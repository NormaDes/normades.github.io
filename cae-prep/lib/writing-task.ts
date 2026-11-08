import type { WritingExercise } from "@/lib/schemas";

export const TYPE_LABEL: Record<string, string> = { essay: "Essay", letter: "Letter", email: "Email", proposal: "Proposal", report: "Report", review: "Review" };

/** Enunciado completo de una tarea de Writing, tal y como se muestra al alumno y se envía a la IA */
export function describeTask(ex: WritingExercise, taskIdx: number): { type: string; text: string } {
  if (ex.partId === "w1") {
    const d = ex.data;
    return {
      type: "essay",
      text: `${d.question}\nNotes:\n${d.points.map((p, i) => `${i + 1}. ${p}`).join("\n")}\nWrite an essay discussing two of the points. You should explain which idea you think is more important, giving reasons to support your opinion.`,
    };
  }
  const t = ex.data.tasks[taskIdx];
  return { type: t.type, text: `${t.situation}\nIn your ${t.type} you should:\n${t.requirements.map((r) => `- ${r}`).join("\n")}` };
}
