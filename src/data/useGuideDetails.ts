import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./apiConfig";
import type { Guide } from "@/types/guide";

const fetchGuideDetails = async (id: string): Promise<Guide> => {
  const res = await fetch(`${API_BASE_URL}/resources/guide/${id}`);
  if (!res.ok) throw new Error("Failed to fetch guide details");
  return res.json();
};

export function useGuideDetails(guideId: string) {
  return useQuery<Guide>({
    queryKey: ["guideDetails", guideId],
    queryFn: () => fetchGuideDetails(guideId),
    enabled: !!guideId, // Only run the query if guideId is available
  });
}

