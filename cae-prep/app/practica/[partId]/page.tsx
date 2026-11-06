import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PartRunner } from "@/components/practice/part-runner";
import { WritingRunner } from "@/components/practice/writing-runner";
import { getPart, isPartId } from "@/config/exam";
import { isImplemented } from "@/lib/schemas";

export async function generateMetadata({ params }: PageProps<"/practica/[partId]">): Promise<Metadata> {
  const { partId } = await params;
  if (!isPartId(partId)) return { title: "Práctica" };
  const p = getPart(partId);
  return { title: `${p.name} · Práctica` };
}

export default async function PracticePartPage({ params }: PageProps<"/practica/[partId]">) {
  const { partId } = await params;
  if (!isPartId(partId) || !isImplemented(partId)) notFound();
  if (getPart(partId).paper === "writing") return <WritingRunner partId={partId} />;
  return <PartRunner partId={partId} />;
}
