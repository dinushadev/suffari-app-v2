import { useQuery } from '@tanstack/react-query';
import {apiClient} from './apiClient';

interface BookingStatusResponse {
  status: string;
}

export const useBookingStatus = (bookingId: string, enabled: boolean) => {
  return useQuery<BookingStatusResponse, Error>({
    queryKey: ['bookingStatus', bookingId],
    queryFn: () => apiClient<BookingStatusResponse>(`/bookings/${bookingId}/status`),
    refetchInterval: 3000, // Poll every 3 seconds
    enabled: enabled && !!bookingId, // Only run if enabled and bookingId is present
  });
};
