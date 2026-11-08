/** Qué proveedor de IA hay configurado. Sin "server-only" para poder usarlo en rutas y tests. */
export type AiProvider = "anthropic" | "gemini";

export function aiProvider(): AiProvider | null {
  const forced = process.env.AI_PROVIDER;
  if (forced === "gemini" && process.env.GEMINI_API_KEY) return "gemini";
  if (forced === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.GEMINI_API_KEY) return "gemini";
  return null;
}

export const aiConfigured = () => aiProvider() !== null;
