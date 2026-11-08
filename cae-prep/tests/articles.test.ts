import assert from "node:assert/strict";
import { test } from "node:test";
import { classifyTopic, decodeEntities, decodeId, encodeId, estimateDifficulty, htmlToText, lengthBucket } from "../lib/articles/text";
import { parseConversation, parseGuardian, parseMediaWiki } from "../lib/articles/sources";

const LONG = Array.from({ length: 30 }, (_, i) => `Sentence number ${i + 1} explains how remote work changes the daily routine of employees and employers across the country.`).join(" ");

test("HTML → texto: párrafos, entidades y bloques ajenos", () => {
  const html = `<p>It&rsquo;s a &ldquo;test&rdquo; &amp; more.</p><aside>RELATED LINK</aside><figure><img src="x"><figcaption>cap</figcaption></figure><h2>Title</h2><p>Second<br>line.</p><script>alert(1)</script>`;
  const text = htmlToText(html);
  assert.equal(text, "It’s a “test” & more.\n\nTitle\n\nSecond line.");
  assert.ok(!text.includes("RELATED") && !text.includes("alert"));
  assert.equal(decodeEntities("&#8217;&#x2014;&nbsp;"), "’— ");
});

test("dificultad: frases cortas = B2+, académico denso = C2", () => {
  const easy = "The cat sat on the mat. It was a nice day. We went to the park. The dog ran fast. ".repeat(6);
  const hard = "Notwithstanding considerable methodological heterogeneity, contemporary epidemiological investigations consistently demonstrate substantial socioeconomic disparities, which fundamentally complicate interventions designed to ameliorate institutional vulnerabilities across heterogeneous populations. ".repeat(3);
  assert.equal(estimateDifficulty(easy).level, "B2+");
  assert.equal(estimateDifficulty(hard).level, "C2");
});

test("longitud y tema", () => {
  assert.equal(lengthBucket(300), "short");
  assert.equal(lengthBucket(700), "medium");
  assert.equal(lengthBucket(1500), "long");
  assert.equal(classifyTopic("The new software and the smartphone app use artificial intelligence and data online"), "tecnologia");
  assert.equal(classifyTopic("A quiet afternoon by the river"), "general");
});

test("id seguro para URL: ida y vuelta", () => {
  const id = "guardian:technology/2026/nov/06/some-story?x=1";
  assert.equal(decodeId(encodeId(id)), id);
  assert.ok(!/[+/=]/.test(encodeId(id)));
});

test("Guardian: normaliza, exige cuerpo y conserva autor, fecha, URL y licencia", () => {
  const json = JSON.stringify({
    response: {
      results: [
        { id: "technology/2026/nov/06/a", webTitle: "Remote work &amp; us", webUrl: "https://www.theguardian.com/technology/2026/nov/06/a", webPublicationDate: "2026-11-06T09:00:00Z", fields: { body: `<p>${LONG}</p>`, byline: "Jane Doe" } },
        { id: "technology/2026/nov/06/sin-cuerpo", webTitle: "No body", webUrl: "https://x", fields: {} },
        { id: "technology/2026/nov/06/corto", webTitle: "Short", webUrl: "https://y", fields: { body: "<p>Too short.</p>" } },
      ],
    },
  });
  const [a, ...rest] = parseGuardian(json, "tecnologia");
  assert.equal(rest.length, 0);
  assert.equal(a.id, "guardian:technology/2026/nov/06/a");
  assert.equal(a.title, "Remote work & us");
  assert.equal(a.author, "Jane Doe");
  assert.equal(a.publishedAt, "2026-11-06T09:00:00Z");
  assert.equal(a.url, "https://www.theguardian.com/technology/2026/nov/06/a");
  assert.equal(a.topic, "tecnologia");
  assert.ok(a.license.includes("Guardian") && a.fullTextAllowed && a.body && a.wordCount > 120);
});

test("The Conversation: Atom con contenido HTML en CDATA", () => {
  const xml = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom">
  <entry><id>tag:theconversation.com,2011:article/12345</id><title>Why we need <![CDATA[sleep]]></title>
  <author><name>Dr Alex Smith</name></author><published>2026-11-05T08:00:00Z</published>
  <link rel="alternate" href="https://theconversation.com/why-we-need-sleep-12345"/>
  <content type="html"><![CDATA[<p>${LONG}</p>]]></content></entry>
  <entry><id>x</id><title>Tiny</title><content type="html">&lt;p&gt;short&lt;/p&gt;</content></entry></feed>`;
  const list = parseConversation(xml);
  assert.equal(list.length, 1);
  assert.equal(list[0].author, "Dr Alex Smith");
  assert.equal(list[0].url, "https://theconversation.com/why-we-need-sleep-12345");
  assert.equal(list[0].license, "CC BY-ND 4.0");
  assert.equal(list[0].source, "conversation");
});

test("MediaWiki: extracto en texto plano, autor colectivo y licencia CC BY-SA", () => {
  const json = JSON.stringify({ query: { pages: [{ pageid: 42, title: "Sleep", extract: `${LONG}\n\n== Stages ==\n${LONG}`, fullurl: "https://en.wikipedia.org/wiki/Sleep", touched: "2026-10-30T00:00:00Z" }] } });
  const a = parseMediaWiki(json, "wikipedia", "salud")!;
  assert.equal(a.author, "Wikipedia contributors");
  assert.equal(a.license, "CC BY-SA 4.0");
  assert.ok(a.body!.includes("\n\nStages\n\n"));
  assert.equal(parseMediaWiki(JSON.stringify({ query: { pages: [{ title: "X", missing: true }] } }), "wikipedia"), null);
});
