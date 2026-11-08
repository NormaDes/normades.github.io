"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowIcon, CheckIcon } from "@/components/icons";
import { ApiError, fetchAiStatus, requestVocabEnrich, type AiStatus } from "@/lib/client/api";
import { GRADE_QUALITY, isDue, isLearned, previewInterval, review, type Grade } from "@/lib/sm2";
import { repo, type VocabItem } from "@/lib/storage";
import { cleanTerm, makeVocab, mergeVocab, needsEnrichment } from "@/lib/vocab";

type Tab = "review" | "bank" | "add";
type Filter = "all" | "due" | "new" | "learned" | "missing";

const NEW_PER_SESSION = 15;
const GRADES: Array<{ grade: Grade; label: string; key: string; tone: string }> = [
  { grade: "again", label: "Otra vez", key: "1", tone: "border-bad/50 text-bad hover:bg-bad-soft" },
  { grade: "hard", label: "Difícil", key: "2", tone: "border-line hover:bg-warn-soft" },
  { grade: "good", label: "Bien", key: "3", tone: "border-brand/50 text-brand hover:bg-brand-soft" },
  { grade: "easy", label: "Fácil", key: "4", tone: "border-ok/50 text-ok hover:bg-ok-soft" },
];

const isNew = (v: VocabItem) => v.repetitions === 0 && v.lapses === 0 && v.intervalDays === 0;

const inputCls = "mt-1 h-11 w-full rounded-lg border border-line bg-surface px-3 text-[15px] focus:border-brand";

function dueLabel(v: VocabItem, now: Date) {
  if (isDue(v, now)) return isNew(v) ? "nueva" : "toca hoy";
  const d = Math.max(1, Math.ceil((new Date(v.dueAt).getTime() - now.getTime()) / 86_400_000));
  return `en ${d} ${d === 1 ? "día" : "días"}`;
}

/** Resalta el término dentro de su frase de contexto */
function Highlight({ text, term }: { text: string; term: string }) {
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="rounded bg-warn-soft px-0.5 font-semibold text-ink">{text.slice(i, i + term.length)}</mark>
      {text.slice(i + term.length)}
    </>
  );
}

export function VocabApp() {
  const [items, setItems] = useState<VocabItem[] | null>(null);
  const [tab, setTab] = useState<Tab>("review");
  const [ai, setAi] = useState<AiStatus | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    repo.listVocab().then((v) => !cancelled && setItems(v));
    fetchAiStatus().then((s) => !cancelled && setAi(s));
    return () => {
      cancelled = true;
    };
  }, []);

  const flash = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(null), 2200);
  };

  const persist = useCallback(async (v: VocabItem) => {
    await repo.saveVocab(v);
    setItems((all) => {
      const rest = (all ?? []).filter((x) => x.id !== v.id && x.term.trim().toLowerCase() !== v.term.trim().toLowerCase());
      return [...rest, v];
    });
  }, []);

  const remove = async (id: string) => {
    setItems((all) => (all ?? []).filter((x) => x.id !== id));
    await repo.deleteVocab(id);
  };

  const enrich = async (list: VocabItem[]) => {
    const batch = list.slice(0, 8);
    if (!batch.length) return;
    setBusy(true);
    setError(null);
    try {
      const { items: out, remainingToday } = await requestVocabEnrich(batch.map((v) => ({ term: v.term, context: v.context })));
      setAi((p) => (p ? { ...p, remainingToday } : p));
      for (let i = 0; i < batch.length; i++) {
        const e = out[i];
        await persist({ ...batch[i], definition: e.definition, example: e.example, translation: e.translation, collocations: e.collocations });
      }
      flash(`${batch.length} ${batch.length === 1 ? "palabra completada" : "palabras completadas"} ✓`);
    } catch (e) {
      setError(e instanceof ApiError || e instanceof Error ? e.message : "No se pudo completar con IA.");
    } finally {
      setBusy(false);
    }
  };

  if (!items) return <div className="h-48 animate-pulse rounded-xl bg-line/60" aria-busy="true" aria-label="Cargando tu vocabulario" />;

  const now = new Date();
  const due = items.filter((v) => isDue(v, now));
  const learned = items.filter(isLearned).length;
  const missing = items.filter(needsEnrichment);

  const TABS: Array<[Tab, string]> = [
    ["review", `Repasar${due.length ? ` (${due.length})` : ""}`],
    ["bank", `Mi banco (${items.length})`],
    ["add", "Añadir"],
  ];

  return (
    <div>
      <div role="tablist" aria-label="Vocabulario" className="mb-5 flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`relative min-h-11 shrink-0 px-4 text-sm font-semibold ${tab === id ? "text-ink" : "text-muted hover:text-ink"}`}>
            {label}
            {tab === id && <span aria-hidden className="absolute inset-x-3 bottom-[-1px] h-[3px] rounded-t bg-accent" />}
          </button>
        ))}
      </div>

      {error && <p role="alert" className="mb-4 rounded-lg bg-bad-soft p-3 text-sm text-bad">{error}</p>}

      {tab === "review" && <ReviewTab items={items} due={due} learned={learned} onSave={persist} onGoAdd={() => setTab("add")} />}
      {tab === "bank" && <BankTab items={items} now={now} missing={missing} ai={ai} busy={busy} onEnrich={enrich} onSave={persist} onRemove={remove} />}
      {tab === "add" && (
        <AddTab
          ai={ai}
          busy={busy}
          onAdd={async (v, withAi) => {
            const existing = items.find((x) => x.term.trim().toLowerCase() === v.term.trim().toLowerCase());
            const merged = existing ? mergeVocab(existing, v) : v;
            await persist(merged);
            flash(existing ? "Ya la tenías: he completado lo que faltaba" : "Guardada en tu banco ✓");
            if (withAi && needsEnrichment(merged)) await enrich([merged]);
          }}
        />
      )}

      {toast && (
        <div role="status" className="fixed inset-x-0 bottom-24 z-50 mx-auto w-fit rounded-lg bg-ink px-4 py-2.5 text-sm font-semibold text-white shadow-lg md:bottom-8">
          {toast}
        </div>
      )}
    </div>
  );
}

/* ───────────── Repaso ───────────── */
function ReviewTab({ items, due, learned, onSave, onGoAdd }: { items: VocabItem[]; due: VocabItem[]; learned: number; onSave: (v: VocabItem) => Promise<void>; onGoAdd: () => void }) {
  const [queue, setQueue] = useState<VocabItem[] | null>(null);
  const [shown, setShown] = useState(false);
  const [done, setDone] = useState(0);
  const [stats, setStats] = useState<Record<Grade, number>>({ again: 0, hard: 0, good: 0, easy: 0 });
  const [total, setTotal] = useState(0);

  const start = () => {
    const reviews = due.filter((v) => !isNew(v)).sort((a, b) => a.dueAt.localeCompare(b.dueAt));
    const news = due.filter(isNew).slice(0, NEW_PER_SESSION);
    const q = [...reviews, ...news];
    setQueue(q);
    setTotal(q.length);
    setDone(0);
    setShown(false);
    setStats({ again: 0, hard: 0, good: 0, easy: 0 });
  };

  const current = queue?.[0];

  const answer = useCallback(
    async (grade: Grade) => {
      if (!queue?.length) return;
      const card = queue[0];
      const next = { ...card, ...review(card, grade) };
      await onSave(next);
      setStats((s) => ({ ...s, [grade]: s[grade] + 1 }));
      setQueue((q) => {
        const rest = (q ?? []).slice(1);
        return grade === "again" ? [...rest, next] : rest;
      });
      if (grade !== "again") setDone((d) => d + 1);
      setShown(false);
    },
    [queue, onSave],
  );

  useEffect(() => {
    if (!current) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement | null)?.tagName === "INPUT" || (e.target as HTMLElement | null)?.tagName === "TEXTAREA") return;
      if (!shown && (e.key === " " || e.key === "Enter")) {
        e.preventDefault();
        setShown(true);
      } else if (shown && ["1", "2", "3", "4"].includes(e.key)) void answer(GRADES[Number(e.key) - 1].grade);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, shown, answer]);

  // Estado: aún no ha empezado
  if (!queue) {
    const next = items.filter((v) => !isDue(v)).sort((a, b) => a.dueAt.localeCompare(b.dueAt))[0];
    return (
      <div>
        <dl className="grid grid-cols-3 gap-3">
          {[
            ["Pendientes", due.length, "bg-tangerine-soft text-tangerine-dark"],
            ["En tu banco", items.length, "bg-grape-soft text-grape-dark"],
            ["Aprendidas", learned, "bg-ok-soft text-ok"],
          ].map(([l, v, tone]) => (
            <div key={l as string} className={`rounded-3xl px-4 py-4 ${tone}`}>
              <dt className="eyebrow">{l}</dt>
              <dd className="mt-1.5 font-display text-4xl font-semibold leading-none tabular-nums text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        {items.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-line bg-surface p-8 text-center">
            <p className="font-display text-xl font-bold">Tu banco de vocabulario está vacío</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Guarda palabras mientras lees un artículo (selecciona el texto) o añádelas a mano. Las repasaremos con repetición espaciada.</p>
            <button type="button" onClick={onGoAdd} className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-ink">
              Añadir mi primera palabra <ArrowIcon width={18} height={18} />
            </button>
          </div>
        ) : due.length ? (
          <div className="mt-6 flex flex-wrap items-center gap-4 rounded-3xl border-2 border-accent/30 bg-coral-soft p-5">
            <div className="min-w-0 flex-1">
              <p className="eyebrow text-accent-dark">Toca repasar</p>
              <p className="mt-1 font-display text-xl font-bold">
                {due.length} {due.length === 1 ? "tarjeta" : "tarjetas"} para hoy
              </p>
              <p className="mt-0.5 text-sm text-muted">Unos {Math.max(2, Math.round(due.length * 0.4))} minutos. Si te cuesta, pulsa «Otra vez»: volverá a salir en la sesión.</p>
            </div>
            <button type="button" onClick={start} className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-brand px-6 text-sm font-semibold text-brand-ink">
              Empezar repaso <ArrowIcon width={18} height={18} />
            </button>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-line bg-surface p-6 text-center">
            <p className="font-display text-xl font-bold">¡Todo al día!</p>
            <p className="mt-1 text-sm text-muted">{next ? `Tu próxima tarjeta toca ${dueLabel(next, new Date())}.` : "No tienes tarjetas pendientes."}</p>
          </div>
        )}
      </div>
    );
  }

  // Sesión terminada
  if (!current) {
    const ok = stats.good + stats.easy;
    return (
      <div className="rounded-xl border border-line bg-surface p-8 text-center">
        <p className="hand text-4xl text-accent-dark">Class dismissed!</p>
        <p className="mt-2 font-display text-xl font-bold">Has repasado {total} {total === 1 ? "tarjeta" : "tarjetas"}</p>
        <p className="mt-1 text-sm text-muted">
          {ok} bien o fácil · {stats.hard} difíciles · {stats.again} para repetir. Vuelve mañana: la constancia es lo que fija el vocabulario.
        </p>
        <button type="button" onClick={() => setQueue(null)} className="mt-5 min-h-12 rounded-lg bg-brand px-6 text-sm font-semibold text-brand-ink">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3 text-xs text-muted">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(done / Math.max(1, total)) * 100}%` }} />
        </div>
        <span className="tabular-nums">{done}/{total}</span>
      </div>

      <div className="ruled min-h-[18rem] rounded-xl border border-line py-6 shadow-[0_14px_30px_-22px_rgba(1,26,59,0.5)]">
        <p className="eyebrow leading-none text-muted">{isNew(current) ? "Palabra nueva" : "Repaso"}</p>
        <p className="mt-3 font-display text-4xl font-bold leading-[1.15] tracking-tight">{current.term}</p>
        {current.context && (
          <p className="mt-4 font-serif text-[1.02rem] italic leading-[1.5] text-muted">
            “<Highlight text={current.context} term={current.term} />”
          </p>
        )}

        {shown ? (
          <div className="mt-5 space-y-3 border-t border-dashed border-line pt-4 pr-2 leading-snug">
            {current.definition ? <p className="text-[1.02rem]">{current.definition}</p> : <p className="text-sm text-muted">Sin definición todavía: complétala con IA desde «Mi banco».</p>}
            {current.example && (
              <p className="font-serif text-[1.02rem] italic text-ink/80">
                <Highlight text={current.example} term={current.term} />
              </p>
            )}
            {current.collocations.length > 0 && (
              <p className="flex flex-wrap gap-1.5">
                {current.collocations.map((c) => (
                  <span key={c} className="rounded-md bg-brand-soft px-2 py-0.5 text-xs font-semibold text-brand">{c}</span>
                ))}
              </p>
            )}
            {current.translation && (
              <p className="text-sm text-muted">
                <span className="hand text-lg text-accent-dark">ES </span>
                {current.translation}
              </p>
            )}
          </div>
        ) : null}
      </div>

      {shown ? (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {GRADES.map((g) => (
            <button key={g.grade} type="button" onClick={() => answer(g.grade)} className={`flex min-h-14 flex-col items-center justify-center rounded-lg border bg-surface text-sm font-semibold transition-colors ${g.tone}`}>
              {g.label}
              <span className="text-[11px] font-normal text-muted">{previewInterval(current, g.grade)} · tecla {g.key}</span>
            </button>
          ))}
        </div>
      ) : (
        <button type="button" onClick={() => setShown(true)} className="mt-4 min-h-14 w-full rounded-lg bg-brand px-5 text-sm font-semibold text-brand-ink">
          Mostrar respuesta <span className="ml-1 font-normal opacity-70">(Espacio)</span>
        </button>
      )}
      <p className="mt-3 text-center text-[11px] text-muted">Calidad SM-2: otra vez {GRADE_QUALITY.again}, difícil {GRADE_QUALITY.hard}, bien {GRADE_QUALITY.good}, fácil {GRADE_QUALITY.easy}.</p>
    </div>
  );
}

/* ───────────── Banco ───────────── */
function BankTab({ items, now, missing, ai, busy, onEnrich, onSave, onRemove }: { items: VocabItem[]; now: Date; missing: VocabItem[]; ai: AiStatus | null; busy: boolean; onEnrich: (l: VocabItem[]) => Promise<void>; onSave: (v: VocabItem) => Promise<void>; onRemove: (id: string) => Promise<void> }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);

  const shown = useMemo(() => {
    const text = q.trim().toLowerCase();
    return items
      .filter((v) => (text ? v.term.toLowerCase().includes(text) || (v.definition ?? "").toLowerCase().includes(text) : true))
      .filter((v) => (filter === "due" ? isDue(v, now) : filter === "new" ? isNew(v) : filter === "learned" ? isLearned(v) : filter === "missing" ? needsEnrichment(v) : true))
      .sort((a, b) => a.term.localeCompare(b.term));
  }, [items, q, filter, now]);

  const FILTERS: Array<[Filter, string]> = [["all", "Todas"], ["due", "Pendientes"], ["new", "Nuevas"], ["learned", "Aprendidas"], ["missing", `Sin completar (${missing.length})`]];
  const aiOk = ai?.configured && (ai.remainingToday ?? 0) > 0;

  if (!items.length) return <p className="rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">Todavía no hay palabras. Añade la primera o guarda palabras desde un artículo.</p>;

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar en tu banco…" aria-label="Buscar" className="h-11 min-w-0 flex-1 rounded-lg border border-line bg-surface px-3 text-[15px] focus:border-brand" />
        {missing.length > 0 && (
          <button type="button" disabled={!aiOk || busy} onClick={() => onEnrich(missing)} title={aiOk ? "" : "Requiere la IA configurada"} className="min-h-11 rounded-lg border border-brand px-4 text-sm font-semibold text-brand disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? "Completando…" : `Completar con IA (${Math.min(8, missing.length)})`}
          </button>
        )}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Filtro">
        {FILTERS.map(([id, label]) => (
          <button key={id} type="button" onClick={() => setFilter(id)} className={`min-h-9 rounded-lg border px-3 text-xs font-semibold ${filter === id ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface hover:border-brand"}`}>
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {shown.map((v) => (
          <li key={v.id} className="p-4">
            <button type="button" onClick={() => setOpen(open === v.id ? null : v.id)} aria-expanded={open === v.id} className="flex w-full items-baseline gap-3 text-left">
              <span className="font-display text-lg font-bold">{v.term}</span>
              <span className="min-w-0 flex-1 truncate text-sm text-muted">{v.definition ?? "sin definición"}</span>
              <span className={`shrink-0 text-xs font-semibold ${isDue(v, now) ? "text-accent-dark" : "text-muted"}`}>{dueLabel(v, now)}</span>
            </button>
            {open === v.id && <BankEdit v={v} ai={aiOk ?? false} busy={busy} onSave={onSave} onRemove={() => onRemove(v.id)} onEnrich={() => onEnrich([v])} />}
          </li>
        ))}
        {shown.length === 0 && <li className="p-5 text-sm text-muted">No hay palabras con ese filtro.</li>}
      </ul>
    </div>
  );
}

function BankEdit({ v, ai, busy, onSave, onRemove, onEnrich }: { v: VocabItem; ai: boolean; busy: boolean; onSave: (v: VocabItem) => Promise<void>; onRemove: () => void; onEnrich: () => void }) {
  const [def, setDef] = useState(v.definition ?? "");
  const [ex, setEx] = useState(v.example ?? "");
  const [tr, setTr] = useState(v.translation ?? "");
  const [col, setCol] = useState(v.collocations.join(", "));
  return (
    <div className="mt-3 space-y-3 border-t border-dashed border-line pt-3">
      {v.context && <p className="font-serif text-sm italic text-muted">“<Highlight text={v.context} term={v.term} />” {v.sourceTitle && <span className="not-italic">— {v.sourceUrl ? <a href={v.sourceUrl} target="_blank" rel="noreferrer" className="underline">{v.sourceTitle}</a> : v.sourceTitle}</span>}</p>}
      <label className="block text-xs font-medium text-muted">Definición<input value={def} onChange={(e) => setDef(e.target.value)} className={inputCls} /></label>
      <label className="block text-xs font-medium text-muted">Ejemplo<input value={ex} onChange={(e) => setEx(e.target.value)} className={inputCls} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-muted">Traducción<input value={tr} onChange={(e) => setTr(e.target.value)} className={inputCls} /></label>
        <label className="block text-xs font-medium text-muted">Colocaciones (separadas por comas)<input value={col} onChange={(e) => setCol(e.target.value)} className={inputCls} /></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => onSave({ ...v, definition: def || undefined, example: ex || undefined, translation: tr || undefined, collocations: col.split(",").map((c) => c.trim()).filter(Boolean) })} className="inline-flex min-h-10 items-center gap-1.5 rounded-lg bg-brand px-4 text-sm font-semibold text-brand-ink">
          <CheckIcon width={16} height={16} /> Guardar
        </button>
        {needsEnrichment(v) && ai && (
          <button type="button" disabled={busy} onClick={onEnrich} className="min-h-10 rounded-lg border border-brand px-4 text-sm font-semibold text-brand disabled:opacity-50">Completar con IA</button>
        )}
        <button type="button" onClick={() => window.confirm(`¿Eliminar «${v.term}»?`) && onRemove()} className="ml-auto min-h-10 rounded-lg border border-line px-4 text-sm font-semibold text-bad hover:bg-bad-soft">Eliminar</button>
      </div>
    </div>
  );
}

/* ───────────── Añadir ───────────── */
function AddTab({ ai, busy, onAdd }: { ai: AiStatus | null; busy: boolean; onAdd: (v: VocabItem, withAi: boolean) => Promise<void> }) {
  const [term, setTerm] = useState("");
  const [def, setDef] = useState("");
  const [ex, setEx] = useState("");
  const [tr, setTr] = useState("");
  const aiOk = ai?.configured && (ai.remainingToday ?? 0) > 0;
  const [withAi, setWithAi] = useState(true);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = cleanTerm(term);
    if (!t) return;
    await onAdd(makeVocab({ term: t, definition: def.trim() || undefined, example: ex.trim() || undefined, translation: tr.trim() || undefined }), Boolean(aiOk && withAi));
    setTerm("");
    setDef("");
    setEx("");
    setTr("");
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-line bg-surface p-5">
      <label className="block text-sm font-medium">
        Palabra o expresión
        <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="p. ej. make ends meet" maxLength={70} autoCapitalize="none" className={inputCls} />
      </label>
      <details className="rounded-lg border border-line p-3">
        <summary className="cursor-pointer text-sm font-semibold">Añadir definición, ejemplo y traducción (opcional)</summary>
        <div className="mt-3 space-y-3">
          <label className="block text-xs font-medium text-muted">Definición<input value={def} onChange={(e) => setDef(e.target.value)} className={inputCls} /></label>
          <label className="block text-xs font-medium text-muted">Ejemplo<input value={ex} onChange={(e) => setEx(e.target.value)} className={inputCls} /></label>
          <label className="block text-xs font-medium text-muted">Traducción<input value={tr} onChange={(e) => setTr(e.target.value)} className={inputCls} /></label>
        </div>
      </details>
      {aiOk && (
        <label className="flex cursor-pointer items-center gap-3 text-sm">
          <input type="checkbox" checked={withAi} onChange={(e) => setWithAi(e.target.checked)} className="h-5 w-5 accent-[var(--brand)]" />
          Completar lo que falte con IA (1 uso)
        </label>
      )}
      <button type="submit" disabled={!term.trim() || busy} className="min-h-12 w-full rounded-lg bg-brand px-5 text-sm font-semibold text-brand-ink disabled:opacity-50">
        {busy ? "Guardando…" : "Guardar en mi banco"}
      </button>
    </form>
  );
}
