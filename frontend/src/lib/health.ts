import { api } from "./api";

export async function fetchBackendHealth() {
  const { data } = await api.get<{ status: string; app: string }>("/health");

  return data;
}
