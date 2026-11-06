import { LocalRepository } from "@/lib/storage/local";
import { SupabaseRepository } from "@/lib/storage/supabase";
import type { Repository } from "@/lib/storage/types";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type { Attempt, AttemptDetail, Mistake, Repository, VocabItem } from "@/lib/storage/types";
export { clientPrefs } from "@/lib/storage/local";

const local = new LocalRepository();

/**
 * Punto único de acceso a datos.
 * Con Supabase configurado: datos por usuario en la base de datos (con copia local de seguridad).
 * Sin Supabase: todo en localStorage, como en las fases 1-3.
 */
export const repo: Repository = isSupabaseConfigured() ? new SupabaseRepository(local) : local;
