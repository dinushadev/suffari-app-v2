import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export interface SupportedLanguagesResponse {
  languages: string[];
}

const fetchSupportedLanguages = async (): Promise<string[]> => {
  const response = await apiClient<SupportedLanguagesResponse>("/config/supported-languages");
  return response.languages ?? [];
};

export function useSupportedLanguages() {
  return useQuery<string[]>({
    queryKey: ["config", "supported-languages"],
    queryFn: fetchSupportedLanguages,
    staleTime: 5 * 60 * 1000, // 5 minutes - config rarely changes
  });
}
