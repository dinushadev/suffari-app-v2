import { useQuery } from '@tanstack/react-query';
import { apiClient } from './apiClient';

interface Booking {
  id: string;
  resourceName: string;
  locationName: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'past' | 'canceled';
  // Add other relevant booking fields
}

interface GetBookingsResponse {
  bookings: Booking[];
}

const fetchBookings = async (userId: string): Promise<GetBookingsResponse> => {
  const response = await apiClient<GetBookingsResponse>(`/bookings?userId=${userId}`, { method: "GET" });
  return response;
};

export const useBookings = (userId: string, isEnabled: boolean) => {
  return useQuery<GetBookingsResponse, Error>({
    queryKey: ['bookings', userId],
    queryFn: () => fetchBookings(userId),
    enabled: !!userId && isEnabled, // Only fetch if userId is available and isEnabled is true
  });
};
