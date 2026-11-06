import { EXPLANATION_LANGUAGE, KWT_RULES, TARGET_LEVEL, getPart, type PartId } from "@/config/exam";

const LANG = EXPLANATION_LANGUAGE === "es" ? "Spanish (español de España)" : "English";

export const SYSTEM_PROMPT = `You are a senior Cambridge English examiner and item writer for the C1 Advanced (CAE) exam. You write original, exam-quality practice items at ${TARGET_LEVEL}.

Hard rules:
- Every item must have ONE unambiguous correct answer. If a distractor could also be correct in context, rewrite it.
- Practice content (texts, sentences, options) is in British English. Explanations are in ${LANG}.
- The texts you write are ORIGINAL practice texts, not real articles. Never attribute them to real publications or invent quotes from real people.
- Output ONLY a single JSON object. No markdown fences, no commentary before or after.`;

const jsonRules = `Return a single JSON object that follows the schema exactly. Escape quotes properly. Gap markers inside "text" are written {{1}}, {{2}}, … in order, each exactly once.`;

export function buildUserPrompt(partId: PartId, topic?: string): string {
  const part = getPart(partId);
  const n = part.questionCount;
  const topicLine = topic
    ? `Topic: ${topic}.`
    : `Choose an engaging, non-trivial topic (e.g. science, society, work, culture, environment, education, technology, health). Avoid cliché topics and avoid repeating the same topic every time.`;

  switch (partId) {
    case "r1":
      return `Write a Cambridge C1 Advanced Reading & Use of English PART 1 (multiple-choice cloze).

${topicLine}
- Text of about 200–230 words in a slightly formal/informative register, with exactly ${n} gaps marked {{1}}…{{${n}}}.
- For each gap give 4 options (A–D) of the same word class that look plausible out of context. The correct answer must be decided by collocation, fixed phrase, phrasal verb, linking/grammatical pattern or precise meaning — never by pure guesswork. Check that the three distractors are genuinely wrong in the sentence (a native examiner would not accept them).
- Vary the correct option's position across A–D.
- "correct" is the 0-based index of the right option.
- "explanations" has 4 entries in the SAME ORDER as "options": for the correct one explain why it fits; for each wrong one explain precisely why it fails (collocation, meaning, grammar). One or two sentences each, in ${LANG}.
- "evidence" is a short literal fragment from the text around the gap that justifies the answer (replace the gap with the answer if useful).
- "skill" is a short label in English such as "collocation", "phrasal verb", "fixed phrase", "linking word", "meaning/register", "dependent preposition".

${jsonRules}
Schema:
{"title": string, "topic": string, "text": string, "questions": [{"n": 1, "options": [string,string,string,string], "correct": 0-3, "explanations": [string,string,string,string], "evidence": string, "skill": string}]}  // exactly ${n} questions`;

    case "r2":
      return `Write a Cambridge C1 Advanced Reading & Use of English PART 2 (open cloze).

${topicLine}
- Text of about 190–220 words with exactly ${n} gaps marked {{1}}…{{${n}}}. Each gap is ONE word.
- Test grammar and lexico-grammar: auxiliaries, prepositions, relative pronouns, linking words, determiners/quantifiers, fixed phrases, comparative structures, inversion, etc. Do not make two gaps test the same thing.
- Each gap must have an unambiguous answer. In "answers" list EVERY single word a competent examiner would accept (lowercase, one word each, no spaces). Most gaps will have 1–3 accepted answers.
- "explanation" (in ${LANG}) explains the grammar/phrase being tested and why the answer is needed.
- "evidence" is a short literal fragment from the text around the gap.
- "skill" examples: "preposition", "auxiliary verb", "relative pronoun", "linking word", "quantifier", "fixed phrase", "comparison", "inversion".

${jsonRules}
Schema:
{"title": string, "topic": string, "text": string, "gaps": [{"n": 1, "answers": [string], "explanation": string, "evidence": string, "skill": string}]}  // exactly ${n} gaps`;

    case "r3":
      return `Write a Cambridge C1 Advanced Reading & Use of English PART 3 (word formation).

${topicLine}
- Text of about 180–210 words with exactly ${n} gaps marked {{1}}…{{${n}}}. Each gap is tied to one base word given in CAPITALS (the app shows it next to the gap).
- Cover varied transformations: noun↔adjective↔verb↔adverb, negative prefixes (un-, in-, im-, dis-, mis-), plural/singular, -ful/-less, -ment/-ness/-ity, suffix changes needing a spelling change. At least 2 gaps need a negative or a less obvious form.
- "base" must be ONE word in CAPITALS and the answer must be a DIFFERENT word. Each gap must have exactly one correct form in context; list every acceptable form in "answers" (lowercase, one word each; include both spellings if British/American variants exist).
- "explanation" in ${LANG}: say which transformation is needed and why the context requires it (part of speech, negative meaning, etc.).
- "evidence" is a short literal fragment of the text around the gap.
- "skill" examples: "noun formation", "adjective formation", "adverb formation", "verb formation", "negative prefix", "plural/singular".

${jsonRules}
Schema:
{"title": string, "topic": string, "text": string, "gaps": [{"n": 1, "base": "UPPERCASEWORD", "answers": [string], "explanation": string, "evidence": string, "skill": string}]}  // exactly ${n} gaps`;

    case "r4":
      return `Write a Cambridge C1 Advanced Reading & Use of English PART 4 (key word transformations).

${topic ? topicLine : "Use a mix of everyday and semi-formal situations."}
Write exactly ${n} items. Each item:
- "first": the original sentence.
- "keyword": ONE word in CAPITALS that must be used UNCHANGED (never inflected).
- "before" / "after": the second sentence split around the gap. The gap is the part the student writes; "before" and "after" are the fixed words around it (either may be an empty string).
- "answers": every acceptable filling of the gap. Each answer MUST contain the keyword exactly as given and have between ${KWT_RULES.minWords} and ${KWT_RULES.maxWords} words INCLUDING the keyword. Contractions count as two words (haven't = 2). The keyword must NOT appear in "before" or "after".
- The second sentence must be grammatical with the answer in the gap and must keep the same meaning as the first.
- Test C1 structures: passives and reporting structures, inversion, conditionals and wishes, modal verbs of deduction, causative, gerund/infinitive patterns, phrasal verbs, fixed expressions, comparatives, "so/such", "no sooner", etc. Use a different structure for each item. Avoid items where many unrelated answers would be correct.
- "explanation" in ${LANG}: the structure tested and why the answer works.
- "skill" examples: "passive/reporting", "inversion", "conditional/wish", "modal deduction", "gerund/infinitive", "phrasal verb", "fixed expression", "comparison".

${jsonRules}
Schema:
{"title": string, "topic": string, "items": [{"n": 1, "first": string, "keyword": "WORD", "before": string, "after": string, "answers": [string], "explanation": string, "skill": string}]}  // exactly ${n} items`;

    default:
      throw new Error(`No prompt for part ${partId} yet`);
  }
}
