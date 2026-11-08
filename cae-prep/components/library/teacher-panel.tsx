"use client";

import { useCallback, useEffect, useState } from "react";
import { MaterialCard } from "@/components/library/material-card";
import { TOPICS } from "@/lib/articles/types";
import { PARTS } from "@/config/exam";
import { removeMaterialFile, uploadMaterialFile } from "@/lib/library/files";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useIsAdmin } from "@/lib/supabase/use-admin";
import { repo, type Material, type MaterialKind } from "@/lib/storage";

const KINDS: Array<[MaterialKind, string, string]> = [
  ["audio", "Audio (MP3, M4A…)", "audio/*"],
  ["pdf", "Documento PDF", "application/pdf"],
  ["image", "Imagen (fotos del Speaking…)", "image/*"],
  ["video", "Vídeo (enlace de YouTube)", ""],
  ["podcast", "Podcast (enlace)", ""],
  ["article", "Artículo (enlace)", ""],
  ["link", "Otro enlace", ""],
];

const field = "mt-1 h-11 w-full rounded-lg border border-line bg-surface px-3 text-[15px] focus:border-brand";

export function TeacherPanel() {
  const admin = useIsAdmin();
  const [list, setList] = useState<Material[]>([]);
  const [kind, setKind] = useState<MaterialKind>("audio");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [partId, setPartId] = useState("");
  const [author, setAuthor] = useState("");
  const [license, setLicense] = useState("");
  const [transcript, setTranscript] = useState("");
  const [visibility, setVisibility] = useState<"class" | "private">("class");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const load = useCallback(async () => setList((await repo.listMaterials()).sort((a, b) => b.createdAt.localeCompare(a.createdAt))), []);
  useEffect(() => {
    let cancelled = false;
    repo.listMaterials().then((m) => !cancelled && setList(m.sort((a, b) => b.createdAt.localeCompare(a.createdAt))));
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isSupabaseConfigured()) {
    return <p className="rounded-xl border border-line bg-surface p-5 text-sm text-muted">El panel del profesor necesita las cuentas de usuario (Supabase) para compartir material con la clase.</p>;
  }
  if (admin === null) return <div className="h-40 animate-pulse rounded-xl bg-line/60" aria-busy="true" />;
  if (!admin) return <p className="rounded-xl border border-line bg-surface p-5 text-sm text-muted">Esta sección es solo para el profesor. Si deberías tener acceso, pídele que te haga administrador.</p>;

  const needsFile = ["audio", "pdf", "image"].includes(kind);
  const accept = KINDS.find((k) => k[0] === kind)?.[2];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (!title.trim()) return setMsg({ ok: false, text: "Pon un título." });
    if (needsFile && !file) return setMsg({ ok: false, text: "Elige un archivo." });
    if (!needsFile && !/^https?:\/\//.test(url.trim())) return setMsg({ ok: false, text: "Escribe un enlace que empiece por https://" });
    if (file && file.size > 45 * 1024 * 1024) return setMsg({ ok: false, text: "El archivo pesa más de 45 MB." });
    setBusy(true);
    try {
      const storagePath = file ? await uploadMaterialFile(file) : undefined;
      await repo.saveMaterial({
        id: crypto.randomUUID(),
        kind,
        title: title.trim(),
        description: description.trim() || undefined,
        url: needsFile ? undefined : url.trim(),
        storagePath,
        transcript: transcript.trim() || undefined,
        topic: topic || undefined,
        partId: partId || undefined,
        author: author.trim() || undefined,
        license: license.trim() || undefined,
        visibility,
        createdAt: new Date().toISOString(),
      });
      setTitle("");
      setDescription("");
      setUrl("");
      setTranscript("");
      setFile(null);
      setMsg({ ok: true, text: visibility === "class" ? "Publicado para la clase ✓" : "Guardado como privado ✓" });
      await load();
    } catch (err) {
      setMsg({ ok: false, text: err instanceof Error ? `No se pudo subir: ${err.message}` : "No se pudo subir." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={submit} className="space-y-4 rounded-xl border border-line border-t-[3px] border-t-brand bg-surface p-5">
        <h2 className="font-display text-xl font-bold">Subir material</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm font-medium">Tipo
            <select value={kind} onChange={(e) => { setKind(e.target.value as MaterialKind); setFile(null); }} className={field}>
              {KINDS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Título
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={160} className={field} />
          </label>
        </div>

        {needsFile ? (
          <label className="block text-sm font-medium">Archivo
            <input type="file" accept={accept} onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mt-1 block w-full rounded-lg border border-dashed border-line bg-bg p-3 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-brand file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-ink" />
            <span className="mt-1 block text-xs font-normal text-muted">Se guarda en un almacenamiento privado: solo lo ven los alumnos con sesión iniciada. Máx. 45 MB.</span>
          </label>
        ) : (
          <label className="block text-sm font-medium">Enlace
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" inputMode="url" className={field} />
          </label>
        )}

        <label className="block text-sm font-medium">Descripción (opcional)
          <input value={description} onChange={(e) => setDescription(e.target.value)} maxLength={240} className={field} />
        </label>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block text-sm font-medium">Tema
            <select value={topic} onChange={(e) => setTopic(e.target.value)} className={field}>
              <option value="">—</option>
              {TOPICS.map((t) => <option key={t.id} value={t.label}>{t.label}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Parte del examen
            <select value={partId} onChange={(e) => setPartId(e.target.value)} className={field}>
              <option value="">—</option>
              {PARTS.map((p) => <option key={p.id} value={p.id}>{p.id.toUpperCase()} · {p.name}</option>)}
            </select>
          </label>
          <label className="block text-sm font-medium">Autor / fuente
            <input value={author} onChange={(e) => setAuthor(e.target.value)} className={field} />
          </label>
        </div>
        <label className="block text-sm font-medium">Licencia o aviso de uso (opcional)
          <input value={license} onChange={(e) => setLicense(e.target.value)} placeholder="p. ej. Material del curso — uso exclusivo del alumnado" className={field} />
        </label>
        {["audio", "video", "podcast"].includes(kind) && (
          <label className="block text-sm font-medium">Transcripción (opcional)
            <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={5} className="mt-1 w-full resize-y rounded-lg border border-line bg-surface p-3 text-[15px] focus:border-brand" />
            <span className="mt-1 block text-xs font-normal text-muted">Con transcripción, los alumnos podrán generar ejercicios de comprensión y vocabulario.</span>
          </label>
        )}

        <fieldset>
          <legend className="text-sm font-medium">¿Quién lo ve?</legend>
          <div className="mt-2 flex flex-wrap gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="vis" checked={visibility === "class"} onChange={() => setVisibility("class")} className="h-5 w-5 accent-[var(--brand)]" /> Toda la clase</label>
            <label className="flex cursor-pointer items-center gap-2"><input type="radio" name="vis" checked={visibility === "private"} onChange={() => setVisibility("private")} className="h-5 w-5 accent-[var(--brand)]" /> Solo yo (borrador)</label>
          </div>
        </fieldset>

        {msg && <p role={msg.ok ? "status" : "alert"} className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-ok-soft text-ok" : "bg-bad-soft text-bad"}`}>{msg.text}</p>}
        <button type="submit" disabled={busy} className="min-h-12 w-full rounded-lg bg-brand px-5 text-sm font-semibold text-brand-ink disabled:opacity-60">{busy ? "Subiendo…" : "Publicar"}</button>
        <p className="text-xs text-muted">Asegúrate de tener derecho a compartir el material con tus alumnos. Los alumnos solo podrán verlo dentro de la plataforma.</p>
      </form>

      <section>
        <h2 className="font-display text-xl font-bold">Material subido ({list.length})</h2>
        {list.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Todavía no has subido nada.</p>
        ) : (
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {list.map((m) => (
              <MaterialCard
                key={m.id}
                m={m}
                canDelete
                onDelete={async () => {
                  if (m.storagePath) await removeMaterialFile(m.storagePath);
                  await repo.deleteMaterial(m.id);
                  await load();
                }}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
