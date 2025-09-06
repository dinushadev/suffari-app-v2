import { useMutation } from '@tanstack/react-query';
import { supabase } from './apiConfig';
import { apiClient } from './apiClient';
import { User } from '@supabase/supabase-js'; // Import User type

interface OtpVerifyRequest {
  email: string;
  otp: string;
}

interface OtpVerifyResponse {
  access_token: string;
  refresh_token: string;
}

/**
 * Custom hook for verifying OTP and setting up the user session
 * @returns Mutation object for OTP verification
 */
export function useOtpVerify() {
  return useMutation<{ user: User | null }, Error, OtpVerifyRequest>({
    mutationFn: async ({ email, otp }) => {
      // First verify the OTP through our API using apiClient
      const { access_token, refresh_token }: OtpVerifyResponse = await apiClient('api/otp/verify', {
        method: 'POST',
        body: { email, otp },
        baseUrl: window.location.origin
      });

      // Set the session in Supabase client
      const { data, error } = await supabase.auth.setSession({ 
        access_token, 
        refresh_token 
      });

      if (error) {
        throw new Error(error.message || 'Failed to set session');
      }

      // Return the user data
      return { user: data.user };
    },
  });
}
