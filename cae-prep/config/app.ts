/** Ajustes de la aplicación (no del examen). Se pueden sobreescribir con variables de entorno. */

export const APP_SETTINGS = {
  /** Modelo de Claude. Sobrescribible con ANTHROPIC_MODEL (p. ej. claude-sonnet-5-5 para gastar menos). */
  defaultModel: "claude-opus-5-5",
  /** Máximo de ejercicios generados con IA por día (control de coste). DAILY_GENERATION_LIMIT lo sobrescribe. */
  dailyGenerationLimit: 15,
  /** Tokens máximos de salida por generación */
  maxOutputTokens: 16000,
};

export function getDailyLimit(): number {
  const raw = Number(process.env.DAILY_GENERATION_LIMIT);
  return Number.isFinite(raw) && raw >= 0 ? raw : APP_SETTINGS.dailyGenerationLimit;
}

export function getModel(): string {
  return process.env.ANTHROPIC_MODEL || APP_SETTINGS.defaultModel;
}
