import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/data/apiClient"; // Import apiClient

interface MergeGuestSessionPayload {
  userId: string;
  email: string | null | undefined;
  fullName: string | null | undefined;
  sessionId: string | null;
}

interface MergeGuestSessionResponse {
  success: boolean;
  message?: string; // Optional message from the API
}

const mergeGuestSession = async (payload: MergeGuestSessionPayload) => {
  const { userId, email, fullName, sessionId } = payload;
  
  // Use apiClient instead of fetch
  const response = await apiClient<MergeGuestSessionResponse>('/superbase/customer-signup', {
    method: 'POST',
    body: {
      userId,
      email,
      name: fullName,
      sessionId
    }
    // apiClient automatically adds Authorization header if session is present.
    // Uses API_BASE_URL from apiConfig to call backend at http://localhost:3003/api/superbase/customer-signup
  });

  return response;
};

export const useMergeGuestSession = () => {
  const queryClient = useQueryClient();
  return useMutation<MergeGuestSessionResponse, Error, MergeGuestSessionPayload>({
    mutationFn: mergeGuestSession,
    onSuccess: () => {
      // Optionally invalidate queries or perform other actions on success
      queryClient.invalidateQueries({ queryKey: ['userBookings'] }); // Example
    },
  });
};
