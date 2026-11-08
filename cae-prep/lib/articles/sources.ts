import "server-only";
import { classifyTopic, countWords, decodeEntities, estimateDifficulty, excerptOf, htmlToText } from "@/lib/articles/text";
import { SOURCE_INFO, type Article, type ArticleSource, type ArticleTopic, type TopicId } from "@/lib/articles/types";

/**
 * Descarga y normaliza artículos de fuentes con licencia abierta o API oficial.
 * Las URLs base se pueden cambiar con variables de entorno (útil para pruebas).
 */
const env = (k: string, d: string) => process.env[k] || d;

export const bases = () => ({
  guardian: env("GUARDIAN_API_BASE", "https://content.guardianapis.com"),
  conversation: env("CONVERSATION_FEED_URL", "https://theconversation.com/uk/articles.atom"),
  wikipedia: env("WIKIPEDIA_API_BASE", "https://en.wikipedia.org"),
  wikinews: env("WIKINEWS_API_BASE", "https://en.wikinews.org"),
});

const MAX_WORDS = 2500;
const UA = "Englora/1.0 (educational English practice; contact via site)";

async function get(url: string, accept = "application/json"): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: accept }, signal: AbortSignal.timeout(9000), next: { revalidate: 86_400 } });
  if (!res.ok) throw new Error(`${res.status} ${new URL(url).host}`);
  return res.text();
}

function build(source: ArticleSource, p: { externalId: string; title: string; author: string; publishedAt: string | null; url: string; text: string; topic?: ArticleTopic }): Article | null {
  const text = p.text.split(/\s+/).slice(0, MAX_WORDS).join(" ");
  const words = countWords(p.text);
  if (words < 120) return null; // demasiado corto para practicar
  const body = p.text.split("\n\n").join("\n\n");
  const info = SOURCE_INFO[source];
  return {
    id: `${source}:${p.externalId}`,
    source,
    externalId: p.externalId,
    title: decodeEntities(p.title).trim(),
    author: p.author.trim() || info.name,
    publishedAt: p.publishedAt,
    url: p.url,
    license: info.license,
    fullTextAllowed: info.fullText,
    excerpt: excerptOf(text, 55),
    body: info.fullText ? limitWords(body, MAX_WORDS) : undefined,
    topic: p.topic ?? classifyTopic(`${p.title} ${p.text}`),
    wordCount: Math.min(words, MAX_WORDS),
    level: estimateDifficulty(text).level,
  };
}

function limitWords(text: string, max: number): string {
  let n = 0;
  const out: string[] = [];
  for (const para of text.split("\n\n")) {
    const c = countWords(para);
    if (n + c > max && out.length) break;
    out.push(para);
    n += c;
  }
  return out.join("\n\n");
}

/* ───────── The Guardian (Open Platform) ───────── */
const GUARDIAN_FILTER: Record<TopicId, string> = {
  tecnologia: "section=technology",
  "medio-ambiente": "section=environment",
  educacion: "section=education",
  salud: "tag=society/health",
  trabajo: "tag=money/work-and-careers",
  cultura: "section=culture",
  ciencia: "section=science",
};

interface GuardianResult {
  id: string;
  webTitle: string;
  webUrl: string;
  webPublicationDate?: string;
  fields?: { body?: string; byline?: string; trailText?: string; wordcount?: string };
}

export function parseGuardian(json: string, topic?: TopicId): Article[] {
  const data = JSON.parse(json) as { response?: { results?: GuardianResult[] } };
  const out: Article[] = [];
  for (const r of data.response?.results ?? []) {
    if (!r.fields?.body) continue;
    const a = build("guardian", {
      externalId: r.id,
      title: r.webTitle,
      author: decodeEntities(r.fields.byline ?? ""),
      publishedAt: r.webPublicationDate ?? null,
      url: r.webUrl,
      text: htmlToText(r.fields.body),
      topic,
    });
    if (a) out.push(a);
  }
  return out;
}

export async function fetchGuardian(topic: TopicId | undefined, apiKey: string): Promise<Article[]> {
  const filter = topic ? `&${GUARDIAN_FILTER[topic]}` : "";
  const url = `${bases().guardian}/search?api-key=${encodeURIComponent(apiKey)}${filter}&show-fields=body,byline,trailText,wordcount&page-size=12&order-by=newest&type=article`;
  return parseGuardian(await get(url), topic);
}

/* ───────── The Conversation (Atom, CC BY-ND) ───────── */
const tag = (xml: string, name: string) => xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"))?.[1] ?? "";
const unCdata = (s: string) => s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");

export function parseConversation(xml: string): Article[] {
  const out: Article[] = [];
  for (const entry of xml.split(/<entry[\s>]/i).slice(1)) {
    const body = entry.split(/<\/entry>/i)[0];
    const content = unCdata(tag(body, "content")) || unCdata(tag(body, "summary"));
    const link = body.match(/<link[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? body.match(/<link[^>]*href=["']([^"']+)["']/i)?.[1] ?? "";
    const id = tag(body, "id").trim() || link;
    const authorBlock = tag(body, "author");
    const a = build("conversation", {
      externalId: id,
      title: unCdata(tag(body, "title")),
      author: decodeEntities(unCdata(tag(authorBlock, "name"))),
      publishedAt: tag(body, "published").trim() || tag(body, "updated").trim() || null,
      url: decodeEntities(link),
      text: htmlToText(decodeEntities(content).includes("<") && !content.includes("<") ? decodeEntities(content) : content),
    });
    if (a) out.push(a);
  }
  return out;
}

export async function fetchConversation(): Promise<Article[]> {
  return parseConversation(await get(bases().conversation, "application/atom+xml, application/xml"));
}

/* ───────── Wikipedia / Wikinews (MediaWiki API, CC BY-SA / CC BY) ───────── */
const WIKI_TITLES: Record<TopicId, string[]> = {
  tecnologia: ["Artificial intelligence", "Internet", "Smartphone", "Robotics", "Cryptography"],
  "medio-ambiente": ["Climate change", "Renewable energy", "Biodiversity", "Recycling", "Deforestation"],
  educacion: ["Education", "Distance education", "Bilingual education", "Homeschooling", "Lifelong learning"],
  salud: ["Sleep", "Mental health", "Nutrition", "Vaccination", "Physical exercise"],
  trabajo: ["Remote work", "Unemployment", "Entrepreneurship", "Work–life balance", "Gig economy"],
  cultura: ["Renaissance", "Globalization", "Museum", "Opera", "Folklore"],
  ciencia: ["Black hole", "Evolution", "DNA", "Quantum mechanics", "Photosynthesis"],
};

interface MwPage {
  pageid?: number;
  title: string;
  extract?: string;
  fullurl?: string;
  touched?: string;
  missing?: boolean;
}

export function parseMediaWiki(json: string, source: "wikipedia" | "wikinews", topic?: TopicId): Article | null {
  const page = (JSON.parse(json) as { query?: { pages?: MwPage[] } }).query?.pages?.[0];
  if (!page || page.missing || !page.extract) return null;
  const text = page.extract
    .replace(/^=+\s*(.*?)\s*=+$/gm, "\n\n$1\n\n")
    .replace(/\n{3,}/g, "\n\n")
    .split(/\n{2,}/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter((p) => p.length > 0)
    .join("\n\n");
  return build(source, {
    externalId: String(page.pageid ?? page.title),
    title: page.title,
    author: source === "wikipedia" ? "Wikipedia contributors" : "Wikinews contributors",
    publishedAt: page.touched ?? null,
    url: page.fullurl ?? `${bases()[source]}/wiki/${encodeURIComponent(page.title.replace(/ /g, "_"))}`,
    text,
    topic,
  });
}

async function fetchMwPage(source: "wikipedia" | "wikinews", title: string, topic?: TopicId): Promise<Article | null> {
  const url = `${bases()[source]}/w/api.php?action=query&format=json&formatversion=2&prop=extracts%7Cinfo&explaintext=1&exsectionformat=plain&inprop=url&redirects=1&titles=${encodeURIComponent(title)}`;
  return parseMediaWiki(await get(url), source, topic);
}

export async function fetchWikipedia(topic: TopicId): Promise<Article[]> {
  const settled = await Promise.allSettled(WIKI_TITLES[topic].map((t) => fetchMwPage("wikipedia", t, topic)));
  return settled.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
}

export async function fetchWikinews(): Promise<Article[]> {
  const list = `${bases().wikinews}/w/api.php?action=query&format=json&formatversion=2&list=categorymembers&cmtitle=Category:Published&cmlimit=8&cmsort=timestamp&cmdir=desc&cmtype=page`;
  const titles = ((JSON.parse(await get(list)) as { query?: { categorymembers?: Array<{ title: string }> } }).query?.categorymembers ?? []).map((m) => m.title);
  const settled = await Promise.allSettled(titles.map((t) => fetchMwPage("wikinews", t)));
  return settled.flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []));
}
