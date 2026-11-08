import { PAPERS, partsOfPaper, type PaperId, type PartId } from "@/config/exam";

/** Papers que se pueden simular (Speaking necesita un compañero y se practica por partes) */
export const MOCK_PAPERS: PaperId[] = ["reading", "writing", "listening"];

export const mockParts = (paper: PaperId): PartId[] => partsOfPaper(paper).map((p) => p.id);
export const mockMinutes = (paper: PaperId) => PAPERS.find((p) => p.id === paper)!.durationMinutes;

export interface MockPartResult {
  partId: PartId;
  marks: number;
  maxMarks: number;
  /** false si no se pudo evaluar (p. ej. Writing sin IA): no cuenta en la nota */
  assessed: boolean;
}

export interface MockSummary {
  raw: number;
  max: number;
  pct: number;
  scale: number;
  level: "C2" | "C1" | "B2" | "B1" | "<B1";
  assessedAll: boolean;
}

/**
 * Escala Cambridge (80–230) estimada a partir del porcentaje de marcas.
 * Aproximación: ~60 % de las marcas ≈ 180 (aprobado C1); 100 % ≈ 230. NO es la conversión oficial.
 */
export function scaleScore(pct: number): number {
  const p = Math.min(1, Math.max(0, pct));
  return Math.round(p >= 0.6 ? 180 + ((p - 0.6) / 0.4) * 50 : 80 + (p / 0.6) * 100);
}

export function levelOf(scale: number): MockSummary["level"] {
  return scale >= 200 ? "C2" : scale >= 180 ? "C1" : scale >= 160 ? "B2" : scale >= 140 ? "B1" : "<B1";
}

export function summarizeMock(parts: MockPartResult[]): MockSummary {
  const assessed = parts.filter((p) => p.assessed);
  const raw = assessed.reduce((a, p) => a + p.marks, 0);
  const max = assessed.reduce((a, p) => a + p.maxMarks, 0);
  const pct = max ? raw / max : 0;
  const scale = scaleScore(pct);
  return { raw, max, pct, scale, level: levelOf(scale), assessedAll: assessed.length === parts.length };
}

export interface MockRecord {
  id: string;
  paper: PaperId;
  at: string;
  scale: number;
  level: MockSummary["level"];
  pct: number;
  assessedAll: boolean;
}
