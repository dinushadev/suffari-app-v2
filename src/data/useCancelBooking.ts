import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

interface CancelBookingPayload {
  bookingId: string;
  reason: string;
}

export function useCancelBooking() {
  return useMutation({
    mutationFn: ({ bookingId, reason }: CancelBookingPayload) =>
      apiClient(`/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        body: JSON.stringify({ reason }),
      }),
  });
}
