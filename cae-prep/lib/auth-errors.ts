/** Traduce los errores de Supabase Auth a mensajes en español de España. */
export function authErrorMessage(err: { message?: string; code?: string } | null | undefined): string {
  const code = err?.code ?? "";
  const msg = (err?.message ?? "").toLowerCase();
  if (code === "invalid_credentials" || msg.includes("invalid login credentials")) return "El email o la contraseña no son correctos.";
  if (code === "email_not_confirmed" || msg.includes("email not confirmed")) return "Todavía no has confirmado tu email. Revisa tu bandeja de entrada (y el spam).";
  if (code === "user_already_exists" || msg.includes("already registered")) return "Ya existe una cuenta con ese email. Prueba a iniciar sesión.";
  if (code === "weak_password" || msg.includes("password should be at least")) return "La contraseña es demasiado débil: usa al menos 8 caracteres.";
  if (code === "over_email_send_rate_limit" || code === "over_request_rate_limit" || msg.includes("rate limit")) return "Demasiados intentos seguidos. Espera unos minutos e inténtalo de nuevo.";
  if (code === "signup_disabled") return "El registro está desactivado en este momento.";
  if (msg.includes("fetch") || msg.includes("network")) return "No se puede conectar con el servidor. Revisa tu conexión.";
  if (code === "email_provider_disabled") return "El registro con email está desactivado en Supabase (Authentication → Providers → Email).";
  if (code === "email_address_invalid" || msg.includes("invalid email")) return "Ese email no es válido. Revísalo.";
  if (msg.includes("redirect")) return "La URL de la web no está permitida en Supabase (Authentication → URL Configuration).";
  if (msg.includes("error sending") || code === "unexpected_failure") return "Supabase no ha podido enviar el email de confirmación. Desactiva «Confirm email» o prueba más tarde.";
  const detail = [code, err?.message].filter(Boolean).join(": ");
  return `No se ha podido completar la operación${detail ? ` (${detail})` : ""}. Inténtalo de nuevo.`;
}

/** Solo permite redirigir a rutas internas (evita open redirect). */
export function safeNext(next: string | null | undefined): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}
