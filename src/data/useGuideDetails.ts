import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./apiConfig";
import { normalizeLanguages } from "@/lib/utils";
import type { Guide } from "@/types/guide";

const fetchGuideDetails = async (id: string): Promise<Guide> => {
  const res = await fetch(`${API_BASE_URL}/resources/guide/${id}`);
  if (!res.ok) throw new Error("Failed to fetch guide details");
  const guide = await res.json();
  
  // Normalize languages from CSV to array
  // Also normalize resourceTypeId - API might return it as resource_type_id (snake_case)
  const normalizedGuide = {
    ...guide,
    speaking_languages: normalizeLanguages(guide.speaking_languages),
    // Ensure resourceTypeId is always available, check both camelCase and snake_case
    resourceTypeId: guide.resourceTypeId || guide.resource_type_id || guide.resourceType?.id || "",
  };
  
  return normalizedGuide;
};

export function useGuideDetails(guideId: string) {
  return useQuery<Guide>({
    queryKey: ["guideDetails", guideId],
    queryFn: () => fetchGuideDetails(guideId),
    enabled: !!guideId, // Only run the query if guideId is available
  });
}


