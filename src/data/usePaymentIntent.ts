import { useMutation } from "@tanstack/react-query";
import { apiClient } from "./apiClient";

interface PaymentIntentResponse {
  clientSecret: string;
}

interface PaymentIntentRequestParams {
  amount: number;
  bookingId: string;
  resourceTypeId: string;
}

const fetchPaymentIntent = async (params: PaymentIntentRequestParams): Promise<PaymentIntentResponse> => {
  // Use Next.js API route directly (not external API)
  const data = await apiClient<PaymentIntentResponse>("/api/payment-intent", {
    method: "POST",
    body: { amount: params.amount, currency: 'usd', bookingId: params.bookingId, resourceTypeId: params.resourceTypeId },
    baseUrl: typeof window !== 'undefined' ? window.location.origin : '', // Use current origin for Next.js API routes
  });

  if (!data.clientSecret) {
    throw new Error("Invalid response from payment service");
  }
  return data;
};

export function usePaymentIntent() {
  return useMutation<PaymentIntentResponse, Error, PaymentIntentRequestParams>({ 
    mutationFn: fetchPaymentIntent,
    retry: false,
  });
} 