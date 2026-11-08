import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MockRunner } from "@/components/mock/mock-runner";
import { PAPERS, type PaperId } from "@/config/exam";
import { MOCK_PAPERS } from "@/lib/mock";

export async function generateMetadata({ params }: PageProps<"/simulacro/[paper]">): Promise<Metadata> {
  const { paper } = await params;
  return { title: `Simulacro · ${PAPERS.find((p) => p.id === paper)?.name ?? ""}` };
}

export default async function MockPaperPage({ params }: PageProps<"/simulacro/[paper]">) {
  const { paper } = await params;
  if (!MOCK_PAPERS.includes(paper as PaperId)) notFound();
  return <MockRunner paper={paper as PaperId} />;
}
