# CAE Prep — Cambridge C1 Advanced

Web app para preparar el examen **Cambridge C1 Advanced (CAE)**. Interfaz en español de España; todo el contenido de práctica en inglés. Pensada para usarse mucho desde el móvil.

> Estado: **Fase 4a** — Reading 1-8, Writing 1-2, Listening 1-4, Speaking 1-4 y **cuentas de usuario** (registro, inicio de sesión, datos por usuario). Ver [`docs/PLAN.md`](docs/PLAN.md).

## Qué funciona ahora

- Modo práctica de **Reading & Use of English 1-8**: multiple-choice cloze, open cloze, word formation, key word transformations, multiple choice (texto largo), cross-text multiple matching, gapped text y multiple matching.
- **Writing 1 (essay) y 2 (letter/email, proposal, report, review)**: contador de palabras (220-260), temporizador, borrador guardado y corrección por IA con los 4 criterios oficiales (Content, Communicative Achievement, Organisation, Language; 0-5 cada uno), errores marcados en tu texto con su corrección y una versión mejorada.
- Corrección con explicación de por qué es correcta y por qué fallan las demás opciones, con el fragmento del texto que lo justifica.
- Respuestas aceptadas múltiples (Open cloze, Word formation, Key word transformations) y comparación tolerante (mayúsculas, comillas tipográficas, contracciones).
- **Listening 1-4**: reproductor con límite de **2 reproducciones** como en el examen, voz del navegador en inglés británico (voces femenina y masculina alternadas) o **audio real** si el ejercicio trae un campo `audio` con la URL de un MP3. Al corregir se muestra el guion.
- **Speaking 1-4**: grabas tu voz (MediaRecorder; el audio se queda en tu dispositivo), el navegador la transcribe en directo (Web Speech API; si no puede, escribes lo dicho) y la IA da feedback de gramática, vocabulario, fluidez y coherencia, con correcciones, mejoras de vocabulario y respuesta modelo. No evalúa la pronunciación (solo ve el texto).
- Temporizador opcional (tiempo sugerido por parte, se corrige solo al terminar).
- Banco inicial de ejercicios + generación nueva con Claude, **cacheada** en tu navegador.
- Todos los intentos y fallos se guardan (localStorage), con racha de días en la portada.
- Resto de secciones (simulacro, biblioteca, vocabulario, errores, progreso y cuentas de usuario, en la Fase 4) con página «próximamente».

## Arrancar en local

Requisitos: Node.js 20+.

```bash
cd cae-prep
npm install
cp .env.example .env.local   # y rellena ANTHROPIC_API_KEY (opcional para el banco inicial)
npm run dev                   # http://localhost:3000
```

Sin `ANTHROPIC_API_KEY` la app funciona con el banco inicial; solo se desactiva «Generar nuevo con IA».

Comandos útiles:

```bash
npm run lint            # ESLint
npm run typecheck       # TypeScript
npm run validate:seeds  # valida el banco inicial con las mismas reglas que la IA
npm run build           # build de producción
```

## Cuentas de usuario (Supabase)

Si defines `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, la app **exige iniciar sesión** (registro con email y contraseña, recuperación de contraseña) y guarda los intentos, errores, redacciones y ejercicios de cada usuario en Supabase, aislados por RLS. Sin esas variables la app funciona en modo local, sin cuentas.

Configuración, una sola vez:

1. Crea el proyecto en [supabase.com](https://supabase.com) y ejecuta [`supabase/schema.sql`](supabase/schema.sql) en *SQL Editor*.
2. En *Authentication → URL Configuration*: **Site URL** = la URL de tu web (p. ej. `https://cae-prep-normades.vercel.app`) y, en **Redirect URLs**, añade `https://cae-prep-normades.vercel.app/**` (y `http://localhost:3000/**` para desarrollo). Sin esto, los enlaces de los emails de confirmación y de recuperar contraseña no funcionan.
3. *Authentication → Providers → Email*: activo. Decide si activas **Confirm email**: activado es más seguro (cada alumno confirma su correo); desactivado es más cómodo para una clase pequeña. La app funciona con ambos.
4. Variables en Vercel: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (tipo *Config*) y `SUPABASE_SERVICE_ROLE_KEY` (tipo *Secret*; se usa para contar los usos de IA por usuario). Después, *Redeploy*.
5. Regístrate en la app y hazte administrador (así podrás compartir material con la clase):

```sql
update public.profiles set role = 'admin'
where id = (select id from auth.users where email = 'TU_EMAIL@ejemplo.com');
```

Si Supabase falla en algún momento, el resultado de cada ejercicio también se guarda en el dispositivo para no perderlo. Los datos que ya tuvieras en localStorage antes de crear la cuenta **no se migran** automáticamente.

## Variables de entorno

| Variable | Fase | Cómo conseguirla |
|---|---|---|
| `ANTHROPIC_API_KEY` | 1 | [console.anthropic.com](https://console.anthropic.com) → *API keys* → *Create key*. Necesita saldo. Solo se usa en el servidor (`/api/generate`). |
| `ANTHROPIC_MODEL` (opc.) | 1 | Por defecto `claude-opus-5-5`. Pon `claude-sonnet-5-5` para gastar menos. |
| `DAILY_GENERATION_LIMIT` (opc.) | 1 | Máx. de ejercicios generados por día (por defecto 15). |
| `APP_ACCESS_CODE` (opc.) | 1 | Cualquier texto. Solo se usa **sin Supabase**: la app pide ese código la primera vez que generas. Con cuentas de usuario no hace falta (la IA solo la usa quien ha iniciado sesión). |
| `GUARDIAN_API_KEY` | 4 | [open-platform.theguardian.com/access](https://open-platform.theguardian.com/access/) → *Register for a developer key* (gratuita). |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 4a | [supabase.com](https://supabase.com) → crear proyecto → *Project Settings → API*: *Project URL* y clave *anon public*. |
| `SUPABASE_SERVICE_ROLE_KEY` | 4a | Misma pantalla, clave *service_role*. **Secreta**: solo servidor, nunca en el cliente. |

## Desplegar en Vercel

Este repositorio también contiene un sitio estático en la raíz, por eso la app vive en `cae-prep/`.

1. En Vercel: *Add New → Project* y elige el repositorio.
2. **Root Directory** → `cae-prep`. Framework: Next.js (se detecta solo).
3. En *Settings → Environment Variables* añade `ANTHROPIC_API_KEY` (y `APP_ACCESS_CODE`, muy recomendable).
4. *Deploy*.

La generación de textos largos y la evaluación de Writing pueden tardar 30-90 s; las rutas declaran `maxDuration = 120`. Si tu plan de Vercel limita las funciones a 60 s, baja ese valor en `app/api/*/route.ts` o activa *Fluid Compute*.

## Configurar el examen

Todo el formato del examen está en [`config/exam.ts`](config/exam.ts): partes, tiempos sugeridos, duración de cada paper, nº de preguntas, marcas por pregunta y reglas de Key Word Transformations (3-6 palabras). Los esquemas de validación, los prompts, la UI y la puntuación leen de ahí: si Cambridge cambia algo, se edita ese archivo.

## Calidad de la generación con IA

- Claude responde en JSON, que se valida con **zod** (`lib/schemas.ts`) y con reglas semánticas (`lib/validation.ts`): marcadores de hueco, una sola palabra en Open cloze/Word formation, keyword en mayúsculas y **sin cambiar**, y entre **3 y 6 palabras** (contando la keyword y las contracciones como dos) en Key Word Transformations.
- Si la validación falla, se **reintenta una vez** indicando los errores concretos.
- Los textos de práctica por parte se marcan siempre como *«texto generado — no es un artículo real»*. Los artículos reales llegarán en la Fase 4.
- Cada generación y cada evaluación de Writing cuentan como 1 uso de IA del límite diario (`DAILY_GENERATION_LIMIT`).
- La corrección de Writing la hace la IA con los criterios oficiales parafraseados: es una **estimación orientativa**, no sustituye a un examinador. Las citas de errores que no aparecen literalmente en tu texto se descartan en el servidor.
- Límite diario configurable (`DAILY_GENERATION_LIMIT`). En Vercel el contador es *best effort* (memoria de la instancia); en la Fase 4 pasará a Supabase.

## Datos

Hoy se guardan en `localStorage` (por dispositivo) a través de la interfaz `Repository` (`lib/storage/types.ts`). El esquema de Supabase ya está en [`supabase/schema.sql`](supabase/schema.sql); migrar es implementar `Repository` con Supabase y cambiar una línea en `lib/storage/index.ts`.

## Limitaciones conocidas

- El banco inicial es más pequeño que los 5 por parte previstos: **2** en las partes 1-4, **1** en las 5-8 y en Listening, **3** enunciados de Writing 1, **2** juegos de Writing 2 y **2** por cada parte de Speaking. El resto se genera con IA y se cachea. Conviene que alguien con ojo de profesor revise los textos del banco.
- Los textos de Reading y los guiones de Listening son generados (marcados como tal). Los artículos reales llegan en la Fase 4.
- Las fotos de Speaking 2 se describen con texto; el esquema admite una URL de imagen real (`photos[].image`).
- La voz sintética del navegador depende de las voces instaladas en el dispositivo; con audio real del profe el problema desaparece.
- Speaking necesita permiso de micrófono y funciona mejor en Chrome/Edge; en Safari/Firefox la transcripción en directo puede no estar disponible (se puede escribir a mano).
- Key Word Transformations puntúa 0 o 2 por ítem (en el examen real hay 1 punto por cada mitad de la respuesta).
- Un ejercicio generado con IA se guarda solo en tu navegador hasta la migración a Supabase.
- Las cuentas se han probado contra un servidor de Supabase **simulado** (registro, login, cookies, rutas protegidas, guardado por usuario y RLS en un Postgres real), no contra tu proyecto de Supabase. Los enlaces de los emails (confirmar, recuperar contraseña) dependen de la configuración del paso 2.
- No se ha probado la generación ni la evaluación contra la API real de Anthropic (no había clave en el entorno de desarrollo). Sí están probados: errores de los endpoints, validadores, corrección de Reading y Listening, y las pantallas de Writing y Speaking con respuestas de IA, voz y micrófono simulados. Falta probarlo con una voz y un micrófono reales en el móvil.
