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
  pickupLocations?: {
    address: string;
    country: string;
    placeId: string;
    coordinate: { lat: number; lng: number };
  }[];
}

const fetchLocations = async (): Promise<Location[]> => {
  const res = await fetch(`${API_BASE_URL}/locations?category=suffari`);
  if (!res.ok) throw new Error("Failed to fetch locations");
  const json = await res.json();
  return json.data;
};

export function useLocations() {
  return useQuery<Location[]>({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });
}