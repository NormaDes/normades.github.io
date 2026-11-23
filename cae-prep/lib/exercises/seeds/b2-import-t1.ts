import type { ClozeMcContent, KwtContent, OpenClozeContent, WordFormationContent } from "@/lib/schemas";

/** B2 First · Test 1 importado del material del profesor · Reading and Use of English, partes 1-4 */

export const b2t1r1: Array<{ id: string; data: ClozeMcContent }> = [
  {
    id: "b2-imp-t1-r1",
    data: {
      title: "Space junk",
      topic: "Science",
      text: `The Space Age began well over half a century ago, and ever since then the area just {{1}} the Earth's atmosphere has been filling up with all kinds of man-made objects that have become {{2}} as 'space junk'. The items up there {{3}} from old satellites and parts of rockets to hundreds of thousands of pieces smaller than one centimetre, all of them travelling at extremely {{4}} speed. Over the last five years, the number of such objects in space is {{5}} to have risen by 50 per cent, and this has {{6}} increased the risk of damage to working satellites or space vehicles with crews on board.

International agreement has therefore now been {{7}} on limiting the amount of new space junk. Scientists have also {{8}} up with some interesting suggestions for tidying up space. These include using laser beams, giant nets and even an enormous umbrella-like device to collect tiny bits of junk.`,
      questions: [
        { n: 1, options: ["along", "away", "out", "beyond"], correct: 3, explanations: ["'Along' indica movimiento a lo largo de algo, no una zona más allá.", "'Away' necesita 'from' (away from).", "'Out' no se combina con 'just … the atmosphere'.", "Correcta: 'just beyond' = justo más allá de."], evidence: "the area just beyond the Earth's atmosphere", skill: "preposition" },
        { n: 2, options: ["referred", "known", "called", "named"], correct: 1, explanations: ["'Referred to as' lleva 'to'; sin 'to' no es correcto.", "Correcta: 'become known as' = pasar a ser conocido como.", "'Become called' no se usa; sería 'be called'.", "'Become named' no se usa."], evidence: "have become known as 'space junk'", skill: "collocation" },
        { n: 3, options: ["include", "enclose", "cover", "range"], correct: 3, explanations: ["'Include' no va seguido de 'from … to'.", "'Enclose' significa adjuntar o rodear.", "'Cover' significa cubrir; no encaja con 'from … to'.", "Correcta: 'range from X to Y' = abarcar desde X hasta Y."], evidence: "range from old satellites … to hundreds of thousands of pieces", skill: "verb pattern" },
        { n: 4, options: ["high", "rapid", "light", "fast"], correct: 0, explanations: ["Correcta: 'high speed' es la colocación habitual.", "'Rapid' no se combina con 'speed'.", "'Light speed' es la velocidad de la luz, no 'extremely'.", "'Fast speed' no es natural; 'fast' no califica a 'speed'."], evidence: "travelling at extremely high speed", skill: "collocation" },
        { n: 5, options: ["assessed", "supposed", "estimated", "regarded"], correct: 2, explanations: ["'Assessed' se usa con 'as' o para evaluar algo, no con 'to have risen'.", "'Supposed to' significa se supone/debería, no una cifra.", "Correcta: 'is estimated to have risen' = se calcula que ha subido.", "'Regarded' va con 'as', no con 'to have'."], evidence: "is estimated to have risen by 50 per cent", skill: "verb meaning" },
        { n: 6, options: ["largely", "greatly", "importantly", "absolutely"], correct: 1, explanations: ["'Largely' significa 'en gran parte' y no se usa con 'increased'.", "Correcta: 'greatly increased' = aumentó mucho.", "'Importantly' no se usa como intensificador.", "'Absolutely' no se combina con 'increased'."], evidence: "this has greatly increased the risk", skill: "collocation" },
        { n: 7, options: ["arrived", "reached", "finished", "closed"], correct: 1, explanations: ["'Arrived' va con 'at' y no con 'agreement'.", "Correcta: 'an agreement has been reached' = se ha alcanzado un acuerdo.", "'Finished' no se usa con 'agreement'.", "'Closed' no se usa con 'agreement'."], evidence: "agreement has therefore now been reached on limiting", skill: "collocation" },
        { n: 8, options: ["caught up with", "put up with", "come up with", "kept up with"], correct: 2, explanations: ["'Catch up with' = alcanzar a alguien.", "'Put up with' = soportar.", "Correcta: 'come up with' = idear / proponer.", "'Keep up with' = mantenerse al día."], evidence: "have also come up with some interesting suggestions", skill: "phrasal verb" },
      ],
    },
  },
];

export const b2t1r2: Array<{ id: string; data: OpenClozeContent }> = [
  {
    id: "b2-imp-t1-r2",
    data: {
      title: "Chewing gum",
      topic: "History",
      text: `We still tend to think chewing gum is a fairly recent invention, even {{1}} there is evidence it was used 5,000 years ago in Finland. The Ancient Greeks also chewed gum, as {{2}} the Aztecs in Mexico during the sixteenth century. As far as we know, however, it wasn't {{3}} 1869 that chewing gum became popular in its present form, {{4}} a New York inventor called Thomas Adams first had the idea of adding flavour to it.

Nowadays, of course, it is chewed around the world, {{5}} the fact that it continues to be regarded by some {{6}} an unpleasant habit. Unfortunately, far too many people drop used gum onto the pavement, {{7}} it remains for some time because it is extremely difficult to remove once it has stuck to the surface. On the other hand, those {{8}} favour of chewing gum claim it helps them relax, improves their concentration, and helps keep their teeth clean.`,
      gaps: [
        { n: 1, answers: ["though", "if"], explanation: "'Even though' = aunque (hecho real); también se acepta 'even if'.", evidence: "even though there is evidence", skill: "concession link" },
        { n: 2, answers: ["did"], explanation: "'As did the Aztecs' = igual que hicieron los aztecas (inversión tras 'as').", evidence: "as did the Aztecs in Mexico", skill: "auxiliary verb" },
        { n: 3, answers: ["until", "till"], explanation: "'It wasn't until 1869 that…' = no fue hasta 1869 cuando…", evidence: "it wasn't until 1869 that", skill: "fixed structure" },
        { n: 4, answers: ["when"], explanation: "'When' introduce el momento: cuando un inventor de Nueva York tuvo la idea.", evidence: "when a New York inventor called Thomas Adams first had the idea", skill: "relative adverb" },
        { n: 5, answers: ["despite"], explanation: "'Despite the fact that' = a pesar de que (no admite 'of' después).", evidence: "despite the fact that it continues to be regarded", skill: "contrast link" },
        { n: 6, answers: ["as"], explanation: "'Be regarded as' = ser considerado como.", evidence: "regarded by some as an unpleasant habit", skill: "dependent preposition" },
        { n: 7, answers: ["where"], explanation: "'Where' se refiere al lugar: la acera, donde el chicle permanece.", evidence: "onto the pavement, where it remains", skill: "relative pronoun" },
        { n: 8, answers: ["in"], explanation: "'In favour of' = a favor de.", evidence: "those in favour of chewing gum", skill: "fixed phrase" },
      ],
    },
  },
];

export const b2t1r3: Array<{ id: string; data: WordFormationContent }> = [
  {
    id: "b2-imp-t1-r3",
    data: {
      title: "Remembering people's names",
      topic: "Psychology",
      text: `Most of us have suffered the embarrassment of forgetting someone's name. Often we fail to pay attention when {{1}} are made, but later on in the conversation we don't want to appear {{2}} by asking them what they're called.

Fortunately, there are some simple ways you can {{3}} this problem. One is to improve your powers of {{4}}. Practise studying faces in public places, making a mental note of physical {{5}}, such as high foreheads or narrow eyebrows. You'll be surprised what a wide {{6}} of shapes and sizes people's features have. Then, when you first meet someone, remember them as 'Laura with the small nose', for example.

With surnames, make {{7}} associations. For instance, imagine people called Cook, Ford or King making a meal, driving a car or wearing a crown, respectively. Finally, ending with the person's name, as in 'See you later, Max.' is a good way of {{8}} that you don't forget it.`,
      gaps: [
        { n: 1, base: "INTRODUCE", answers: ["introductions"], explanation: "Tras 'when' y antes de 'are made' hace falta un sustantivo plural: introduce → introductions.", evidence: "when introductions are made", skill: "noun formation" },
        { n: 2, base: "POLITE", answers: ["impolite"], explanation: "El sentido es negativo (no queremos parecer maleducados): polite → impolite (prefijo im-).", evidence: "appear impolite by asking them what they're called", skill: "negative prefix" },
        { n: 3, base: "COME", answers: ["overcome"], explanation: "'Overcome a problem' = superar un problema (verbo compuesto).", evidence: "ways you can overcome this problem", skill: "compound verb" },
        { n: 4, base: "OBSERVE", answers: ["observation"], explanation: "Tras 'powers of' va un sustantivo: observe → observation.", evidence: "improve your powers of observation", skill: "noun formation" },
        { n: 5, base: "CHARACTER", answers: ["characteristics"], explanation: "Sustantivo plural tras 'physical': characteristics (rasgos).", evidence: "making a mental note of physical characteristics", skill: "noun formation" },
        { n: 6, base: "VARY", answers: ["variety"], explanation: "'A wide variety of' = una gran variedad de; vary → variety (la y pasa a i).", evidence: "a wide variety of shapes and sizes", skill: "noun formation" },
        { n: 7, base: "VISION", answers: ["visual"], explanation: "Adjetivo antes de 'associations': vision → visual.", evidence: "make visual associations", skill: "adjective formation" },
        { n: 8, base: "SURE", answers: ["ensuring"], explanation: "Tras la preposición 'of' va una forma -ing: sure → ensure → ensuring.", evidence: "a good way of ensuring that you don't forget it", skill: "verb formation" },
      ],
    },
  },
];

export const b2t1r4: Array<{ id: string; data: KwtContent }> = [
  {
    id: "b2-imp-t1-r4",
    data: {
      title: "Key word transformations · Test 1",
      topic: "Mixed structures",
      items: [
        { n: 1, first: "Thomas spoke so quickly I had difficulty understanding him.", keyword: "DIFFICULT", before: "Thomas spoke so quickly I", after: "him.", answers: ["found it difficult to understand"], explanation: "'Find it + adjetivo + to + infinitivo': 'found it difficult to understand'.", skill: "verb pattern" },
        { n: 2, first: "They've postponed the match and it'll be played next weekend.", keyword: "PUT", before: "The match", after: "until next weekend.", answers: ["has been put off"], explanation: "Pasiva en presente perfecto con el phrasal verb 'put off' (aplazar).", skill: "passive" },
        { n: 3, first: "I'm never going to speak to Louis again.", keyword: "INTENTION", before: "I've got", after: "to Louis again.", answers: ["no intention of speaking"], explanation: "'Have no intention of + -ing' = no tener intención de.", skill: "fixed phrase" },
        { n: 4, first: "It seems certain that lightning started the forest fire.", keyword: "MUST", before: "The forest fire", after: "by lightning.", answers: ["must have been started"], explanation: "Deducción sobre el pasado en pasiva: 'must have been started'.", skill: "modal deduction" },
        { n: 5, first: "It wasn't worth going to the market because it was closing.", keyword: "POINT", before: "The market was closing, so", after: "going there.", answers: ["there was no point in", "there was no point"], explanation: "'There is no point (in) + -ing' = no tiene sentido hacer algo.", skill: "fixed phrase" },
        { n: 6, first: "We phoned the restaurant, but they said booking a table wasn't necessary.", keyword: "HAVE", before: "We phoned the restaurant, but they said we", after: "a table.", answers: ["didn't have to book", "wouldn't have to book", "did not have to book", "would not have to book"], explanation: "'Not have to' = no ser necesario (ausencia de obligación): 'didn't have to book'.", skill: "modal verbs" },
      ],
    },
  },
];
