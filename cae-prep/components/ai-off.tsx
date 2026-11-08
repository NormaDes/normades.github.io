import Link from "next/link";
import type { AiStatus } from "@/lib/client/api";

/** Aviso cuando la IA no se puede usar: invitado (hay que entrar) o servidor sin clave. */
export function AiOff({ ai, what }: { ai: AiStatus; what: string }) {
  if (ai.needsLogin) {
    return (
      <>
        Para {what} necesitas una cuenta (gratis).{" "}
        <Link href="/login" className="font-semibold text-brand underline">Entrar</Link> ·{" "}
        <Link href="/registro" className="font-semibold text-brand underline">Crear cuenta</Link>
      </>
    );
  }
  return <>La IA no está configurada en el servidor (falta <code>GEMINI_API_KEY</code> o <code>ANTHROPIC_API_KEY</code>).</>;
}
