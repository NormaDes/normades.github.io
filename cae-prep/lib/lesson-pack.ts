import { z } from "zod";

/** Paquete de clase generado a partir de un texto real: resumen, comprensión, vocabulario C1, colocaciones y essay */
export const lessonPackSchema = z.object({
  summary: z.string().min(150).max(1400),
  comprehension: z
    .array(
      z.object({
        stem: z.string().min(8),
        options: z.array(z.string().min(1)).length(4),
        correct: z.number().int().min(0).max(3),
        explanation: z.string().min(5),
        evidence: z.string().min(3),
      }),
    )
    .length(5),
  vocabulary: z
    .array(
      z.object({
        term: z.string().min(1).max(60),
        pos: z.string().max(30),
        definition: z.string().min(5).max(220),
        example: z.string().min(5).max(260),
        collocations: z.array(z.string().min(2).max(60)).min(2).max(5),
        translation: z.string().min(1).max(120),
      }),
    )
    .length(8),
  collocations: z
    .array(
      z.object({
        sentence: z.string().min(10),
        options: z.array(z.string().min(1)).length(4),
        correct: z.number().int().min(0).max(3),
        explanation: z.string().min(5),
      }),
    )
    .length(5),
  essay: z.object({
    question: z.string().min(30),
    points: z.array(z.string().min(2)).length(3),
  }),
});

export type LessonPack = z.infer<typeof lessonPackSchema>;

export function validatePack(data: unknown): string[] {
  const parsed = lessonPackSchema.safeParse(data);
  if (!parsed.success) return parsed.error.issues.slice(0, 8).map((i) => `${i.path.join(".")}: ${i.message}`);
  const p = parsed.data;
  const problems: string[] = [];
  p.collocations.forEach((c, i) => {
    if (!c.sentence.includes("____")) problems.push(`collocations.${i}: la frase debe contener el hueco "____".`);
    if (new Set(c.options.map((o) => o.toLowerCase())).size !== 4) problems.push(`collocations.${i}: opciones duplicadas.`);
  });
  p.comprehension.forEach((q, i) => {
    if (new Set(q.options.map((o) => o.toLowerCase())).size !== 4) problems.push(`comprehension.${i}: opciones duplicadas.`);
  });
  if (!/own idea/i.test(p.essay.points[2])) problems.push('essay.points[2] debe ser "your own idea".');
  return problems;
}
