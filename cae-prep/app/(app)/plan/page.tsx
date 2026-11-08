import type { Metadata } from "next";
import { PlanApp } from "@/components/plan/plan-app";

export const metadata: Metadata = { title: "Plan de estudio" };

export default function PlanPage() {
  return <PlanApp />;
}
