import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aviso legal" };

const Pending = ({ children }: { children: React.ReactNode }) => <span className="pending-data">{children}</span>;

export default function LegalNoticePage() {
  return (
    <>
      <p className="eyebrow text-accent">Legal</p>
      <h1 className="mt-1 font-display text-3xl font-bold">Aviso legal y condiciones de uso</h1>
      <p className="mt-3 rounded-lg bg-warn-soft p-3 text-sm">
        <strong>Borrador pendiente de completar y revisar.</strong> Rellena los datos resaltados y haz que lo revise un profesional antes de abrir la plataforma al público.
      </p>

      <h2>1. Titular</h2>
      <p>
        Englora es un servicio de <Pending>[NOMBRE Y APELLIDOS / RAZÓN SOCIAL]</Pending>, NIF <Pending>[NIF]</Pending>, domicilio <Pending>[DIRECCIÓN]</Pending>, contacto <Pending>[EMAIL]</Pending>.
      </p>

      <h2>2. Qué es Englora</h2>
      <p>Una herramienta de práctica para exámenes de inglés (hoy, Cambridge C1 Advanced). Los ejercicios, textos y guiones de práctica son <strong>originales o generados con inteligencia artificial</strong> y pueden contener errores; no son material oficial de ningún organismo examinador y la puntuación estimada es orientativa. Englora no está afiliada ni respaldada por Cambridge University Press &amp; Assessment ni por otros organismos examinadores.</p>

      <h2>3. Material de clase</h2>
      <p>El material que el profesorado comparte a través de la plataforma (audios, textos, vídeos, documentos) es de uso <strong>exclusivo del alumnado con cuenta</strong> y para su estudio personal. No se puede copiar, redistribuir ni publicar fuera de la plataforma. Los derechos pertenecen a sus respectivos autores y titulares.</p>

      <h2>4. Contenidos de terceros</h2>
      <p>Los artículos, vídeos y audios de terceros que se muestren en la biblioteca conservan su autoría y licencia, que se indican junto a cada contenido junto con un enlace al original. Para fuentes sin licencia abierta solo se muestra un extracto y el enlace a la fuente.</p>

      <h2>5. Uso aceptable</h2>
      <ul>
        <li>Usa tu cuenta de forma personal y no la compartas.</li>
        <li>No intentes eludir los límites de uso, acceder a datos de otras personas ni sobrecargar el servicio.</li>
        <li>No envíes contenido ilícito u ofensivo en tus redacciones o respuestas.</li>
      </ul>
      <p>Podemos suspender cuentas que incumplan estas condiciones.</p>

      <h2>6. Responsabilidad</h2>
      <p>Hacemos lo posible por que el servicio funcione de forma continua y correcta, pero se ofrece «tal cual», sin garantía de resultados en el examen. No nos hacemos responsables de interrupciones, pérdidas de datos de terceros proveedores ni del uso que se haga de la información.</p>

      <h2>7. Legislación aplicable</h2>
      <p>Este aviso se rige por la legislación española. <Pending>[Indicar fuero si procede]</Pending></p>
    </>
  );
}
