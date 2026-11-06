"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LISTENING_RULES } from "@/config/exam";
import type { Segment } from "@/lib/schemas";

interface Props {
  /** Guion para la voz del navegador (Web Speech API) */
  segments: Segment[];
  /** Audio real (p. ej. del profesor). Si existe, tiene prioridad sobre la voz del navegador. */
  audioUrl?: string;
  label?: string;
  maxPlays?: number;
}

const FEMALE_HINT = /female|woman|libby|sonia|serena|kate|hazel|fiona|samantha|susan|martha|karen|moira|google uk english female/i;
const MALE_HINT = /\bmale\b|daniel|ryan|george|arthur|oliver|rishi|thomas|alex|google uk english male/i;

function pickVoice(voices: SpeechSynthesisVoice[], gender: "f" | "m"): SpeechSynthesisVoice | undefined {
  const en = voices.filter((v) => /^en[-_]/i.test(v.lang));
  const gb = en.filter((v) => /^en[-_]GB/i.test(v.lang));
  const pool = gb.length ? gb : en;
  const hint = gender === "f" ? FEMALE_HINT : MALE_HINT;
  const other = gender === "f" ? MALE_HINT : FEMALE_HINT;
  return pool.find((v) => hint.test(v.name)) ?? pool.find((v) => !other.test(v.name)) ?? pool[0];
}

const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

function speak(text: string, voice: SpeechSynthesisVoice | undefined, gender: "f" | "m"): Promise<void> {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang ?? "en-GB";
    u.rate = 0.97;
    // Si solo hay una voz disponible, el tono distingue a hombre y mujer
    u.pitch = gender === "f" ? 1.12 : 0.82;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    window.speechSynthesis.speak(u);
  });
}

/** Chrome corta los enunciados largos: se leen frase a frase */
const sentences = (t: string) => t.match(/[^.!?]+[.!?]+["')]*|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [t];

export function AudioPlayer({ segments, audioUrl, label = "Audio", maxPlays = LISTENING_RULES.maxPlays }: Props) {
  const [plays, setPlays] = useState(0);
  const [playing, setPlaying] = useState(false);
  const supported = useSyncExternalStore(
    () => () => undefined,
    () => "speechSynthesis" in window,
    () => true,
  );
  const [voicesReady, setVoicesReady] = useState(false);
  const cancelled = useRef(false);
  const audioEl = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioUrl) return;
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const update = () => setVoicesReady(synth.getVoices().length > 0);
    update();
    synth.addEventListener("voiceschanged", update);
    return () => {
      synth.removeEventListener("voiceschanged", update);
      cancelled.current = true;
      synth.cancel();
    };
  }, [audioUrl]);

  useEffect(
    () => () => {
      cancelled.current = true;
      audioEl.current?.pause();
    },
    [],
  );

  const remaining = maxPlays - plays;

  const start = async () => {
    if (playing || remaining <= 0) return;
    setPlays((p) => p + 1);
    setPlaying(true);
    cancelled.current = false;

    if (audioUrl) {
      const el = new Audio(audioUrl);
      audioEl.current = el;
      el.onended = () => setPlaying(false);
      el.onerror = () => setPlaying(false);
      try {
        await el.play();
      } catch {
        setPlaying(false);
      }
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();
    const voices = synth.getVoices();
    const f = pickVoice(voices, "f");
    const m = pickVoice(voices, "m");
    let prevSpeaker = "";
    for (const seg of segments) {
      if (cancelled.current) break;
      const pause = seg.pauseBefore ?? (prevSpeaker && prevSpeaker !== seg.speaker ? 550 : 0);
      if (pause) await wait(pause);
      for (const sentence of sentences(seg.text)) {
        if (cancelled.current) break;
        await speak(sentence, seg.gender === "f" ? f : m, seg.gender);
      }
      prevSpeaker = seg.speaker;
    }
    setPlaying(false);
  };

  const stop = () => {
    cancelled.current = true;
    window.speechSynthesis?.cancel();
    audioEl.current?.pause();
    setPlaying(false);
  };

  if (!audioUrl && !supported) {
    return (
      <p className="rounded-2xl bg-bad-soft p-4 text-sm text-bad">
        Tu navegador no admite síntesis de voz. Prueba con Chrome, Edge o Safari actualizados.
      </p>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-4">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={playing ? stop : start}
          disabled={!playing && (remaining <= 0 || (!audioUrl && !voicesReady))}
          aria-label={playing ? "Detener audio" : `Reproducir ${label}`}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg text-brand-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          {playing ? "■" : "▶"}
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{label}</p>
          <p className="text-xs text-muted" aria-live="polite">
            {playing
              ? "Reproduciendo…"
              : remaining > 0
                ? `Te quedan ${remaining} de ${maxPlays} reproducciones`
                : "Has usado las 2 reproducciones, como en el examen"}
          </p>
        </div>
        {playing && (
          <div className="flex h-6 items-end gap-0.5" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className="w-1 animate-pulse rounded bg-brand" style={{ height: `${10 + ((i * 7) % 14)}px`, animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}
      </div>
      {!audioUrl && !voicesReady && <p className="mt-2 text-xs text-muted">Cargando voces del navegador…</p>}
      {!audioUrl && <p className="mt-2 text-[11px] text-muted">Voz sintética del navegador (inglés británico si está disponible).</p>}
    </div>
  );
}

/** Guion completo (solo en la revisión) */
export function Transcript({ segments }: { segments: Segment[] }) {
  return (
    <details className="rounded-2xl border border-line bg-surface p-4">
      <summary className="cursor-pointer text-sm font-semibold">Ver el guion (transcript)</summary>
      <div className="mt-3 space-y-2 font-serif text-[1.02rem] leading-relaxed">
        {segments.map((s, i) => (
          <p key={i}>
            <span className="mr-1 font-sans text-xs font-bold uppercase tracking-wide text-brand">{s.speaker}</span>
            {s.text}
          </p>
        ))}
      </div>
    </details>
  );
}
