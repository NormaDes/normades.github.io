/** Exámenes que ofrece (u ofrecerá) Englora. Hoy solo C1 Advanced tiene contenido; el resto se irán abriendo. */
export interface ExamEntry {
  id: string;
  name: string;
  body: string;
  level: string;
  available: boolean;
}

export const EXAM_CATALOG: ExamEntry[] = [
  { id: "c1-advanced", name: "C1 Advanced", body: "Cambridge", level: "C1", available: true },
  { id: "b1-preliminary", name: "B1 Preliminary", body: "Cambridge", level: "B1", available: false },
  { id: "b2-first", name: "B2 First", body: "Cambridge", level: "B2", available: false },
  { id: "c2-proficiency", name: "C2 Proficiency", body: "Cambridge", level: "C2", available: false },
  { id: "ielts", name: "IELTS", body: "British Council / IDP", level: "B1–C2", available: false },
  { id: "toefl", name: "TOEFL iBT", body: "ETS", level: "B1–C2", available: false },
];
