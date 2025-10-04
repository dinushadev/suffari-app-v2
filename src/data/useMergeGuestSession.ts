import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from "@/data/apiClient"; // Import apiClient

interface MergeGuestSessionPayload {
  userId: string;
  email: string | null | undefined;
  fullName: string | null | undefined;
  sessionId: string;
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
    },
    // apiClient automatically adds Authorization header if session is present.
    // However, if we need to explicitly pass it, we can modify apiClient or
    // ensure that the /api/superbase/customer-signup endpoint handles it.
    // For now, apiClient should handle it as it fetches the session internally.
    baseUrl: "" // Use relative path for Next.js API routes
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
