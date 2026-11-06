import { NextResponse } from "next/server";
import { safeNext } from "@/lib/auth-errors";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getServerClient } from "@/lib/supabase/server";

/** Destino del enlace de los emails de Supabase (confirmar cuenta, recuperar contraseña). */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (isSupabaseConfigured() && code) {
    const supabase = await getServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(next, url.origin));
  }
  return NextResponse.redirect(new URL("/login?error=enlace", url.origin));
}
