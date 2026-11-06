import type { CrossTextContent } from "@/lib/schemas";

export const r6Seeds: Array<{ id: string; data: CrossTextContent }> = [
  {
    id: "seed-r6-online-learning",
    data: {
      title: "Learning on a screen",
      topic: "Education",
      intro: "Four writers give their views on online learning in schools and universities.",
      texts: [
        {
          label: "A",
          author: "Nina Ortega, secondary school teacher",
          text: "I have been teaching for twenty years and, to my surprise, I have become a supporter of blended learning. Some of my quietest pupils bloom when they can contribute through an online forum rather than in front of thirty classmates, and for those who struggle to keep up in a busy classroom, being able to pause and replay a lesson is a real gift. Self-discipline, which people always raise as a worry, is a skill like any other: we can teach it, step by step. What I will never accept is that technology can replace a good teacher. A screen can deliver content; only a person can notice who has stopped trying, and why.",
        },
        {
          label: "B",
          author: "Dr Paul Whitcombe, education researcher",
          text: "The enthusiasm for online learning runs well ahead of the evidence. Studies of the past decade show mixed results at best, and the clearest pattern is that the pupils who benefit most are those who were already doing well. Learning at a distance demands a level of self-discipline that many young people simply do not yet possess, and when it is missing, the gap between them and their more organised classmates widens quickly. Those who defend digital schooling often point to flexibility and cost, and both matter, but neither is a measure of learning. Before we reorganise whole education systems, we need far more rigorous research than we have at present.",
        },
        {
          label: "C",
          author: "Samira Khan, parent",
          text: "My son found secondary school overwhelming. The noise, the crowds and the constant pressure to perform left him exhausted and anxious, and his marks suffered. Since moving to an online programme two years ago he has changed completely: he works steadily, asks questions he would never have dared to ask in class, and has taught himself to plan his own week, which I could not have imagined before. I do worry about how many hours he spends in front of a screen, and we have had to agree strict limits on evenings. But I would not go back. For a child like him, learning from home has made learning possible again.",
        },
        {
          label: "D",
          author: "Leo Brandt, university student",
          text: "I did most of my degree online, and I can say it taught me more about working independently than any seminar could have done. Nobody chases you; if you do not organise yourself, you fall behind, and learning that early is invaluable. People who worry that students spend too long in front of screens seem to forget that most of us would be on them anyway. What I did miss were the lecturers who made a subject come alive. A recorded lecture is only as good as the person giving it, and the best ones I attended, online or not, made me want to read further. Technology is the vehicle, but it is the teacher who decides where you end up.",
        },
      ],
      questions: [
        {
          n: 1,
          stem: "Which writer takes a different view from the others about how much online learning demands of pupils' self-discipline?",
          correct: 1,
          explanation: "B es el único que lo ve como un obstáculo para muchos jóvenes; A, C y D consideran que es una habilidad que se puede enseñar o que se desarrolla.",
          evidence: "Learning at a distance demands a level of self-discipline that many young people simply do not yet possess",
          skill: "contrast of opinions",
        },
        {
          n: 2,
          stem: "Which writer shares Writer A's opinion about the importance of the teacher?",
          correct: 3,
          explanation: "D sostiene, como A, que la tecnología no sustituye a un buen profesor. B y C no tratan el papel del profesorado.",
          evidence: "Technology is the vehicle, but it is the teacher who decides where you end up.",
          skill: "shared opinion",
        },
        {
          n: 3,
          stem: "Which writer expresses a concern about screen use that Writer D dismisses?",
          correct: 2,
          explanation: "C se preocupa por las horas de pantalla de su hijo; D considera que esa preocupación olvida que los estudiantes estarían frente a pantallas de todos modos.",
          evidence: "I do worry about how many hours he spends in front of a screen",
          skill: "contrast of opinions",
        },
        {
          n: 4,
          stem: "Which writer shares Writer C's view that online learning can help pupils who find an ordinary classroom difficult?",
          correct: 0,
          explanation: "A cree que los alumnos más callados o con dificultades para seguir el ritmo se benefician. B sostiene lo contrario y D no habla de alumnos con dificultades.",
          evidence: "for those who struggle to keep up in a busy classroom, being able to pause and replay a lesson is a real gift",
          skill: "shared opinion",
        },
      ],
    },
  },
];
