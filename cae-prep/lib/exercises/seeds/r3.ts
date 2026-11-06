import type { WordFormationContent } from "@/lib/schemas";

export const r3Seeds: Array<{ id: string; data: WordFormationContent }> = [
  {
    id: "seed-r3-remote-work",
    data: {
      title: "Working from home",
      topic: "Work",
      text: `For many employees, working from home has proved a {{1}} experience, offering greater flexibility and an end to the daily commute. Employers, on the other hand, have been {{2}} about its long-term effects on teamwork, and there is a {{3}} fear that staff who are rarely seen in the office will be overlooked for promotion.

Regular video calls can help to {{4}} bonds between colleagues who have never met, but critics point to a lack of {{5}} in the way performance is judged. It would be {{6}} to assume that everyone wants the same arrangement, however. {{7}}, there are signs that a compromise is emerging: a hybrid model, with {{8}} in the office required on two days a week.`,
      gaps: [
        { n: 1, base: "REWARD", answers: ["rewarding"], explanation: "Hace falta un adjetivo antes de 'experience': reward → rewarding.", evidence: "a rewarding experience", skill: "adjective formation" },
        { n: 2, base: "CAUTION", answers: ["cautious"], explanation: "Tras 'have been' va un adjetivo: caution → cautious (cautious about = cauteloso con).", evidence: "have been cautious about its long-term effects", skill: "adjective formation" },
        { n: 3, base: "GROW", answers: ["growing"], explanation: "Participio como adjetivo: 'a growing fear' (un temor creciente).", evidence: "there is a growing fear", skill: "adjective formation" },
        { n: 4, base: "STRONG", answers: ["strengthen"], explanation: "Tras 'help to' va un verbo: strong → strengthen (con cambio de vocal y sufijo -en).", evidence: "help to strengthen bonds between colleagues", skill: "verb formation" },
        { n: 5, base: "CLEAR", answers: ["clarity"], explanation: "Tras 'lack of' va un sustantivo: clear → clarity (transparencia).", evidence: "a lack of clarity in the way performance is judged", skill: "noun formation" },
        { n: 6, base: "WISE", answers: ["unwise"], explanation: "El sentido pide negación: 'It would be unwise to assume…' (no sería prudente suponer).", evidence: "It would be unwise to assume", skill: "negative prefix" },
        { n: 7, base: "FORTUNATE", answers: ["fortunately"], explanation: "Adverbio de actitud al inicio de la frase: fortunate → fortunately.", evidence: "Fortunately, there are signs", skill: "adverb formation" },
        { n: 8, base: "ATTEND", answers: ["attendance"], explanation: "Sustantivo tras 'with': attend → attendance (asistencia).", evidence: "with attendance in the office required", skill: "noun formation" },
      ],
    },
  },
  {
    id: "seed-r3-running",
    data: {
      title: "The running boom",
      topic: "Sport and health",
      text: `Running has seen a remarkable surge in {{1}} in recent years. Once the preserve of {{2}} athletes, it is now embraced by people of all ages, many of whom see it as an {{3}} way to stay fit. Weekly community races have helped to {{4}} the sport by removing the need for club membership.

Participants often praise the {{5}} of the atmosphere, yet doctors warn that inexperienced runners often fall victim to {{6}}. It is therefore {{7}} to increase your distance too quickly. A gradual build-up, combined with proper {{8}}, is the safest approach.`,
      gaps: [
        { n: 1, base: "POPULAR", answers: ["popularity"], explanation: "Tras la preposición 'in' se necesita un sustantivo: popular → popularity.", evidence: "a remarkable surge in popularity", skill: "noun formation" },
        { n: 2, base: "COMPETE", answers: ["competitive", "competing"], explanation: "Adjetivo antes de 'athletes': 'competitive athletes' (atletas de competición).", evidence: "the preserve of competitive athletes", skill: "adjective formation" },
        { n: 3, base: "EXPENSE", answers: ["inexpensive"], explanation: "Con 'way to stay fit' se pide un adjetivo positivo: expense → expensive → inexpensive.", evidence: "an inexpensive way to stay fit", skill: "negative prefix" },
        { n: 4, base: "DEMOCRACY", answers: ["democratise", "democratize"], explanation: "Tras 'helped to' va un verbo: democracy → democratise (sufijo -ise/-ize).", evidence: "helped to democratise the sport", skill: "verb formation" },
        { n: 5, base: "FRIEND", answers: ["friendliness"], explanation: "Con 'the … of the atmosphere' va un sustantivo: friend → friendly → friendliness.", evidence: "praise the friendliness of the atmosphere", skill: "noun formation" },
        { n: 6, base: "INJURE", answers: ["injury", "injuries"], explanation: "'fall victim to' + sustantivo: injure → injury/injuries.", evidence: "fall victim to injuries", skill: "noun formation" },
        { n: 7, base: "ADVISE", answers: ["inadvisable"], explanation: "El sentido es negativo (no conviene aumentar la distancia rápido): advise → advisable → inadvisable.", evidence: "It is therefore inadvisable to increase your distance", skill: "negative prefix" },
        { n: 8, base: "NUTRIENT", answers: ["nutrition"], explanation: "Tras 'proper' va un sustantivo: nutrient → nutrition (alimentación).", evidence: "combined with proper nutrition", skill: "noun formation" },
      ],
    },
  },
];
