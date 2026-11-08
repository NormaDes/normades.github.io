/**
 * Catálogo curado de la biblioteca. Los vídeos son charlas TED de YouTube; la app comprueba en tiempo
 * de ejecución que cada uno sigue existiendo y permite incrustarse (oEmbed) y oculta los que no.
 */
export interface CuratedVideo {
  id: string; // ID de YouTube
  title: string;
  speaker: string;
  topic: "tecnologia" | "medio-ambiente" | "educacion" | "salud" | "trabajo" | "cultura" | "ciencia";
  channel: string;
}

export const CURATED_VIDEOS: CuratedVideo[] = [
  { id: "iG9CE55wbtY", title: "Do schools kill creativity?", speaker: "Sir Ken Robinson", topic: "educacion", channel: "TED" },
  { id: "H14bBuluwB8", title: "Grit: the power of passion and perseverance", speaker: "Angela Lee Duckworth", topic: "educacion", channel: "TED" },
  { id: "arj7oStGLkU", title: "Inside the mind of a master procrastinator", speaker: "Tim Urban", topic: "trabajo", channel: "TED" },
  { id: "rrkrvAUbU9Y", title: "The puzzle of motivation", speaker: "Dan Pink", topic: "trabajo", channel: "TED" },
  { id: "RcGyVTAoXEU", title: "How to make stress your friend", speaker: "Kelly McGonigal", topic: "salud", channel: "TED" },
  { id: "UNP03fDSj1U", title: "Try something new for 30 days", speaker: "Matt Cutts", topic: "cultura", channel: "TED" },
  { id: "iCvmsMzlF7o", title: "The power of vulnerability", speaker: "Brené Brown", topic: "salud", channel: "TED" },
  { id: "Ks-_Mh1QhMc", title: "Your body language may shape who you are", speaker: "Amy Cuddy", topic: "salud", channel: "TED" },
  { id: "c0KYU2j0TM4", title: "The power of introverts", speaker: "Susan Cain", topic: "trabajo", channel: "TED" },
  { id: "eIho2S0ZahI", title: "How to speak so that people want to listen", speaker: "Julian Treasure", topic: "cultura", channel: "TED" },
  { id: "qp0HIF3SfI4", title: "How great leaders inspire action", speaker: "Simon Sinek", topic: "trabajo", channel: "TED" },
];

export interface CuratedLink {
  title: string;
  by: string;
  url: string;
  note: string;
}

export const CHANNELS: CuratedLink[] = [
  { title: "BBC Learning English", by: "BBC", url: "https://www.youtube.com/@bbclearningenglish", note: "Vídeos cortos de actualidad, gramática y vocabulario." },
  { title: "TED-Ed", by: "TED", url: "https://www.youtube.com/@TEDEd", note: "Lecciones animadas de 5 minutos con subtítulos en inglés." },
  { title: "TED", by: "TED", url: "https://www.youtube.com/@TED", note: "Charlas completas sobre ciencia, sociedad y cultura." },
  { title: "Cambridge English", by: "Cambridge", url: "https://www.youtube.com/@CambridgeEnglish", note: "Consejos oficiales y ejemplos del examen." },
  { title: "English with Lucy", by: "Lucy", url: "https://www.youtube.com/@EnglishwithLucy", note: "Vocabulario y gramática avanzada con acento británico." },
];

export const PODCASTS: CuratedLink[] = [
  { title: "6 Minute English", by: "BBC Learning English", url: "https://www.bbc.co.uk/learningenglish/english/features/6-minute-english", note: "Conversación sobre un tema de actualidad con vocabulario y transcripción." },
  { title: "The English We Speak", by: "BBC Learning English", url: "https://www.bbc.co.uk/learningenglish/english/features/the-english-we-speak", note: "Expresiones coloquiales explicadas en 3 minutos." },
  { title: "News Review", by: "BBC Learning English", url: "https://www.bbc.co.uk/learningenglish/english/features/news-review", note: "Dos presentadores comentan titulares y vocabulario de noticias." },
  { title: "TED Talks Daily", by: "TED", url: "https://www.ted.com/podcasts", note: "Una charla TED al día en formato audio." },
  { title: "Luke's English Podcast", by: "Luke Thompson", url: "https://teacherluke.co.uk/", note: "Inglés británico natural, de nivel avanzado." },
];

/** Extrae el ID de un enlace de YouTube (watch, youtu.be, embed, shorts) */
export function parseYouTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  try {
    const u = new URL(s);
    if (u.hostname.replace(/^www\.|^m\./, "") === "youtu.be") return u.pathname.slice(1).split("/")[0].match(/^[\w-]{11}$/)?.[0] ?? null;
    if (/(^|\.)youtube(-nocookie)?\.com$/.test(u.hostname)) {
      const v = u.searchParams.get("v");
      if (v && /^[\w-]{11}$/.test(v)) return v;
      const m = u.pathname.match(/\/(embed|shorts|live|v)\/([\w-]{11})/);
      if (m) return m[2];
    }
  } catch {
    /* no es una URL */
  }
  return null;
}
