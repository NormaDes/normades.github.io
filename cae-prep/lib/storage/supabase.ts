import type { PartId } from "@/config/exam";
import type { Exercise } from "@/lib/schemas";
import type { SpeakingSubmission } from "@/lib/speaking";
import { getBrowserClient } from "@/lib/supabase/client";
import type { LocalRepository } from "@/lib/storage/local";
import type { Attempt, Mistake, Repository, VocabItem } from "@/lib/storage/types";
import type { WritingSubmission } from "@/lib/writing";

interface AttemptRow {
  id: string;
  exercise_id: string;
  part_id: PartId;
  correct_count: number;
  total: number;
  marks: number;
  max_marks: number;
  duration_sec: number;
  timed: boolean;
  details: Attempt["details"];
  created_at: string;
}

interface MistakeRow {
  id: string;
  exercise_id: string;
  part_id: PartId;
  n: number;
  skill: string;
  given: string | null;
  expected: string | null;
  resolved: boolean;
  created_at: string;
}

interface VocabRow {
  id: string;
  term: string;
  definition: string | null;
  example: string | null;
  translation: string | null;
  collocations: string[] | null;
  context: string | null;
  source_title: string | null;
  source_url: string | null;
  ease: number;
  interval_days: number;
  repetitions: number;
  lapses: number | null;
  due_at: string;
  created_at: string;
}

const MAX_ROWS = 5000;

/**
 * Guarda los datos de cada usuario en Supabase (protegidos por RLS: solo ve lo suyo).
 * Si una operación falla (red, tablas sin crear…), recurre al almacenamiento local
 * para no perder nunca el resultado del ejercicio.
 */
export class SupabaseRepository implements Repository {
  constructor(private fallback: LocalRepository) {}

  private get db() {
    return getBrowserClient();
  }

  /** Ejecuta la operación en Supabase; si lanza o devuelve error, usa el plan B */
  private async attempt<T>(label: string, run: () => PromiseLike<{ data: T | null; error: { message: string } | null }>, plan_b: () => Promise<T>): Promise<T> {
    try {
      const { data, error } = await run();
      if (error) throw new Error(error.message);
      return data as T;
    } catch (e) {
      console.warn(`[supabase] ${label} falló, usando almacenamiento local:`, e);
      return plan_b();
    }
  }

  async saveAttempt(a: Attempt) {
    await this.attempt<unknown>(
      "saveAttempt",
      () =>
        this.db.from("attempts").insert({
          exercise_id: a.exerciseId,
          part_id: a.partId,
          correct_count: a.correctCount,
          total: a.total,
          marks: a.marks,
          max_marks: a.maxMarks,
          duration_sec: a.durationSec,
          timed: a.timed,
          details: a.details,
          created_at: a.createdAt,
        }),
      () => this.fallback.saveAttempt(a),
    );
  }

  async listAttempts(partId?: PartId): Promise<Attempt[]> {
    const rows = await this.attempt<AttemptRow[]>(
      "listAttempts",
      () => {
        let q = this.db.from("attempts").select("*").order("created_at", { ascending: true }).limit(MAX_ROWS);
        if (partId) q = q.eq("part_id", partId);
        return q;
      },
      async () => [],
    );
    if (!rows.length && !partId) return this.fallback.listAttempts(partId);
    return rows.map((r) => ({
      id: r.id,
      exerciseId: r.exercise_id,
      partId: r.part_id,
      createdAt: r.created_at,
      correctCount: r.correct_count,
      total: r.total,
      marks: Number(r.marks),
      maxMarks: Number(r.max_marks),
      durationSec: r.duration_sec,
      timed: r.timed,
      details: r.details ?? [],
    }));
  }

  async addMistakes(list: Mistake[]) {
    if (!list.length) return;
    await this.attempt<unknown>(
      "addMistakes",
      () =>
        this.db.from("mistakes").insert(
          list.map((m) => ({
            exercise_id: m.exerciseId,
            part_id: m.partId,
            n: m.n,
            skill: m.skill,
            given: m.given,
            expected: m.expected,
            resolved: m.resolved,
            created_at: m.createdAt,
          })),
        ),
      () => this.fallback.addMistakes(list),
    );
  }

  async listMistakes(): Promise<Mistake[]> {
    const rows = await this.attempt<MistakeRow[]>(
      "listMistakes",
      () => this.db.from("mistakes").select("*").order("created_at", { ascending: true }).limit(MAX_ROWS),
      async () => [],
    );
    return rows.map((r) => ({
      id: r.id,
      exerciseId: r.exercise_id,
      partId: r.part_id,
      n: r.n,
      skill: r.skill,
      given: r.given ?? "",
      expected: r.expected ?? "",
      createdAt: r.created_at,
      resolved: r.resolved,
    }));
  }

  async setMistakeResolved(id: string, resolved: boolean) {
    await this.attempt<unknown>(
      "setMistakeResolved",
      () => this.db.from("mistakes").update({ resolved }).eq("id", id),
      () => this.fallback.setMistakeResolved(id, resolved),
    );
  }

  async resolveMistakes(exerciseId: string, ns: number[]) {
    if (!ns.length) return;
    await this.attempt<unknown>(
      "resolveMistakes",
      () => this.db.from("mistakes").update({ resolved: true }).eq("exercise_id", exerciseId).in("n", ns).eq("resolved", false),
      () => this.fallback.resolveMistakes(exerciseId, ns),
    );
  }

  async listVocab(): Promise<VocabItem[]> {
    const rows = await this.attempt<VocabRow[]>(
      "listVocab",
      () => this.db.from("vocab").select("*").order("created_at", { ascending: true }).limit(MAX_ROWS),
      async () => [],
    );
    if (!rows.length) return this.fallback.listVocab();
    return rows.map((r) => ({
      id: r.id,
      term: r.term,
      definition: r.definition ?? undefined,
      example: r.example ?? undefined,
      translation: r.translation ?? undefined,
      collocations: r.collocations ?? [],
      context: r.context ?? undefined,
      sourceTitle: r.source_title ?? undefined,
      sourceUrl: r.source_url ?? undefined,
      createdAt: r.created_at,
      ease: Number(r.ease),
      intervalDays: r.interval_days,
      repetitions: r.repetitions,
      lapses: r.lapses ?? 0,
      dueAt: r.due_at,
    }));
  }

  async saveVocab(v: VocabItem) {
    await this.attempt<unknown>(
      "saveVocab",
      () =>
        this.db.from("vocab").upsert(
          {
            // id solo si ya es un UUID de la base de datos; si no, lo genera Postgres
            ...(/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(v.id) ? { id: v.id } : {}),
            term: v.term.trim().toLowerCase(),
            definition: v.definition ?? null,
            example: v.example ?? null,
            translation: v.translation ?? null,
            collocations: v.collocations,
            context: v.context ?? null,
            source_title: v.sourceTitle ?? null,
            source_url: v.sourceUrl ?? null,
            ease: v.ease,
            interval_days: v.intervalDays,
            repetitions: v.repetitions,
            lapses: v.lapses,
            due_at: v.dueAt,
          },
          { onConflict: "user_id,term" },
        ),
      () => this.fallback.saveVocab(v),
    );
  }

  async deleteVocab(id: string) {
    await this.attempt<unknown>(
      "deleteVocab",
      () => this.db.from("vocab").delete().eq("id", id),
      () => this.fallback.deleteVocab(id),
    );
  }

  private saveSubmission(kind: "writing" | "speaking", s: WritingSubmission | SpeakingSubmission, local: () => Promise<void>) {
    return this.attempt<unknown>(
      `save-${kind}`,
      () => this.db.from("submissions").insert({ kind, exercise_id: s.exerciseId, part_id: s.partId, payload: s, created_at: s.createdAt }),
      local,
    );
  }

  async saveWriting(w: WritingSubmission) {
    await this.saveSubmission("writing", w, () => this.fallback.saveWriting(w));
  }

  async saveSpeaking(s: SpeakingSubmission) {
    await this.saveSubmission("speaking", s, () => this.fallback.saveSpeaking(s));
  }

  private async listSubmissions<T>(kind: "writing" | "speaking", local: () => Promise<T[]>): Promise<T[]> {
    const rows = await this.attempt<Array<{ payload: T }>>(
      `list-${kind}`,
      () => this.db.from("submissions").select("payload").eq("kind", kind).order("created_at", { ascending: true }).limit(500),
      async () => [],
    );
    return rows.length ? rows.map((r) => r.payload) : local();
  }

  listWritings() {
    return this.listSubmissions<WritingSubmission>("writing", () => this.fallback.listWritings());
  }

  listSpeakings() {
    return this.listSubmissions<SpeakingSubmission>("speaking", () => this.fallback.listSpeakings());
  }

  async saveExercise(e: Exercise) {
    await this.attempt<unknown>(
      "saveExercise",
      () =>
        this.db.from("exercises").upsert({
          id: e.id,
          part_id: e.partId,
          source: e.source === "seed" ? "ai" : e.source,
          title: e.data.title,
          content: e,
          visibility: "private",
          created_at: e.createdAt,
        }),
      () => this.fallback.saveExercise(e),
    );
  }

  /** Incluye los ejercicios propios y los que el profe comparte con la clase (RLS) */
  async listExercises(partId: PartId): Promise<Exercise[]> {
    const rows = await this.attempt<Array<{ content: Exercise }>>(
      "listExercises",
      () => this.db.from("exercises").select("content").eq("part_id", partId).order("created_at", { ascending: true }).limit(500),
      async () => [],
    );
    const remote = rows.map((r) => r.content).filter((c): c is Exercise => Boolean(c && c.partId === partId));
    const local = await this.fallback.listExercises(partId);
    const ids = new Set(remote.map((x) => x.id));
    return [...remote, ...local.filter((x) => !ids.has(x.id))];
  }
}
