import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export function useCreateBooking() {
  return useMutation({
    mutationFn: (bookingData: any) => apiClient("/bookings", { method: "POST", body: bookingData }),
  });
}