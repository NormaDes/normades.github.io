import { EXAM_CATALOG } from "@/config/catalog";

/** Exámenes disponibles y próximos. */
export function ExamPicker() {
  return (
    <section className="mt-12" aria-labelledby="exams-title">
      <h2 id="exams-title" className="text-2xl md:text-3xl">Tu examen</h2>
      <p className="mb-4 mt-1 text-sm font-semibold text-muted">Englora crece examen a examen. Ahora puedes preparar el C1 Advanced; los demás llegarán pronto.</p>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {EXAM_CATALOG.map((e) => (
          <li key={e.id} className={`flex items-center gap-3 rounded-3xl border-2 p-3.5 ${e.available ? "border-brand bg-brand-soft" : "border-line bg-surface"}`}>
            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl font-display text-base font-semibold ${e.available ? "bg-brand text-brand-ink shadow-[0_4px_0_var(--brand-dark)]" : "bg-bg text-muted"}`}>{e.level}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-bold">{e.name}</span>
              <span className="block truncate text-xs font-semibold text-muted">{e.body}</span>
            </span>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-extrabold ${e.available ? "bg-brand text-brand-ink" : "bg-bg text-muted"}`}>{e.available ? "Activo" : "Pronto"}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
