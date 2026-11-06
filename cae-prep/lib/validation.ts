import { KWT_RULES, getPart, type PartId } from "@/config/exam";
import { containsWholeWord, countWords } from "@/lib/checking";
import { schemaForPart, type ExerciseContent } from "@/lib/schemas";

/**
 * Validación semántica además de zod. Devuelve una lista de problemas
 * (vacía si el ejercicio es válido). Se usa en la generación con IA
 * (para reintentar) y en el script de validación de los seeds.
 */

function markersOf(text: string): number[] {
  return [...text.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));
}

function checkMarkers(text: string, count: number, problems: string[]) {
  const found = markersOf(text);
  const expected = Array.from({ length: count }, (_, i) => i + 1);
  if (found.length !== count || expected.some((n, i) => found[i] !== n)) {
    problems.push(
      `El texto debe contener exactamente los marcadores {{1}}..{{${count}}} una vez cada uno y en orden (encontrados: ${found.join(",") || "ninguno"}).`,
    );
  }
}

function checkNumbering(ns: number[], count: number, problems: string[]) {
  const expected = Array.from({ length: count }, (_, i) => i + 1);
  if (ns.length !== count || expected.some((n, i) => ns[i] !== n)) {
    problems.push(`Los campos "n" deben ser 1..${count} en orden.`);
  }
}

const isOneWord = (s: string) => /^[\p{L}][\p{L}'-]*$/u.test(s.trim());

export function validateContent(partId: PartId, data: unknown): string[] {
  const problems: string[] = [];
  const count = getPart(partId).questionCount;
  const parsed = schemaForPart(partId).safeParse(data);
  if (!parsed.success) {
    return parsed.error.issues.slice(0, 8).map((i) => `${i.path.join(".")}: ${i.message}`);
  }
  const content = { partId, data: parsed.data } as ExerciseContent;

  switch (content.partId) {
    case "r1": {
      const d = content.data;
      checkMarkers(d.text, count, problems);
      checkNumbering(d.questions.map((q) => q.n), count, problems);
      for (const q of d.questions) {
        const lower = q.options.map((o) => o.trim().toLowerCase());
        if (new Set(lower).size !== 4) problems.push(`P${q.n}: opciones duplicadas.`);
      }
      break;
    }
    case "r2": {
      const d = content.data;
      checkMarkers(d.text, count, problems);
      checkNumbering(d.gaps.map((g) => g.n), count, problems);
      for (const g of d.gaps) {
        for (const a of g.answers) {
          if (!isOneWord(a)) problems.push(`Hueco ${g.n}: "${a}" no es una sola palabra (Open cloze = UNA palabra).`);
        }
      }
      break;
    }
    case "r3": {
      const d = content.data;
      checkMarkers(d.text, count, problems);
      checkNumbering(d.gaps.map((g) => g.n), count, problems);
      for (const g of d.gaps) {
        if (g.base !== g.base.toUpperCase() || !isOneWord(g.base)) {
          problems.push(`Hueco ${g.n}: la palabra base "${g.base}" debe estar en MAYÚSCULAS y ser una sola palabra.`);
        }
        for (const a of g.answers) {
          if (!isOneWord(a)) problems.push(`Hueco ${g.n}: "${a}" debe ser una sola palabra.`);
          if (a.toLowerCase() === g.base.toLowerCase()) {
            problems.push(`Hueco ${g.n}: la respuesta "${a}" es igual a la palabra base (debe transformarse).`);
          }
        }
      }
      break;
    }
    case "r4": {
      const d = content.data;
      checkNumbering(d.items.map((i) => i.n), count, problems);
      for (const it of d.items) {
        if (it.keyword !== it.keyword.toUpperCase() || !isOneWord(it.keyword)) {
          problems.push(`Ítem ${it.n}: la keyword "${it.keyword}" debe estar en MAYÚSCULAS y ser una sola palabra.`);
        }
        const kw = it.keyword.toLowerCase();
        for (const a of it.answers) {
          const words = countWords(a);
          if (words < KWT_RULES.minWords || words > KWT_RULES.maxWords) {
            problems.push(`Ítem ${it.n}: "${a}" tiene ${words} palabras (debe tener entre ${KWT_RULES.minWords} y ${KWT_RULES.maxWords}, contando la keyword).`);
          }
          if (!containsWholeWord(a, kw)) {
            problems.push(`Ítem ${it.n}: "${a}" no contiene la keyword "${it.keyword}" sin cambiar.`);
          }
        }
        if (containsWholeWord(`${it.before} ${it.after}`, kw)) {
          problems.push(`Ítem ${it.n}: la keyword aparece fuera del hueco.`);
        }
      }
      break;
    }
  }
  return problems;
}
