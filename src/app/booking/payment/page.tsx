"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BookingSummary from "../../../components/molecules/BookingSummary";
import { Button } from "../../../components/atoms";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, PaymentRequestButtonElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Suspense } from "react";
import Loader from '../../../components/atoms/Loader';
import type { PaymentRequest as StripePaymentRequest } from "@stripe/stripe-js";
import { useCreateBooking } from "../../../data/useCreateBooking";
import { useConfirmBooking } from "../../../data/useConfirmBooking";
import { useVehicleTypes } from "../../../data/useVehicleTypes";
import { useLocationDetails } from "../../../data/useLocationDetails";

// Validate Stripe publishable key
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured in environment variables");
}

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

function StripePaymentForm({ loading, setLoading, error, setError, amount }: {
  loading: boolean,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  error: string | null,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  amount: number,
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicle = searchParams.get("vehicle") || "";
  const date = searchParams.get("date") || "";
  const timeSlot = searchParams.get("timeSlot") || "";
  const fromGate = searchParams.get("fromGate") === "true";
  const pickupRaw = searchParams.get("pickup");
  const pickup = pickupRaw ? JSON.parse(pickupRaw) : {};
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);
  const bookingId = searchParams.get("bookingId") || "";

  const [paymentRequest, setPaymentRequest] = useState<StripePaymentRequest | null>(null);
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

  const confirmBooking = useConfirmBooking();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!stripe || !elements) {
      setError("Stripe has not loaded yet.");
      setLoading(false);
      return;
    }
    let paymentSucceeded = false;
    if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true') {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {},
        redirect: "if_required",
      });
      if (error) {
        setError(error.message || "Payment failed");
        setLoading(false);
        return;
      }
      paymentSucceeded = !!(paymentIntent && paymentIntent.status === "succeeded");
    } else {
      paymentSucceeded = true;
    }
    if (paymentSucceeded) {
      try {
        await confirmBooking.mutateAsync({bookingId});
        const params = new URLSearchParams({
          vehicle,
          date,
          timeSlot,
          fromGate: fromGate ? "true" : "false",
          pickup: JSON.stringify(pickup),
          amount: amount.toString(),
        });
        router.push(`/booking/payment/success?${params.toString()}`);
      } catch (err) {
        setError((err as Error).message || "Confirmation failed");
      }
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      {paymentRequest && (
        <div className="mb-4">
          <PaymentRequestButtonElement
            options={{
              paymentRequest: paymentRequest,
              style: { paymentRequestButton:  { type: 'default', theme: 'dark', height: '44px' } },
            }}
          //  onReady={() => setPrButtonReady(true)}
            // onClick={event => {
            //   // Optionally handle click events
            // }}
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

  const fetchPaymentIntent = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, currency: 'usd' }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      
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
  };

  useEffect(() => {
    fetchPaymentIntent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount]);

  const handleTryAgain = () => {
    fetchPaymentIntent();
  };

  if (!clientSecret) return <Loader />;

  return (
    <>
      {error && (
        <div className="mb-4">
          <div className="text-red-500 text-sm mb-2">{error}</div>
          <Button onClick={handleTryAgain} variant="secondary" className="w-full mb-4">Try Again</Button>
        </div>
      )}
      <Elements stripe={stripePromise} options={{ clientSecret, appearance: { theme: "stripe" } }}>
        <StripePaymentForm loading={loading} setLoading={setLoading} error={error} setError={setError} amount={amount} />
      </Elements>
    </>
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
  const adults = parseInt(searchParams.get("adults") || "1", 10);
  const children = parseInt(searchParams.get("children") || "0", 10);
  const totalGuests = adults + children;
  const groupSizeLabel = `${adults} Adult${adults !== 1 ? 's' : ''}${children > 0 ? `, ${children} Child${children !== 1 ? 'ren' : ''}` : ''}`;
  const userId = searchParams.get("userId") || ""; // TODO: Implement proper user ID
  const locationId = searchParams.get("locationId") || "";
  const resourceId = searchParams.get("resourceId") || ""; // TODO: Implement proper resource ID

  const { data: location, isLoading: locationLoading, error: locationError } = useLocationDetails(locationId);

  // Fetch vehicle types
  const { data: vehicleTypes, isLoading: vehicleTypesLoading, error: vehicleTypesError } = useVehicleTypes();

  if (locationLoading || vehicleTypesLoading) return <div>Loading...</div>;
  if (locationError) return <div>Error loading location</div>;
  if (vehicleTypesError) return <div>Error loading vehicle types</div>;
  if (!location) return <div>Location not found</div>;

  // Find the selected vehicle
  const selectedVehicle = vehicleTypes?.find(v => v.id === vehicle);

  // Use its price (convert to cents for Stripe)
  const amount = selectedVehicle?.price ? selectedVehicle.price * 100 : 0;

  if (!selectedVehicle) return <div>Vehicle not found</div>;

  const summary = {
    location: location.name,
    date,
    timeSlot,
    vehicleType: vehicle,
    groupType: groupSizeLabel,
    pickupLocation: fromGate ? { address: "Pickup from park gate" } : pickup,
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      <div className="w-full max-w-lg bg-ivory rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        <div className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">You're One Click Away!</h1>
            <p className="text-gray-600">Complete your payment to secure your safari adventure</p>
          </div>
          <BookingSummary
            location={summary.location}
            date={summary.date}
            timeSlot={summary.timeSlot}
            vehicleType={summary.vehicleType}
            groupType={summary.groupType}
            pickupLocation={summary.pickupLocation}
            paymentAmount={amount}
          />
          {process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === 'true' ? (
            <StripePaymentWrapper amount={amount} />
          ) : (
            <DirectBookingConfirmation
              bookingData={{
                userId,
                locationId,
                resourceId,
                date,
                timeSlot,
                adults,
                children,
                pickupLocation: fromGate ? {
                  placeId: "",
                  coordinate: { lat: 0, lng: 0 },
                  address: "Pickup from park gate",
                  country: "",
                } : pickup,
              }}
              vehicle={vehicle}
              fromGate={fromGate}
              pickup={pickup}
              amount={amount}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DirectBookingConfirmation({ bookingData, vehicle, fromGate, pickup, amount }: {
  bookingData: any;
  vehicle: string;
  fromGate: boolean;
  pickup: any;
  amount: number;
}) {
  const router = useRouter();
  const confirmBooking = useConfirmBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || "";

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      await confirmBooking.mutateAsync({bookingId});
      const params = new URLSearchParams({
        vehicle,
        date: bookingData.date,
        timeSlot: bookingData.timeSlot,
        fromGate: fromGate ? "true" : "false",
        pickup: JSON.stringify(pickup),
        amount: amount.toString(),
      });
      router.push(`/booking/payment/success?${params.toString()}`);
    } catch (err) {
      setError((err as Error).message || "Confirmation failed");
    }
    setLoading(false);
  };

  return (
    <div className="mt-8">
      {error && <div className="text-red-500 text-sm mb-4">{error}</div>}
      <Button 
        onClick={handleConfirm} 
        variant="primary" 
        className="w-full text-lg py-3" 
        disabled={loading}
      >
        {loading ? "Processing..." : "Confirm Booking (Payment Disabled)"}
      </Button>
    </div>
  );
}