import { useState, useEffect, useCallback, useRef } from "react";
import { apiClient } from "./apiClient";

interface PaymentIntentResponse {
  clientSecret: string;
}

interface UsePaymentIntentResult {
  clientSecret: string;
  loading: boolean;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>; // Add setError to the interface
  fetchPaymentIntent: () => Promise<void>;
}

export function usePaymentIntent(amount: number, bookingId?: string, resourceTypeId?: string): UsePaymentIntentResult {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchedIntentRef = useRef<{ amount: number; bookingId?: string; resourceTypeId?: string } | null>(null);

  const fetchPaymentIntent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient("/payments/intent", {
        method: "POST",
        body: { amount, currency: 'usd', bookingId },
      }) as PaymentIntentResponse;
      
      if (!data.clientSecret) {
        throw new Error("Invalid response from payment service");
      }
      
      setClientSecret(data.clientSecret);
    } catch (err) {
      console.error("Payment intent creation failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(`Failed to create payment intent: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [amount, bookingId, resourceTypeId]);

  useEffect(() => {
    if (amount >= 100 && bookingId && resourceTypeId ) {
      fetchPaymentIntent();
      fetchedIntentRef.current = { amount, bookingId, resourceTypeId };
    }
  }, [amount, bookingId, resourceTypeId, fetchPaymentIntent]);

  return { clientSecret, loading, error, setError, fetchPaymentIntent };
} 