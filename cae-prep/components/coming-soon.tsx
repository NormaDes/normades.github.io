import Link from "next/link";

export function ComingSoon({ title, description, bullets }: { title: string; phase?: number; description: string; bullets: string[] }) {
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow text-accent">Próximamente</p>
      <h1 className="mt-1 font-serif text-3xl font-bold md:text-4xl">{title}</h1>
      <p className="mt-3 text-muted">{description}</p>
      <ul className="mt-6 divide-y divide-line rounded-xl border border-line bg-surface text-[15px]">
        {bullets.map((b) => (
          <li key={b} className="flex gap-3 px-4 py-3">
            <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {b}
          </li>
        ))}
      </ul>
      <Link href="/practica" className="mt-6 inline-flex min-h-12 items-center rounded-lg bg-brand px-5 text-sm font-semibold text-brand-ink">
        Ir a practicar
      </Link>
    </div>
  );
}
