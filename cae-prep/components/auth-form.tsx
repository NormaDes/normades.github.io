"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authErrorMessage, safeNext } from "@/lib/auth-errors";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Mode = "login" | "register" | "recover";

const COPY: Record<Mode, { title: string; subtitle: string; button: string }> = {
  login: { title: "Inicia sesión", subtitle: "Entra para guardar tu progreso y ver el material de clase.", button: "Entrar" },
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

      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
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
