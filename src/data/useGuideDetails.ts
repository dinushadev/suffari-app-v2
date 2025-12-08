import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./apiConfig";
import { normalizeLanguages } from "@/lib/utils";
import type { Guide } from "@/types/guide";

/**
 * Raw guide data from API before normalization
 */
type RawGuide = Partial<Guide> & {
  speakingLanguages?: string | string[];
  speaking_languages?: string | string[];
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  images?: string[] | null;
  resourceTypeId?: string;
  resource_type_id?: string;
  locationId?: string;
};

const fetchGuideDetails = async (id: string): Promise<Guide> => {
  const res = await fetch(`${API_BASE_URL}/resources/guide/${id}`);
  if (!res.ok) throw new Error("Failed to fetch guide details");
  const guide: RawGuide = await res.json();
  
  // Normalize speakingLanguages (prefer camelCase, fallback to snake_case)
  const speakingLanguages = normalizeLanguages(
    guide.speakingLanguages || guide.speaking_languages || []
  );

  // Normalize timestamps (prefer camelCase, fallback to snake_case)
  const createdAt = guide.createdAt || guide.created_at || "";
  const updatedAt = guide.updatedAt || guide.updated_at || "";

  // Normalize images (ensure it's an array or null)
  const images = guide.images === undefined ? null : guide.images;

  // Ensure resourceTypeId is always available
  const resourceTypeId = guide.resourceTypeId || guide.resource_type_id || guide.resourceType?.id || "";

  // Get locationId from guide object
  const locationId = guide.locationId || undefined;

  const normalizedGuide: Guide = {
    ...guide,
    speakingLanguages,
    createdAt,
    updatedAt,
    images,
    resourceTypeId,
    locationId,
    // Keep legacy fields for backward compatibility
    speaking_languages: speakingLanguages,
    created_at: createdAt,
    updated_at: updatedAt,
  } as Guide;
  
  return normalizedGuide;
};

export function useGuideDetails(guideId: string) {
  return useQuery<Guide>({
    queryKey: ["guideDetails", guideId],
    queryFn: () => fetchGuideDetails(guideId),
    enabled: !!guideId, // Only run the query if guideId is available
  });
}


