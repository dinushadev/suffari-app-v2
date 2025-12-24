import { useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "./apiConfig";

export interface VehicleType {
  id: string;
  name: string;
  discription: string; // from API
  imageUrl: string;    // from API
  catogory?: string;   // optional, from API
  price?: number;
  currency?: string;
  displayPriceUsd?: {
    amount: number;
    currency: string;
  };
  featureList?: string[];
  numberOfGuests?: number;
}

const fetchVehicleTypes = async (): Promise<VehicleType[]> => {
  const res = await fetch(
    `${API_BASE_URL}/resources/resource-types?category=safari_vehicles`
  );
  if (!res.ok) throw new Error("Failed to fetch vehicle types");
  return res.json();
};

export function useVehicleTypes(enabled: boolean = true) {
  return useQuery<VehicleType[]>({
    queryKey: ["vehicleTypes"],
    queryFn: fetchVehicleTypes,
    enabled,
  });
}