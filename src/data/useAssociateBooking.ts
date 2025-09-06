import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export function useAssociateBooking() {
  return useMutation({
    mutationFn: ({bookingId, userId}: {bookingId: string, userId: string}) => apiClient(`/bookings/${bookingId}/associate`, { method: "POST", body: {userId} }),
  });
}
