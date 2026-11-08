"use client";

import { getBrowserClient } from "@/lib/supabase/client";

/** URL temporal (1 h) de un archivo del almacenamiento privado «materials» */
export async function signedUrl(path: string): Promise<string | null> {
  const { data, error } = await getBrowserClient().storage.from("materials").createSignedUrl(path, 3600);
  return error ? null : (data?.signedUrl ?? null);
}

export async function uploadMaterialFile(file: File): Promise<string> {
  const safe = file.name.replace(/[^\w.\-]+/g, "_").slice(-80);
  const path = `${crypto.randomUUID()}/${safe}`;
  const { error } = await getBrowserClient().storage.from("materials").upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) throw new Error(error.message);
  return path;
}

export async function removeMaterialFile(path: string): Promise<void> {
  await getBrowserClient().storage.from("materials").remove([path]);
}
