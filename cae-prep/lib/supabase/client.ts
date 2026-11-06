import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/supabase/config";

let client: ReturnType<typeof createBrowserClient> | null = null;

/** Cliente de Supabase para el navegador (sesión en cookies). */
export function getBrowserClient() {
  if (!client) client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return client;
}
