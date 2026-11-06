import type { SVGProps } from "react";

/** Iconos de línea propios (trazo uniforme), en lugar de emojis. */
function Svg(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    />
  );
}

export const HomeIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M3.5 11.2 12 4l8.5 7.2" /><path d="M5.5 9.8V20h13V9.8" /><path d="M10 20v-5.5h4V20" /></Svg>
);
export const PracticeIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M4 20h4.2L19.5 8.7a1.6 1.6 0 0 0 0-2.2l-2-2a1.6 1.6 0 0 0-2.2 0L4 15.8V20z" /><path d="m13.5 6 4.5 4.5" /></Svg>
);
export const MockIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><circle cx="12" cy="13" r="7.5" /><path d="M12 9v4.2l2.8 1.8" /><path d="M9.5 3.5h5" /></Svg>
);
export const LibraryIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M12 6.8C10 5.3 7 4.8 4 5.3V18c3-.5 6 0 8 1.6 2-1.6 5-2.1 8-1.6V5.3c-3-.5-6 0-8 1.5z" /><path d="M12 6.8v12.8" /></Svg>
);
export const VocabIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><rect x="6" y="8" width="14" height="11" rx="1.5" /><path d="M4 15.5V6.5A1.5 1.5 0 0 1 5.5 5H16" /><path d="M10 12.5h6" /></Svg>
);
export const MistakesIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M4.5 12a7.5 7.5 0 0 1 13-5l2 2" /><path d="M19.5 4.5V9H15" /><path d="M19.5 12a7.5 7.5 0 0 1-13 5l-2-2" /><path d="M4.5 19.5V15H9" /></Svg>
);
export const ProgressIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M5 20v-8" /><path d="M12 20V5" /><path d="M19 20v-11" /><path d="M3 20.5h18" /></Svg>
);
export const ReadingIcon = LibraryIcon;
export const WritingIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M4.5 5.5h15M4.5 10h15M4.5 14.5h7" /><path d="m14 19.5 .6-2.6 5.1-5.1a1.4 1.4 0 0 1 2 2l-5.1 5.1L14 19.5z" /></Svg>
);
export const ListeningIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M4 14v-2a8 8 0 0 1 16 0v2" /><path d="M4 14h3v5.2H5.2A1.2 1.2 0 0 1 4 18v-4z" /><path d="M20 14h-3v5.2h1.8a1.2 1.2 0 0 0 1.2-1.2v-4z" /></Svg>
);
export const SpeakingIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><rect x="9" y="3.5" width="6" height="11" rx="3" /><path d="M5.8 11.5a6.2 6.2 0 0 0 12.4 0" /><path d="M12 17.7V21" /></Svg>
);
export const ChevronIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="m9.5 6 6 6-6 6" /></Svg>
);
export const ArrowIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><path d="M4 12h15M13 6l6 6-6 6" /></Svg>
);
export const ClockIcon = (p: SVGProps<SVGSVGElement>) => (
  <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 1.8" /></Svg>
);

import type { PaperId } from "@/config/exam";

export const PAPER_ICONS: Record<PaperId, (p: SVGProps<SVGSVGElement>) => React.JSX.Element> = {
  reading: ReadingIcon,
  writing: WritingIcon,
  listening: ListeningIcon,
  speaking: SpeakingIcon,
};
