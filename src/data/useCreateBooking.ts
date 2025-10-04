import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

export interface BookingResponse {
  id: string;
  // Add other properties that are returned after successful booking creation if needed
}

export function useCreateBooking() {
  return useMutation<BookingResponse, Error, BookingPayload>({
    mutationFn: (bookingData) => apiClient<BookingResponse>("/bookings", { method: "POST", body: bookingData }),
  });
}

export interface BookingPayload {
  customer: {
    email?: string | null;
    phone?: string | null;
    sessionId: string;
    name?: string | null;
  };
  resourceTypeId: string;
  resourceId?: string | null;
  resourceOwnerId?: string | null;
  locationId: string;
  schedule: {
    date: string;
    timeSlot: string;
  };
  group: {
    adults: number;
    children: number;
    size: number;
  };
  pickupLocation: {
    placeId: string | null;
    coordinate: { lat: number; lng: number };
    address: string;
    country: string | null;
  };
  paymentAmount: number;
}