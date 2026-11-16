import type { EssayContent, GappedTextContent, McTextContent, MultiMatchContent, WritingChoiceContent } from "@/lib/schemas";

/** B2 First · Reading and Use of English, partes 5-7, y Writing (textos originales de práctica) */

export const b2r5Seeds: Array<{ id: string; data: McTextContent }> = [
  {
    id: "b2-r5-street-musician",
    data: {
      title: "The street musician",
      topic: "People",
      text: `When I first arrived in the city, I had no job, very little money and only one thing of value: a battered old violin that had belonged to my grandfather. I played it on the street corner near the station, not because I enjoyed performing in public, but because I needed to pay for my room. At first, people hurried past without looking at me. I remember feeling invisible, as though the music were being played for nobody at all. The first weeks were the hardest. My fingers were sore, I was often hungry, and I sometimes wondered whether I had made a terrible mistake by leaving home.

Things began to change one rainy morning. A woman stopped, listened to the whole piece and put a five-pound note in my case. She told me that the tune reminded her of the village where she grew up. It was a small moment, but it made me realise that I was not just making noise; I was giving something to the people who passed by. After that, I started to choose my music more carefully, playing slow, familiar melodies in the morning, when commuters seemed tired, and livelier tunes in the afternoon.

Over the following months, I became a familiar face. A baker from the café opposite would bring me a hot drink on cold days, and a group of schoolchildren stopped every Friday to ask for their favourite song. I never felt that I was famous, but I did feel that I belonged. When a local radio presenter offered to record me, I hesitated. The street had become my stage, and I was afraid that a studio would take away what made my playing special.

Not every day was easy, of course. In December, the council introduced a rule that street performers needed a licence, and for a few weeks I was afraid that I would have to stop. The form was long and confusing, and I had to queue for two hours to hand it in. A police officer who had listened to me many times told me not to worry, and eventually the licence arrived in the post. It cost less than I had feared, and it gave me an unexpected sense of pride, as if I had become a real professional.

I am often asked what advice I would give to someone who wants to play in public. My answer is always the same: be patient and be yourself. Do not expect to be noticed on the first day, and do not copy what other people do just because it seems to work for them. Audiences can tell when a musician is pretending, and they usually respond to honesty. I also tell beginners to look at people's faces, because a smile from a stranger is often worth more than the coins in the case.

In the end, I accepted, and the recording was played on the radio a few weeks later. People who had never spoken to me came up to say they had recognised my name. Yet I still go back to my corner whenever I can. Money was the reason I started, but it is not the reason I stay: it is the unexpected conversations, and the feeling that, for a few minutes, a stranger's day might be a little better because of what I have played.`,
      questions: [
        { n: 1, stem: "Why did the writer start playing in the street?", options: ["He wanted to become famous.", "He needed money to live.", "He enjoyed performing in public.", "His grandfather had asked him to."], correct: 1, explanations: ["Nunca dice que quisiera ser famoso; al contrario, no disfrutaba actuando.", "Correcta: tocaba 'because I needed to pay for my room'.", "El texto dice lo contrario: no disfrutaba actuando en público.", "El violín era de su abuelo, pero no se menciona ninguna petición."], evidence: "not because I enjoyed performing in public, but because I needed to pay for my room", skill: "detail" },
        { n: 2, stem: "What did the writer realise after the woman's visit?", options: ["His music could have a positive effect on people.", "He should play in a different place.", "He needed to practise more.", "People did not like his choice of songs."], correct: 0, explanations: ["Correcta: se dio cuenta de que 'was giving something to the people who passed by'.", "No piensa en cambiar de lugar.", "No habla de practicar más.", "La mujer, al contrario, reconoció una melodía que le gustaba."], evidence: "I was giving something to the people who passed by", skill: "inference" },
        { n: 3, stem: "Why did he play slow music in the morning?", options: ["He was tired himself.", "The weather was usually bad.", "Commuters seemed tired.", "Children asked for it."], correct: 2, explanations: ["No dice que él estuviera cansado.", "La lluvia solo se menciona un día concreto.", "Correcta: tocaba lento 'when commuters seemed tired'.", "Los niños pedían canciones los viernes, no por la mañana."], evidence: "playing slow, familiar melodies in the morning, when commuters seemed tired", skill: "detail" },
        { n: 4, stem: "How did the writer feel about being a familiar face?", options: ["He worried people would copy him.", "He felt he was part of the community.", "He expected to become famous.", "He found it embarrassing."], correct: 1, explanations: ["No hay ninguna mención a que lo copiaran.", "Correcta: 'I did feel that I belonged'.", "Dice que nunca se sintió famoso.", "No lo considera vergonzoso."], evidence: "I never felt that I was famous, but I did feel that I belonged", skill: "attitude" },
        { n: 5, stem: "Why did he hesitate when the radio presenter made an offer?", options: ["He did not trust the presenter.", "He thought a studio would change his music.", "He had no time to record.", "He was not good enough."], correct: 1, explanations: ["No desconfía del presentador.", "Correcta: temía que un estudio 'would take away what made my playing special'.", "No habla de falta de tiempo.", "No expresa dudas sobre su nivel."], evidence: "I was afraid that a studio would take away what made my playing special", skill: "reason" },
        { n: 6, stem: "What is the writer's main reason for staying on the street now?", options: ["It pays more than the radio.", "He is afraid to leave.", "He values meeting people.", "He has promised the baker."], correct: 2, explanations: ["Dice que el dinero fue la razón de empezar, no de quedarse.", "No habla de miedo.", "Correcta: 'the unexpected conversations' y animar el día de un desconocido.", "El panadero solo le llevaba bebidas calientes."], evidence: "it is the unexpected conversations", skill: "main idea" },
      ],
    },
  },
];

export const b2r7Seeds: Array<{ id: string; data: GappedTextContent }> = [
  {
    id: "b2-r7-escape-room",
    data: {
      title: "The rise of the escape room",
      topic: "Leisure",
      text: `A few years ago, nobody had heard of escape rooms. Today, you can find one in almost every big city. The idea is simple: a group of friends is locked in a room for an hour and has to solve a series of puzzles in order to get out. {{1}}

The first escape rooms appeared in Japan in the mid-2000s, inspired by a type of computer game in which the player must find the way out of a locked space. {{2}} The games soon spread to Europe and America, where companies began to create more and more elaborate stories.

Part of the attraction is that the experience is completely different from watching television or going to the cinema. {{3}} Players have to talk, listen and share ideas, because nobody can solve every puzzle alone.

Many companies have now realised that escape rooms can also be used for training employees. {{4}} Managers say that they learn more about their colleagues in an hour of playing than in months of meetings.

Not everyone is enthusiastic, though. Some critics argue that the games are too expensive for what they offer. {{5}} In reply, the owners point out that creating a room takes months of work and a large amount of equipment.

Whatever the future holds, escape rooms show no sign of disappearing. {{6}} Designers are already planning rooms that use virtual reality, and some even offer games that can be played at home.`,
      paragraphs: [
        { letter: "A", text: "Instead of sitting still, the players are actively involved and have to cooperate with each other all the time." },
        { letter: "B", text: "Teams of workers are given a challenge and must communicate clearly in order to succeed." },
        { letter: "C", text: "Prices vary a lot, and a group of five can easily spend more than a hundred pounds on a single visit." },
        { letter: "D", text: "The popularity of these games has grown so fast that thousands of rooms now exist around the world." },
        { letter: "E", text: "Within a few years, the same idea had been turned into a real-life game, played in a building rather than on a screen." },
        { letter: "F", text: "Nobody knows exactly when the first dinosaur-themed park was opened in the United States." },
        { letter: "G", text: "What makes them special is the mixture of teamwork, imagination and the pressure of a ticking clock." },
      ],
      gaps: [
        { n: 1, correct: 6, explanation: "El párrafo G resume lo que hace especiales estas salas y enlaza con la descripción del juego anterior.", evidence: "has to solve a series of puzzles in order to get out", skill: "cohesion" },
        { n: 2, correct: 4, explanation: "E sigue a 'computer game … locked space' y explica cómo esa idea pasó a un juego real ('real-life game').", evidence: "in which the player must find the way out of a locked space", skill: "cohesion" },
        { n: 3, correct: 0, explanation: "A contrasta con 'watching television or going to the cinema' ('Instead of sitting still') y precede a 'Players have to talk…'.", evidence: "completely different from watching television or going to the cinema", skill: "contrast" },
        { n: 4, correct: 1, explanation: "B desarrolla la idea de entrenar empleados; después se habla de lo que dicen los directivos.", evidence: "can also be used for training employees", skill: "cohesion" },
        { n: 5, correct: 2, explanation: "C da el argumento del precio ('too expensive'); la respuesta de los dueños viene después ('In reply').", evidence: "Some critics argue that the games are too expensive for what they offer", skill: "reference" },
        { n: 6, correct: 3, explanation: "D confirma que las salas no desaparecen ('show no sign of disappearing'); el siguiente párrafo habla de planes de futuro.", evidence: "escape rooms show no sign of disappearing", skill: "cohesion" },
      ],
    },
  },
];

export const b2r8Seeds: Array<{ id: string; data: MultiMatchContent }> = [
  {
    id: "b2-r8-first-jobs",
    data: {
      title: "My first job",
      topic: "Work",
      intro: "Five people talk about their first job. For questions 1–10, choose from the people (A–E). The people may be chosen more than once.",
      sections: [
        { label: "A", heading: "Ana, waitress", text: "My first job was in a café by the sea. I was only sixteen and terrified of dropping the trays, which I did on my second day! The owner, however, laughed it off and told me everyone makes mistakes. What I remember most is how quickly the time passed. We were always busy in the summer, and I made friends I still see today. The money wasn't great, but I learned how to stay calm under pressure, and that has been useful in every job since." },
        { label: "B", heading: "Ben, newspaper delivery", text: "I delivered newspapers before school for two years. Getting up at five o'clock was hard, especially in winter, and I often arrived at school half asleep. But I loved the feeling of being independent, and I saved enough to buy my first guitar. The customers were sometimes unfriendly, but a few of them left me biscuits at Christmas. Looking back, I think it taught me to be responsible, because people really depended on me." },
        { label: "C", heading: "Chloe, shop assistant", text: "I worked in a clothes shop on Saturdays. The manager was very strict, and we had to fold every item in exactly the same way. I found it boring at first, and I nearly gave up in the first month. Then they let me design the window display, and everything changed. I realised that I wanted to work in fashion, and now I do. Without that job, I would probably have chosen a very different career." },
        { label: "D", heading: "Dan, farm worker", text: "One summer I picked fruit on a farm. The work was physically exhausting, and my hands were covered in scratches by the end of the first week. We were paid according to how much we picked, so there was a lot of competition. I was slower than the others, which was frustrating. However, it made me appreciate how much effort goes into the food we eat, and I never waste anything now." },
        { label: "E", heading: "Eva, babysitter", text: "I started by looking after my neighbours' children in the evenings. At first, I thought it would be easy money, but the youngest boy refused to go to bed for weeks! I tried everything: stories, songs, even bribery. Finally, I discovered that he simply wanted attention. Since then, I have always been patient with people, and I now work as a primary school teacher." },
      ],
      questions: [
        { n: 1, stem: "dropped something on the second day", correct: 0, explanation: "Ana tiró las bandejas el segundo día.", evidence: "dropping the trays, which I did on my second day", skill: "detail" },
        { n: 2, stem: "had to get up very early", correct: 1, explanation: "Ben se levantaba a las cinco de la mañana.", evidence: "Getting up at five o'clock was hard", skill: "detail" },
        { n: 3, stem: "nearly left the job soon after starting", correct: 2, explanation: "Chloe casi lo deja en el primer mes.", evidence: "I nearly gave up in the first month", skill: "detail" },
        { n: 4, stem: "was disappointed by their own speed", correct: 3, explanation: "Dan era más lento que los demás y lo encontraba frustrante.", evidence: "I was slower than the others, which was frustrating", skill: "attitude" },
        { n: 5, stem: "was surprised at how difficult the job turned out to be", correct: 4, explanation: "Eva creyó que sería dinero fácil, pero fue difícil.", evidence: "I thought it would be easy money", skill: "attitude" },
        { n: 6, stem: "bought something with the money earned", correct: 1, explanation: "Ben ahorró para comprar su primera guitarra.", evidence: "I saved enough to buy my first guitar", skill: "detail" },
        { n: 7, stem: "says the job led to their present career", correct: 2, explanation: "Chloe trabaja ahora en moda gracias a ese empleo.", evidence: "I realised that I wanted to work in fashion, and now I do", skill: "inference" },
        { n: 8, stem: "learned to remain calm when there was a lot to do", correct: 0, explanation: "Ana aprendió a mantener la calma bajo presión.", evidence: "I learned how to stay calm under pressure", skill: "detail" },
        { n: 9, stem: "now never throws away food", correct: 3, explanation: "Dan dice que ya no desperdicia nada.", evidence: "I never waste anything now", skill: "detail" },
        { n: 10, stem: "learned to be patient", correct: 4, explanation: "Eva dice que desde entonces es paciente con la gente.", evidence: "I have always been patient with people", skill: "detail" },
      ],
    },
  },
];

export const b2w1Seeds: Array<{ id: string; data: EssayContent }> = [
  {
    id: "b2-w1-school-uniform",
    data: {
      title: "School uniforms",
      topic: "Education",
      question: "In your English class you have been talking about school uniforms. Now your teacher has asked you to write an essay.",
      points: ["Cost", "Comfort", "(your own idea)"],
    },
  },
  {
    id: "b2-w1-social-media",
    data: {
      title: "Social media and young people",
      topic: "Technology",
      question: "In your English class you have been talking about the time young people spend on social media. Now your teacher has asked you to write an essay.",
      points: ["Friendships", "Free time", "(your own idea)"],
    },
  },
];

export const b2w2Seeds: Array<{ id: string; data: WritingChoiceContent }> = [
  {
    id: "b2-w2-set-a",
    data: {
      title: "Writing Part 2 · Set A (B2)",
      topic: "Mixed",
      tasks: [
        { type: "email", situation: "You have received an email from your English-speaking friend Sam, who is planning to visit your town next month and asks you for advice.", requirements: ["suggest the best time of day to visit the main sights", "recommend a place to eat", "explain how Sam should get around"] },
        { type: "review", situation: "You see this notice in an English-language magazine: 'Reviews wanted: a film you have seen recently.' Write a review of a film for the magazine.", requirements: ["briefly describe the story", "say what you liked and disliked", "say who would enjoy the film"] },
        { type: "report", situation: "Your school is planning to organise a day trip. Your teacher has asked you to write a report about two places you could visit.", requirements: ["describe both places", "compare the advantages of each one", "recommend which one is better"] },
      ],
    },
  },
];
