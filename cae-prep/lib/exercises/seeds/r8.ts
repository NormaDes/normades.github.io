import type { MultiMatchContent } from "@/lib/schemas";

export const r8Seeds: Array<{ id: string; data: MultiMatchContent }> = [
  {
    id: "seed-r8-career-changers",
    data: {
      title: "Starting again",
      topic: "Work",
      intro: "Five people describe how they changed careers.",
      sections: [
        {
          label: "A",
          heading: "Maya, former lawyer, now a baker",
          text: "I never planned to bake for a living. A friend asked me to make her wedding cake as a favour, and I remember looking up at the clock at midnight and realising I had been decorating for six hours without once checking my phone. I hadn't felt that absorbed in anything for years. Within a year I had left the firm and opened a small bakery. I had pictured long, creative afternoons, and in fact the job is mostly early starts: I am in the kitchen at four every morning, and some days I'm so tired by lunchtime that I can barely think. I still wouldn't change it.",
        },
        {
          label: "B",
          heading: "Kofi, former soldier, now a nurse",
          text: "When I left the army I assumed my fitness would make nursing easy. I was wrong. Twelve-hour shifts on a hospital ward, on your feet almost all the time, wore me out in a way that training exercises never had. What got me through was Sister Okonkwo, an experienced nurse on my first ward, who took me under her wing and taught me everything from how to talk to frightened patients to how to chart medication. Without her, I doubt I would have lasted a month. Now I'm the one who looks out for the new recruits.",
        },
        {
          label: "C",
          heading: "Elena, former journalist, now a primary teacher",
          text: "I was convinced my mother would think I was throwing away a good career. Instead, she phoned the next day and offered to lend me her savings to pay for the training course. I wish I'd been as confident as she was. On my first morning at the school, I sat in the car park for ten minutes, wondering whether I had made a terrible mistake. Then a six-year-old ran up and asked whether I was the new teacher, and I decided I could at least stay until the end of the day. That was seven years ago.",
        },
        {
          label: "D",
          heading: "Ben, former banker, now a farmer",
          text: "My income is about a third of what it was, and I have never been happier. I took over a small dairy farm from an uncle, and although the figures on paper look alarming, there is far less I feel I need to buy. The real change is at home. In the bank I left before the children woke and returned after they were asleep. Now I am there at breakfast and at bedtime, and my youngest has started to follow me around the yard asking questions about everything. No bonus could compete with that.",
        },
        {
          label: "E",
          heading: "Priya, former engineer, now an illustrator",
          text: "Everyone assumes that engineering and drawing have nothing in common, but my training turned out to be a hidden advantage. I understand how things are put together, so my illustrations of buildings and machines look believable in a way many artists' work doesn't, and publishers have noticed. I haven't cut the connection completely: one day a week I still work as a consultant for my old company, and I intend to carry on doing so. It keeps me in touch with people I respect and, frankly, it pays for the paper and the pens.",
        },
      ],
      questions: [
        { n: 1, stem: "mentions a drawback of the new job that was not anticipated", correct: 0, explanation: "A esperaba tardes creativas y no madrugones: 'I had pictured long, creative afternoons, and in fact the job is mostly early starts'.", evidence: "I had pictured long, creative afternoons, and in fact the job is mostly early starts", skill: "paraphrase" },
        { n: 2, stem: "was surprised by the reaction of a relative", correct: 2, explanation: "C esperaba que su madre desaprobara y esta le ofreció sus ahorros.", evidence: "she phoned the next day and offered to lend me her savings", skill: "paraphrase" },
        { n: 3, stem: "gives credit to an experienced colleague for making the change possible", correct: 1, explanation: "B dice que sin Sister Okonkwo, que lo tomó bajo su protección, no habría durado un mes.", evidence: "Without her, I doubt I would have lasted a month.", skill: "paraphrase" },
        { n: 4, stem: "accepts a much lower income", correct: 3, explanation: "D gana un tercio de antes y es más feliz.", evidence: "My income is about a third of what it was, and I have never been happier.", skill: "paraphrase" },
        { n: 5, stem: "found that previous skills were useful in the new profession", correct: 4, explanation: "E dice que su formación de ingeniera es una ventaja oculta para sus ilustraciones.", evidence: "my training turned out to be a hidden advantage", skill: "paraphrase" },
        { n: 6, stem: "had serious doubts on the first day of the new job", correct: 2, explanation: "C se sentó en el aparcamiento preguntándose si había cometido un error terrible.", evidence: "wondering whether I had made a terrible mistake", skill: "paraphrase" },
        { n: 7, stem: "found the physical demands of the new job greater than expected", correct: 1, explanation: "B creía que su forma física le haría fácil la enfermería, pero los turnos de doce horas le agotaron.", evidence: "wore me out in a way that training exercises never had", skill: "paraphrase" },
        { n: 8, stem: "describes how a chance event led to the decision to change careers", correct: 0, explanation: "A empezó al hacer la tarta de boda de una amiga y descubrir lo absorta que estaba.", evidence: "A friend asked me to make her wedding cake as a favour", skill: "inference" },
        { n: 9, stem: "values the way the new job has improved family life", correct: 3, explanation: "D está en casa en el desayuno y a la hora de acostar a los niños.", evidence: "Now I am there at breakfast and at bedtime", skill: "paraphrase" },
        { n: 10, stem: "has kept a link with the previous profession", correct: 4, explanation: "E sigue trabajando un día a la semana como consultora para su antigua empresa.", evidence: "one day a week I still work as a consultant for my old company", skill: "paraphrase" },
      ],
    },
  },
];
