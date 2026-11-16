"use client";

import { useSyncExternalStore } from "react";
import { DEFAULT_EXAM, examOrDefault, type ExamId } from "@/config/exam";
import { clientPrefs } from "@/lib/storage/local";

/** Examen que está preparando el alumno (se guarda en este dispositivo). */
export function useExam(): ExamId {
  return useSyncExternalStore(
    clientPrefs.subscribe,
    () => examOrDefault(clientPrefs.get<string>("exam", DEFAULT_EXAM)),
    () => DEFAULT_EXAM,
  );
}

export const setExam = (exam: ExamId) => clientPrefs.set("exam", exam);

/** ¿Este intento/fallo es del examen indicado? (sin el campo, es C1) */
export const inExam = (item: { exam?: ExamId }, exam: ExamId) => (item.exam ?? DEFAULT_EXAM) === exam;
