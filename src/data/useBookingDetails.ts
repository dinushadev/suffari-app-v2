import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export function useBookingDetails(bookingId: string) {
  return useQuery({
    queryKey: ["bookingDetails", bookingId],
    queryFn: () => apiClient(`/bookings/${bookingId}`),
    enabled: !!bookingId, // Only run the query if bookingId is available
  });
}
