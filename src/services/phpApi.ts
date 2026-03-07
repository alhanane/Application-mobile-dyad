import { api } from "@/services/backend";

export type PhpStudent = {
  id: number;
  first_name: string;
  last_name: string;
  level_id: number;
  class_id: number;
  level_code: string;
  class_code: string;
  class_name: string;
};

export type PhpInfoNote = {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  pdf_url: string | null;
  link_url: string | null;
  target_type: "all" | "level" | "class";
  level_id: number | null;
  class_id: number | null;
  published_at: string;
  is_read: 0 | 1 | boolean;
};

export type PhpNews = {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  pdf_url: string | null;
  link_url: string | null;
  category: string | null;
  target_type: "all" | "level" | "class";
  level_id: number | null;
  class_id: number | null;
  published_at: string;
  is_read: 0 | 1 | boolean;
};

export type PhpRequestItem = {
  id: number;
  student_id: number;
  type: string;
  message: string;
  status: "pending" | "completed" | string;
  created_at: string;
  updated_at: string;
  student_first_name: string;
  student_last_name: string;
  level_code: string;
  class_code: string;
  response_id: number | null;
  response_message: string | null;
  response_attachment_url: string | null;
  response_created_at: string | null;
};

function boolish(v: unknown): boolean {
  return v === true || v === 1 || v === "1";
}

export async function fetchInfoNotes() {
  const res = await api.get<{ items: PhpInfoNote[] }>("/info/list.php");
  if (!res.success) throw new Error(res.error?.message || "Erreur API");
  return (res.data.items ?? []).map((n) => ({ ...n, is_read: boolish(n.is_read) }));
}

export async function markInfoNoteRead(info_note_id: number) {
  const res = await api.post<{ marked: boolean }>("/info/mark-read.php", { info_note_id });
  if (!res.success) throw new Error(res.error?.message || "Erreur API");
  return res.data;
}

export async function fetchNews() {
  const res = await api.get<{ items: PhpNews[] }>("/news/list.php");
  if (!res.success) throw new Error(res.error?.message || "Erreur API");
  return (res.data.items ?? []).map((n) => ({ ...n, is_read: boolish(n.is_read) }));
}

export async function markNewsRead(news_id: number) {
  const res = await api.post<{ marked: boolean }>("/news/mark-read.php", { news_id });
  if (!res.success) throw new Error(res.error?.message || "Erreur API");
  return res.data;
}

export async function fetchRequests() {
  const res = await api.get<{ items: PhpRequestItem[] }>("/requests/list.php");
  if (!res.success) throw new Error(res.error?.message || "Erreur API");
  return res.data.items ?? [];
}

export async function createRequest(student_id: number, type: string, message: string) {
  const res = await api.post<{ id: number }>("/requests/create.php", { student_id, type, message });
  if (!res.success) throw new Error(res.error?.message || "Erreur API");
  return res.data;
}

export async function fetchProfile() {
  const res = await api.get<{ profile: any }>("/parent/profile.php");
  if (!res.success) throw new Error(res.error?.message || "Erreur API");
  return res.data.profile;
}

export async function updateProfile(payload: Record<string, unknown>) {
  const res = await api.post<{ updated: boolean }>("/parent/profile.update.php", payload);
  if (!res.success) throw new Error(res.error?.message || "Erreur API");
  return res.data;
}

export async function fetchContact() {
  const res = await api.get<{ contact: { phone: string; email: string; address: string } }>("/contact/get.php");
  if (!res.success) throw new Error(res.error?.message || "Erreur API");
  return res.data.contact;
}
