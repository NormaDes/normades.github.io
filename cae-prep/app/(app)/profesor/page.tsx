import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { TeacherIcon } from "@/components/icons";
import { ClassDashboard } from "@/components/library/class-dashboard";
import { WaitlistAdmin } from "@/components/library/waitlist-admin";
import { TeacherPanel } from "@/components/library/teacher-panel";

export const metadata: Metadata = { title: "Profesor" };

export default function TeacherPage() {
  return (
    <div>
      <PageHeader icon={<TeacherIcon width={32} height={32} weight="fill" />} tone="tangerine" eyebrow="Panel del profesor" title="Tu clase y su material">Mira cómo avanza cada alumno y sube audios, PDFs, imágenes y enlaces para la biblioteca de clase.</PageHeader>
      <ClassDashboard />
      <h2 className="mb-4 mt-12 text-2xl md:text-3xl">Material de clase</h2>
      <TeacherPanel />
      <WaitlistAdmin />
    </div>
  );
}
