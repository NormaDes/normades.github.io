import Link from "next/link";

export function ComingSoon({
  title,
  phase,
  description,
  bullets,
}: {
  title: string;
  phase: number;
  description: string;
  bullets: string[];
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="mb-2 inline-block rounded-full bg-warn-soft px-3 py-1 text-xs font-semibold">Fase {phase} · próximamente</p>
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
      <p className="mt-3 text-muted">{description}</p>
      <ul className="mt-6 space-y-2 rounded-2xl border border-line bg-surface p-5 text-sm">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2">
            <span aria-hidden className="text-brand">•</span>
            {b}
          </li>
        ))}
      </ul>
      <Link href="/practica" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-ink">
        Ir a practicar
      </Link>
    </div>
  );
}
