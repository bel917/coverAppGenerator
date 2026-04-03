import { api } from "@/lib/api";

export type JobDescriptionSummary = {
  id: number;
  user_id: number;
  title: string | null;
  company_name: string | null;
  job_post_url: string | null;
  job_description_text: string;
  requirements_text: string | null;
  location: string | null;
  employment_type: string | null;
  source: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CoverLetter = {
  id: number;
  user_id: number;
  cv_id: number | null;
  job_description_id: number | null;
  title: string;
  content: string | null;
  tone: string | null;
  language: string;
  status: string;
  generated_by: string;
  cv: {
    id: number;
    title: string;
    file_name: string;
  } | null;
  job_description: JobDescriptionSummary | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

type ApiCollection<T> = {
  message: string | null;
  data: T[];
};

type ApiItem<T> = {
  message: string | null;
  data: T;
};

export async function listCoverLetters() {
  const { data } = await api.get<ApiCollection<CoverLetter>>("/cover-letters");

  return data.data;
}

export async function getCoverLetter(id: string | number) {
  const { data } = await api.get<ApiItem<CoverLetter>>(`/cover-letters/${id}`);

  return data.data;
}

export async function updateCoverLetter(
  id: string | number,
  payload: Partial<Pick<CoverLetter, "title" | "content" | "tone" | "language" | "status">>
) {
  const { data } = await api.put<ApiItem<CoverLetter>>(`/cover-letters/${id}`, payload);

  return data.data;
}

export async function generateCoverLetter(payload: {
  cv_id?: number;
  job_description_id?: number;
  job_description_text?: string;
  title?: string;
  tone?: string;
  language?: string;
}) {
  const { data } = await api.post<ApiItem<CoverLetter>>("/cover-letters/generate", payload);

  return data.data;
}
