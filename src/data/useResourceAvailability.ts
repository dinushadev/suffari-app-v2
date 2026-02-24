import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

/** Single slot returned by the availability API */
export interface AvailabilitySlot {
  startDateTime: string;
  endDateTime: string;
  available: boolean;
}

/** Backend returns an array of slots for the requested date range */
export type ResourceAvailabilityResponse = AvailabilitySlot[];

function isDateRangeValid(startDate: string, endDate: string): boolean {
  if (!startDate || !endDate) return false;
  const start = new Date(startDate);
  const end = new Date(endDate);
  return !Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end >= start;
}

async function fetchResourceAvailability(
  resourceId: string,
  startDate: string,
  endDate: string
): Promise<ResourceAvailabilityResponse> {
  const params = new URLSearchParams({ from: startDate, to: endDate });
  return apiClient<ResourceAvailabilityResponse>(
    `/resources/${resourceId}/availability?${params.toString()}`
  );
}

/** Derive availability: true if at least one slot in the range is available */
function deriveAvailable(slots: ResourceAvailabilityResponse | undefined): boolean | null {
  if (slots === undefined) return null;
  if (!Array.isArray(slots) || slots.length === 0) return false;
  return slots.some((slot) => slot.available === true);
}

export function useResourceAvailability(
  resourceId: string,
  startDate: string,
  endDate: string
) {
  const dateRangeValid = isDateRangeValid(startDate, endDate);
  const query = useQuery({
    queryKey: ["resourceAvailability", resourceId, startDate, endDate],
    queryFn: () => fetchResourceAvailability(resourceId, startDate, endDate),
    enabled: !!resourceId && !!startDate && !!endDate && dateRangeValid,
  });

  return {
    ...query,
    isAvailable: deriveAvailable(query.data),
  };
}
