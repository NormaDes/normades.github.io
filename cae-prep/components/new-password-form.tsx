"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { authErrorMessage } from "@/lib/auth-errors";
import type { User } from "@supabase/supabase-js";
import { getBrowserClient } from "@/lib/supabase/client";

export function NewPasswordForm() {
  const router = useRouter();
  const [hasSession, setHasSession] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getBrowserClient()
      .auth.getUser()
      .then(({ data }: { data: { user: User | null } }) => setHasSession(Boolean(data.user)));
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) return setError("La contraseña debe tener al menos 8 caracteres.");
    setBusy(true);
    setError(null);
    const { error: err } = await getBrowserClient().auth.updateUser({ password });
    setBusy(false);
    if (err) return setError(authErrorMessage(err));
    router.replace("/");
    router.refresh();
  };

  if (hasSession === false) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-6 text-sm">
        El enlace ha caducado o ya se ha usado. <Link href="/recuperar" className="font-semibold text-brand">Pide uno nuevo</Link>.
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-line shadow-card bg-surface p-6">
      <h1 className="text-2xl font-bold tracking-tight">Elige una contraseña nueva</h1>
      <form onSubmit={submit} className="mt-5 space-y-4" noValidate>
        <label className="block text-sm font-medium">
          Nueva contraseña
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={8} className="mt-1 h-12 w-full rounded-xl border border-line bg-surface px-3 text-base focus:border-brand" />
          <span className="mt-1 block text-xs font-normal text-muted">Mínimo 8 caracteres.</span>
        </label>
        {error && <p role="alert" className="rounded-xl bg-bad-soft p-3 text-sm text-bad">{error}</p>}
        <button type="submit" disabled={busy || hasSession === null} className="min-h-12 w-full rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink disabled:opacity-60">
          {busy ? "Guardando…" : "Guardar contraseña"}
        </button>
      </form>
    </div>
  );
}
