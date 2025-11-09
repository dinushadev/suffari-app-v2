import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";
import { normalizeLanguages } from "@/lib/utils";
import type { Guide } from "@/types/guide";

export interface UseGuidesParams {
  resourceType?: string;
  speakingLanguage?: string;
  search?: string;
}

/**
 * Raw guide data from API before normalization
 * speaking_languages can be a string (CSV) or array
 */
type RawGuide = Omit<Guide, "speaking_languages"> & {
  speaking_languages: string | string[];
};

/**
 * Transform guide data to ensure speaking_languages is always an array
 */
const normalizeGuide = (guide: RawGuide): Guide => {
  return {
    ...guide,
    speaking_languages: normalizeLanguages(guide.speaking_languages),
  };
};

const fetchGuides = async (params: UseGuidesParams): Promise<Guide[]> => {
  const queryParams = new URLSearchParams();
  
  if (params.resourceType && params.resourceType !== "all") {
    queryParams.append("resourceType", params.resourceType);
  }
  
  if (params.speakingLanguage && params.speakingLanguage !== "all") {
    queryParams.append("speakingLanguage", params.speakingLanguage);
  }
  
  if (params.search && params.search.trim()) {
    queryParams.append("search", params.search.trim());
  }
  
  const queryString = queryParams.toString();
  const endpoint = `/guides${queryString ? `?${queryString}` : ""}`;
  
  const guides = await apiClient<RawGuide[]>(endpoint);
  
  // Normalize languages from CSV to array for each guide
  return guides.map(normalizeGuide);
};

export function useGuides(params: UseGuidesParams = {}) {
  return useQuery<Guide[]>({
    queryKey: ["guides", params],
    queryFn: () => fetchGuides(params),
  });
}

