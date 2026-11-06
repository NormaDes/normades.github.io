/** Consejos del profe: uno por día (rotan según el día del año). */
export const TIPS: string[] = [
  "Open cloze: mira siempre la palabra de antes y la de después del hueco. Casi siempre es una preposición, un auxiliar o un conector.",
  "Word formation: decide primero qué clase de palabra falta (nombre, adjetivo, verbo, adverbio). Luego mira si hace falta un prefijo negativo.",
  "Key word transformations: nunca cambies la palabra clave. Si necesitas «wishes» y la clave es WISH, estás fuera.",
  "Reading 5: lee las preguntas antes que el texto. Subraya la frase exacta que justifica tu respuesta.",
  "Reading 7: busca pronombres (this, they, such) y conectores. Si un párrafo empieza con «However», necesita algo positivo antes.",
  "Listening 2: lo que oyes casi nunca es lo que está escrito. Escucha el significado y apunta una o dos palabras, no una frase.",
  "Listening: en la segunda escucha, comprueba solo lo que dudaste en la primera. No empieces de cero.",
  "Writing: dedica 5 minutos a planificar. Un essay con párrafos claros puntúa más que uno largo y desordenado.",
  "Writing: cuida el registro. Un email a un amigo no se escribe como un report para el director del colegio.",
  "Writing: usa conectores variados, pero solo los que dominas. «Nevertheless» mal puesto resta, no suma.",
  "Speaking Part 2: no describas, compara. «Whereas», «unlike», «on the other hand» son tus aliados.",
  "Speaking Part 3: reacciona a tu compañero. Pregúntale «What do you think?» y escucha de verdad.",
  "Si no sabes una palabra, rodéala: «a kind of…», «something you use to…». Los examinadores valoran que sigas hablando.",
  "Vocabulario: aprende colocaciones, no palabras sueltas. «Make a decision», no «do a decision».",
  "Repasa tus errores cada semana. Fallar dos veces lo mismo es una señal de que hay que estudiarlo.",
  "20 minutos al día valen más que 3 horas el domingo. La constancia es lo que se nota el día del examen.",
  "Lee cada día un artículo corto en inglés. Subraya cinco expresiones y úsalas en voz alta.",
  "Phrasal verbs: apréndelos en frases completas y por temas (trabajo, viajes, relaciones).",
  "Reading 1: prueba cada opción en el hueco con la frase entera. Muchas respuestas «suenan» bien, pero solo una colocación es correcta.",
  "Dos errores de ortografía no te quitan el aprobado; no responder, sí. En el examen, nunca dejes huecos en blanco.",
  "Reading 6: marca la opinión de cada autor con un símbolo (+ / −) antes de leer las preguntas.",
  "Listening 4: los distractores están hechos para engañarte. Si oyes la palabra exacta de la opción, desconfía.",
  "Escucha podcasts mientras caminas o vas en el bus. No hace falta entenderlo todo: entrena el oído.",
  "El día antes del examen no estudies cosas nuevas. Repasa tu cuaderno de errores y duerme bien.",
  "En el Speaking, sonríe y mira a tus examinadores. La comunicación también es actitud.",
  "Gramática avanzada: practica inversiones («Not only did he…»), condicionales mixtos y estructuras pasivas.",
  "Reading 8: subraya en las preguntas las palabras clave y busca su paráfrasis en el texto, no la palabra idéntica.",
  "Escribe tu essay con la regla 3-2-1: tres párrafos de desarrollo, dos ejemplos concretos y una conclusión clara.",
  "Un error que se repite se arregla con una regla corta escrita a mano. Pégala donde estudies.",
  "Descansa: un cerebro cansado no retiene vocabulario. Estudia por bloques de 25 minutos con pausa.",
];

export function tipOfTheDay(date: Date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0).getTime();
  const day = Math.floor((date.getTime() - start) / 86_400_000);
  return TIPS[day % TIPS.length];
}
