import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";
import { Booking } from "@/types/booking";



export function useBookingDetails(bookingId: string) {
  return useQuery<Booking, Error>({
    queryKey: ["bookingDetails", bookingId],
    queryFn: () => apiClient<Booking>(`/bookings/${bookingId}`),
    enabled: !!bookingId, // Only run the query if bookingId is available
  });
}
