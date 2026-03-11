import { useQuery } from "@tanstack/react-query";

const CONFIG_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3004";

export interface ConfigLocation {
  id: string;
  name: string;
  currency: string;
  currencySymbol: string;
}

export interface ConfigTimeSlot {
  id: string;
  label: string;
  value: string;
  timeRange: string;
  description: string;
  icon: string;
  sortOrder: number;
}

export interface ConfigVehicleCapacity {
  min: number;
  max: number;
  recommended: number;
}

export interface ConfigVehicle {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  capacity: ConfigVehicleCapacity;
  featureList: string[];
  sortOrder: number;
}

export interface PricingAmount {
  amount: number;
  currency: string;
  symbol: string;
  formatted: string;
}

export interface PricingEntry {
  id: string;
  locationId: string;
  vehicleId: string;
  timeSlotId: string;
  pricing: {
    local: PricingAmount;
    usd: PricingAmount;
  };
  perVehicle: boolean;
  isAvailable: boolean;
  metadata: {
    lastUpdated: string;
    notes: string;
  };
}

export interface BookingConfig {
  location: ConfigLocation;
  timeSlots: ConfigTimeSlot[];
  vehicles: ConfigVehicle[];
  pricingMatrix: PricingEntry[];
  metadata: {
    version: string;
    lastUpdated: string;
    ttl: number;
  };
}

const fetchBookingConfig = async (locationId: string): Promise<BookingConfig> => {
  const res = await fetch(
    `${CONFIG_API_BASE_URL}/config/safari-booking/${locationId}`
  );
  if (!res.ok) throw new Error("Failed to fetch booking config");
  const json = await res.json();
  return json.data as BookingConfig;
};

export function useBookingConfig(locationId: string) {
  return useQuery<BookingConfig>({
    queryKey: ["bookingConfig", locationId],
    queryFn: () => fetchBookingConfig(locationId),
    enabled: !!locationId,
  });
}

/**
 * For a given pricingMatrix vehicleId (e.g. "standard_safari_jeep_yala"),
 * find the best-matching vehicle from the vehicles array using word-overlap
 * between the vehicleId tokens and the vehicle name tokens.
 */
export function findVehicleForPricingId(
  vehicleId: string,
  vehicles: ConfigVehicle[]
): ConfigVehicle | undefined {
  const idTokens = new Set(vehicleId.toLowerCase().split("_"));
  let best: ConfigVehicle | undefined;
  let bestScore = -1;

  for (const v of vehicles) {
    const nameTokens = v.name.toLowerCase().split(/\s+/);
    const score = nameTokens.filter((t) => idTokens.has(t)).length;
    if (score > bestScore) {
      bestScore = score;
      best = v;
    }
  }

  return best;
}
