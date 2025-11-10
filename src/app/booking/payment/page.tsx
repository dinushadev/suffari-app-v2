"use client";
import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BookingSummary from "../../../components/molecules/BookingSummary";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  PaymentRequestButtonElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Suspense } from "react";
import { FullScreenLoader, Loader } from "../../../components/atoms";
import type { PaymentRequest as StripePaymentRequest } from "@stripe/stripe-js";
import { usePaymentIntent } from "../../../data/usePaymentIntent"; // Import the new hook
import { Session } from "@supabase/supabase-js"; // Import Session type
import { useBookingStatus } from "../../../data/useBookingStatus"; // Import the new hook
import { supabase } from "../../../data/apiConfig"; // Re-add supabase import
import { useLocationDetails } from "@/data/useLocationDetails";
import { useBookingDetails } from "@/data/useBookingDetails";
import { ButtonV2, ErrorDisplay } from '../../../components/atoms';

// Validate Stripe publishable key
if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
  throw new Error(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not configured in environment variables"
  );
}

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

function StripePaymentForm({
  amount,
  error,
}: {
  amount: number;
  error: Error | null;
  locationName: string;
  userEmail: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("orderId") || "";

  const [paymentRequest, setPaymentRequest] =
    useState<StripePaymentRequest | null>(null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false); // New state for button loading
  const [hasConfirmedPaymentIntent, setHasConfirmedPaymentIntent] =
    useState(false); // New state variable

  useEffect(() => {
    if (stripe) {
      // Stripe expects amounts in the smallest currency unit (cents for USD)
      // Convert dollars to cents by multiplying by 100
      const amountInCents = Math.round(amount * 100);
      
      const pr = stripe.paymentRequest({
        country: "US",
        currency: "usd",
        total: {
          label: "RAAHI Booking",
          amount: amountInCents, // Amount in cents
        },
        requestPayerName: true,
        requestPayerEmail: true,
      });
      pr.canMakePayment().then((result) => {
        if (result) {
          setPaymentRequest(pr);
        }
      });
    }
  }, [stripe, amount]);

  const [isPolling, setIsPolling] = useState(false);
  const { data: bookingStatus } =
    useBookingStatus(bookingId, isPolling);

  useEffect(() => {
    if (bookingStatus && bookingStatus.status === "confirmed") {
      const params = new URLSearchParams({
        bookingId,
      });
      router.push(`/booking/payment/success?${params.toString()}`);
    }
  }, [bookingStatus, router, bookingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingPayment(true); // Start loading immediately on click
    if (!stripe || !elements) {
      setIsSubmittingPayment(false); // Stop loading if Stripe not loaded
      return;
    }
    let paymentSucceeded = false;
    if (process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true") {
      if (hasConfirmedPaymentIntent) {
        // Prevent re-confirming if already confirmed
        paymentSucceeded = true; // Assume succeeded if already confirmed
      } else {
        const { error: stripeError, paymentIntent } =
          await stripe.confirmPayment({
            elements,
            confirmParams: {},
            redirect: "if_required",
          });
        if (stripeError) {
          setIsSubmittingPayment(false); // Stop loading on payment error
          return;
        }
        if (paymentIntent && paymentIntent.status === "succeeded") {
          paymentSucceeded = true;
          setHasConfirmedPaymentIntent(true); // Mark as confirmed
        }
      }
    } else {
      paymentSucceeded = true;
    }

    if (paymentSucceeded) {
      try {
        setIsPolling(true); // Start polling after successful payment
      } catch {
        // Error handling for polling initiation if needed
      } finally {
        setIsSubmittingPayment(false); // Stop loading after payment processing
      }
    } else {
      setIsSubmittingPayment(false); // Stop loading if payment didn't succeed for other reasons
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      {isSubmittingPayment && <FullScreenLoader />}
      {paymentRequest && (
        <div className="mb-4">
          <PaymentRequestButtonElement
            options={{
              paymentRequest: paymentRequest,
              style: {
                paymentRequestButton: {
                  type: "default",
                  theme: "dark",
                  height: "44px",
                },
              },
            }}
          />
        </div>
      )}
      <PaymentElement />
      {error && (
        <div className="text-red-500 text-sm mt-2">{error.message}</div>
      )}

      <div className="mt-4">
        <ButtonV2
          type="submit"
          variant="primary"
          className="w-full text-lg py-3"
          disabled={isSubmittingPayment || hasConfirmedPaymentIntent}
          loading={isSubmittingPayment}
        >
          Pay with Card
        </ButtonV2>
      </div>
    </form>
  );
}

function StripePaymentWrapper({
  amount,
  locationName,
  userEmail,
  bookingId,
  resourceTypeId,
}: {
  amount: number;
  locationName: string;
  userEmail: string;
  bookingId: string;
  resourceTypeId: string;
}) {
  const {
    mutateAsync,
    isPending: isCreatingPaymentIntent,
    data,
    error,
    reset,
  } = usePaymentIntent();
  const clientSecret = data?.clientSecret;

  useEffect(() => {
    const createIntent = async () => {
      if (
        amount >= 1 &&
        bookingId &&
        resourceTypeId &&
        !clientSecret &&
        !isCreatingPaymentIntent
      ) {
        try {
          await mutateAsync({ amount, bookingId, resourceTypeId });
          // setPaymentIntentError(null); // Clear error on success - REMOVED
        } catch (err) {
          console.error("Failed to create payment intent", err);
          // setPaymentIntentError("Failed to set up payment. Please try again or contact support."); // REMOVED
        }
      }
    };
    createIntent();
  }, [
    amount,
    bookingId,
    resourceTypeId,
    clientSecret,
    isCreatingPaymentIntent,
    mutateAsync,
  ]);

  const handleTryAgain = () => {
    reset(); // Reset the mutation state, clearing any errors
    mutateAsync({ amount, bookingId, resourceTypeId });
  };

  if (isCreatingPaymentIntent || !clientSecret) {
    return (
      <div className="mt-8 p-6">
        <div className="flex flex-col items-center justify-center py-8">
          <Loader />
          <p className="mt-4 text-sm text-muted-foreground text-center">
            Setting up payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4">
          <ErrorDisplay 
            error={error}
            onRetry={handleTryAgain}
            onSignIn={() => {
              // Redirect to auth page
              window.location.href = '/auth';
            }}
          />
        </div>
      )}
      <Elements
        stripe={stripePromise}
        options={{ clientSecret, appearance: { theme: "stripe" } }}
      >
        <StripePaymentForm
          amount={amount}
          error={error}
          locationName={locationName}
          userEmail={userEmail}
        />
      </Elements>
    </>
  );
}

export default function PaymentPageWrapper() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background p-4">
      {/* <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 drop-shadow-sm text-center">RAAHI</h1>
      <p className="text-lg sm:text-xl text-foreground font-medium text-center max-w-xl drop-shadow-sm flex items-center justify-center gap-2">Loading payment page...</p> */}
      <div className="flex flex-grow w-full items-center justify-center">
        <Suspense fallback={<FullScreenLoader />}>
          <PaymentPage />
        </Suspense>
      </div>
    </main>
  );
}

function PaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");
  const router = useRouter();

  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  const {
    data: booking,
    isLoading: bookingLoading,
    error: bookingError,
  } = useBookingDetails(orderId || "");

  useEffect(() => {
    if (!orderId) {
      router.push("/"); // Redirect to home if no orderId
    }
  }, [orderId, router]);

  // Fetch session and user email
  useEffect(() => {
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        // If no session, redirect to auth page with returnUrl
        const currentPath = window.location.pathname + window.location.search;
        router.push(`/auth?returnUrl=${encodeURIComponent(currentPath)}`);
      } else {
        setUserEmail(session.user?.email || null);
        setCurrentSession(session);
      }
    }
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    data: location,
    isLoading: locationLoading,
    error: locationError,
  } = useLocationDetails(booking?.locationId || "");

  if (
    bookingLoading ||
    locationLoading ||
    userEmail === null
  ) {
    return (
      <main className="min-h-screen flex flex-col items-center bg-background p-4">
        <FullScreenLoader />
      </main>
    );
  }
  if (bookingError || locationError || !booking || !location) {
    const error = bookingError || locationError || new Error('Failed to load booking details');
    return (
      <div className="min-h-screen flex flex-col items-center bg-background p-4">
        <div className="w-full max-w-lg">
          <ErrorDisplay 
            error={error}
            onRetry={() => {
              window.location.reload();
            }}
            onSignIn={() => {
              window.location.href = '/auth';
            }}
          />
        </div>
      </div>
    );
  }

  // Use booking.resourceType directly (works for both vehicle and guide bookings)
  if (!booking.resourceType) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-background p-4">
        <div className="w-full max-w-lg">
          <ErrorDisplay 
            error={new Error('Resource type not found. Please try again.')}
            onRetry={() => {
              window.location.reload();
            }}
            onSignIn={() => {
              window.location.href = '/auth';
            }}
          />
        </div>
      </div>
    );
  }

  const groupSizeLabel = `${booking.group.adults} Adult${booking.group.adults !== 1 ? 's' : ''}${booking.group.children > 0 ? `, ${booking.group.children} Child${booking.group.children !== 1 ? 'ren' : ''}` : ''}`;

  // Handle both regular bookings (date/timeSlot) and custom bookings (startDateTime/endDateTime)
  // Regular bookings have schedule.date and schedule.timeSlot
  // Custom bookings might have startTime/endTime or schedule.date might be derived
  const getDateDisplay = () => {
    // First try schedule.date (for regular bookings)
    if (booking.schedule?.date) {
      // Format date consistently (YYYY-MM-DD to readable format)
      try {
        const date = new Date(booking.schedule.date);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
      } catch {
        // If parsing fails, return as-is
        return booking.schedule.date;
      }
      return booking.schedule.date;
    }
    // Fallback to startTime if date is not available (for custom bookings)
    if (booking.startTime) {
      try {
        const date = new Date(booking.startTime);
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
        }
      } catch {
        return booking.startTime;
      }
    }
    return "N/A";
  };

  const getTimeSlotDisplay = () => {
    // First try schedule.timeSlot (for regular bookings like morning, afternoon, etc.)
    if (booking.schedule?.timeSlot) {
      // Capitalize first letter and format
      return booking.schedule.timeSlot
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    // For custom bookings with date range, show the date range in time slot
    if (booking.startTime && booking.endTime) {
      try {
        const startDate = new Date(booking.startTime);
        const endDate = new Date(booking.endTime);
        if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
          const startFormatted = startDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
          });
          const endFormatted = endDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          });
          
          // If same date, show as "Full Day"
          if (startDate.toDateString() === endDate.toDateString()) {
            return "Full Day";
          }
          // Otherwise show date range
          return `${startFormatted} - ${endFormatted}`;
        }
      } catch {
        // If parsing fails, return raw values
        return `${booking.startTime} - ${booking.endTime}`;
      }
    }
    // Fallback for custom bookings without time slot
    return "Custom Booking";
  };

  // Get start and end dates for date range display
  const startDate = booking.startTime || booking.schedule?.startDateTime || undefined;
  const endDate = booking.endTime || booking.schedule?.endDateTime || undefined;

  const summary = {
    location: location.name,
    date: getDateDisplay(),
    timeSlot: getTimeSlotDisplay(),
    vehicleType: booking.resourceType.name, // Use resource type name (works for both vehicle and guide bookings)
    groupType: groupSizeLabel,
    pickupLocation:
      booking.pickupLocation.address === "Pickup from park gate"
        ? { address: "Pickup from park gate" }
        : booking.pickupLocation,
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      <div className="w-full max-w-lg bg-ivory rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        <div>
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-primary mb-2">
              You&apos;re One Click Away!
            </h1>
            <p className="text-foreground/70">
              Confirm your booking details and proceed to payment.
            </p>
          </div>
          <BookingSummary
            location={summary.location}
            date={summary.date}
            timeSlot={summary.timeSlot}
            vehicleType={summary.vehicleType}
            groupType={summary.groupType}
            pickupLocation={summary.pickupLocation}
            paymentAmount={parseFloat(booking.paymentAmount)}
            resourceCategory={booking.resourceType.category}
            startDate={startDate}
            endDate={endDate}
          />
          {process.env.NEXT_PUBLIC_ENABLE_PAYMENTS === "true" ? (
            <StripePaymentWrapper
              amount={parseFloat(booking.paymentAmount)}
              locationName={location.name}
              bookingId={booking.id}
              userEmail={userEmail || ""}
              resourceTypeId={booking.resourceTypeId}
            />
          ) : (
            <DirectBookingConfirmation
              booking={booking}
              amount={parseFloat(booking.paymentAmount)}
              currentSession={currentSession}
              locationName={location.name}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DirectBookingConfirmation({
  booking,
  amount,
  currentSession,
  locationName,
}: {
  booking: { id: string; locationId: string }; // Add locationId to the booking type
  amount: number;
  currentSession: Session | null;
  locationName: string;
}) {
  const router = useRouter();
  // const confirmBooking = useConfirmBooking(); // Removed direct call
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const bookingId = booking.id; // Get bookingId from the booking object

  const { data: bookingStatus } =
    useBookingStatus(bookingId, isPolling);

  useEffect(() => {
    if (bookingStatus && bookingStatus.status === "confirmed") {
      const params = new URLSearchParams({
        bookingId,
        amount: amount.toString(),
        location: locationName,
        email: currentSession?.user?.email || "",
      });
      router.push(`/booking/payment/success?${params.toString()}`);
    }
  }, [bookingStatus, router, bookingId, amount, locationName, currentSession?.user?.email]);

  const handleConfirm = async () => {
    setLoading(true);
    setError(null);
    try {
      // await confirmBooking.mutateAsync({bookingId}); // Removed direct call
      // Instead of confirming directly, we simulate a backend update and poll
      setIsPolling(true); // Start polling for status
    } catch (err) {
      setError((err as Error).message || "Confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {loading && (

          <FullScreenLoader />
      
      )}
      {error && (
        <div className="mb-4">
          <ErrorDisplay 
            error={error}
            onRetry={() => {
              setError(null);
              handleConfirm();
            }}
            onSignIn={() => {
              window.location.href = '/auth';
            }}
          />
        </div>
      )}
      <ButtonV2 
        onClick={handleConfirm} 
        variant="primary" 
        className="w-full text-lg py-3" 
        disabled={loading}
        loading={loading}
      >
        Confirm Booking (Payment Disabled)
      </ButtonV2>
    </div>
  );
}
