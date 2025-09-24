import { useQuery } from '@tanstack/react-query';
import { apiClient } from './apiClient';
import { Booking } from '@/types/booking';

interface GetBookingsResponse {
  data: Booking[];
  total: number;
  page: number;
  limit: number;
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
