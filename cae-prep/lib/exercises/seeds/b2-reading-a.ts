import type { ClozeMcContent, KwtContent, OpenClozeContent, WordFormationContent } from "@/lib/schemas";

/** B2 First · Reading and Use of English, partes 1-4 (textos originales de práctica) */

export const b2r1Seeds: Array<{ id: string; data: ClozeMcContent }> = [
  {
    id: "b2-r1-cycling",
    data: {
      title: "Cycling to work",
      topic: "Transport",
      text: `More and more people are {{1}} up cycling as a way of getting to work. Apart from being good for health, it is also a cheap and reliable way to travel, as cyclists do not have to {{2}} hours in traffic jams. In some cities, local authorities have {{3}} special lanes to make the journey safer.

However, not everybody is convinced. Some drivers {{4}} cyclists of causing delays on busy roads, and many cyclists say they {{5}} unsafe when a lorry passes close to them. Cycling groups are calling on councils to {{6}} more money on safe routes. They point out that the cost would soon be {{7}} back through lower healthcare bills and less pollution. As one cyclist put it, "The more of us there are on the road, the {{8}} drivers will get used to sharing it."`,
      questions: [
        { n: 1, options: ["taking", "looking", "making", "turning"], correct: 0, explanations: ["Correcta: 'take up' = empezar una actividad (take up cycling).", "'Look up' significa buscar información o mejorar; no encaja aquí.", "'Make up' significa inventar o maquillar; no se combina con 'cycling'.", "'Turn up' significa aparecer; no tiene sentido en la frase."], evidence: "are taking up cycling", skill: "phrasal verb" },
        { n: 2, options: ["spend", "pass", "take", "use"], correct: 0, explanations: ["Correcta: 'spend hours (in)' = pasar horas en un sitio.", "'Pass hours' no se usa con 'in traffic jams' de forma natural.", "'Take hours' necesita un sujeto como 'the journey', no una persona.", "'Use hours' no es una colocación."], evidence: "do not have to spend hours in traffic jams", skill: "collocation" },
        { n: 3, options: ["introduced", "presented", "launched", "produced"], correct: 0, explanations: ["Correcta: 'introduce special lanes' = poner en marcha carriles especiales.", "'Present' se usa para dar algo a alguien o mostrar un programa.", "'Launch' se usa con productos, campañas o cohetes, no con carriles.", "'Produce' significa fabricar; no encaja con 'lanes'."], evidence: "have introduced special lanes", skill: "collocation" },
        { n: 4, options: ["blame", "accuse", "charge", "criticise"], correct: 1, explanations: ["'Blame' va con 'for' (blame cyclists for causing), no con 'of'.", "Correcta: 'accuse somebody of doing' = acusar a alguien de hacer algo.", "'Charge' va con 'with' (charged with a crime).", "'Criticise' va con 'for' (criticise cyclists for causing)."], evidence: "accuse cyclists of causing delays", skill: "dependent preposition" },
        { n: 5, options: ["feel", "look", "seem", "sound"], correct: 0, explanations: ["Correcta: 'feel unsafe' = sentirse inseguro (sensación personal).", "'Look unsafe' describe el aspecto de algo, no cómo se siente una persona.", "'Seem unsafe' describe una impresión externa, no la propia sensación.", "'Sound unsafe' se refiere a cómo suena algo que se oye."], evidence: "they feel unsafe when a lorry", skill: "verb meaning" },
        { n: 6, options: ["spend", "pay", "cost", "charge"], correct: 0, explanations: ["Correcta: 'spend money on' = gastar dinero en.", "'Pay' se usa con 'for' (pay for), no con 'on'.", "'Cost' tiene como sujeto el precio de algo, no una persona.", "'Charge' significa cobrar, no gastar."], evidence: "to spend more money on safe routes", skill: "collocation" },
        { n: 7, options: ["paid", "given", "taken", "sent"], correct: 0, explanations: ["Correcta: 'be paid back' = recuperarse el gasto.", "'Given back' significa devolverse un objeto, no recuperar un coste.", "'Taken back' significa retirar o devolver algo; no encaja.", "'Sent back' se usa con objetos físicos que se devuelven."], evidence: "would soon be paid back through lower healthcare bills", skill: "phrasal verb" },
        { n: 8, options: ["sooner", "soon", "early", "quick"], correct: 0, explanations: ["Correcta: estructura 'the more…, the sooner…' (cuantos más…, antes…).", "'Soon' no es comparativo; la estructura exige comparativo.", "'Early' no es comparativo (haría falta 'earlier').", "'Quick' no es comparativo (haría falta 'quicker')."], evidence: "the sooner drivers will get used to sharing it", skill: "comparative structure" },
      ],
    },
  },
];

export const b2r2Seeds: Array<{ id: string; data: OpenClozeContent }> = [
  {
    id: "b2-r2-volunteering",
    data: {
      title: "Why volunteer?",
      topic: "Society",
      text: `Every year, millions of people give up some of their free time to work as volunteers. Some help {{1}} animal shelters, while others spend their weekends cleaning beaches or serving meals {{2}} people who have nowhere to live.

Volunteering is not only good for the community; it also benefits the volunteers {{3}}. Research shows that people who help others tend to feel happier and less stressed. {{4}} addition, it is a great way to meet new people and to learn skills that can be useful {{5}} a future job.

If you have never done anything like this before, there is no need to worry. Most organisations will be glad to find a task that suits you, {{6}} matter how little time you have. You can also try different activities until you find the {{7}} one for you. By the time you have finished {{8}} first day, you will probably want to go back.`,
      gaps: [
        { n: 1, answers: ["at", "in", "out"], explanation: "'Help at/in an animal shelter' = ayudar en un refugio. También vale 'help out in'.", evidence: "Some help at animal shelters", skill: "preposition" },
        { n: 2, answers: ["to"], explanation: "'Serve meals to people' = servir comidas a personas.", evidence: "serving meals to people who have nowhere to live", skill: "preposition" },
        { n: 3, answers: ["themselves"], explanation: "Pronombre reflexivo para reforzar el sujeto: 'the volunteers themselves'.", evidence: "benefits the volunteers themselves", skill: "reflexive pronoun" },
        { n: 4, answers: ["in"], explanation: "'In addition' = además; expresión fija.", evidence: "In addition, it is a great way", skill: "linking word" },
        { n: 5, answers: ["in", "for"], explanation: "'Useful in a future job' / 'useful for a future job'; ambas son correctas.", evidence: "useful in a future job", skill: "preposition" },
        { n: 6, answers: ["no"], explanation: "'No matter how little time you have' = por poco tiempo que tengas.", evidence: "no matter how little time you have", skill: "fixed phrase" },
        { n: 7, answers: ["right", "best", "perfect", "ideal"], explanation: "Adjetivo que califica 'one': 'the right one for you' (el adecuado para ti).", evidence: "find the right one for you", skill: "collocation" },
        { n: 8, answers: ["your"], explanation: "Posesivo antes de 'first day': 'your first day'.", evidence: "finished your first day", skill: "determiner" },
      ],
    },
  },
];

export const b2r3Seeds: Array<{ id: string; data: WordFormationContent }> = [
  {
    id: "b2-r3-music-festival",
    data: {
      title: "A weekend at the festival",
      topic: "Leisure",
      text: `Every summer, thousands of music lovers travel to a small field in the countryside for a three-day {{1}}. The line-up is always {{2}}, with famous bands playing next to groups nobody has ever heard of.

Many visitors say that the {{3}} of the other campers is what makes the festival special: everyone is welcoming and ready to share. Of course, the weather can be {{4}}, and when it rains the field turns into a sea of mud. Still, most people are {{5}} to put up with it for the sake of the music.

The organisers try to be {{6}} friendly by recycling as much rubbish as possible, and they offer {{7}} tickets to students. Their main {{8}} is to keep the festival small and welcoming, rather than to make a large profit.`,
      gaps: [
        { n: 1, base: "CELEBRATE", answers: ["celebration"], explanation: "Tras 'three-day' hace falta un sustantivo: celebrate → celebration.", evidence: "a three-day celebration", skill: "noun formation" },
        { n: 2, base: "VARY", answers: ["varied"], explanation: "Tras 'is always' va un adjetivo: vary → varied (variado).", evidence: "The line-up is always varied", skill: "adjective formation" },
        { n: 3, base: "FRIEND", answers: ["friendliness"], explanation: "Sustantivo abstracto tras 'the': friend → friendliness (la simpatía).", evidence: "the friendliness of the other campers is what makes the festival special", skill: "noun formation" },
        { n: 4, base: "PREDICT", answers: ["unpredictable"], explanation: "Adjetivo con negación: predict → unpredictable (impredecible).", evidence: "the weather can be unpredictable", skill: "negative prefix" },
        { n: 5, base: "WILL", answers: ["willing"], explanation: "'Be willing to' = estar dispuesto a; will → willing.", evidence: "most people are willing to put up with it", skill: "adjective formation" },
        { n: 6, base: "ENVIRONMENT", answers: ["environmentally"], explanation: "Adverbio que modifica a 'friendly': environment → environmentally.", evidence: "to be environmentally friendly", skill: "adverb formation" },
        { n: 7, base: "DISCOUNT", answers: ["discounted"], explanation: "Adjetivo/participio antes de 'tickets': discounted tickets (entradas con descuento).", evidence: "they offer discounted tickets to students", skill: "adjective formation" },
        { n: 8, base: "INTEND", answers: ["intention"], explanation: "Sustantivo tras 'main': intend → intention (su intención principal).", evidence: "Their main intention is to keep the festival small", skill: "noun formation" },
      ],
    },
  },
];

export const b2r4Seeds: Array<{ id: string; data: KwtContent }> = [
  {
    id: "b2-r4-set-a",
    data: {
      title: "Key word transformations · Set A (B2)",
      topic: "Mixed structures",
      items: [
        { n: 1, first: "I last saw my cousin three years ago.", keyword: "SEEN", before: "I haven't", after: "three years.", answers: ["seen my cousin for"], explanation: "'Present perfect + for + periodo' equivale a 'last saw … ago': 'I haven't seen my cousin for three years'. SEEN no se cambia.", skill: "tense" },
        { n: 2, first: "'Don't forget to lock the door,' Maria told me.", keyword: "REMINDED", before: "Maria", after: "the door.", answers: ["reminded me to lock"], explanation: "'Remind somebody to do something' = recordar a alguien que haga algo.", skill: "reported speech" },
        { n: 3, first: "It was such a boring film that we left early.", keyword: "SO", before: "The film", after: "we left early.", answers: ["was so boring that"], explanation: "'Such a + adjetivo + sustantivo' se convierte en 'so + adjetivo': 'was so boring that'.", skill: "structure transformation" },
        { n: 4, first: "If you don't leave now, you will miss the train.", keyword: "UNLESS", before: "You will miss the train", after: "now.", answers: ["unless you leave"], explanation: "'Unless' = 'if … not': 'unless you leave now'.", skill: "conditional" },
        { n: 5, first: "My brother is much taller than me.", keyword: "NEARLY", before: "I am", after: "my brother.", answers: ["not nearly as tall as"], explanation: "'Not nearly as … as' = ni mucho menos tan … como: expresa una gran diferencia, igual que 'much taller than'.", skill: "comparison" },
        { n: 6, first: "Someone has stolen my bike.", keyword: "BEEN", before: "My bike", after: "stolen.", answers: ["has been"], explanation: "Voz pasiva en presente perfecto: 'has been stolen'.", skill: "passive" },
      ],
    },
  },
];
