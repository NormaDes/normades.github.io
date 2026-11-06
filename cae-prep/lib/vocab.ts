import { z } from "zod";
import { newSrs } from "@/lib/sm2";
import type { VocabItem } from "@/lib/storage/types";

export const vocabEnrichSchema = z.object({
  items: z
    .array(
      z.object({
        term: z.string().min(1),
        pos: z.string().max(30),
        definition: z.string().min(5).max(220),
        example: z.string().min(5).max(260),
        collocations: z.array(z.string().min(2).max(60)).min(1).max(5),
        translation: z.string().min(1).max(120),
      }),
    )
    .min(1)
    .max(8),
});

export type VocabEnrichment = z.infer<typeof vocabEnrichSchema>["items"][number];

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export function makeVocab(input: Partial<VocabItem> & { term: string }, now: Date = new Date()): VocabItem {
  const srs = newSrs(now);
  return {
    id: uid(),
    collocations: [],
    createdAt: now.toISOString(),
    ...srs,
    ...input,
    term: input.term.trim(),
  };
}

/** Cuando guardas una palabra que ya tenías, conserva el progreso y rellena lo que faltaba */
export function mergeVocab(existing: VocabItem, incoming: Partial<VocabItem>): VocabItem {
  return {
    ...existing,
    definition: existing.definition || incoming.definition,
    example: existing.example || incoming.example,
    translation: existing.translation || incoming.translation,
    collocations: existing.collocations.length ? existing.collocations : (incoming.collocations ?? []),
    context: existing.context || incoming.context,
    sourceTitle: existing.sourceTitle || incoming.sourceTitle,
    sourceUrl: existing.sourceUrl || incoming.sourceUrl,
  };
}

export const needsEnrichment = (v: VocabItem) => !v.definition || !v.example || v.collocations.length === 0;

/** Recorta una selección de texto a un término razonable (palabra o frase corta) */
export function cleanTerm(raw: string): string {
  return raw.replace(/\s+/g, " ").replace(/^[\s"'“”‘’(\[.,;:!?-]+|[\s"'“”‘’)\].,;:!?-]+$/g, "").slice(0, 70);
}

/** La frase del texto que contiene la selección (para guardar el contexto) */
export function sentenceAround(paragraph: string, term: string): string {
  const sentences = paragraph.match(/[^.!?]+[.!?]+["')”’]*|[^.!?]+$/g) ?? [paragraph];
  const hit = sentences.find((s) => s.toLowerCase().includes(term.toLowerCase())) ?? sentences[0] ?? paragraph;
  return hit.trim().slice(0, 300);
}
