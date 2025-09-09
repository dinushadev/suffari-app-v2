import { useState, useEffect, useCallback } from "react";
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

export function usePaymentIntent(amount: number): UsePaymentIntentResult {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentIntent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiClient("/payments/intent", {
        method: "POST",
        body: { amount, currency: 'usd' },
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
  }, [amount]);

  useEffect(() => {
    if (amount > 0) {
      fetchPaymentIntent();
    }
  }, [amount, fetchPaymentIntent]); // Add fetchPaymentIntent to the dependency array

  return { clientSecret, loading, error, setError, fetchPaymentIntent }; // Return setError
} 