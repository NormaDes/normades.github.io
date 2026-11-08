import type { PartId } from "@/config/exam";
import type { Exercise } from "@/lib/schemas";
import type { SpeakingSubmission } from "@/lib/speaking";
import { LocalRepository } from "@/lib/storage/local";
import { SupabaseRepository } from "@/lib/storage/supabase";
import type { Attempt, Material, Mistake, Repository, VocabItem } from "@/lib/storage/types";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { WritingSubmission } from "@/lib/writing";

export type { Attempt, AttemptDetail, Material, MaterialKind, Mistake, Repository, VocabItem } from "@/lib/storage/types";
export { clientPrefs } from "@/lib/storage/local";

const local = new LocalRepository();
const remote = new SupabaseRepository(local);

/**
 * Elige en cada operación dónde guardar:
 *  - con sesión iniciada (y Supabase configurado): en la cuenta del usuario (con copia local de seguridad);
 *  - como invitado o sin Supabase: en este dispositivo (localStorage).
 */
class SessionRepository implements Repository {
  private async pick(): Promise<Repository> {
    if (!isSupabaseConfigured()) return local;
    try {
      const { data } = await getBrowserClient().auth.getSession();
      return data.session ? remote : local;
    } catch {
      return local;
    }
  }

  async saveAttempt(a: Attempt) { return (await this.pick()).saveAttempt(a); }
  async listAttempts(partId?: PartId) { return (await this.pick()).listAttempts(partId); }
  async addMistakes(m: Mistake[]) { return (await this.pick()).addMistakes(m); }
  async listMistakes() { return (await this.pick()).listMistakes(); }
  async setMistakeResolved(id: string, resolved: boolean) { return (await this.pick()).setMistakeResolved(id, resolved); }
  async resolveMistakes(exerciseId: string, ns: number[]) { return (await this.pick()).resolveMistakes(exerciseId, ns); }
  async saveSpeaking(s: SpeakingSubmission) { return (await this.pick()).saveSpeaking(s); }
  async listSpeakings() { return (await this.pick()).listSpeakings(); }
  async listVocab() { return (await this.pick()).listVocab(); }
  async saveVocab(v: VocabItem) { return (await this.pick()).saveVocab(v); }
  async deleteVocab(id: string) { return (await this.pick()).deleteVocab(id); }
  async listMaterials() { return (await this.pick()).listMaterials(); }
  async saveMaterial(m: Material) { return (await this.pick()).saveMaterial(m); }
  async deleteMaterial(id: string) { return (await this.pick()).deleteMaterial(id); }
  async saveWriting(w: WritingSubmission) { return (await this.pick()).saveWriting(w); }
  async listWritings() { return (await this.pick()).listWritings(); }
  async saveExercise(e: Exercise) { return (await this.pick()).saveExercise(e); }
  async listExercises(partId: PartId) { return (await this.pick()).listExercises(partId); }
}

/** Punto único de acceso a datos. */
export const repo: Repository = isSupabaseConfigured() ? new SessionRepository() : local;
