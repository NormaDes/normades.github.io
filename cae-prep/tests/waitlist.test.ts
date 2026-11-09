import assert from "node:assert/strict";
import { test } from "node:test";
import { waitlistSchema } from "../lib/waitlist";

const ok = { email: " Ana@Test.ES ", exam: "c1-advanced", role: "alumno", consent: true };

test("waitlist: normaliza el email y acepta datos válidos", () => {
  const r = waitlistSchema.safeParse(ok);
  assert.ok(r.success);
  assert.equal(r.data.email, "ana@test.es");
});

test("waitlist: exige consentimiento y email válido", () => {
  assert.equal(waitlistSchema.safeParse({ ...ok, consent: false }).success, false);
  assert.equal(waitlistSchema.safeParse({ ...ok, email: "no-es-email" }).success, false);
  assert.equal(waitlistSchema.safeParse({ ...ok, exam: "inventado" }).success, false);
});

test("waitlist: el campo trampa debe ir vacío", () => {
  assert.equal(waitlistSchema.safeParse({ ...ok, website: "http://spam" }).success, false);
  assert.equal(waitlistSchema.safeParse({ ...ok, website: "" }).success, true);
});
