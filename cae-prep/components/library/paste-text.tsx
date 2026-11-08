"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Converter } from "@/components/library/converter";
import { repo } from "@/lib/storage";
import { useQueryParam } from "@/lib/use-query-param";

const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40);

/** Pega el texto de cualquier web: genera ejercicios solo para ti, sin guardar ni republicar el texto */
export function PasteText() {
  const qTitle = useQueryParam("title");
  const qUrl = useQueryParam("url");
  const kind = useQueryParam("kind") === "video" ? "video" : "article";
  const matId = useQueryParam("m");
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mat = matId ? (await repo.listMaterials()).find((m) => m.id === matId) : undefined;
      if (cancelled) return;
      setTitle((t) => t || qTitle || mat?.title || "");
      setUrl((u) => u || qUrl || mat?.url || "");
      setText((x) => x || mat?.transcript || "");
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [qTitle, qUrl, matId]);

  const n = words(text);
  const validUrl = /^https?:\/\//.test(url.trim());

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/biblioteca" className="text-sm text-muted hover:text-ink">← Biblioteca</Link>
      <p className="eyebrow mt-4 text-accent">{kind === "video" ? "Transcripción" : "Tu propio texto"}</p>
      <h1 className="mt-1 font-display text-3xl font-bold md:text-4xl">{kind === "video" ? "Ejercicios desde una transcripción" : "Pega un texto"}</h1>
      <p className="mt-2 max-w-xl text-muted">
        Pega el texto de cualquier web (The Economist, BBC…) y genera ejercicios <strong>solo para tu uso personal</strong>.
        No guardamos ni republicamos el texto: solo el enlace y tus resultados.
      </p>

      <div className="mt-6 space-y-4">
        <label className="block text-sm font-medium">
          Título
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} className="mt-1 h-11 w-full rounded-lg border border-line bg-surface px-3 text-[15px] focus:border-brand" />
        </label>
        <label className="block text-sm font-medium">
          Enlace al original (opcional)
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" inputMode="url" className="mt-1 h-11 w-full rounded-lg border border-line bg-surface px-3 text-[15px] focus:border-brand" />
        </label>
        <label className="block text-sm font-medium">
          Texto
          <textarea value={ready ? text : ""} onChange={(e) => setText(e.target.value)} rows={12} placeholder="Pega aquí el texto en inglés…" className="mt-1 w-full resize-y rounded-xl border border-line bg-surface p-4 text-[15px] leading-relaxed focus:border-brand" />
        </label>
        <p className={`text-xs ${n >= 150 ? "text-ok" : "text-muted"}`}>{n} palabras {n < 150 && "· necesito al menos 150"}{n > 2300 && " · se usarán las primeras ~2300"}</p>
      </div>

      {n >= 150 && (
        <div className="mt-6">
          <Converter source={{ text, title: title || "Texto pegado", url: validUrl ? url.trim() : undefined, kind }} sourceKey={`paste-${slug(title || "texto")}-${n}`} words={n} />
        </div>
      )}
    </div>
  );
}
