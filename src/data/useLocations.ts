import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./apiConfig";

export interface Location {
  id: string;
  name: string;
  address: string;
  description: string;
  price: string;
  rating: number;
  thumbnail: string;
  about: string;
  images: string[];
  facilities: string[];
}

const fetchLocations = async (): Promise<Location[]> => {
  const res = await fetch(`${API_BASE_URL}/locations/`);
  if (!res.ok) throw new Error("Failed to fetch locations");
  return res.json();
};

export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });
}