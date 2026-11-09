import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de privacidad" };

const Pending = ({ children }: { children: React.ReactNode }) => <span className="pending-data">{children}</span>;

export default function PrivacyPage() {
  return (
    <>
      <p className="eyebrow text-accent-dark">Legal</p>
      <h1 className="mt-1 font-display text-3xl font-bold">Política de privacidad</h1>
      <p className="mt-3 rounded-lg bg-warn-soft p-3 text-sm">
        <strong>Borrador pendiente de completar y revisar.</strong> Los datos resaltados deben rellenarse antes de abrir la plataforma a otras personas, y conviene que un profesional revise el texto.
      </p>
      <p className="text-sm text-muted">Última actualización: noviembre de 2026.</p>

      <h2>1. Quién es el responsable</h2>
      <p>
        El responsable del tratamiento de tus datos es <Pending>[NOMBRE Y APELLIDOS / RAZÓN SOCIAL]</Pending>, con NIF <Pending>[NIF]</Pending> y domicilio en <Pending>[DIRECCIÓN]</Pending>.
        Puedes escribirnos a <Pending>[EMAIL DE CONTACTO]</Pending>.
      </p>

      <h2>2. Qué datos tratamos</h2>
      <ul>
        <li><strong>Cuenta:</strong> tu nombre (o el que elijas), tu email y tu contraseña (almacenada cifrada; nosotros nunca la vemos).</li>
        <li><strong>Actividad de estudio:</strong> ejercicios realizados, resultados, errores, textos de redacción y transcripciones de Speaking.</li>
        <li><strong>Datos técnicos:</strong> cookies necesarias para mantener tu sesión iniciada.</li>
        <li><strong>Audio de Speaking:</strong> la grabación de tu voz se queda en tu dispositivo y no se envía a nuestros servidores. Solo se envía la transcripción en texto cuando pides feedback.</li>
      </ul>

      <h2>3. Para qué y con qué base legal</h2>
      <ul>
        <li>Crear y gestionar tu cuenta y prestarte el servicio de práctica: <em>ejecución del servicio que solicitas</em> (art. 6.1.b RGPD).</li>
        <li>Guardar tu progreso y generar estadísticas personales para ti: <em>ejecución del servicio</em>.</li>
        <li>Corregir tus redacciones y respuestas orales con inteligencia artificial cuando tú lo solicitas: <em>tu consentimiento</em> al pulsar el botón correspondiente (art. 6.1.a).</li>
        <li>Seguridad y prevención de abusos (por ejemplo, límite diario de usos de IA): <em>interés legítimo</em> (art. 6.1.f).</li>
      </ul>
      <p>No usamos tus datos para publicidad ni los vendemos. No tomamos decisiones automatizadas con efectos jurídicos sobre ti: la puntuación de la IA es orientativa.</p>

      <h2>4. Con quién los compartimos</h2>
      <p>Usamos proveedores que tratan datos por nuestra cuenta, con los contratos exigidos por la normativa:</p>
      <ul>
        <li><strong>Supabase</strong> (base de datos y autenticación).</li>
        <li><strong>Vercel</strong> (alojamiento de la web).</li>
        <li><strong>Anthropic</strong> (modelo de IA que corrige tus textos y transcripciones; solo recibe el contenido que envías para su corrección y los enunciados).</li>
      </ul>
      <p>Algunos de estos proveedores pueden tratar datos fuera del Espacio Económico Europeo (por ejemplo, en EE. UU.), amparados por cláusulas contractuales tipo u otras garantías adecuadas. <Pending>[Confirmar regiones y garantías de cada proveedor]</Pending></p>

      <h2>5. Cuánto tiempo los conservamos</h2>
      <p>Mientras mantengas tu cuenta. Si la eliminas o nos lo pides, borraremos tus datos, salvo los que debamos conservar por obligación legal durante los plazos que correspondan.</p>

      <h2>6. Tus derechos</h2>
      <p>
        Puedes ejercer los derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo a <Pending>[EMAIL DE CONTACTO]</Pending>. Si consideras que no hemos tratado tus datos correctamente, puedes reclamar ante la
        {" "}<a href="https://www.aepd.es" target="_blank" rel="noreferrer">Agencia Española de Protección de Datos</a>. Puedes retirar tu consentimiento en cualquier momento sin que afecte a lo anterior.
      </p>

      <h2>7. Menores</h2>
      <p>El servicio está dirigido a personas de 14 años o más. Si eres menor de esa edad, necesitas el consentimiento de tu madre, padre o tutor legal.</p>

      <h2>8. Lista de espera</h2>
      <p>Si te apuntas a la lista de espera guardamos tu email, tu nombre (si lo indicas), el examen que preparas, tu perfil (estudiante, profesor o academia) y la web desde la que llegaste. Los usamos solo para avisarte del lanzamiento y de novedades de Englora. Puedes pedir que te borremos en cualquier momento escribiendo al correo de contacto.</p>

      <h2>9. Cookies</h2>
      <p>Solo usamos cookies técnicas estrictamente necesarias para mantener tu sesión. No usamos cookies de publicidad ni de seguimiento, por lo que no mostramos un banner de consentimiento.</p>
    </>
  );
}
