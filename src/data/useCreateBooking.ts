import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export interface BookingResponse {
  id: string;
  // Add other properties that are returned after successful booking creation if needed
}

export function useCreateBooking() {
  return useMutation<BookingResponse, Error, unknown>({
    mutationFn: (bookingData: unknown) => apiClient<BookingResponse>("/bookings", { method: "POST", body: bookingData }),
  });
}