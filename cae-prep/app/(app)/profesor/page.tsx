import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";
import { TeacherIcon } from "@/components/icons";
import { WaitlistAdmin } from "@/components/library/waitlist-admin";
import { TeacherPanel } from "@/components/library/teacher-panel";

export const metadata: Metadata = { title: "Profesor" };

export default function TeacherPage() {
  return (
    <div>
      <PageHeader icon={<TeacherIcon width={32} height={32} weight="fill" />} tone="tangerine" eyebrow="Panel del profesor" title="Material para la clase">Sube audios, PDFs, imágenes y enlaces. Los alumnos con sesión iniciada los verán en la biblioteca, en «Material de clase».</PageHeader>
      <TeacherPanel />
      <WaitlistAdmin />
    </div>
  );
}
