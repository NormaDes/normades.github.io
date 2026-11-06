import type { OpenClozeContent } from "@/lib/schemas";

export const r2Seeds: Array<{ id: string; data: OpenClozeContent }> = [
  {
    id: "seed-r2-smartphones",
    data: {
      title: "The smartphone and our attention",
      topic: "Technology",
      text: `Few inventions have changed daily life {{1}} profoundly as the smartphone. Within little more than a decade, it has replaced the camera, the map and, for many people, the alarm clock, {{2}} not the newspaper.

{{3}} its convenience, however, there is growing concern about the effect it is having on our concentration. Studies suggest that the mere presence of a phone on a desk, {{4}} if it is switched off, can reduce our ability to focus. It is hardly surprising, {{5}}, that some schools have banned them altogether. Not {{6}} the parents agree with the ban, though; many argue that children {{7}} be taught to use technology responsibly rather than be kept away from it. Whichever side is right, it seems unlikely that the debate will be settled {{8}} long.`,
      gaps: [
        { n: 1, answers: ["as", "so"], explanation: "Comparación 'as … as': 'changed daily life as profoundly as'. En frases negativas también vale 'so … as'.", evidence: "changed daily life as profoundly as the smartphone", skill: "comparison" },
        { n: 2, answers: ["if"], explanation: "'if not' introduce una posibilidad mayor: 'the alarm clock, if not the newspaper' (incluso el periódico).", evidence: "the alarm clock, if not the newspaper", skill: "fixed phrase" },
        { n: 3, answers: ["despite"], explanation: "'Despite + sustantivo' expresa contraste: 'Despite its convenience'. (Con 'in spite of' serían dos palabras.)", evidence: "Despite its convenience, however", skill: "linking word" },
        { n: 4, answers: ["even"], explanation: "'even if' = incluso si; refuerza que el efecto se da aunque el móvil esté apagado.", evidence: "even if it is switched off", skill: "linking word" },
        { n: 5, answers: ["then", "therefore"], explanation: "Conector de consecuencia entre comas: 'It is hardly surprising, then, that…'.", evidence: "It is hardly surprising, then, that some schools", skill: "linking word" },
        { n: 6, answers: ["all"], explanation: "'Not all (of) the parents' = no todos los padres. Se usa 'all' con determinante 'the'.", evidence: "Not all the parents agree", skill: "quantifier" },
        { n: 7, answers: ["should", "must"], explanation: "Verbo modal de obligación/recomendación seguido de infinitivo pasivo: 'children should be taught'.", evidence: "children should be taught to use technology", skill: "modal verb" },
        { n: 8, answers: ["before"], explanation: "'before long' = dentro de poco; expresión fija. Aquí en negativo: 'unlikely … settled before long'.", evidence: "will be settled before long", skill: "fixed phrase" },
      ],
    },
  },
  {
    id: "seed-r2-overtourism",
    data: {
      title: "A village under pressure",
      topic: "Tourism",
      text: `The village of Eldermoor, home to fewer than a thousand people, can receive several thousand visitors on a busy summer day. Locals, {{1}} of whom make their living from tourism, have begun to complain that their home is being turned into a theme park.

Matters have reached the point {{2}} some residents have resorted to putting up fences to stop tourists from peering into their gardens. The authorities are {{3}} a difficult position: they cannot afford to turn visitors away, yet to do {{4}} would only make matters worse. Several measures have been proposed, {{5}} limiting the number of coaches allowed into the village each day. It remains to be {{6}}, however, whether such restrictions will have any effect. Some argue that unless visitors are {{7}} to pay more, the numbers will never fall. {{8}} the outcome, the village has become a warning to other popular destinations.`,
      gaps: [
        { n: 1, answers: ["many", "most", "some"], explanation: "Relativo con cuantificador: 'many of whom' (muchos de los cuales). 'Most' y 'some' también encajan.", evidence: "Locals, many of whom make their living", skill: "relative clause" },
        { n: 2, answers: ["where", "that"], explanation: "'reach the point where/that' = llegar al punto en que.", evidence: "reached the point where some residents", skill: "relative pronoun" },
        { n: 3, answers: ["in"], explanation: "Expresión fija: 'be in a difficult position'.", evidence: "are in a difficult position", skill: "preposition" },
        { n: 4, answers: ["nothing"], explanation: "'to do nothing' (no hacer nada) contrasta con 'turn visitors away': ambas opciones son malas.", evidence: "yet to do nothing would only make matters worse", skill: "fixed phrase" },
        { n: 5, answers: ["including", "notably", "namely", "like"], explanation: "Introduce un ejemplo de las medidas propuestas: 'including limiting…'.", evidence: "proposed, including limiting the number of coaches", skill: "linking word" },
        { n: 6, answers: ["seen"], explanation: "Expresión fija: 'It remains to be seen whether…' (está por ver si…).", evidence: "It remains to be seen, however, whether", skill: "fixed phrase" },
        { n: 7, answers: ["made", "forced", "obliged", "required", "compelled"], explanation: "Pasiva de causativo/obligación seguida de 'to pay': 'are made/forced/obliged to pay'.", evidence: "unless visitors are made to pay more", skill: "passive" },
        { n: 8, answers: ["whatever"], explanation: "'Whatever the outcome' = sea cual sea el resultado; estructura concesiva sin verbo.", evidence: "Whatever the outcome, the village", skill: "linking word" },
      ],
    },
  },
];
