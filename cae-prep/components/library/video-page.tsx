"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Converter } from "@/components/library/converter";
import { CURATED_VIDEOS } from "@/lib/library/catalog";
import { repo } from "@/lib/storage";
import { useQueryParam } from "@/lib/use-query-param";

const tKey = (id: string) => `cae.v1.transcript.${id}`;
const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

/** Vídeo de YouTube incrustado + transcripción pegada por el alumno + generación de ejercicios */
export function VideoPage() {
  const id = useQueryParam("v");
  const matId = useQueryParam("m");
  const [title, setTitle] = useState("");
  const [transcript, setTranscript] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    (async () => {
      const curated = CURATED_VIDEOS.find((v) => v.id === id);
      const mat = matId ? (await repo.listMaterials()).find((m) => m.id === matId) : undefined;
      let t = curated ? `${curated.title} — ${curated.speaker}` : (mat?.title ?? "");
      if (!t) {
        try {
          const r = await fetch(`/api/video-meta?ids=${id}`);
          t = (await r.json()).videos?.[id]?.title ?? "";
        } catch {
          /* sin red */
        }
      }
      let local = "";
      try {
        local = window.localStorage.getItem(tKey(id)) ?? "";
      } catch {
        /* sin almacenamiento */
      }
      if (!cancelled) {
        setTitle(t || "Vídeo de YouTube");
        setTranscript(local || mat?.transcript || "");
        setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, matId]);

  const onTranscript = (v: string) => {
    setTranscript(v);
    try {
      window.localStorage.setItem(tKey(id), v);
    } catch {
      /* cuota llena */
    }
  };

  if (!id) return <p className="text-muted">Falta el vídeo. <Link href="/biblioteca?tab=videos" className="font-semibold text-brand underline">Volver</Link></p>;
  const n = words(transcript);

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/biblioteca?tab=videos" className="text-sm text-muted hover:text-ink">← Vídeos</Link>
      <h1 className="mt-3 font-display text-2xl font-bold leading-tight md:text-3xl">{title || " "}</h1>

      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-ink shadow-[0_14px_30px_-20px_rgba(1,26,59,0.6)]">
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${id}?rel=0`}
            title={title || "Vídeo de YouTube"}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">
        Vídeo alojado en YouTube. <a href={`https://www.youtube.com/watch?v=${id}`} target="_blank" rel="noreferrer" className="underline">Ver en YouTube</a>
      </p>

      <section className="mt-8">
        <h2 className="font-display text-xl font-bold">Transcripción</h2>
        <p className="mt-1 text-sm text-muted">Pega aquí la transcripción (en YouTube: ⋯ → «Mostrar transcripción»). Se guarda solo en este dispositivo y sirve para generar ejercicios.</p>
        <textarea
          value={loaded ? transcript : ""}
          onChange={(e) => onTranscript(e.target.value)}
          rows={9}
          placeholder="Pega la transcripción del vídeo…"
          className="mt-3 w-full resize-y rounded-xl border border-line bg-surface p-4 text-[15px] leading-relaxed focus:border-brand"
        />
        <p className={`mt-1 text-xs ${n >= 150 ? "text-ok" : "text-muted"}`}>{n} palabras {n < 150 && "· necesito al menos 150 para generar ejercicios"}</p>
      </section>

      {n >= 150 && (
        <div className="mt-6">
          <Converter source={{ text: transcript, title: title || "Vídeo", url: `https://www.youtube.com/watch?v=${id}`, kind: "video" }} sourceKey={`yt-${id}`} words={n} />
        </div>
      )}
    </div>
  );
}
