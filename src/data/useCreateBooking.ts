import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export function useCreateBooking() {
  return useMutation({
    mutationFn: (bookingData: unknown) => apiClient("/bookings", { method: "POST", body: bookingData }),
  });
}