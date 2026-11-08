import {
  ArrowRight,
  BookOpenText,
  CalendarCheck,
  CaretRight,
  ChalkboardTeacher,
  ChartBar,
  Check,
  Clock,
  Headphones,
  House,
  Lightning,
  Cards,
  Fire,
  Microphone,
  PencilSimpleLine,
  DotsThreeOutline,
  PenNib,
  Play,
  Plus,
  Sparkle,
  Star,
  Target,
  Timer,
  Trophy,
} from "@phosphor-icons/react/ssr";
import type { Icon, IconWeight } from "@phosphor-icons/react";
import type { SVGProps } from "react";
import type { PaperId } from "@/config/exam";

type Props = Omit<SVGProps<SVGSVGElement>, "ref"> & { weight?: IconWeight };

/** Iconos Phosphor (un solo juego en toda la app). Aceptan width/height/className como antes. */
function make(Glyph: Icon, defaultWeight: IconWeight = "duotone") {
  const Wrapped = ({ width, height, weight, className, style }: Props) => (
    <Glyph size={Number(width ?? height ?? 24)} weight={weight ?? defaultWeight} className={className} style={style} aria-hidden />
  );
  return Wrapped;
}

export const HomeIcon = make(House);
export const PracticeIcon = make(PencilSimpleLine);
export const MockIcon = make(Timer);
export const LibraryIcon = make(BookOpenText);
export const VocabIcon = make(Cards);
export const MistakesIcon = make(Target);
export const ProgressIcon = make(ChartBar);
export const ReadingIcon = LibraryIcon;
export const WritingIcon = make(PenNib);
export const ListeningIcon = make(Headphones);
export const SpeakingIcon = make(Microphone);
export const ChevronIcon = make(CaretRight, "bold");
export const ArrowIcon = make(ArrowRight, "bold");
export const ClockIcon = make(Clock);
export const CalendarIcon = make(CalendarCheck);
export const TeacherIcon = make(ChalkboardTeacher);
export const MoreIcon = make(DotsThreeOutline, "fill");
export const PlusIcon = make(Plus, "bold");
export const PlayIcon = make(Play, "fill");
export const CheckIcon = make(Check, "bold");
export const FlameIcon = make(Fire, "fill");
export const StarIcon = make(Star, "fill");
export const TrophyIcon = make(Trophy, "fill");
export const SparkleIcon = make(Sparkle, "fill");
export const BoltIcon = make(Lightning, "fill");

export const PAPER_ICONS: Record<PaperId, (p: Props) => React.JSX.Element> = {
  reading: ReadingIcon,
  writing: WritingIcon,
  listening: ListeningIcon,
  speaking: SpeakingIcon,
};
