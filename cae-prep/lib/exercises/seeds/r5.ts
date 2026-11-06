import type { McTextContent } from "@/lib/schemas";

export const r5Seeds: Array<{ id: string; data: McTextContent }> = [
  {
    id: "seed-r5-boredom",
    data: {
      title: "In praise of boredom",
      topic: "Psychology",
      text: `Last winter, when a power cut plunged our street into darkness for six hours, I did something I had not done in years: I sat in a chair and did nothing. No phone, no screen, no podcast. After twenty minutes of restless fidgeting, something shifted. My mind began to wander and, to my surprise, it wandered somewhere interesting. By the evening I had untangled a problem at work that had been nagging me for weeks.

That experience is not unusual, according to psychologists who study boredom. For a long time they treated it as a purely negative state, a kind of mental starvation to be avoided at all costs. More recent research, however, suggests that boredom may serve a useful purpose. When nothing demands our attention, the brain does not simply switch off; instead, it turns inwards, making connections between memories and ideas that would otherwise remain separate. One study found that people who had first spent a few minutes on a tedious task came up with more inventive uses for everyday objects than those who had gone straight to the test.

The trouble is that boredom has become almost impossible to experience. Every gap in the day, whether a queue, a bus journey or a commercial break, is now filled by the device in our pocket. Dr Helena Marsh, a cognitive scientist, argues that this constant stimulation comes at a price. "We are rarely alone with our thoughts any more," she says. "And a mind that is never allowed to wander loses the habit of doing so." She is careful, though, not to blame the technology itself. "The phone is simply very good at meeting a need we have always had: the need to escape discomfort. The problem is that we escape it before it has had a chance to teach us anything."

Not everyone is convinced. Critics point out that the research is still thin, and that many of the experiments were conducted in laboratories with small groups of students. It is a fair objection. Nor is it clear that the benefits of boredom apply equally to everyone: for people struggling with anxiety, being left alone with one's thoughts can be distressing rather than liberating. Marsh accepts this readily. "Nobody is suggesting that we should sit in silence for hours," she says. "The point is that we have swung too far in one direction."

Some schools have taken the message to heart. At a primary school in Leeds, pupils now spend ten minutes every afternoon with no task, no book and no instructions. The head teacher, Raj Patel, admits that the first weeks were difficult. "The children complained, they wriggled, they asked what they were supposed to be doing. I kept telling them that was the whole idea." Within a term, he says, teachers noticed a change: pupils were more willing to invent their own games at break time, and fewer of them reached for an adult as soon as they ran out of things to do.

As for me, I have not become a convert to idleness. I still check my phone more often than I would like to admit. But I have started to protect small pockets of emptiness: the walk to the station without headphones, the ten minutes before sleep with the light off. They feel awkward at first, a bit like a muscle that has not been used. Then, gradually, the awkwardness gives way to something closer to curiosity, and I find myself looking forward to the moment when my mind begins, once again, to drift.`,
      questions: [
        {
          n: 1,
          stem: "What does the writer say about the power cut in the first paragraph?",
          options: [
            "It forced him to face a problem he had been avoiding.",
            "It brought an unexpected benefit after an uncomfortable start.",
            "It made him realise how much he depended on technology.",
            "It gave him the chance to catch up on neglected work.",
          ],
          correct: 1,
          explanations: [
            "El problema le 'molestaba' (nagging), pero no dice que lo estuviera evitando.",
            "Correcta: tras veinte minutos de inquietud, su mente divagó y resolvió un problema.",
            "No expresa que se diera cuenta de su dependencia de la tecnología.",
            "No trabajó durante el apagón: no hizo nada.",
          ],
          evidence: "After twenty minutes of restless fidgeting, something shifted.",
          skill: "detail",
        },
        {
          n: 2,
          stem: "According to recent research, boredom",
          options: [
            "shows that the brain has stopped working properly.",
            "encourages the mind to link ideas it would normally keep apart.",
            "makes people more willing to carry out dull tasks.",
            "helps people concentrate on a single problem.",
          ],
          correct: 1,
          explanations: [
            "Se dice justo lo contrario: el cerebro 'no se apaga'.",
            "Correcta: el cerebro hace conexiones entre recuerdos e ideas que de otro modo seguirían separados.",
            "No se habla de disposición a hacer tareas aburridas, sino de creatividad posterior.",
            "El texto habla de divagar y conectar ideas, no de concentrarse en un solo problema.",
          ],
          evidence: "making connections between memories and ideas that would otherwise remain separate",
          skill: "detail",
        },
        {
          n: 3,
          stem: "What is Dr Marsh's view of smartphones?",
          options: [
            "They have created a need that did not exist before.",
            "They are responsible for people's inability to concentrate.",
            "They offer an easy way of escaping an unpleasant feeling.",
            "They should be used less in public places.",
          ],
          correct: 2,
          explanations: [
            "Al contrario: dice que satisfacen una necesidad que siempre hemos tenido.",
            "Marsh evita culpar a la tecnología en sí misma.",
            "Correcta: el móvil es muy bueno en ayudarnos a 'escapar de la incomodidad'.",
            "No hace ninguna recomendación sobre lugares públicos.",
          ],
          evidence: "The phone is simply very good at meeting a need we have always had: the need to escape discomfort.",
          skill: "attitude",
        },
        {
          n: 4,
          stem: "What is the main purpose of the fourth paragraph?",
          options: [
            "To dismiss the criticism of the research.",
            "To suggest that boredom is harmful to many people.",
            "To acknowledge limits to the argument while keeping its main point.",
            "To show that Dr Marsh has changed her opinion.",
          ],
          correct: 2,
          explanations: [
            "Se reconoce que la objeción es 'justa' (fair), no se descarta.",
            "Solo se menciona que puede ser incómodo para quien sufre ansiedad, no que sea dañino para muchos.",
            "Correcta: se admiten las limitaciones, pero Marsh insiste en que hemos 'ido demasiado lejos' en una dirección.",
            "Marsh no cambia de opinión; matiza su postura.",
          ],
          evidence: "Marsh accepts this readily... \"The point is that we have swung too far in one direction.\"",
          skill: "purpose",
        },
        {
          n: 5,
          stem: "What does Raj Patel mean by \"that was the whole idea\"?",
          options: [
            "The activity was meant to leave the children without direction.",
            "The children were expected to complain.",
            "The school wanted the pupils to learn to ask for help.",
            "The task was designed to tire the children out.",
          ],
          correct: 0,
          explanations: [
            "Correcta: los niños preguntaban qué debían hacer; precisamente la idea era que no hubiera instrucciones.",
            "Las quejas eran una reacción, no el objetivo de la actividad.",
            "Ocurre lo contrario: al final, menos niños recurren a un adulto.",
            "No se menciona cansar a los niños.",
          ],
          evidence: "no task, no book and no instructions",
          skill: "reference",
        },
        {
          n: 6,
          stem: "What is the writer's attitude in the final paragraph?",
          options: [
            "Disappointed that he has not changed his habits more.",
            "Cautiously positive about small changes.",
            "Convinced that other people should follow his example.",
            "Embarrassed by his dependence on his phone.",
          ],
          correct: 1,
          explanations: [
            "No muestra decepción; describe pequeños avances con curiosidad.",
            "Correcta: 'no soy un converso', pero protege pequeños espacios vacíos y espera con ilusión el resultado.",
            "No recomienda a nadie que lo imite.",
            "Admite que mira el móvil demasiado, pero ese no es el tono dominante del párrafo.",
          ],
          evidence: "I have started to protect small pockets of emptiness",
          skill: "attitude",
        },
      ],
    },
  },
];
