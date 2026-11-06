import "server-only";
import { randomUUID } from "node:crypto";
import type { PartId } from "@/config/exam";
import { generateValidatedJson } from "@/lib/ai/client";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/ai/prompts";
import type { Exercise, ExerciseContent } from "@/lib/schemas";
import { validateContent } from "@/lib/validation";

export async function generateExercise(partId: PartId, topic?: string): Promise<Exercise> {
  const content = await generateValidatedJson<ExerciseContent>({
    system: SYSTEM_PROMPT,
    user: buildUserPrompt(partId, topic),
    validate: (data) => {
      const problems = validateContent(partId, data);
      if (problems.length) return { ok: false, problems };
      return { ok: true, value: { partId, data } as ExerciseContent };
    },
  });

  return {
    ...content,
    id: `ai-${randomUUID()}`,
    source: "ai",
    createdAt: new Date().toISOString(),
    isGeneratedText: true,
  } as Exercise;
}
