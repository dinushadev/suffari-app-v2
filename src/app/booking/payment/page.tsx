"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import BookingSummary from "../../../components/molecules/BookingSummary";
import { Button } from "../../../components/atoms";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, PaymentRequestButtonElement, useStripe } from "@stripe/react-stripe-js";
import { Suspense } from "react";
import Loader from '../../../components/atoms/Loader';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function StripePaymentForm({ loading, error, handleSubmit, amount }: {
  loading: boolean,
  error: string | null,
  handleSubmit: (e: React.FormEvent) => void,
  amount: number,
}) {
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  //const [prButtonReady, setPrButtonReady] = useState(false);

  useEffect(() => {
    if (stripe) {
      const pr = stripe.paymentRequest({
        country: 'US',
        currency: 'usd',
        total: {
          label: 'Safari Booking',
          amount: amount,
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });
      pr.canMakePayment().then(result => {
        if (result) {
          setPaymentRequest(pr);
        }
      });
    }
  }, [stripe, amount]);

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      {paymentRequest && (
        <div className="mb-4">
          <PaymentRequestButtonElement
            options={{
              paymentRequest: paymentRequest,
              style: { paymentRequestButton: { type: 'default', theme: 'dark', height: '44px' } },
            }}
          //  onReady={() => setPrButtonReady(true)}
            onClick={event => {
              // Optionally handle click events
            }}
          />
        </div>
      )}
      <PaymentElement />
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      <Button type="submit" variant="primary" className="w-full text-lg py-3" disabled={loading}>
        {loading ? "Processing..." : "Pay with Card"}
      </Button>
    </form>
  );
}

function StripePaymentWrapper({ amount }: { amount: number }) {
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, currency: 'usd' }), // send currency
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, [amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Stripe logic can be added here if needed
    setLoading(false);
  };

  if (!clientSecret) return <Loader />;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
      <StripePaymentForm loading={loading} error={error} handleSubmit={handleSubmit} amount={amount} />
    </Elements>
  );
}

export default function PaymentPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PaymentPage />
    </Suspense>
  );
}

function PaymentPage() {
  const searchParams = useSearchParams();
  const vehicle = searchParams.get("vehicle") || "";
  const date = searchParams.get("date") || "";
  const timeSlot = searchParams.get("timeSlot") || "";
  const fromGate = searchParams.get("fromGate") === "true";
  const pickupRaw = searchParams.get("pickup");
  const pickup = pickupRaw ? JSON.parse(pickupRaw) : {};
  // TODO: Calculate amount based on booking details
  const amount = 1500; // Example: 1500 cents = $15.00
  const summary = {
    location: "Selected Location",
    date,
    timeSlot,
    vehicleType: vehicle,
    pickupLocation: fromGate ? { address: "Pickup from park gate" } : pickup,
  };
  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      <div className="w-full max-w-lg bg-ivory rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        <div className="p-6">

          <BookingSummary
            location={summary.location}
            date={summary.date}
            timeSlot={summary.timeSlot}
            vehicleType={summary.vehicleType}
            pickupLocation={summary.pickupLocation}
            paymentAmount={amount}
          />
          <StripePaymentWrapper amount={amount} />
        </div>
      </div>
    </div>
  );
}