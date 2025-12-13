import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";
import { normalizeLanguages } from "@/lib/utils";
import type { Guide } from "@/types/guide";

export interface UseGuidesParams {
  resourceType?: string;
  speakingLanguage?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedGuidesResponse {
  data: Guide[];
  total: number;
  page: number;
  limit: number;
}

/**
 * Raw guide data from API before normalization
 * Handles both camelCase (new API) and snake_case (legacy) formats
 */
type RawGuide = Partial<Guide> & {
  speakingLanguages?: string | string[];
  speaking_languages?: string | string[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  images?: string[] | null;
  locationId?: string;
};

/**
 * Transform guide data to ensure consistent format
 */
const normalizeGuide = (guide: RawGuide): Guide => {
  // Normalize speakingLanguages (prefer camelCase, fallback to snake_case)
  const speakingLanguages = normalizeLanguages(
    guide.speakingLanguages || guide.speaking_languages || []
  );

  // Normalize timestamps (prefer camelCase, fallback to snake_case)
  const createdAt = guide.createdAt || guide.created_at || "";
  const updatedAt = guide.updatedAt || guide.updated_at || "";

  // Normalize images (ensure it's an array or null)
  const images = guide.images === undefined ? null : guide.images;

  // Get locationId from guide object
  const locationId = guide.locationId || undefined;

  return {
    ...guide,
    speakingLanguages,
    createdAt,
    updatedAt,
    images,
    locationId,
    // Keep legacy fields for backward compatibility
    speaking_languages: speakingLanguages,
    created_at: createdAt,
    updated_at: updatedAt,
  } as Guide;
};

const fetchGuides = async (params: UseGuidesParams): Promise<PaginatedGuidesResponse> => {
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
  
  if (params.page !== undefined) {
    queryParams.append("page", String(params.page));
  }
  
  if (params.limit !== undefined) {
    queryParams.append("limit", String(params.limit));
  }
  
  const queryString = queryParams.toString();
  const endpoint = `/guides${queryString ? `?${queryString}` : ""}`;
  
  const response = await apiClient<{
    data: RawGuide[];
    total: number;
    page: number;
    limit: number;
  }>(endpoint);
  
  // Normalize each guide
  const normalizedGuides = response.data.map(normalizeGuide);
  
  return {
    data: normalizedGuides,
    total: response.total,
    page: response.page,
    limit: response.limit,
  };
};

export function useGuides(params: UseGuidesParams = {}) {
  return useQuery<PaginatedGuidesResponse>({
    queryKey: ["guides", params],
    queryFn: () => fetchGuides(params),
  });
}

