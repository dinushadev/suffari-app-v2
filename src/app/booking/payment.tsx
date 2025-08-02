"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BookingSummary from "../../components/molecules/BookingSummary";
import { Button } from "../../components/atoms";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function StripePaymentForm({ amount }: { amount: number }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!stripe || !elements) return;
    const { error: submitError } = await elements.submit();
    if (submitError) {
      setError(submitError.message || "");
      setLoading(false);
      return;
    }
    const { error: paymentError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/booking/success",
      },
      redirect: "if_required",
    });
    if (paymentError) setError(paymentError.message || "");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      {/* Show the amount to pay */}
      <div className="mb-4 text-lg font-semibold text-center">
        Amount to pay: ${(amount / 100).toFixed(2)}
      </div>
      <PaymentElement />
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <Button type="submit" variant="primary" className="w-full text-lg py-3" disabled={loading}>
        {loading ? "Processing..." : "Pay with Card"}
      </Button>
    </form>
  );
}

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const vehicle = searchParams.get("vehicle") || "";
  const date = searchParams.get("date") || "";
  const timeSlot = searchParams.get("timeSlot") || "";
  const fromGate = searchParams.get("fromGate") === "true";
  const pickup = JSON.parse(searchParams.get("pickup") || "{}" );
  // TODO: Calculate amount based on booking details
  const amount = 1500; // Example: 1500 cents = $15.00
  const summary = {
    location: "Selected Location",
    date,
    timeSlot,
    vehicleType: vehicle,
    pickupLocation: fromGate ? { address: "Pickup from park gate" } : pickup,
  };
  const [clientSecret, setClientSecret] = useState("");
  useEffect(() => {
    fetch("/api/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount]);
  if (!clientSecret) return <div>Loading payment form...</div>;
  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      <div className="w-full max-w-lg bg-ivory rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        <div className="p-6">
          <h2 className="font-bold text-lg mb-4 text-orange">Booking Summary</h2>
          <BookingSummary
            location={summary.location}
            date={summary.date}
            timeSlot={summary.timeSlot}
            vehicleType={summary.vehicleType}
            pickupLocation={summary.pickupLocation}
          />
          <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
            <StripePaymentForm amount={amount} />
          </Elements>
        </div>
      </div>
    </div>
  );
}