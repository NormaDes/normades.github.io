import type { Metadata } from "next";
import { PasteText } from "@/components/library/paste-text";

export const metadata: Metadata = { title: "Pegar un texto" };

export default function PastePage() {
  return <PasteText />;
}
