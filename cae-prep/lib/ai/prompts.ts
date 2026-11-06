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

    case "r5":
      return `Write a Cambridge C1 Advanced Reading & Use of English PART 5 (multiple choice, long text).

${topicLine}
- An original text of 600–720 words (essay, feature article, or a first-person account) with a clear argumentative or narrative development, split into 6–9 paragraphs separated by a blank line.
- ${n} multiple-choice questions (A–D) in text order, testing: writer's attitude/opinion, purpose, detail, inference, tone, reference words ("what does 'this' refer to"), and the meaning of a phrase in context. Do not test trivial word-matching.
- Each question has a "stem" (the question text), 4 options, "correct" (0-based) and 4 "explanations" in the SAME ORDER as the options (why the correct one is right and why each wrong one is wrong, referencing the text). Distractors must be plausible but unambiguously wrong according to the text. Vary the correct position.
- "evidence" is a short literal quote from the text that proves the answer.
- "skill" examples: "attitude", "detail", "inference", "purpose", "reference", "tone", "meaning in context".

${jsonRules}
Schema:
{"title": string, "topic": string, "text": string, "questions": [{"n": 1, "stem": string, "options": [string,string,string,string], "correct": 0-3, "explanations": [string,string,string,string], "evidence": string, "skill": string}]}  // exactly ${n} questions`;

    case "r6": {
      const t = part.choices ?? 4;
      return `Write a Cambridge C1 Advanced Reading & Use of English PART 6 (cross-text multiple matching).

${topicLine}
- ${t} short extracts (labelled A–${String.fromCharCode(64 + t)}), each 100–140 words, by DIFFERENT fictional writers (give each a plausible fictional "author" name and role, never a real person), all discussing the same issue from different, clearly distinguishable standpoints (agreeing on some sub-points, disagreeing on others).
- "intro": one sentence of context, e.g. "Four writers give their views on…".
- ${n} questions. The first two (or the first half) ask which writer holds a particular view / has a different opinion from the others on a given sub-point. The remaining ask which writers share an opinion with another named writer on a sub-point (for those, the answer cannot be the writer named in the question). Every question must have exactly ONE defensible answer supported by the texts.
- "correct" is the 0-based index of the extract (0 = A).
- "explanation" (in ${LANG}) explains why that extract is the answer and, briefly, why the others are not. "evidence" is a short literal quote from the correct extract.
- "skill" examples: "contrast of opinions", "shared opinion", "attitude", "inference".

${jsonRules}
Schema:
{"title": string, "topic": string, "intro": string, "texts": [{"label": "A", "author": string, "text": string}], "questions": [{"n": 1, "stem": string, "correct": 0-${t - 1}, "explanation": string, "evidence": string, "skill": string}]}  // exactly ${t} texts and ${n} questions`;
    }

    case "r7": {
      const p = part.choices ?? 7;
      return `Write a Cambridge C1 Advanced Reading & Use of English PART 7 (gapped text).

${topicLine}
- An original article of about 650–750 words with exactly ${n} paragraphs removed. Mark each gap in "text" as {{1}}…{{${n}}} on its own line (a blank line before and after). The text must remain coherent with the gaps filled.
- Provide ${p} candidate paragraphs (each 40–90 words) labelled A–${String.fromCharCode(64 + p)}: the ${n} correct ones plus ONE extra paragraph that fits nowhere (but is tempting). Shuffle them so the correct letters are NOT in text order.
- Each correct paragraph must be uniquely identifiable by cohesion: pronoun/reference links to the previous or next paragraph, linking words, time sequence, repeated lexical chains, contrast. A wrong paragraph must break at least one such link.
- "correct" is the 0-based index (0 = A) of the paragraph for that gap; all ${n} values must be DIFFERENT.
- "explanation" (in ${LANG}) names the exact cohesive clues before and after the gap. "evidence" is a short literal quote from the text near the gap or from the paragraph that proves the link.
- "skill" examples: "reference", "linking word", "lexical chain", "time sequence", "contrast".

${jsonRules}
Schema:
{"title": string, "topic": string, "text": string, "paragraphs": [{"letter": "A", "text": string}], "gaps": [{"n": 1, "correct": 0-${p - 1}, "explanation": string, "evidence": string, "skill": string}]}  // exactly ${p} paragraphs and ${n} gaps`;
    }

    case "r8": {
      const sec = part.choices ?? 5;
      return `Write a Cambridge C1 Advanced Reading & Use of English PART 8 (multiple matching).

${topicLine}
- One article of ${sec} sections (labelled A–${String.fromCharCode(64 + sec)}), each 140–180 words with a short "heading" (e.g. a person, a product, or a theme), about related items/people/ideas.
- "intro": one sentence of context.
- ${n} statements ("stem") that paraphrase ideas in the sections (never copy phrases verbatim). Each section must be the answer for at least one statement and some sections for two or three. Each statement matches exactly ONE section: check that no other section expresses the same idea.
- Typical stems: "mentions a drawback that was not anticipated", "describes a change of opinion", "refers to the importance of timing".
- "correct" is the 0-based index of the section (0 = A).
- "explanation" (in ${LANG}) shows the paraphrase link; "evidence" is a short literal quote from the correct section.
- "skill" examples: "paraphrase", "attitude", "detail", "inference".

${jsonRules}
Schema:
{"title": string, "topic": string, "intro": string, "sections": [{"label": "A", "heading": string, "text": string}], "questions": [{"n": 1, "stem": string, "correct": 0-${sec - 1}, "explanation": string, "evidence": string, "skill": string}]}  // exactly ${sec} sections and ${n} questions`;
    }

    case "w1":
      return `Write a Cambridge C1 Advanced WRITING PART 1 task (compulsory essay).

${topicLine}
- "question": 2–3 sentences of context in the official style, e.g. "Your class has attended a panel discussion on how cities can reduce traffic congestion. You have made the notes below."
- "points": EXACTLY 3 strings: two short, concrete, genuinely debatable ideas (3–8 words each) and the third must be exactly "your own idea".
- The topic must allow a balanced essay of 220–260 words with a clear opinion (society, education, environment, technology, health, work, culture). Avoid topics that require specialised knowledge.

${jsonRules}
Schema:
{"title": string, "topic": string, "question": string, "points": [string, string, "your own idea"]}`;

    case "w2":
      return `Write a Cambridge C1 Advanced WRITING PART 2 set of options.

${topicLine}
- Provide EXACTLY 3 different tasks, each of a DIFFERENT type chosen from: "letter", "email", "proposal", "report", "review".
- Each task has a realistic "situation" (2–4 sentences stating who the reader is and the purpose) and "requirements": 2–4 bullet points the writer must cover (e.g. "describe…", "explain…", "recommend…").
- Tasks must be answerable in 220–260 words without specialised knowledge. Make the audience and register clear so register can be assessed.

${jsonRules}
Schema:
{"title": string, "topic": string, "tasks": [{"type": "letter"|"email"|"proposal"|"report"|"review", "situation": string, "requirements": [string]}]}  // exactly 3 tasks`;

    case "l1": {
      const ex = part.choices ?? 3;
      return `Write a Cambridge C1 Advanced LISTENING PART 1 (${ex} short extracts, 2 three-option questions each).

${topicLine}
- ${ex} independent extracts of 90–120 words each, on different subjects: mix a two-speaker conversation (speakers "Woman"/"Man") and a monologue. Natural spoken British English with discourse markers, hesitation and self-correction, but written as clean text for a text-to-speech voice (no stage directions, no brackets).
- Each extract has "context" ("You hear two colleagues talking about…"), "segments" (the script: each {"speaker": string, "gender": "f"|"m", "text": string}) and exactly ${n / ex} questions with 3 options (A–C) testing gist, attitude, opinion, purpose, or function. The right answer must be a paraphrase, never a repeated word sequence; distractors use words from the script in a wrong sense.
- Number questions 1..${n} across the extracts. "correct" is 0-based. "explanations" has 3 entries in the SAME ORDER as the options (in ${LANG}); "evidence" is a short literal quote from the script.

${jsonRules}
Schema:
{"title": string, "topic": string, "extracts": [{"context": string, "segments": [{"speaker": string, "gender": "f"|"m", "text": string}], "questions": [{"n": 1, "stem": string, "options": [string,string,string], "correct": 0-2, "explanations": [string,string,string], "evidence": string, "skill": string}]}]}  // exactly ${ex} extracts`;
    }

    case "l2":
      return `Write a Cambridge C1 Advanced LISTENING PART 2 (sentence completion).

${topicLine}
- A monologue of 280–340 words (a talk by a fictional speaker to an audience), as 3–4 "segments" of one speaker; clean text for text-to-speech, no stage directions.
- "intro": "You will hear … talking about … For questions 1–${n}, complete the sentences with a word or short phrase."
- ${n} sentences, in the order the information appears. Each is split into "before" and "after" around ONE gap that is filled with 1–3 words that appear in the script. Paraphrase the sentence (never copy it) so that the learner must listen. Each answer must be unambiguous; list every acceptable form in "answers" (lowercase).
- "explanation" (in ${LANG}) and a literal "evidence" quote from the script.

${jsonRules}
Schema:
{"title": string, "topic": string, "intro": string, "segments": [{"speaker": string, "gender": "f"|"m", "text": string}], "sentences": [{"n": 1, "before": string, "after": string, "answers": [string], "explanation": string, "evidence": string, "skill": string}]}  // exactly ${n} sentences`;

    case "l3":
      return `Write a Cambridge C1 Advanced LISTENING PART 3 (interview, multiple choice).

${topicLine}
- An interview of 480–580 words between an "Interviewer" (gender "m" or "f") and ONE fictional guest (never a real person). Alternate speakers in separate "segments". Natural speech; clean text for text-to-speech.
- "intro": "You will hear an interview with … For questions 1–${n}, choose the answer (A, B, C or D) which fits best according to what you hear."
- ${n} questions in order, 4 options each, testing attitude, opinion, feeling, purpose, detail. The correct option is a paraphrase; distractors echo words from the script but are wrong. "explanations" has 4 entries in the option order (in ${LANG}); "evidence" is a literal quote.

${jsonRules}
Schema:
{"title": string, "topic": string, "intro": string, "segments": [{"speaker": string, "gender": "f"|"m", "text": string}], "questions": [{"n": 1, "stem": string, "options": [string,string,string,string], "correct": 0-3, "explanations": [string,string,string,string], "evidence": string, "skill": string}]}  // exactly ${n} questions`;

    case "l4": {
      const o = part.choices ?? 8;
      const sp = n / 2;
      return `Write a Cambridge C1 Advanced LISTENING PART 4 (multiple matching, two tasks).

${topicLine}
- ${sp} short monologues (45–65 words each) by ${sp} different fictional speakers (mix of "f" and "m"), each talking about the same general experience; each speaker gives information relevant to BOTH tasks. Put each monologue in "speakers[i].segments" (speaker "Speaker i+1").
- Two tasks, each with a "stem" ("For questions 1–${sp}, choose from the list (A–H) …") and exactly ${o} "options" (short phrases). Each task has ${sp} correct answers and ${o - sp} distractors that are tempting but wrong; no two speakers share the same option within a task.
- ${n} questions: n 1..${sp} belong to task 1 (speaker n), n ${sp + 1}..${n} to task 2 (speaker n-${sp}). Fields: "task" (1|2), "speaker" (1..${sp}), "correct" (0-based option index), "explanation" (in ${LANG}), "evidence" (literal quote from the speaker).

${jsonRules}
Schema:
{"title": string, "topic": string, "speakers": [{"segments": [{"speaker": "Speaker 1", "gender": "f"|"m", "text": string}]}], "tasks": [{"stem": string, "options": [${o} strings]}, {"stem": string, "options": [${o} strings]}], "questions": [{"n": 1, "task": 1, "speaker": 1, "correct": 0-${o - 1}, "explanation": string, "evidence": string, "skill": string}]}  // ${sp} speakers, 2 tasks, ${n} questions`;
    }

    case "s1":
      return `Write a Cambridge C1 Advanced SPEAKING PART 1 (interview) set.

${topicLine}
- 6 personal questions in the style of the examiner's Part 1 (about the candidate's life, studies, work, interests, plans, opinions on everyday topics), from easy to slightly more reflective. One sentence each.

${jsonRules}
Schema:
{"title": string, "topic": string, "questions": [string]}  // 6 questions`;

    case "s2":
      return `Write a Cambridge C1 Advanced SPEAKING PART 2 (long turn) task.

${topicLine}
- Two photographs are described in words ("photos[i].description": 1–2 sentences each, concrete and visual) that can be compared on a theme (people, activities, places, feelings).
- "instruction": the examiner's task: "Compare the two photographs and say … You have about one minute." with a question about reasons/feelings/advantages.
- "partnerQuestion": the short follow-up question asked about the other candidate's photos (e.g. "Which of these would you prefer to do?").

${jsonRules}
Schema:
{"title": string, "topic": string, "instruction": string, "photos": [{"description": string}, {"description": string}], "partnerQuestion": string}`;

    case "s3":
      return `Write a Cambridge C1 Advanced SPEAKING PART 3 (collaborative task).

${topicLine}
- "question": a discussion question in the official style ("How effective might these things be in …?").
- "options": exactly 5 short noun phrases.
- "decisionQuestion": the final question ("Which two would make the biggest difference?").

${jsonRules}
Schema:
{"title": string, "topic": string, "question": string, "options": [string,string,string,string,string], "decisionQuestion": string}`;

    case "s4":
      return `Write a Cambridge C1 Advanced SPEAKING PART 4 (further discussion).

${topicLine}
- 4 more abstract, opinion-based questions extending a theme (society, education, technology, work, environment). One sentence each.

${jsonRules}
Schema:
{"title": string, "topic": string, "questions": [string]}  // 4 questions`;

    default:
      throw new Error(`No prompt for part ${partId} yet`);
  }
}
