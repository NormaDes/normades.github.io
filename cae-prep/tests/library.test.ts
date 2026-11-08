import assert from "node:assert/strict";
import { test } from "node:test";
import { CURATED_VIDEOS, parseYouTubeId } from "../lib/library/catalog";

test("ID de YouTube desde cualquier tipo de enlace", () => {
  const id = "iCvmsMzlF7o";
  for (const u of [`https://www.youtube.com/watch?v=${id}`, `https://youtu.be/${id}?t=10`, `https://www.youtube.com/embed/${id}`, `https://m.youtube.com/watch?v=${id}&list=x`, `https://www.youtube.com/shorts/${id}`, id]) {
    assert.equal(parseYouTubeId(u), id, u);
  }
  assert.equal(parseYouTubeId("https://example.com/watch?v=iCvmsMzlF7o"), null);
  assert.equal(parseYouTubeId("hola"), null);
});

test("catálogo: IDs con formato válido y sin duplicados", () => {
  const ids = CURATED_VIDEOS.map((v) => v.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const v of CURATED_VIDEOS) assert.match(v.id, /^[\w-]{11}$/, v.title);
});

import { normalizeSupabaseUrl } from "@/lib/supabase/config";

test("normalizeSupabaseUrl deja solo el origen", () => {
  assert.equal(normalizeSupabaseUrl("https://abc.supabase.co/rest/v1/"), "https://abc.supabase.co");
  assert.equal(normalizeSupabaseUrl(" https://abc.supabase.co "), "https://abc.supabase.co");
  assert.equal(normalizeSupabaseUrl("abc.supabase.co/auth/v1"), "https://abc.supabase.co");
  assert.equal(normalizeSupabaseUrl(""), "");
});
