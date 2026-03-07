import { PhpStudent } from "@/services/phpApi";

const KEY = "alhanane_selected_student_id_v1";

export function getSelectedStudentId(): number | null {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

export function setSelectedStudentId(id: number) {
  try {
    localStorage.setItem(KEY, String(id));
  } catch {
    // ignore
  }
}

export function ensureSelectedStudentId(students: PhpStudent[]): number | null {
  const current = getSelectedStudentId();
  if (current && students.some((s) => s.id === current)) return current;
  const first = students[0]?.id ?? null;
  if (first) setSelectedStudentId(first);
  return first;
}
