"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authErrorMessage, safeNext } from "@/lib/auth-errors";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Mode = "login" | "register" | "recover";

const COPY: Record<Mode, { title: string; subtitle: string; button: string }> = {
  login: { title: "Inicia sesión", subtitle: "Entra para usar la IA, guardar tu progreso en la nube y ver el material de clase.", button: "Entrar" },
  register: { title: "Crea tu cuenta", subtitle: "Gratis. Tu progreso se guarda y lo ves desde cualquier dispositivo.", button: "Crear cuenta" },
  recover: { title: "Recupera tu contraseña", subtitle: "Te enviaremos un enlace por email para elegir una nueva.", button: "Enviar enlace" },
};

const inputCls = "mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3 text-base focus:border-brand";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const copy = COPY[mode];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  if (!isSupabaseConfigured()) {
    return (
      <p className="rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
        Las cuentas no están configuradas en este servidor (faltan las variables de Supabase). La app funciona en modo local, sin inicio de sesión.{" "}
        <Link href="/" className="font-semibold text-brand">Ir a la app</Link>
      </p>
    );
  }

  const google = async () => {
    setError(null);
    setBusy(true);
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));
    const { error: err } = await getBrowserClient().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (err) {
      setBusy(false);
      setError("No se pudo iniciar sesión con Google. Inténtalo de nuevo o usa tu email.");
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (mode !== "recover" && password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (mode === "register" && !accepted) {
      setError("Para crear la cuenta debes aceptar la política de privacidad.");
      return;
    }
    setBusy(true);
    const supabase = getBrowserClient();
    const origin = window.location.origin;
    try {
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (err) return setError(authErrorMessage(err));
        router.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
        router.refresh();
      } else if (mode === "register") {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { display_name: name.trim() || undefined }, emailRedirectTo: `${origin}/auth/callback` },
        });
        if (err) return setError(authErrorMessage(err));
        if (data.session) {
          router.replace("/");
          router.refresh();
        } else {
          setInfo("¡Casi listo! Te hemos enviado un email para confirmar tu cuenta. Ábrelo y pulsa el enlace (mira también el spam).");
        }
      } else {
        const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${origin}/auth/callback?next=/auth/cambiar-password`,
        });
        if (err) return setError(authErrorMessage(err));
        setInfo("Si ese email tiene cuenta, te hemos enviado un enlace para cambiar la contraseña.");
      }
    } catch (ex) {
      setError(authErrorMessage(ex as Error));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-line border-t-[3px] border-t-brand bg-surface p-6">
      <h1 className="text-2xl font-bold tracking-tight">{copy.title}</h1>
      <p className="mt-1 text-sm text-muted">{copy.subtitle}</p>

      {mode !== "recover" && (
        <div className="mt-5">
          <button type="button" onClick={google} disabled={busy} className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-line bg-surface px-5 text-sm font-semibold hover:bg-bg disabled:opacity-60">
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z" />
              <path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.9-6.1A24 24 0 0 0 0 24c0 3.9.9 7.5 2.6 10.8l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
            Continuar con Google
          </button>
          {mode === "register" && <p className="mt-2 text-center text-xs text-muted">Al continuar con Google aceptas la <Link href="/privacidad" target="_blank" className="underline">política de privacidad</Link>.</p>}
          <p className="my-4 flex items-center gap-3 text-xs text-muted before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">o con tu email</p>
        </div>
      )}

      <form onSubmit={submit} className={mode === "recover" ? "mt-5 space-y-4" : "space-y-4"} noValidate>
        {mode === "register" && (
          <label className="block text-sm font-medium">
            Tu nombre
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={40} placeholder="Cómo quieres que te llamemos" className={inputCls} />
          </label>
        )}
        <label className="block text-sm font-medium">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" autoCapitalize="none" className={inputCls} />
        </label>
        {mode !== "recover" && (
          <label className="block text-sm font-medium">
            Contraseña
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              minLength={8}
              className={inputCls}
            />
            {mode === "register" && <span className="mt-1 block text-xs font-normal text-muted">Mínimo 8 caracteres.</span>}
          </label>
        )}

        {mode === "register" && (
          <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug">
            <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]" />
            <span>
              He leído y acepto la{" "}
              <Link href="/privacidad" target="_blank" className="font-semibold text-brand underline">política de privacidad</Link> y el{" "}
              <Link href="/aviso-legal" target="_blank" className="font-semibold text-brand underline">aviso legal</Link>.
            </span>
          </label>
        )}

        {error && <p role="alert" className="rounded-xl bg-bad-soft p-3 text-sm text-bad">{error}</p>}
        {info && <p role="status" className="rounded-xl bg-ok-soft p-3 text-sm text-ok">{info}</p>}

        <button type="submit" disabled={busy || !email} className="min-h-12 w-full rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink disabled:opacity-60">
          {busy ? "Un momento…" : copy.button}
        </button>
      </form>

      <div className="mt-5 space-y-1.5 text-center text-sm text-muted">
        {mode === "login" && (
          <>
            <p>
              ¿Aún no tienes cuenta? <Link href="/registro" className="font-semibold text-brand">Regístrate</Link>
            </p>
            <p>
              <Link href="/recuperar" className="font-semibold text-brand">He olvidado mi contraseña</Link>
            </p>
          </>
        )}
        {mode === "register" && (
          <p>
            ¿Ya tienes cuenta? <Link href="/login" className="font-semibold text-brand">Inicia sesión</Link>
          </p>
        )}
        {mode === "recover" && (
          <p>
            <Link href="/login" className="font-semibold text-brand">Volver a iniciar sesión</Link>
          </p>
        )}
      </div>
    </div>
  );
}
