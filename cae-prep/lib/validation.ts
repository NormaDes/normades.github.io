import { KWT_RULES, getPart, type PartId } from "@/config/exam";
import { containsWholeWord, countWords } from "@/lib/checking";
import { letterOf, schemaForPart, type ExerciseContent } from "@/lib/schemas";

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
    case "r5": {
      const d = content.data;
      checkNumbering(d.questions.map((q) => q.n), count, problems);
      for (const q of d.questions) {
        if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== 4) problems.push(`P${q.n}: opciones duplicadas.`);
      }
      const words = d.text.split(/\s+/).length;
      if (words < 450) problems.push(`El texto tiene ${words} palabras; debe tener unas 550-750.`);
      break;
    }
    case "r6": {
      const d = content.data;
      const n = getPart(partId).choices ?? 4;
      checkNumbering(d.questions.map((q) => q.n), count, problems);
      d.texts.forEach((t, i) => {
        if (t.label !== letterOf(i)) problems.push(`El texto ${i + 1} debe llamarse "${letterOf(i)}".`);
      });
      for (const q of d.questions) if (q.correct >= n) problems.push(`P${q.n}: "correct" fuera de rango.`);
      break;
    }
    case "r7": {
      const d = content.data;
      const n = getPart(partId).choices ?? 7;
      checkMarkers(d.text, count, problems);
      checkNumbering(d.gaps.map((g) => g.n), count, problems);
      d.paragraphs.forEach((p, i) => {
        if (p.letter !== letterOf(i)) problems.push(`El párrafo ${i + 1} debe llamarse "${letterOf(i)}".`);
      });
      const used = d.gaps.map((g) => g.correct);
      if (used.some((c) => c >= n)) problems.push(`Hay un "correct" fuera de rango (0-${n - 1}).`);
      if (new Set(used).size !== used.length) problems.push("Dos huecos usan el mismo párrafo; cada párrafo solo puede usarse una vez.");
      break;
    }
    case "r8": {
      const d = content.data;
      const n = getPart(partId).choices ?? 5;
      checkNumbering(d.questions.map((q) => q.n), count, problems);
      d.sections.forEach((s, i) => {
        if (s.label !== letterOf(i)) problems.push(`La sección ${i + 1} debe llamarse "${letterOf(i)}".`);
      });
      for (const q of d.questions) if (q.correct >= n) problems.push(`P${q.n}: "correct" fuera de rango.`);
      const covered = new Set(d.questions.map((q) => q.correct));
      if (covered.size < n) problems.push("Cada sección debe ser la respuesta de al menos una pregunta.");
      break;
    }
    case "l1": {
      const d = content.data;
      checkNumbering(d.extracts.flatMap((e) => e.questions.map((q) => q.n)), count, problems);
      for (const q of d.extracts.flatMap((e) => e.questions)) {
        if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== 3) problems.push(`P${q.n}: opciones duplicadas.`);
      }
      break;
    }
    case "l2": {
      const d = content.data;
      checkNumbering(d.sentences.map((x) => x.n), count, problems);
      for (const g of d.sentences) {
        for (const a of g.answers) {
          const w = countWords(a);
          if (w < 1 || w > 3) problems.push(`Frase ${g.n}: "${a}" debe tener entre 1 y 3 palabras.`);
        }
      }
      const words = d.segments.map((x) => x.text).join(" ").split(/\s+/).length;
      if (words < 150) problems.push(`El guion tiene ${words} palabras; debe tener unas 250-350.`);
      break;
    }
    case "l3": {
      const d = content.data;
      checkNumbering(d.questions.map((q) => q.n), count, problems);
      for (const q of d.questions) {
        if (new Set(q.options.map((o) => o.trim().toLowerCase())).size !== 4) problems.push(`P${q.n}: opciones duplicadas.`);
      }
      const words = d.segments.map((x) => x.text).join(" ").split(/\s+/).length;
      if (words < 300) problems.push(`La entrevista tiene ${words} palabras; debe tener unas 450-600.`);
      break;
    }
    case "l4": {
      const d = content.data;
      const optionCount = getPart(partId).choices ?? 8;
      checkNumbering(d.questions.map((q) => q.n), count, problems);
      const perTask = count / 2;
      for (const task of [1, 2]) {
        const qs = d.questions.filter((q) => q.task === task);
        if (qs.length !== perTask) problems.push(`La tarea ${task} debe tener ${perTask} preguntas.`);
        if (new Set(qs.map((q) => q.correct)).size !== qs.length) problems.push(`Tarea ${task}: dos hablantes comparten la misma respuesta.`);
        if (new Set(qs.map((q) => q.speaker)).size !== qs.length) problems.push(`Tarea ${task}: cada hablante debe tener una pregunta.`);
        if (qs.some((q) => q.correct >= optionCount || q.speaker > d.speakers.length)) problems.push(`Tarea ${task}: respuesta u hablante fuera de rango.`);
      }
      break;
    }
    case "s1":
    case "s4":
    case "s2":
    case "s3":
      break;
    case "w1": {
      const d = content.data;
      if (!/own idea/i.test(d.points[2])) problems.push('El tercer punto debe ser "your own idea".');
      break;
    }
    case "w2": {
      const d = content.data;
      if (new Set(d.tasks.map((t) => t.type)).size !== d.tasks.length) problems.push("Las 3 tareas deben ser de tipos distintos.");
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
