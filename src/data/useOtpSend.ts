import { useMutation } from '@tanstack/react-query';
import { apiClient } from './apiClient';

interface OtpSendRequest {
  email: string;
}

interface OtpSendResponse {
  success: boolean;
}

/**
 * Custom hook for sending OTP emails
 * @returns Mutation object for sending OTP
 */
export function useOtpSend() {
  return useMutation<OtpSendResponse, Error, OtpSendRequest>({
    mutationFn: (data) => apiClient('api/otp/send', { 
      method: 'POST', 
      body: data,
      baseUrl: window.location.origin 
    }),
  });
}
