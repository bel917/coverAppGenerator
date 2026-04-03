import { api } from "@/lib/api";

export type Cv = {
  id: number;
  user_id: number;
  title: string;
  file_name: string;
  name?: string;
  file_path: string;
  file_url: string | null;
  file_mime_type: string | null;
  file_size: number | null;
  size?: string;
  extracted_text: string | null;
  parsed_data_json: Record<string, unknown> | null;
  is_default: boolean;
  created_at: string;
  date?: string;
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

export async function listCvs() {
  const { data } = await api.get<ApiCollection<Cv>>("/cvs");

  return data.data;
}

export async function uploadCv(input: {
  title: string;
  file: File;
  is_default?: boolean;
}) {
  const formData = new FormData();
  formData.append("title", input.title);
  formData.append("file", input.file);

  if (typeof input.is_default === "boolean") {
    formData.append("is_default", String(input.is_default));
  }

  const { data } = await api.post<ApiItem<Cv>>("/cvs", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data.data;
}

export async function deleteCv(id: number) {
  await api.delete(`/cvs/${id}`);
}
