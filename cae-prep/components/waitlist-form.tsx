"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { CheckIcon } from "@/components/icons";
import { WAITLIST_EXAMS, WAITLIST_ROLES } from "@/lib/waitlist";
import { useQueryParam } from "@/lib/use-query-param";

const field = "mt-1 h-12 w-full rounded-xl border-line bg-white px-3 text-base font-semibold text-ink";

/** Formulario de la lista de espera (para la pizarra azul de la página). */
export function WaitlistForm() {
  const utmSource = useQueryParam("utm_source");
  const ref = useQueryParam("ref");
  const utm = utmSource || ref;
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [exam, setExam] = useState("c1-advanced");
  const [role, setRole] = useState("alumno");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<null | { already: boolean }>(null);
  const [copied, setCopied] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!consent) return setError("Marca la casilla para aceptar la política de privacidad.");
    setBusy(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, name: name || undefined, exam, role, consent: true, source: utm || undefined, website: trap }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return setError(body.error ?? "No se ha podido guardar. Inténtalo de nuevo.");
      setDone({ already: Boolean(body.already) });
    } catch {
      setError("No hay conexión. Inténtalo de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  if (done) {
    const link = typeof window !== "undefined" ? `${window.location.origin}/lista-espera?ref=amigo` : "";
    const text = encodeURIComponent(`Mira Englora, una web para preparar exámenes de inglés. Apúntate a la lista de espera: ${link}`);
    return (
      <div className="rounded-3xl bg-white p-6 text-ink shadow-[0_6px_0_rgba(0,0,0,0.18)]" role="status">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-mint text-white shadow-[0_4px_0_var(--mint-dark)]">
          <CheckIcon width={30} height={30} />
        </span>
        <p className="mt-4 font-display text-2xl font-semibold">{done.already ? "¡Ya estabas apuntado!" : "¡Estás dentro!"}</p>
        <p className="mt-1 text-sm font-semibold text-muted">Te escribiremos al correo en cuanto abramos. Mientras, puedes probar la versión gratuita.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/" className="inline-flex h-12 items-center rounded-xl bg-brand px-5 text-sm font-extrabold text-brand-ink">Probar ahora</Link>
          <a href={`https://wa.me/?text=${text}`} target="_blank" rel="noreferrer" className="inline-flex h-12 items-center rounded-xl border-2 border-line px-5 text-sm font-extrabold hover:bg-bg">Compartir por WhatsApp</a>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(link).then(() => setCopied(true))}
            className="inline-flex h-12 items-center rounded-xl border-2 border-line px-5 text-sm font-extrabold hover:bg-bg"
          >
            {copied ? "Enlace copiado" : "Copiar enlace"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-3xl bg-white p-5 text-ink shadow-[0_6px_0_rgba(0,0,0,0.18)] md:p-6" noValidate>
      <p className="font-display text-2xl font-semibold leading-tight">Reserva tu plaza</p>
      <p className="mt-1 text-sm font-semibold text-muted">Es gratis y sin compromiso.</p>

      <div className="mt-4 space-y-3">
        <label className="block text-sm font-bold">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" inputMode="email" autoCapitalize="none" placeholder="tu@email.com" className={field} />
        </label>
        <label className="block text-sm font-bold">
          Tu nombre <span className="font-semibold text-muted">(opcional)</span>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" maxLength={80} className={field} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold">
            Examen que preparas
            <select value={exam} onChange={(e) => setExam(e.target.value)} className={field}>
              {WAITLIST_EXAMS.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-bold">
            Soy
            <select value={role} onChange={(e) => setRole(e.target.value)} className={field}>
              {WAITLIST_ROLES.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}
            </select>
          </label>
        </div>
        {/* Campo trampa para bots: las personas no lo ven */}
        <label className="absolute -left-[9999px]" aria-hidden>
          No rellenar
          <input tabIndex={-1} autoComplete="off" value={trap} onChange={(e) => setTrap(e.target.value)} />
        </label>
        <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold leading-snug">
          <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--brand)]" />
          <span>
            Acepto la <Link href="/privacidad" target="_blank" className="font-bold text-brand underline">política de privacidad</Link> y que me avisen del lanzamiento por email.
          </span>
        </label>
      </div>

      {error && <p role="alert" className="mt-3 rounded-xl bg-bad-soft p-3 text-sm font-semibold text-bad">{error}</p>}

      <button type="submit" disabled={busy || !email} className="mt-4 min-h-14 w-full whitespace-nowrap rounded-2xl bg-brand px-5 text-base font-extrabold text-brand-ink disabled:opacity-60">
        {busy ? "Guardando…" : "Apuntarme a la lista"}
      </button>
    </form>
  );
}
