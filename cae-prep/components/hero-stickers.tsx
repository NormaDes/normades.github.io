import { BoltIcon, FlameIcon, ListeningIcon, StarIcon, TrophyIcon } from "@/components/icons";

/** Pegatinas decorativas de la portada (solo adorno). */
export function HeroStickers() {
  const base = "absolute flex items-center justify-center rounded-2xl shadow-[0_5px_0_rgba(0,0,0,0.2)]";
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
      <span className={`${base} wiggle right-6 top-2 h-14 w-14 rotate-6 bg-sun text-[#4d3700]`}><StarIcon width={30} height={30} /></span>
      <span className={`${base} right-28 top-16 h-12 w-12 -rotate-12 bg-tangerine text-white`}><FlameIcon width={26} height={26} /></span>
      <span className={`${base} wiggle right-2 top-28 h-12 w-12 rotate-12 bg-mint text-white`}><TrophyIcon width={26} height={26} /></span>
      <span className={`${base} right-36 top-0 h-10 w-10 -rotate-6 bg-accent text-white`}><ListeningIcon width={22} height={22} weight="fill" /></span>
      <span className={`${base} right-16 top-28 h-10 w-10 rotate-3 bg-white text-brand`}><BoltIcon width={22} height={22} /></span>
    </div>
  );
}
