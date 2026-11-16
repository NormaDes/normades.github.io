import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartRunner } from "@/components/practice/part-runner";
import { SpeakingRunner } from "@/components/practice/speaking-runner";
import { WritingRunner } from "@/components/practice/writing-runner";
import { EXAMS, examOrDefault, getPart, hasPart, isPartId } from "@/config/exam";
import { isImplemented } from "@/lib/schemas";

export async function generateMetadata({ params, searchParams }: PageProps<"/practica/[partId]">): Promise<Metadata> {
  const { partId } = await params;
  const exam = examOrDefault((await searchParams).examen);
  if (!isPartId(partId) || !hasPart(partId, exam)) return { title: "Práctica" };
  return { title: `${getPart(partId, exam).name} · ${EXAMS[exam].name}` };
}

export default async function PracticePartPage({ params, searchParams }: PageProps<"/practica/[partId]">) {
  const { partId } = await params;
  const exam = examOrDefault((await searchParams).examen);
  if (!isPartId(partId) || !hasPart(partId, exam) || !isImplemented(partId, exam)) notFound();
  const paper = getPart(partId, exam).paper;
  if (paper === "writing") return <WritingRunner partId={partId} exam={exam} />;
  if (paper === "speaking") return <SpeakingRunner partId={partId} />;
  return <PartRunner partId={partId} exam={exam} />;
}
