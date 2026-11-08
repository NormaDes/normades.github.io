import type { ArticleTopic, Level, LengthBucket } from "@/lib/articles/types";

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", ldquo: "“", rdquo: "”", mdash: "—", ndash: "–", hellip: "…", pound: "£", euro: "€", eacute: "é", egrave: "è", agrave: "à", ouml: "ö", uuml: "ü", ccedil: "ç", copy: "©", deg: "°",
};

export function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h: string) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d: string) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n: string) => NAMED[n.toLowerCase()] ?? m);
}

/** HTML de un artículo → texto plano con párrafos separados por una línea en blanco */
export function htmlToText(html: string): string {
  const cleaned = html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|figure|aside|iframe|nav|form|table|svg)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|h[1-6]|li|div|blockquote|section)>/gi, "\n\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<[^>]+>/g, "");
  return decodeEntities(cleaned)
    .replace(/[ \t ]+/g, " ")
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s*\n\s*/g, " ").trim())
    .filter((p) => p.length > 0)
    .join("\n\n");
}

export const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export function excerptOf(text: string, words = 60): string {
  const w = text.split(/\s+/).filter(Boolean);
  return w.length <= words ? text.trim() : w.slice(0, words).join(" ") + "…";
}

export function lengthBucket(words: number): LengthBucket {
  return words < 450 ? "short" : words <= 1000 ? "medium" : "long";
}

/** Dificultad orientativa a partir de la longitud de las frases y la proporción de palabras largas */
export function estimateDifficulty(text: string): { level: Level; score: number } {
  const words = text.split(/\s+/).filter(Boolean);
  if (words.length < 20) return { level: "B2+", score: 0 };
  const sentences = Math.max(1, (text.match(/[.!?]+(\s|$)/g) ?? []).length);
  const long = words.filter((w) => w.replace(/[^\p{L}]/gu, "").length >= 9).length / words.length;
  const score = 0.6 * (words.length / sentences) + 60 * long;
  return { level: score < 15 ? "B2+" : score <= 22 ? "C1" : "C2", score: Math.round(score * 10) / 10 };
}

const KEYWORDS: Record<Exclude<ArticleTopic, "general">, string[]> = {
  tecnologia: ["technology", "digital", "artificial intelligence", " ai ", "software", "internet", "online", "robot", "smartphone", "algorithm", "data", "cyber", "app ", "computer", "social media", "tech "],
  "medio-ambiente": ["climate", "environment", "carbon", "emissions", "renewable", "pollution", "biodiversity", "wildlife", "energy", "sustainab", "recycl", "forest", "ocean", "plastic", "global warming"],
  educacion: ["school", "university", "student", "education", "teacher", "learning", "pupils", "curriculum", "exam", "college", "classroom", "tuition"],
  salud: ["health", "medical", "disease", "hospital", "mental", "patients", "nutrition", "sleep", "vaccine", "doctor", "diet", "cancer", "wellbeing", "obesity"],
  trabajo: ["work", "job", "employ", "career", "workers", "salary", "unemployment", "remote", "office", "business", "company", "workplace", "labour", "economy"],
  cultura: ["culture", "art ", "film", "music", "book", "museum", "theatre", "literature", "heritage", "festival", "cinema", "novel", "painting", "tradition"],
  ciencia: ["scientist", "research", "study", "physics", "biology", "evolution", "space", "astronomy", "species", "genetic", "experiment", "universe", "chemistry", "dna"],
};

/** Asigna un tema por palabras clave (el de más coincidencias; «general» si ninguna) */
export function classifyTopic(text: string): ArticleTopic {
  const t = ` ${text.toLowerCase()} `;
  let best: ArticleTopic = "general";
  let bestScore = 0;
  for (const [topic, kws] of Object.entries(KEYWORDS)) {
    let score = 0;
    for (const k of kws) score += t.split(k).length - 1;
    if (score > bestScore) {
      bestScore = score;
      best = topic as ArticleTopic;
    }
  }
  return bestScore >= 3 ? best : "general";
}

export function encodeId(id: string): string {
  const bytes = new TextEncoder().encode(id);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeId(code: string): string {
  const b64 = code.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (code.length % 4)) % 4);
  return new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
}
