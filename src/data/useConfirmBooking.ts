import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export function useConfirmBooking() {
  return useMutation({
    mutationFn: ({bookingId}: {bookingId: string}) => apiClient(`/bookings/${bookingId}/confirm`, { method: "POST" }),
  });
}
