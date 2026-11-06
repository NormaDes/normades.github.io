import { LocalRepository } from "@/lib/storage/local";
import type { Repository } from "@/lib/storage/types";

export type { Attempt, AttemptDetail, Mistake, Repository } from "@/lib/storage/types";
export { clientPrefs } from "@/lib/storage/local";

/** Punto único de acceso a datos. Para migrar a Supabase, cambia esta línea. */
export const repo: Repository = new LocalRepository();
