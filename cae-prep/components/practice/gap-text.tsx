import type { ReactNode } from "react";

/** Renderiza un texto con marcadores {{n}} sustituyéndolos por el nodo que devuelva `gap(n)`. */
export function GapText({ text, gap }: { text: string; gap: (n: number) => ReactNode }) {
  return (
    <div className="exam-text rounded-2xl border border-line bg-surface p-4 md:p-6">
      {text.split(/\n\s*\n/).map((para, i) => (
        <p key={i}>
          {para.split(/(\{\{\d+\}\})/).map((part, j) => {
            const m = part.match(/^\{\{(\d+)\}\}$/);
            return m ? <span key={j}>{gap(Number(m[1]))}</span> : <span key={j}>{part}</span>;
          })}
        </p>
      ))}
    </div>
  );
}

/** Tarjeta de corrección: respuesta, explicación y fragmento que lo justifica */
export function Feedback({
  n,
  ok,
  given,
  expected,
  explanation,
  evidence,
  skill,
}: {
  n: number;
  ok: boolean;
  given: string;
  expected: string;
  explanation?: string;
  evidence?: string;
  skill: string;
}) {
  return (
    <div className={`rounded-2xl border p-4 ${ok ? "border-ok/40 bg-ok-soft" : "border-bad/40 bg-bad-soft"}`}>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-xs font-bold">{n}</span>
        <span className={`font-semibold ${ok ? "text-ok" : "text-bad"}`}>{ok ? "Correcto" : "Incorrecto"}</span>
        <span className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-muted">{skill}</span>
      </div>
      {!ok && (
        <p className="mt-2 text-sm">
          Tu respuesta: <span className="font-semibold">{given ? given : "(en blanco)"}</span>
        </p>
      )}
      <p className="mt-1 text-sm">
        Respuesta correcta: <span className="font-semibold">{expected}</span>
      </p>
      {explanation && <p className="mt-2 text-sm leading-relaxed">{explanation}</p>}
      {evidence && (
        <blockquote className="mt-2 border-l-2 border-brand pl-3 font-serif text-sm italic text-muted">“{evidence}”</blockquote>
      )}
    </div>
  );
}
