import { API_BASE_URL } from "./apiConfig";

export async function apiClient(endpoint: string, { method = "GET", body }: { method?: string; body?: any } = {}) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error("API request failed");
  return res.json();
}