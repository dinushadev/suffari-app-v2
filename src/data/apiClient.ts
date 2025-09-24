import { API_BASE_URL, supabase } from "./apiConfig";

/**
 * Generic API client for making requests to the backend
 * @param endpoint API endpoint path (with or without leading slash)
 * @param options Request options including method and body
 * @returns Promise with the parsed JSON response
 */
export async function apiClient<T>(endpoint: string, { method = "GET", body, baseUrl }: { method?: string; body?: unknown; baseUrl?: string } = {}): Promise<T> {
  // Normalize endpoint to ensure it starts with a slash if using API_BASE_URL
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Use provided baseUrl or default to API_BASE_URL
  const url = baseUrl ? `${baseUrl}${normalizedEndpoint}` : `${API_BASE_URL}${normalizedEndpoint}`;

  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = { "Content-Type": "application/json" };

  if (session) {
    headers["Authorization"] = `Bearer ${session.access_token}`;
  }
  
  const res = await fetch(url, {
    method,
    headers,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  
  // Parse the response
  const data = await res.json();
  
  // Handle error responses
  if (!res.ok) {
    throw new Error(data.error || "API request failed");
  }
  
  return data as T;
}