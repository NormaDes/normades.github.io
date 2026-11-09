import { z } from "zod";

export const WAITLIST_EXAMS = [
  { id: "c1-advanced", label: "C1 Advanced" },
  { id: "b2-first", label: "B2 First" },
  { id: "b1-preliminary", label: "B1 Preliminary" },
  { id: "c2-proficiency", label: "C2 Proficiency" },
  { id: "ielts", label: "IELTS" },
  { id: "toefl", label: "TOEFL" },
  { id: "otro", label: "Otro" },
] as const;

export const WAITLIST_ROLES = [
  { id: "alumno", label: "Estudiante" },
  { id: "profesor", label: "Profesor/a" },
  { id: "academia", label: "Academia o centro" },
  { id: "otro", label: "Otro" },
] as const;

export const waitlistSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().max(80).optional(),
  exam: z.enum(WAITLIST_EXAMS.map((e) => e.id) as [string, ...string[]]),
  role: z.enum(WAITLIST_ROLES.map((r) => r.id) as [string, ...string[]]),
  consent: z.literal(true),
  source: z.string().trim().max(60).optional(),
  /** Campo trampa para bots: debe llegar vacío */
  website: z.string().max(0).optional(),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
