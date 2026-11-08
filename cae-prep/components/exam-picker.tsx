import { EXAM_CATALOG } from "@/config/catalog";

/** Exámenes disponibles y próximos. */
export function ExamPicker() {
  return (
    <section className="mt-10" aria-labelledby="exams-title">
      <h2 id="exams-title" className="mb-1 font-serif text-2xl font-bold">Tu examen</h2>
      <p className="mb-3 text-sm text-muted">Englora crece examen a examen. Ahora puedes preparar el C1 Advanced; los demás llegarán pronto.</p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {EXAM_CATALOG.map((e) => (
          <li key={e.id} className={`flex items-center gap-3 rounded-xl border p-3.5 ${e.available ? "border-brand bg-brand-soft" : "border-line bg-surface"}`}>
            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg font-serif text-sm font-bold ${e.available ? "bg-brand text-brand-ink" : "bg-bg text-muted"}`}>{e.level}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">{e.name}</span>
              <span className="block truncate text-xs text-muted">{e.body}</span>
            </span>
            <span className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-bold ${e.available ? "bg-brand text-brand-ink" : "bg-bg text-muted"}`}>{e.available ? "Activo" : "Próximamente"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
