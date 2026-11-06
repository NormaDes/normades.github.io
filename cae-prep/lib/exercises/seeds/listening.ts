import type {
  ListeningExtractsContent,
  ListeningInterviewContent,
  ListeningMatchContent,
  ListeningSentenceContent,
  Segment,
} from "@/lib/schemas";

const F = (speaker: string, text: string, pauseBefore?: number): Segment => ({ speaker, gender: "f", text, pauseBefore });
const M = (speaker: string, text: string, pauseBefore?: number): Segment => ({ speaker, gender: "m", text, pauseBefore });

export const l1Seeds: Array<{ id: string; data: ListeningExtractsContent }> = [
  {
    id: "seed-l1-office-run-slides",
    data: {
      title: "Three short extracts",
      topic: "Work, sport and study",
      extracts: [
        {
          context: "You hear two colleagues talking about a new open-plan office.",
          segments: [
            F("Woman", "So, what do you make of the new layout? I've only had a week of it."),
            M("Man", "Honestly? I thought I'd hate it, but the noise isn't as bad as I expected. The real problem is that I can't have a private conversation without everyone listening in."),
            F("Woman", "That's what bothers me, too. I booked one of the meeting pods yesterday to phone a client, and apparently you have to reserve them a day in advance."),
            M("Man", "Which is useless when something comes up unexpectedly. Still, I do like being next to the marketing team. Ideas just seem to bounce around more."),
            F("Woman", "I suppose that's what management were hoping for. Though I notice the directors have kept their own offices."),
            M("Man", "Well, quite. Perhaps we should mention that at Thursday's meeting."),
          ],
          questions: [
            {
              n: 1,
              stem: "What does the man say about the new office?",
              options: ["He has been pleasantly surprised by the noise level.", "He finds it hard to concentrate.", "He misses working with his old team."],
              correct: 0,
              explanations: [
                "Correcta: dice que el ruido no es tan malo como esperaba.",
                "No menciona problemas de concentración; su queja es la falta de privacidad.",
                "Al contrario: le gusta estar junto al equipo de marketing.",
              ],
              evidence: "the noise isn't as bad as I expected",
              skill: "detail",
            },
            {
              n: 2,
              stem: "What problem does the woman mention about the meeting pods?",
              options: ["They are too noisy.", "They have to be booked too far ahead.", "They are too small for client calls."],
              correct: 1,
              explanations: [
                "No se habla del ruido de las cabinas.",
                "Correcta: hay que reservarlas con un día de antelación, lo que no sirve para imprevistos.",
                "No se menciona su tamaño.",
              ],
              evidence: "you have to reserve them a day in advance",
              skill: "detail",
            },
          ],
        },
        {
          context: "You hear a woman talking about taking up long-distance running.",
          segments: [
            F(
              "Woman",
              "I never imagined I'd run a marathon. I started three years ago after a friend dared me to enter a ten-kilometre race, and I only agreed because I assumed I'd be too slow to finish. As it happened, I crossed the line feeling oddly elated, and I signed up for a half marathon within the week. What surprised me most was how much of it is mental. My legs were rarely the problem; it was the voice in my head saying I should stop. I've learnt to ignore it by breaking the distance into small chunks, thinking only about reaching the next lamp-post. People say running is lonely, but my club has become a second family, which is the real reason I keep going.",
            ),
          ],
          questions: [
            {
              n: 3,
              stem: "Why did she enter her first race?",
              options: ["She wanted to improve her fitness.", "A friend challenged her to do it.", "She was confident she would do well."],
              correct: 1,
              explanations: [
                "No menciona querer mejorar su forma física.",
                "Correcta: 'a friend dared me'.",
                "Al contrario: pensaba que sería demasiado lenta para terminar.",
              ],
              evidence: "a friend dared me to enter a ten-kilometre race",
              skill: "detail",
            },
            {
              n: 4,
              stem: "What does she find most difficult about long-distance running?",
              options: ["The physical exhaustion.", "Staying motivated when training alone.", "Controlling negative thoughts."],
              correct: 2,
              explanations: [
                "Dice que las piernas rara vez eran el problema.",
                "Dice que correr no es solitario porque tiene su club.",
                "Correcta: lo más sorprendente es lo mental, la 'voz en mi cabeza' que le dice que pare.",
              ],
              evidence: "it was the voice in my head saying I should stop",
              skill: "inference",
            },
          ],
        },
        {
          context: "You hear two students discussing a presentation they have to give.",
          segments: [
            M("Man", "I've been through your slides, and the content is really strong. My worry is that there's just too much text on each one."),
            F("Woman", "I know. I keep telling myself to cut it down, but I'm afraid of leaving something out that the tutor expects."),
            M("Man", "She's said before that she'd rather see three clear points than ten crowded ones. And if you read out the slide, the audience stops listening."),
            F("Woman", "That's a good point. What about the graph on slide six? I wasn't sure about including it."),
            M("Man", "Definitely keep it. It's the one thing that makes your argument look convincing. I'd just make the labels bigger, because nobody at the back will be able to read them."),
            F("Woman", "OK. I'll rework it tonight and send it back to you tomorrow."),
          ],
          questions: [
            {
              n: 5,
              stem: "What is the man's main criticism of the slides?",
              options: ["They contain too much writing.", "They are poorly organised.", "They don't match the tutor's expectations."],
              correct: 0,
              explanations: [
                "Correcta: 'there's just too much text on each one'.",
                "Dice que el contenido es muy bueno; no critica la organización.",
                "Dice que la tutora prefiere pocos puntos claros, pero no que no cumplan sus expectativas por el contenido.",
              ],
              evidence: "there's just too much text on each one",
              skill: "attitude",
            },
            {
              n: 6,
              stem: "What does the man advise about the graph?",
              options: ["Replace it with a table.", "Remove it to save time.", "Make it easier to read."],
              correct: 2,
              explanations: [
                "No propone sustituirlo por una tabla.",
                "Dice lo contrario: 'Definitely keep it'.",
                "Correcta: aconseja hacer las etiquetas más grandes.",
              ],
              evidence: "I'd just make the labels bigger",
              skill: "detail",
            },
          ],
        },
      ],
    },
  },
];

export const l2Seeds: Array<{ id: string; data: ListeningSentenceContent }> = [
  {
    id: "seed-l2-urban-bees",
    data: {
      title: "Urban beekeeping",
      topic: "Hobbies and nature",
      intro: "You will hear a woman giving a talk about keeping bees in cities. For questions 1–8, complete the sentences with a word or short phrase.",
      segments: [
        F(
          "Hannah",
          "Good evening, everyone. I'm delighted to be talking tonight about urban beekeeping, which, believe it or not, is one of the fastest-growing hobbies in our cities. I started with a single hive on the roof of my apartment block five years ago. At first my neighbours were worried, but I reassured them that honeybees rarely sting unless they feel threatened, and now several of them help me at weekends.",
        ),
        F(
          "Hannah",
          "One surprise for newcomers is that city bees often do better than their country cousins. In the countryside, large fields of a single crop mean that bees have plenty of food for a few weeks and very little for the rest of the year. In a city, the variety of gardens, parks and balconies provides flowers from early spring until late autumn. The honey, as a result, has a more complex flavour than most people expect.",
          900,
        ),
        F(
          "Hannah",
          "If you are thinking of starting, my first piece of advice is to join a local association. Most offer a beginners' course, and some will lend you equipment for the first season, which is a big saving because a basic hive can cost over two hundred pounds. You will also need a protective suit, but I would suggest buying gloves last, because many experienced keepers prefer to work without them once they feel confident.",
          900,
        ),
        F(
          "Hannah",
          "Finally, remember that bees need water, especially in summer. A shallow dish with pebbles in it is ideal, as the bees can land on the stones without drowning. Do that, and your colony will reward you with around twenty kilograms of honey in a good year.",
          900,
        ),
      ],
      sentences: [
        { n: 1, before: "The speaker's first hive was placed on the", after: "of her apartment block.", answers: ["roof"], explanation: "Dice que empezó con una colmena 'on the roof of my apartment block'.", evidence: "a single hive on the roof of my apartment block", skill: "detail" },
        { n: 2, before: "She calmed her neighbours by explaining that honeybees seldom sting unless they feel", after: ".", answers: ["threatened"], explanation: "'rarely sting unless they feel threatened' (parafraseado con 'seldom').", evidence: "honeybees rarely sting unless they feel threatened", skill: "paraphrase" },
        { n: 3, before: "In the countryside, large fields of a single", after: "limit the bees' food supply.", answers: ["crop"], explanation: "Habla de 'large fields of a single crop'.", evidence: "large fields of a single crop", skill: "detail" },
        { n: 4, before: "City gardens, parks and balconies provide flowers from early spring until late", after: ".", answers: ["autumn"], explanation: "'from early spring until late autumn'.", evidence: "from early spring until late autumn", skill: "detail" },
        { n: 5, before: "The honey from city hives has a more", after: "flavour than people expect.", answers: ["complex"], explanation: "'has a more complex flavour than most people expect'.", evidence: "has a more complex flavour than most people expect", skill: "detail" },
        { n: 6, before: "Some associations will lend beginners", after: "for the first season.", answers: ["equipment"], explanation: "'some will lend you equipment for the first season'.", evidence: "some will lend you equipment for the first season", skill: "detail" },
        { n: 7, before: "The speaker advises buying", after: "last.", answers: ["gloves"], explanation: "'I would suggest buying gloves last'.", evidence: "I would suggest buying gloves last", skill: "detail" },
        { n: 8, before: "To stop bees drowning, a dish of water should contain", after: ".", answers: ["pebbles", "stones"], explanation: "'A shallow dish with pebbles in it … land on the stones'. Valen 'pebbles' y 'stones'.", evidence: "A shallow dish with pebbles in it is ideal", skill: "detail" },
      ],
    },
  },
];

export const l3Seeds: Array<{ id: string; data: ListeningInterviewContent }> = [
  {
    id: "seed-l3-wildlife-film",
    data: {
      title: "Filming wildlife",
      topic: "Documentary making",
      intro: "You will hear an interview with a documentary film-maker called Clara Whitfield. For questions 1–6, choose the answer (A, B, C or D) which fits best according to what you hear.",
      segments: [
        M("Interviewer", "Today I'm joined by Clara Whitfield, whose documentary about Arctic foxes has won several awards. Clara, welcome. Most people would assume the hardest part of making a wildlife film is the cold."),
        F("Clara", "That's what I assumed too, before my first trip. In fact, the cold is manageable if you dress properly. The real challenge is waiting. For the fox film, my team and I spent eleven weeks in a hide, and for the first nine we barely got any usable footage. You have to accept that nature doesn't perform on command."),
        M("Interviewer", "Did you ever consider giving up?"),
        F("Clara", "Once, around week six. The weather had been dreadful, and one of the cameras froze. But my producer reminded me that the money had already been spent, and strangely, that was what kept me going. Looking back, I'm glad she was so blunt."),
        M("Interviewer", "There's often criticism that film-makers interfere with the animals they film. How do you respond to that?"),
        F("Clara", "It's a fair question, and I think it deserves a careful answer. We have strict rules: we never feed the animals, and we keep our distance, even if that means a less dramatic shot. Some of my colleagues disagree, and argue that a little intervention can save a species. I understand the argument, but I believe our job is to observe, not to manage."),
        M("Interviewer", "Your film has been praised for its sound as much as its images."),
        F("Clara", "Thank you. That's down to our sound recordist, Tom, who spent days lying in the snow with a microphone the size of a rolled-up newspaper. Audiences don't consciously notice good sound, but they certainly feel it, and I think it's what makes the foxes seem so close."),
        M("Interviewer", "And what's next?"),
        F("Clara", "I'm heading to the Scottish Highlands to film red deer. It will be a very different challenge, because deer are skittish and the landscape is open, so there's nowhere to hide. I'm quite nervous, to be honest, but that's probably a healthy sign."),
      ],
      questions: [
        {
          n: 1,
          stem: "What did Clara discover about filming in the Arctic?",
          options: ["The cold was the least of her difficulties.", "The cold was worse than she had imagined.", "Suitable clothing was hard to find.", "Her team coped badly with the cold."],
          correct: 0,
          explanations: [
            "Correcta: el frío es 'manejable'; el verdadero reto es esperar.",
            "Dice lo contrario: el frío se maneja si te vistes bien.",
            "No habla de dificultades para encontrar ropa.",
            "No dice que el equipo lo llevara mal.",
          ],
          evidence: "the cold is manageable if you dress properly",
          skill: "detail",
        },
        {
          n: 2,
          stem: "According to Clara, what was the main difficulty during the filming?",
          options: ["Dangerous travelling conditions.", "Long periods without good footage.", "Disagreements within the team.", "A lack of suitable hiding places."],
          correct: 1,
          explanations: [
            "No se mencionan viajes peligrosos.",
            "Correcta: en las primeras nueve semanas apenas consiguieron imágenes útiles.",
            "No habla de desacuerdos en el equipo.",
            "Habla de pasar semanas en un refugio, pero no de que faltaran.",
          ],
          evidence: "for the first nine we barely got any usable footage",
          skill: "detail",
        },
        {
          n: 3,
          stem: "Why did Clara keep going when she wanted to give up?",
          options: ["Her producer promised more funding.", "She did not want to waste the money already spent.", "The weather improved.", "Her colleagues encouraged her."],
          correct: 1,
          explanations: [
            "La productora no prometió más dinero: le recordó el que ya se había gastado.",
            "Correcta: saber que el dinero ya estaba gastado fue lo que la mantuvo.",
            "El tiempo era terrible en ese momento; no dice que mejorara.",
            "Quien la anima es la productora, y con un argumento económico, no sus colegas.",
          ],
          evidence: "the money had already been spent, and strangely, that was what kept me going",
          skill: "inference",
        },
        {
          n: 4,
          stem: "How does Clara feel about interfering with wild animals?",
          options: ["She accepts that it is sometimes justified.", "She believes it should be strictly avoided.", "She thinks opinions are too divided to decide.", "She admits that her team has broken the rules."],
          correct: 1,
          explanations: [
            "Entiende el argumento de sus colegas, pero no lo comparte.",
            "Correcta: su trabajo es 'observar, no gestionar'.",
            "Reconoce el desacuerdo, pero tiene una postura clara.",
            "Dice que tienen normas estrictas y no menciona haberlas roto.",
          ],
          evidence: "I believe our job is to observe, not to manage",
          skill: "attitude",
        },
        {
          n: 5,
          stem: "Why does Clara mention Tom?",
          options: ["To explain why the film took so long.", "To show how important sound is to the audience.", "To criticise people who ignore sound.", "To describe the hardships of the work."],
          correct: 1,
          explanations: [
            "No relaciona a Tom con la duración del rodaje.",
            "Correcta: el público siente el buen sonido y eso acerca a los zorros.",
            "No critica al público; solo dice que no lo notan conscientemente.",
            "Menciona que estuvo días tumbado en la nieve, pero ese no es el propósito.",
          ],
          evidence: "Audiences don't consciously notice good sound, but they certainly feel it",
          skill: "purpose",
        },
        {
          n: 6,
          stem: "How does Clara feel about her next project?",
          options: ["Confident because of her experience.", "Worried that the deer will be hard to find.", "Slightly anxious but positive about it.", "Disappointed to be leaving the Arctic."],
          correct: 2,
          explanations: [
            "Dice estar nerviosa, no segura.",
            "Su preocupación es que no hay dónde esconderse, no encontrar a los ciervos.",
            "Correcta: está nerviosa, pero lo considera 'una buena señal'.",
            "No expresa tristeza por dejar el Ártico.",
          ],
          evidence: "I'm quite nervous, to be honest, but that's probably a healthy sign",
          skill: "attitude",
        },
      ],
    },
  },
];

export const l4Seeds: Array<{ id: string; data: ListeningMatchContent }> = [
  {
    id: "seed-l4-moving-city",
    data: {
      title: "Moving to a new place",
      topic: "Life changes",
      speakers: [
        {
          segments: [
            F("Speaker 1", "When the firm offered me a senior post in Manchester, I didn't hesitate; the salary was nearly double what I earned at home. What I hadn't factored in was rent. I viewed fourteen flats before I found one I could afford, and even that was a forty-minute walk from the station."),
          ],
        },
        {
          segments: [
            M("Speaker 2", "My mother had been ill for some time, so when a vacancy came up in my home town I moved back to be nearer to her. I'd forgotten how grey and wet it is up here after ten years in Spain. I still wake up some mornings and wonder why I swapped the sunshine for this. Still, I wouldn't change it."),
          ],
        },
        {
          segments: [
            F("Speaker 3", "I moved because my husband was transferred to Singapore, and I gave up my own career to go with him. At first I knew absolutely nobody. He was out at work all day, and I spent weeks wandering round shopping centres feeling like a ghost. Joining a choir changed everything."),
          ],
        },
        {
          segments: [
            M("Speaker 4", "After years in London, I'd had enough of the crowds and the noise. I bought a cottage in the Welsh hills, expecting peace, and I got it. What nobody warned me about was the lack of any public transport. Without a car, I'm stuck, and the nearest supermarket is a twelve-mile drive."),
          ],
        },
        {
          segments: [
            F("Speaker 5", "I'd always wanted to live abroad, so I applied for a teaching job in Glasgow, mostly for the adventure. I was confident my English was excellent, but for the first month I couldn't understand a word anyone said! People spoke so quickly and with such a strong accent. Now I've picked up quite a bit of the local slang myself."),
          ],
        },
      ],
      tasks: [
        {
          stem: "For questions 1–5, choose from the list (A–H) the reason each speaker gives for moving.",
          options: ["to be nearer a relative", "to accept a better-paid job", "to begin a course of study", "to reduce living costs", "to enjoy a quieter way of life", "to accompany a partner", "to experience something new", "to escape a difficult situation"],
        },
        {
          stem: "For questions 6–10, choose from the list (A–H) the main difficulty each speaker faced after moving.",
          options: ["making friends", "understanding local speech", "coping with the weather", "finding a place to live", "missing former colleagues", "getting around", "finding employment", "adjusting to the pace of life"],
        },
      ],
      questions: [
        { n: 1, task: 1, speaker: 1, correct: 1, explanation: "Aceptó un puesto con casi el doble de salario.", evidence: "the salary was nearly double what I earned at home", skill: "gist" },
        { n: 2, task: 1, speaker: 2, correct: 0, explanation: "Volvió para estar cerca de su madre, que estaba enferma.", evidence: "I moved back to be nearer to her", skill: "gist" },
        { n: 3, task: 1, speaker: 3, correct: 5, explanation: "Se mudó porque trasladaron a su marido a Singapur.", evidence: "my husband was transferred to Singapore, and I gave up my own career to go with him", skill: "gist" },
        { n: 4, task: 1, speaker: 4, correct: 4, explanation: "Buscaba paz tras años de multitudes y ruido.", evidence: "I'd had enough of the crowds and the noise", skill: "gist" },
        { n: 5, task: 1, speaker: 5, correct: 6, explanation: "Lo hizo 'mostly for the adventure'.", evidence: "mostly for the adventure", skill: "gist" },
        { n: 6, task: 2, speaker: 1, correct: 3, explanation: "Visitó catorce pisos hasta encontrar uno asequible.", evidence: "I viewed fourteen flats before I found one I could afford", skill: "detail" },
        { n: 7, task: 2, speaker: 2, correct: 2, explanation: "Echa de menos el sol; allí es gris y lluvioso.", evidence: "how grey and wet it is up here", skill: "detail" },
        { n: 8, task: 2, speaker: 3, correct: 0, explanation: "No conocía a nadie y se sentía como un fantasma.", evidence: "At first I knew absolutely nobody", skill: "detail" },
        { n: 9, task: 2, speaker: 4, correct: 5, explanation: "No hay transporte público y sin coche está aislado.", evidence: "the lack of any public transport", skill: "detail" },
        { n: 10, task: 2, speaker: 5, correct: 1, explanation: "El primer mes no entendía a la gente por el acento y la velocidad.", evidence: "I couldn't understand a word anyone said", skill: "detail" },
      ],
    },
  },
];
