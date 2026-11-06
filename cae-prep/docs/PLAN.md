# CAE Prep — plan

App Next.js (App Router, TS, Tailwind) para preparar Cambridge C1 Advanced. UI en español, práctica en inglés.

## Estructura de carpetas
```
config/exam.ts        única fuente de verdad del examen (partes, tiempos, nº de preguntas, marcas)
config/app.ts         modelo de IA y límite diario de generaciones
lib/schemas.ts        zod por parte (nº de preguntas desde config)
lib/validation.ts     reglas extra: KWT 3-6 palabras, keyword intacta, "una palabra"…
lib/checking.ts       corrección, respuestas aceptadas, contracciones, puntuación
lib/ai/               cliente Claude (solo servidor), prompts, JSON + zod + 1 reintento
lib/server/usage.ts   límite diario (en memoria; Supabase en la Fase 4)
lib/storage/          interfaz Repository + LocalRepository (localStorage) → migrable a Supabase
lib/exercises/        banco inicial (seeds) y selección "no visto primero"
app/api/generate      route handler: clave solo en servidor, límite diario, código de acceso opcional
app/*                 inicio, practica, simulacro, biblioteca, vocabulario, errores, progreso
supabase/schema.sql   esquema + RLS para la migración / Fase 4
scripts/validate-seeds.ts  valida el banco inicial con las mismas reglas que la IA
```

## Orden de construcción
1. **Fase 1** (hecha): esqueleto, navegación, Reading & UoE partes 1-4 con corrección y explicaciones, temporizador, banco inicial, generación con IA, progreso local.
2. **Fase 2**: Reading 5-8 y Writing con corrección IA (4 criterios, 0-5, versión mejorada, contador de palabras).
3. **Fase 3**: Listening (Web Speech API, 2 reproducciones) y Speaking (MediaRecorder + transcripción + feedback).
4. **Fase 4**: biblioteca (vídeos + artículos reales con licencia), vocabulario SM-2, dashboard, cuaderno de errores, simulacro, migración a Supabase con auth.
