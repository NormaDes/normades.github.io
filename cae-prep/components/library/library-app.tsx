"use client";

import { Briefcase, Cpu, Flask, GraduationCap, Heartbeat, Leaf, Newspaper, Palette, type Icon } from "@phosphor-icons/react";
import { useUser } from "@/lib/supabase/use-user";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MaterialCard } from "@/components/library/material-card";
import { PlayIcon } from "@/components/icons";
import { encodeId } from "@/lib/articles/text";
import { SOURCE_INFO, TOPICS, type ArticleSummary, type Level, type LengthBucket } from "@/lib/articles/types";
import { lengthBucket } from "@/lib/articles/text";
import { CHANNELS, CURATED_VIDEOS, PODCASTS, parseYouTubeId } from "@/lib/library/catalog";
import { repo, type Material } from "@/lib/storage";
import { useQueryParam } from "@/lib/use-query-param";

const TOPIC_TILE: Record<string, { tile: string; Glyph: Icon }> = {
  tecnologia: { tile: "bg-brand-soft text-brand", Glyph: Cpu },
  "medio-ambiente": { tile: "bg-ok-soft text-ok", Glyph: Leaf },
  educacion: { tile: "bg-sun-soft text-[#7a5a00]", Glyph: GraduationCap },
  salud: { tile: "bg-coral-soft text-accent-dark", Glyph: Heartbeat },
  trabajo: { tile: "bg-tangerine-soft text-tangerine-dark", Glyph: Briefcase },
  cultura: { tile: "bg-grape-soft text-grape-dark", Glyph: Palette },
  ciencia: { tile: "bg-sky-soft text-[#0b6aa0]", Glyph: Flask },
};
function topicStyle(topic: string) {
  const t = TOPIC_TILE[topic] ?? { tile: "bg-bg text-muted", Glyph: Newspaper };
  return { tile: t.tile, icon: <t.Glyph size={30} weight="duotone" /> };
}

type Tab = "articulos" | "videos" | "podcasts" | "clase";
const TABS: Array<[Tab, string]> = [["articulos", "Artículos"], ["videos", "Vídeos"], ["podcasts", "Podcasts"], ["clase", "Material de clase"]];

const inputCls = "h-11 w-full rounded-lg border border-line bg-surface px-3 text-[15px] focus:border-brand";
const chip = (on: boolean) => `min-h-9 rounded-lg border px-3 text-xs font-semibold ${on ? "border-brand bg-brand text-brand-ink" : "border-line bg-surface hover:border-brand"}`;
const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" }) : "");

export function LibraryApp() {
  const param = useQueryParam("tab");
  const [picked, setPicked] = useState<Tab | null>(null);
  const tab: Tab = picked ?? (TABS.some(([t]) => t === param) ? (param as Tab) : "articulos");
  const [materials, setMaterials] = useState<Material[] | null>(null);

  const reload = useCallback(async () => setMaterials(await repo.listMaterials()), []);
  useEffect(() => {
    let cancelled = false;
    repo.listMaterials().then((m) => !cancelled && setMaterials(m));
    return () => {
      cancelled = true;
    };
  }, []);

  const select = (t: Tab) => {
    setPicked(t);
    window.history.replaceState(null, "", `/biblioteca?tab=${t}`);
  };

  return (
    <div>
      <div role="tablist" aria-label="Biblioteca" className="mb-6 flex items-center gap-2 overflow-x-auto pb-1">
        {TABS.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => select(id)} className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-extrabold transition-colors ${tab === id ? "bg-ok text-white shadow-[0_3px_0_#0a5f3e]" : "bg-surface text-muted ring-2 ring-line hover:text-ink"}`}>
            {label}
          </button>
        ))}
        <Link href="/biblioteca/pegar" className="ml-auto flex min-h-11 shrink-0 items-center rounded-full bg-brand-soft px-4 text-sm font-extrabold text-brand hover:bg-brand hover:text-white">Pegar un texto →</Link>
      </div>

      {tab === "articulos" && <ArticlesTab />}
      {tab === "videos" && <VideosTab materials={materials} onChange={reload} />}
      {tab === "podcasts" && <PodcastsTab materials={materials} onChange={reload} />}
      {tab === "clase" && <ClassTab materials={materials} />}
    </div>
  );
}

/* ───────── Artículos reales ───────── */
function ArticlesTab() {
  const [topic, setTopic] = useState<string>("all");
  const [length, setLength] = useState<LengthBucket | "all">("all");
  const [level, setLevel] = useState<Level | "all">("all");
  const [q, setQ] = useState("");
  const [state, setState] = useState<{ topic: string; items: ArticleSummary[]; status: Array<{ source: string; state: string; message?: string }>; error?: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/articles?topic=${topic}`)
      .then(async (r) => {
        const j = await r.json();
        if (!r.ok) throw new Error(j.error ?? "No se han podido cargar los artículos.");
        if (!cancelled) setState({ topic, items: j.items, status: j.status ?? [] });
      })
      .catch((e: Error) => !cancelled && setState({ topic, items: [], status: [], error: e.message }));
    return () => {
      cancelled = true;
    };
  }, [topic]);

  const loading = !state || state.topic !== topic;
  const shown = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (state?.items ?? []).filter((a) => (length === "all" || lengthBucket(a.wordCount) === length) && (level === "all" || a.level === level) && (!text || `${a.title} ${a.author}`.toLowerCase().includes(text)));
  }, [state, length, level, q]);

  const problems = (state?.status ?? []).filter((s) => s.state === "error");
  const skipped = (state?.status ?? []).filter((s) => s.state === "skipped" && s.source === "guardian");

  return (
    <div>
      <p className="mb-4 max-w-2xl text-sm text-muted">Artículos <strong>reales</strong> de fuentes con licencia (The Guardian, The Conversation, Wikipedia, Wikinews), siempre con su autor, fecha, licencia y enlace al original. Se refrescan cada día.</p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Tema">
        <button type="button" className={chip(topic === "all")} onClick={() => setTopic("all")}>Todos</button>
        {TOPICS.map((t) => (
          <button key={t.id} type="button" className={chip(topic === t.id)} onClick={() => setTopic(t.id)}>{t.label}</button>
        ))}
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_auto]">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título o autor…" aria-label="Buscar" className={inputCls} />
        <select value={length} onChange={(e) => setLength(e.target.value as LengthBucket | "all")} aria-label="Longitud" className={`${inputCls} sm:w-48`}>
          <option value="all">Cualquier longitud</option>
          <option value="short">Corto (&lt; 450)</option>
          <option value="medium">Medio (450–1000)</option>
          <option value="long">Largo (&gt; 1000)</option>
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value as Level | "all")} aria-label="Dificultad" className={`${inputCls} sm:w-48`}>
          <option value="all">Cualquier nivel</option>
          <option value="B2+">B2+</option>
          <option value="C1">C1</option>
          <option value="C2">C2</option>
        </select>
      </div>

      {loading ? (
        <div className="mt-6 space-y-3" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-line/60" />)}</div>
      ) : state.error ? (
        <p role="alert" className="mt-6 rounded-xl bg-bad-soft p-4 text-sm text-bad">{state.error}</p>
      ) : shown.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line bg-surface p-6 text-sm text-muted">
          <p className="font-semibold text-ink">No hay artículos con estos filtros.</p>
          {problems.length > 0 && <p className="mt-1">No se pudo conectar con: {problems.map((p) => SOURCE_INFO[p.source as keyof typeof SOURCE_INFO]?.name ?? p.source).join(", ")}. Inténtalo más tarde.</p>}
          {skipped.length > 0 && <p className="mt-1">The Guardian está pendiente de configurar (falta su clave gratuita de desarrollador).</p>}
          <p className="mt-1">Mientras tanto puedes <Link href="/biblioteca/pegar" className="font-semibold text-brand underline">pegar un texto</Link> de cualquier web.</p>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3">
          {shown.map((a) => (
            <li key={a.id}>
              <Link href={`/biblioteca/articulo?id=${encodeId(a.id)}`} className="group flex gap-4 rounded-3xl border-2 border-line bg-surface p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand/40 active:scale-[0.99] md:p-5">
                <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${topicStyle(a.topic).tile}`} aria-hidden>
                  {topicStyle(a.topic).icon}
                </span>
                <span className="block min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-md bg-brand-soft px-2 py-0.5 font-semibold text-brand">{SOURCE_INFO[a.source].name}</span>
                  <span className="text-muted">{fmt(a.publishedAt)}</span>
                  <span className="ml-auto flex gap-2 font-semibold">
                    <span className="text-muted">{a.wordCount} palabras</span>
                    <span className="text-accent-dark">{a.level}</span>
                  </span>
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold leading-snug group-hover:text-brand">{a.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-muted">{a.excerpt}</p>
                <p className="mt-2 text-xs text-muted">{a.author} · {a.license}</p>
              </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-6 text-xs text-muted">
        Fuentes: <a className="underline" href="https://open-platform.theguardian.com/" target="_blank" rel="noreferrer">The Guardian Open Platform</a>, <a className="underline" href="https://theconversation.com/" target="_blank" rel="noreferrer">The Conversation</a> (CC BY-ND), <a className="underline" href="https://www.wikipedia.org/" target="_blank" rel="noreferrer">Wikipedia</a> (CC BY-SA) y <a className="underline" href="https://www.wikinews.org/" target="_blank" rel="noreferrer">Wikinews</a> (CC BY).
      </p>
    </div>
  );
}

/* ───────── Vídeos ───────── */
function AddLink({ kind, onSaved }: { kind: "video" | "podcast"; onSaved: () => void }) {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = url.trim();
    if (kind === "video" && !parseYouTubeId(u)) return setErr("No reconozco ese enlace de YouTube.");
    if (kind === "podcast" && !/^https?:\/\//.test(u)) return setErr("Escribe un enlace que empiece por https://");
    setErr(null);
    await repo.saveMaterial({ id: crypto.randomUUID(), kind, title: title.trim() || (kind === "video" ? "Vídeo de YouTube" : "Podcast"), url: u, visibility: "private", createdAt: new Date().toISOString() });
    setUrl("");
    setTitle("");
    onSaved();
  };
  return (
    <form onSubmit={submit} className="rounded-xl border border-line bg-surface p-4">
      <p className="font-semibold">Añadir {kind === "video" ? "un vídeo de YouTube" : "un podcast"}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder={kind === "video" ? "https://www.youtube.com/watch?v=…" : "https://…"} inputMode="url" aria-label="Enlace" className={inputCls} />
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título (opcional)" aria-label="Título" className={inputCls} />
        <button type="submit" disabled={!url.trim()} className="min-h-11 rounded-lg bg-brand px-5 text-sm font-semibold text-brand-ink disabled:opacity-50">Añadir</button>
      </div>
      {err && <p role="alert" className="mt-2 text-sm text-bad">{err}</p>}
      <p className="mt-2 text-xs text-muted">Solo lo ves tú. Después podrás pegar la transcripción para generar ejercicios.</p>
    </form>
  );
}

function VideosTab({ materials, onChange }: { materials: Material[] | null; onChange: () => void }) {
  const [meta, setMeta] = useState<Record<string, { state: string; title?: string }>>({});

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/video-meta?ids=${CURATED_VIDEOS.map((v) => v.id).join(",")}`)
      .then((r) => r.json())
      .then((j) => !cancelled && setMeta(j.videos ?? {}))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const curated = CURATED_VIDEOS.filter((v) => meta[v.id]?.state !== "invalid");
  const mine = (materials ?? []).filter((m) => m.kind === "video" && m.visibility === "private");

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-xl font-bold">Charlas recomendadas</h2>
        <p className="mt-1 text-sm text-muted">Vídeos reales de YouTube (TED). Pega su transcripción para generar preguntas de comprensión, vocabulario C1 y ejercicios de colocaciones.</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {curated.map((v) => (
            <li key={v.id}>
              <Link href={`/biblioteca/video?v=${v.id}`} className="group block overflow-hidden rounded-xl border border-line bg-surface transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-[0_14px_30px_-18px_rgba(1,26,59,0.5)]">
                <div className="relative aspect-video bg-ink">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-90" />
                  <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/95 text-ink shadow"><PlayIcon width={22} height={22} /></span></span>
                </div>
                <div className="p-4">
                  <p className="eyebrow text-accent-dark">{v.channel}</p>
                  <p className="mt-1 font-display text-lg font-bold leading-snug">{meta[v.id]?.title ?? v.title}</p>
                  <p className="mt-0.5 text-sm text-muted">{v.speaker}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Tus vídeos</h2>
        <div className="mt-3 space-y-3">
          <AddLink kind="video" onSaved={onChange} />
          {mine.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {mine.map((m) => (
                <MaterialCard key={m.id} m={m} canDelete onDelete={async () => { await repo.deleteMaterial(m.id); onChange(); }} />
              ))}
            </ul>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-bold">Canales para seguir</h2>
        <ul className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {CHANNELS.map((c) => (
            <li key={c.url}>
              <a href={c.url} target="_blank" rel="noreferrer" className="block px-4 py-3 hover:bg-brand-soft/60">
                <span className="font-semibold">{c.title}</span> <span className="text-xs text-muted">· {c.by}</span>
                <span className="block text-sm text-muted">{c.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/* ───────── Podcasts ───────── */
function PodcastsTab({ materials, onChange }: { materials: Material[] | null; onChange: () => void }) {
  const mine = (materials ?? []).filter((m) => m.kind === "podcast" && m.visibility === "private");
  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-xl font-bold">Podcasts para el oído</h2>
        <p className="mt-1 text-sm text-muted">Se abren en su web original. Si copias la transcripción, puedes <Link href="/biblioteca/pegar?kind=video" className="font-semibold text-brand underline">convertirla en ejercicios</Link>.</p>
        <ul className="mt-4 divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
          {PODCASTS.map((p) => (
            <li key={p.url}>
              <a href={p.url} target="_blank" rel="noreferrer" className="block px-4 py-3.5 hover:bg-brand-soft/60">
                <span className="font-display text-lg font-bold">{p.title}</span> <span className="text-xs text-muted">· {p.by}</span>
                <span className="block text-sm text-muted">{p.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2 className="font-display text-xl font-bold">Tus podcasts</h2>
        <div className="mt-3 space-y-3">
          <AddLink kind="podcast" onSaved={onChange} />
          {mine.length > 0 && (
            <ul className="grid gap-3 sm:grid-cols-2">
              {mine.map((m) => (
                <MaterialCard key={m.id} m={m} canDelete onDelete={async () => { await repo.deleteMaterial(m.id); onChange(); }} />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}

/* ───────── Material de clase ───────── */
function ClassTab({ materials }: { materials: Material[] | null }) {
  const user = useUser();
  const guest = isSupabaseConfigured() && user === null;
  if (!materials) return <div className="h-32 animate-pulse rounded-xl bg-line/60" aria-busy="true" />;
  const list = materials.filter((m) => m.visibility === "class");
  if (!list.length && guest) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
        <p className="font-display text-xl font-bold">El material de clase es para alumnos con cuenta</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">Inicia sesión (es gratis) para ver los audios, textos y vídeos que sube tu profesor.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/login" className="inline-flex min-h-11 items-center rounded-lg bg-brand px-5 text-sm font-bold text-brand-ink">Entrar</Link>
          <Link href="/registro" className="inline-flex min-h-11 items-center rounded-lg border border-line px-5 text-sm font-semibold">Crear cuenta</Link>
        </div>
      </div>
    );
  }
  if (!list.length) {
    return (
      <div className="rounded-xl border border-dashed border-line bg-surface p-8 text-center">
        <p className="font-display text-xl font-bold">Todavía no hay material de clase</p>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">Cuando tu profesor suba audios, textos o vídeos, aparecerán aquí, solo para los alumnos con sesión iniciada.</p>
      </div>
    );
  }
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {list.map((m) => (
        <MaterialCard key={m.id} m={m} />
      ))}
    </ul>
  );
}
