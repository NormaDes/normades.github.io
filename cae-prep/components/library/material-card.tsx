"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowIcon, PlayIcon } from "@/components/icons";
import { parseYouTubeId } from "@/lib/library/catalog";
import { signedUrl } from "@/lib/library/files";
import type { Material } from "@/lib/storage";

const KIND_LABEL: Record<Material["kind"], string> = { audio: "Audio", video: "Vídeo", podcast: "Podcast", article: "Artículo", pdf: "PDF", image: "Imagen", link: "Enlace" };

export function MaterialCard({ m, onDelete, canDelete }: { m: Material; onDelete?: () => void; canDelete?: boolean }) {
  const [src, setSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const yt = m.url ? parseYouTubeId(m.url) : null;

  const open = async () => {
    if (!m.storagePath) return;
    setBusy(true);
    setErr(null);
    const url = await signedUrl(m.storagePath);
    setBusy(false);
    if (!url) return setErr("No se pudo abrir el archivo.");
    if (m.kind === "pdf") window.open(url, "_blank", "noopener");
    else setSrc(url);
  };

  return (
    <li className="rounded-xl border border-line bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md bg-brand-soft px-2 py-0.5 font-semibold text-brand">{KIND_LABEL[m.kind]}</span>
        {m.visibility === "class" ? <span className="font-semibold text-ok">Clase</span> : <span className="text-muted">Privado</span>}
        {m.topic && <span className="text-muted">· {m.topic}</span>}
        {m.partId && <span className="text-muted">· {m.partId.toUpperCase()}</span>}
      </div>
      <h3 className="mt-2 font-display text-lg font-bold leading-snug">{m.title}</h3>
      {m.description && <p className="mt-1 text-sm text-muted">{m.description}</p>}
      {(m.author || m.license) && (
        <p className="mt-1 text-xs text-muted">
          {m.author}
          {m.author && m.license ? " · " : ""}
          {m.license}
          {m.sourceUrl && (
            <>
              {" · "}
              <a href={m.sourceUrl} target="_blank" rel="noreferrer" className="underline">fuente</a>
            </>
          )}
        </p>
      )}

      {src && m.kind === "audio" && <audio controls controlsList="nodownload" src={src} className="mt-3 w-full" />}
      {src && m.kind === "image" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={m.title} className="mt-3 max-h-96 w-full rounded-lg border border-line object-contain" />
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {m.storagePath && (m.kind === "audio" || m.kind === "image" || m.kind === "pdf") && !src && (
          <button type="button" onClick={open} disabled={busy} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-ink disabled:opacity-60">
            {m.kind === "audio" ? <PlayIcon width={16} height={16} /> : <ArrowIcon width={16} height={16} />}
            {busy ? "Abriendo…" : m.kind === "audio" ? "Escuchar" : m.kind === "pdf" ? "Abrir PDF" : "Ver"}
          </button>
        )}
        {yt && (
          <Link href={`/biblioteca/video?v=${yt}&m=${m.id}`} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-ink">
            <PlayIcon width={16} height={16} /> Ver vídeo
          </Link>
        )}
        {m.url && !yt && (
          <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-ink">
            Abrir <ArrowIcon width={16} height={16} />
          </a>
        )}
        {(m.transcript || m.kind === "podcast" || m.kind === "audio") && (
          <Link href={`/biblioteca/pegar?kind=video&m=${m.id}&title=${encodeURIComponent(m.title)}`} className="inline-flex min-h-10 items-center rounded-lg border border-brand px-4 text-sm font-semibold text-brand">
            Ejercicios con la transcripción
          </Link>
        )}
        {canDelete && onDelete && (
          <button type="button" onClick={() => window.confirm(`¿Eliminar «${m.title}»?`) && onDelete()} className="ml-auto min-h-10 rounded-lg border border-line px-3 text-sm font-semibold text-bad hover:bg-bad-soft">
            Eliminar
          </button>
        )}
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-bad">{err}</p>}
    </li>
  );
}
