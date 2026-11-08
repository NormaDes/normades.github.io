"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Converter } from "@/components/library/converter";
import { ArrowIcon, PlusIcon } from "@/components/icons";
import type { Article } from "@/lib/articles/types";
import { SOURCE_INFO } from "@/lib/articles/types";
import { useQueryParam } from "@/lib/use-query-param";
import { repo } from "@/lib/storage";
import { cleanTerm, makeVocab, mergeVocab, sentenceAround } from "@/lib/vocab";

const fmtDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" }) : "");
const isHeading = (p: string) => p.length < 80 && !/[.!?:;”"]$/.test(p);

export function ArticleReader() {
  const code = useQueryParam("id");
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ term: string; context: string } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    fetch(`/api/articles/item?id=${encodeURIComponent(code)}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "No se pudo abrir el artículo.");
        if (!cancelled) setArticle(j.article as Article);
      })
      .catch((e: Error) => !cancelled && setError(e.message));
    return () => {
      cancelled = true;
    };
  }, [code]);

  // Selección de texto → barra «Guardar en vocabulario»
  useEffect(() => {
    const onChange = () => {
      const sel = window.getSelection();
      const root = bodyRef.current;
      if (!sel || sel.isCollapsed || !root || !sel.anchorNode || !root.contains(sel.anchorNode) || !sel.focusNode || !root.contains(sel.focusNode)) return setSelected(null);
      const term = cleanTerm(sel.toString());
      if (term.length < 2 || term.split(" ").length > 8) return setSelected(null);
      const para = (sel.anchorNode.nodeType === 3 ? sel.anchorNode.parentElement : (sel.anchorNode as HTMLElement))?.closest("p, h2, li")?.textContent ?? "";
      setSelected({ term, context: sentenceAround(para, term) });
    };
    document.addEventListener("selectionchange", onChange);
    return () => document.removeEventListener("selectionchange", onChange);
  }, []);

  const save = useCallback(async () => {
    if (!selected || !article) return;
    const incoming = { term: selected.term, context: selected.context, sourceTitle: article.title, sourceUrl: article.url };
    const existing = (await repo.listVocab()).find((v) => v.term.trim().toLowerCase() === selected.term.toLowerCase());
    await repo.saveVocab(existing ? mergeVocab(existing, incoming) : makeVocab(incoming));
    setToast(existing ? `«${selected.term}» ya estaba: he guardado esta frase` : `«${selected.term}» guardada ✓`);
    window.getSelection()?.removeAllRanges();
    setSelected(null);
    window.setTimeout(() => setToast(null), 2400);
  }, [selected, article]);

  if (!code) return <p className="text-muted">Falta el artículo. <Link href="/biblioteca" className="font-semibold text-brand underline">Volver a la biblioteca</Link></p>;
  if (error) return <p role="alert" className="rounded-xl bg-bad-soft p-4 text-sm text-bad">{error} <Link href="/biblioteca" className="font-semibold underline">Volver</Link></p>;
  if (!article) return <div className="h-64 animate-pulse rounded-xl bg-line/60" aria-busy="true" aria-label="Cargando el artículo" />;

  const info = SOURCE_INFO[article.source];
  const paragraphs = (article.body ?? "").split("\n\n");

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/biblioteca" className="text-sm text-muted hover:text-ink">← Biblioteca</Link>

      <header className="mt-4 border-b-2 border-ink pb-5">
        <p className="eyebrow text-accent-dark">{info.name}</p>
        <h1 className="mt-1 font-display text-3xl font-bold leading-tight md:text-4xl">{article.title}</h1>
        <p className="mt-3 text-sm text-muted">
          <strong className="text-ink">{article.author}</strong>
          {article.publishedAt && ` · ${fmtDate(article.publishedAt)}`} · {article.wordCount} palabras · nivel estimado {article.level}
        </p>
        <p className="mt-2 text-xs text-muted">
          Licencia: <a href={info.licenseUrl} target="_blank" rel="noreferrer" className="underline">{article.license}</a>. Texto original en{" "}
          <a href={article.url} target="_blank" rel="noreferrer" className="font-semibold text-brand underline">{info.name}</a>.
          {article.source === "guardian" && " Contenido de The Guardian a través de su Open Platform."}
        </p>
      </header>

      {article.fullTextAllowed && article.body ? (
        <>
          <p className="mt-4 text-xs text-muted">Selecciona una palabra o frase para guardarla en tu vocabulario.</p>
          <div ref={bodyRef} className="exam-text-long mt-3 rounded-xl border border-line bg-surface p-5 font-serif text-[1.08rem] md:p-8">
            {paragraphs.map((p, i) => (isHeading(p) ? <h2 key={i} className="mt-6 text-xl font-bold first:mt-0">{p}</h2> : <p key={i} className="mt-4 first:mt-0">{p}</p>))}
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-line bg-surface p-5">
          <p className="font-serif text-[1.05rem] italic">{article.excerpt}</p>
          <p className="mt-3 text-sm text-muted">Esta fuente solo permite mostrar un extracto.</p>
          <a href={article.url} target="_blank" rel="noreferrer" className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-ink">Leer el artículo completo <ArrowIcon width={16} height={16} /></a>
        </div>
      )}

      <div className="mt-8">
        {article.fullTextAllowed && article.body ? (
          <Converter source={{ articleId: code }} sourceKey={article.id} words={article.wordCount} />
        ) : (
          <p className="text-sm text-muted">Para hacer ejercicios con este artículo, pega su texto en <Link href={`/biblioteca/pegar?title=${encodeURIComponent(article.title)}&url=${encodeURIComponent(article.url)}`} className="font-semibold text-brand underline">Pegar un texto</Link>.</p>
        )}
      </div>

      {selected && (
        <div className="fixed inset-x-3 bottom-[4.6rem] z-40 mx-auto flex max-w-xl items-center gap-3 rounded-xl bg-ink px-4 py-3 text-white shadow-[0_14px_34px_-12px_rgba(1,26,59,0.7)] md:bottom-6">
          <p className="min-w-0 flex-1 truncate text-sm">«{selected.term}»</p>
          <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={save} className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-lg bg-white px-3 text-sm font-bold text-ink">
            <PlusIcon width={16} height={16} /> Guardar en vocabulario
          </button>
        </div>
      )}
      {toast && <div role="status" className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit max-w-[90vw] rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-lg md:bottom-8">{toast}</div>}
    </div>
  );
}
