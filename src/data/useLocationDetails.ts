import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./apiConfig";
import type { Location } from "./useLocations";

const fetchLocationDetails = async (id: string): Promise<Location> => {
  const res = await fetch(`${API_BASE_URL}/locations/${id}`);
  if (!res.ok) throw new Error("Failed to fetch location details");
  return res.json();
};

export function useLocationDetails(id: string) {
  return useQuery<Location>({
    queryKey: ["location", id],
    queryFn: () => fetchLocationDetails(id),
    enabled: !!id,
  });
}