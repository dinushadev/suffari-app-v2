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
  const data = await apiClient<PaymentIntentResponse>("/payments/intent", {
    method: "POST",
    body: { amount: params.amount, currency: 'usd', bookingId: params.bookingId, resourceTypeId: params.resourceTypeId },
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