export const TOPICS = [
  { id: "tecnologia", label: "Tecnología" },
  { id: "medio-ambiente", label: "Medio ambiente" },
  { id: "educacion", label: "Educación" },
  { id: "salud", label: "Salud" },
  { id: "trabajo", label: "Trabajo" },
  { id: "cultura", label: "Cultura" },
  { id: "ciencia", label: "Ciencia" },
] as const;

export type TopicId = (typeof TOPICS)[number]["id"];
export type ArticleTopic = TopicId | "general";
export type ArticleSource = "guardian" | "conversation" | "wikipedia" | "wikinews";
export type Level = "B2+" | "C1" | "C2";
export type LengthBucket = "short" | "medium" | "long";

export const SOURCE_INFO: Record<ArticleSource, { name: string; license: string; licenseUrl: string; fullText: boolean }> = {
  guardian: { name: "The Guardian", license: "Guardian Open Platform (uso no comercial, con atribución)", licenseUrl: "https://open-platform.theguardian.com/terms/", fullText: true },
  conversation: { name: "The Conversation", license: "CC BY-ND 4.0", licenseUrl: "https://creativecommons.org/licenses/by-nd/4.0/", fullText: true },
  wikipedia: { name: "Wikipedia", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/", fullText: true },
  wikinews: { name: "Wikinews", license: "CC BY 2.5", licenseUrl: "https://creativecommons.org/licenses/by/2.5/", fullText: true },
};

/** Artículo normalizado: siempre con título, autor, fecha, URL original y licencia */
export interface Article {
  id: string; // `${source}:${externalId}`
  source: ArticleSource;
  externalId: string;
  title: string;
  author: string;
  publishedAt: string | null;
  url: string;
  license: string;
  fullTextAllowed: boolean;
  excerpt: string;
  /** Texto completo (solo si la licencia lo permite) */
  body?: string;
  topic: ArticleTopic;
  wordCount: number;
  level: Level;
}

export type ArticleSummary = Omit<Article, "body">;
