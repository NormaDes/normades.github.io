"use client";

import { useEffect, useRef, useState } from "react";
import { wordsOf } from "@/lib/speaking";

export interface Recording {
  transcript: string;
  durationSec: number;
  audioUrl?: string;
}

interface RecognitionResultItem {
  0: { transcript: string };
  isFinal: boolean;
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResultItem>;
}
interface RecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: RecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start(): void;
  stop(): void;
}
type RecognitionCtor = new () => RecognitionLike;

function getRecognition(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const clock = () => Date.now();
const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

interface Props {
  label: string;
  /** Duración orientativa en segundos */
  targetSec: number;
  value: Recording | null;
  onChange: (r: Recording | null) => void;
  /** Solo lectura (pantalla de resultados) */
  readOnly?: boolean;
}

/**
 * Graba la voz (MediaRecorder) y la transcribe en directo (Web Speech API).
 * Si el navegador no transcribe, se puede escribir lo dicho a mano.
 */
export function Recorder({ label, targetSec, value, onChange, readOnly }: Props) {
  const [recording, setRecording] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [interim, setInterim] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [canTranscribe] = useState(() => getRecognition() !== null);

  const recRef = useRef<RecognitionLike | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const finalRef = useRef("");
  const startedAt = useRef(0);
  const wantRunning = useRef(false);

  useEffect(() => {
    if (!recording) return;
    const id = window.setInterval(() => setElapsed(Math.round((clock() - startedAt.current) / 1000)), 500);
    return () => window.clearInterval(id);
  }, [recording]);

  useEffect(
    () => () => {
      wantRunning.current = false;
      recRef.current?.stop();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const start = async () => {
    setError(null);
    finalRef.current = "";
    chunksRef.current = [];
    setInterim("");
    setElapsed(0);

    // 1) Micrófono + grabación de audio (opcional: si falla, seguimos solo con la transcripción)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      if (typeof MediaRecorder !== "undefined") {
        const mr = new MediaRecorder(stream);
        mr.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
        mr.start();
        mediaRef.current = mr;
      }
    } catch {
      setError("No he podido acceder al micrófono. Revisa los permisos del navegador (o escribe tu respuesta abajo).");
      return;
    }

    // 2) Transcripción en directo
    const Ctor = getRecognition();
    if (Ctor) {
      const r = new Ctor();
      r.lang = "en-GB";
      r.continuous = true;
      r.interimResults = true;
      r.onresult = (e) => {
        let live = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i];
          if (res.isFinal) finalRef.current += res[0].transcript + " ";
          else live += res[0].transcript;
        }
        setInterim(live);
      };
      r.onerror = () => undefined;
      // Chrome corta el reconocimiento tras unos segundos de silencio: lo reanudamos
      r.onend = () => {
        if (wantRunning.current) {
          try {
            r.start();
          } catch {
            /* ya iniciado */
          }
        }
      };
      recRef.current = r;
      wantRunning.current = true;
      try {
        r.start();
      } catch {
        /* ignore */
      }
    }

    startedAt.current = clock();
    setRecording(true);
  };

  const stop = () => {
    wantRunning.current = false;
    recRef.current?.stop();
    const duration = Math.max(1, Math.round((clock() - startedAt.current) / 1000));
    const text = (finalRef.current + " " + interim).replace(/\s+/g, " ").trim();
    setRecording(false);
    setInterim("");

    const finish = (audioUrl?: string) => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      onChange({ transcript: text, durationSec: duration, audioUrl });
    };

    const mr = mediaRef.current;
    if (mr && mr.state !== "inactive") {
      mr.onstop = () => finish(URL.createObjectURL(new Blob(chunksRef.current, { type: mr.mimeType || "audio/webm" })));
      mr.stop();
    } else {
      finish();
    }
  };

  const words = wordsOf(value?.transcript ?? "");
  const wpm = value && value.durationSec > 3 ? Math.round((words / value.durationSec) * 60) : null;

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">{label}</p>
        <span className="text-xs tabular-nums text-muted">
          {recording ? <span className={elapsed > targetSec ? "font-bold text-bad" : "font-bold text-brand"}>{fmt(elapsed)}</span> : null} · objetivo ~{targetSec}s
        </span>
      </div>

      {!readOnly && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={recording ? stop : start}
            className={`flex min-h-12 items-center gap-2 rounded-xl px-5 text-sm font-semibold ${recording ? "bg-bad text-brand-ink" : "bg-brand text-brand-ink"}`}
          >
            <span aria-hidden>{recording ? "■" : "●"}</span>
            {recording ? "Parar" : value ? "Grabar de nuevo" : "Grabar"}
          </button>
          {recording && <span className="animate-pulse text-xs font-semibold text-bad">Grabando…</span>}
          {value && !recording && (
            <button type="button" onClick={() => onChange(null)} className="min-h-12 rounded-xl border border-line px-4 text-sm">
              Borrar
            </button>
          )}
        </div>
      )}

      {recording && (canTranscribe ? interim && <p className="mt-3 text-sm italic text-muted">…{interim}</p> : <p className="mt-3 text-xs text-muted">Tu navegador no transcribe en directo: escribe lo que has dicho cuando pares.</p>)}
      {error && <p role="alert" className="mt-3 text-sm text-bad">{error}</p>}

      {value?.audioUrl && !recording && <audio controls src={value.audioUrl} className="mt-3 w-full" />}

      {!recording && (value || !readOnly) && (
        <div className="mt-3">
          <label className="text-xs font-medium text-muted" htmlFor={`tr-${label}`}>
            {canTranscribe ? "Transcripción (puedes corregirla antes de enviar)" : "Escribe lo que has dicho"}
          </label>
          <textarea
            id={`tr-${label}`}
            value={value?.transcript ?? ""}
            readOnly={readOnly}
            onChange={(e) => onChange({ transcript: e.target.value, durationSec: value?.durationSec ?? 0, audioUrl: value?.audioUrl })}
            rows={4}
            spellCheck={false}
            placeholder={canTranscribe ? "Aquí aparecerá lo que digas…" : "Escribe aquí tu respuesta tal y como la dirías…"}
            className="mt-1 w-full resize-y rounded-xl border border-line bg-bg p-3 text-sm leading-relaxed focus:border-brand"
          />
          {value && (
            <p className="mt-1 text-xs text-muted">
              {words} palabras{value.durationSec > 0 ? ` · ${fmt(value.durationSec)}` : ""}
              {wpm ? ` · ${wpm} palabras/min` : ""}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
