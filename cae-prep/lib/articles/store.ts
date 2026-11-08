import "server-only";
import { classifyTopic } from "@/lib/articles/text";
import { fetchConversation, fetchGuardian, fetchWikinews, fetchWikipedia } from "@/lib/articles/sources";
import type { Article, ArticleSource, ArticleSummary, ArticleTopic, Level, TopicId } from "@/lib/articles/types";
import { getAdminClient } from "@/lib/supabase/server";

/**
 * Caché de artículos: se refresca como mucho una vez al día.
 * Con SUPABASE_SERVICE_ROLE_KEY se guarda en la tabla `articles`; si no, en memoria de la instancia.
 */
const TTL_MS = 24 * 3_600_000;
const mem = new Map<string, { at: number; items: Article[] }>();

export interface SourceStatus {
  source: ArticleSource;
  state: "ok" | "error" | "skipped";
  count: number;
  message?: string;
}

interface ArticleRow {
  source: ArticleSource;
  external_id: string;
  title: string;
  author: string | null;
  published_at: string | null;
  url: string;
  license: string;
  full_text_allowed: boolean;
  excerpt: string | null;
  body: string | null;
  topic: string | null;
  word_count: number | null;
  difficulty: string | null;
}

const toRow = (a: Article) => ({
  source: a.source,
  external_id: a.externalId,
  title: a.title,
  author: a.author,
  published_at: a.publishedAt,
  url: a.url,
  license: a.license,
  full_text_allowed: a.fullTextAllowed,
  excerpt: a.excerpt,
  body: a.fullTextAllowed ? (a.body ?? null) : null,
  topic: a.topic,
  word_count: a.wordCount,
  difficulty: a.level,
  fetched_at: new Date().toISOString(),
});

const fromRow = (r: ArticleRow): Article => ({
  id: `${r.source}:${r.external_id}`,
  source: r.source,
  externalId: r.external_id,
  title: r.title,
  author: r.author ?? "",
  publishedAt: r.published_at,
  url: r.url,
  license: r.license,
  fullTextAllowed: r.full_text_allowed,
  excerpt: r.excerpt ?? "",
  body: r.body ?? undefined,
  topic: (r.topic as ArticleTopic) ?? "general",
  wordCount: r.word_count ?? 0,
  level: (r.difficulty as Level) ?? "C1",
});

async function dbRead(topic: string): Promise<Article[] | null> {
  const admin = getAdminClient();
  if (!admin) return null;
  let q = admin.from("articles").select("*").gte("fetched_at", new Date(Date.now() - TTL_MS).toISOString()).order("published_at", { ascending: false, nullsFirst: false }).limit(60);
  if (topic !== "all") q = q.eq("topic", topic);
  const { data, error } = await q;
  if (error || !data) return null;
  return (data as ArticleRow[]).map(fromRow);
}

async function dbWrite(items: Article[]) {
  const admin = getAdminClient();
  if (!admin || !items.length) return;
  const { error } = await admin.from("articles").upsert(items.map(toRow), { onConflict: "source,external_id" });
  if (error) console.warn("[articles] no se pudo guardar la caché:", error.message);
}

const byDate = (a: Article, b: Article) => (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
const summary = ({ body: _body, ...rest }: Article): ArticleSummary => rest; // eslint-disable-line @typescript-eslint/no-unused-vars

async function refresh(topic: TopicId | "all"): Promise<{ items: Article[]; status: SourceStatus[] }> {
  const key = process.env.GUARDIAN_API_KEY;
  const jobs: Array<{ source: ArticleSource; run: (() => Promise<Article[]>) | null; note?: string }> = [
    { source: "guardian", run: key ? () => fetchGuardian(topic === "all" ? undefined : topic, key) : null, note: "Falta GUARDIAN_API_KEY" },
    { source: "conversation", run: () => fetchConversation() },
    { source: "wikipedia", run: topic === "all" ? null : () => fetchWikipedia(topic), note: "Solo al elegir un tema" },
    { source: "wikinews", run: () => fetchWikinews() },
  ];
  const settled = await Promise.allSettled(jobs.map((j) => (j.run ? j.run() : Promise.resolve([] as Article[]))));
  const status: SourceStatus[] = [];
  let items: Article[] = [];
  settled.forEach((r, i) => {
    const j = jobs[i];
    if (!j.run) return status.push({ source: j.source, state: "skipped", count: 0, message: j.note });
    if (r.status === "rejected") return status.push({ source: j.source, state: "error", count: 0, message: String(r.reason?.message ?? r.reason).slice(0, 120) });
    // Los feeds generales (Conversation, Wikinews) se reclasifican por tema
    const list = topic === "all" || j.source === "guardian" || j.source === "wikipedia" ? r.value : r.value.filter((a) => (a.topic === "general" ? classifyTopic(`${a.title} ${a.excerpt}`) : a.topic) === topic).map((a) => ({ ...a, topic }));
    status.push({ source: j.source, state: "ok", count: list.length });
    items = items.concat(list);
  });
  const unique = [...new Map(items.map((a) => [a.id, a])).values()].sort(byDate).slice(0, 60);
  return { items: unique, status };
}

export async function listArticles(topic: TopicId | "all"): Promise<{ items: ArticleSummary[]; status: SourceStatus[]; cached: boolean }> {
  const hit = mem.get(topic);
  if (hit && Date.now() - hit.at < TTL_MS) return { items: hit.items.map(summary), status: [], cached: true };

  const fromDb = await dbRead(topic);
  if (fromDb && fromDb.length >= 3) {
    mem.set(topic, { at: Date.now(), items: fromDb });
    return { items: fromDb.map(summary), status: [], cached: true };
  }

  const { items, status } = await refresh(topic);
  if (items.length) {
    mem.set(topic, { at: Date.now(), items });
    await dbWrite(items);
  }
  return { items: items.map(summary), status, cached: false };
}

export async function getArticle(id: string): Promise<Article | null> {
  for (const { items } of mem.values()) {
    const a = items.find((x) => x.id === id);
    if (a) return a;
  }
  const [source, ...rest] = id.split(":");
  const admin = getAdminClient();
  if (admin && rest.length) {
    const { data } = await admin.from("articles").select("*").eq("source", source).eq("external_id", rest.join(":")).maybeSingle();
    if (data) return fromRow(data as ArticleRow);
  }
  return null;
}
