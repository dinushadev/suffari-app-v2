import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

interface BookingDetails {
  id: string;
  locationId: string;
  resourceTypeId: string;
  schedule: {
    date: string;
    timeSlot: string;
  };
  group: {
    adults: number;
    children: number;
  };
  pickupLocation: {
    address: string;
    // Add other properties if available in pickupLocation
  };
  // Add any other properties that your UI relies on from the booking object
}

export function useBookingDetails(bookingId: string) {
  return useQuery<BookingDetails, Error>({
    queryKey: ["bookingDetails", bookingId],
    queryFn: () => apiClient<BookingDetails>(`/bookings/${bookingId}`),
    enabled: !!bookingId, // Only run the query if bookingId is available
  });
}
