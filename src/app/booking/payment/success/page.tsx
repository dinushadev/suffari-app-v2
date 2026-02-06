"use client";
import React from "react";
import Link from "next/link";
import { Button } from "../../../../components/atoms";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircleIcon,
  PhoneIcon,
  CalendarIcon,
  MapPinIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/outline";
import { Suspense } from "react";
import { FullScreenLoader } from "../../../../components/atoms";
import { useBookingDetails } from "../../../../data/useBookingDetails";
import { getCurrencyFromResourceType, getDefaultCurrency } from "../../../../lib/currencyUtils";

function PaymentSuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = searchParams.get("bookingId") || "";
  const {
    data: bookingDetails,
    isLoading,
    isError,
  } = useBookingDetails(bookingId);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading booking details...
      </div>
    );
  }

  if (isError || !bookingDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 dark:text-red-400">
        Error loading booking details or booking not found.
      </div>
    );
  }

  const { schedule, pickupLocation, group, paymentAmount, resourceType } =
    bookingDetails;

  // Extract currency from booking resourceType
  const currency = getCurrencyFromResourceType(resourceType) || getDefaultCurrency();

  // Directly use data from bookingDetails
  const vehicle = bookingDetails.resourceType.name;
  const date = schedule.date;
  const timeSlot = schedule.timeSlot;
  const fromGate = pickupLocation && pickupLocation.address === "Park Gate"; // Adjust based on actual pickupLocation structure
  const pickup = pickupLocation || {};

  // Determine the resource label and booking type based on category
  const isSafariBooking = bookingDetails.resourceType.category === 'safari_vehicles' || !bookingDetails.resourceType.category;
  const resourceLabel = isSafariBooking ? 'Vehicle' : 'Guide';
  const bookingType = isSafariBooking ? 'safari' : 'guide';
  const experienceType = isSafariBooking ? 'safari experience' : 'guide tour';
  const partnerType = isSafariBooking ? 'safari partner' : 'guide partner';
  const detailsType = isSafariBooking ? 'vehicle details' : 'guide details';
  const confirmationType = isSafariBooking ? 'vehicle confirmation' : 'guide confirmation';
  const contactType = isSafariBooking ? 'driver details' : 'guide details';
  const arrangementType = isSafariBooking ? 'safari arrangement' : 'guide arrangement';
  const sectionTitle = isSafariBooking ? 'Your Safari Details' : 'Your Guide Details';

  // Dummy data for contact info (these are not passed via URL)
  const contactWithin = "20-30 minutes"; // Placeholder - will come from backend later
  const email = bookingDetails.customer.email || "";
  const location = bookingDetails.location.name || "";

  // Get start and end dates for date range display
  const startDate = bookingDetails.startTime || schedule.startDateTime;
  const endDate = bookingDetails.endTime || schedule.endDateTime;

  // Helper to format date and time slot, with support for date ranges
  const formatDateTime = (dateStr: string | undefined, timeSlotStr: string | undefined, startDateStr?: string, endDateStr?: string) => {
    // If we have start and end dates, format as date range
    if (startDateStr && endDateStr) {
      try {
        const start = new Date(startDateStr);
        const end = new Date(endDateStr);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
          const startFormatted = start.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          const endFormatted = end.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          });
          
          // If same date, show single date with time slot
          if (start.toDateString() === end.toDateString()) {
            return `${startFormatted}${timeSlotStr ? ` • ${timeSlotStr}` : ''}`;
          }
          // Otherwise show date range
          return `${startFormatted} - ${endFormatted}`;
        }
      } catch (e) {
        console.error("Error formatting date range:", e);
      }
    }
    
    // Fallback to original date and timeSlot display
    if (!dateStr || !timeSlotStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString()} • ${timeSlotStr}`;
    } catch (e) {
      console.error("Error formatting date time:", e);
      return `${dateStr} • ${timeSlotStr}`;
    }
  };

  const dateTime = formatDateTime(date, timeSlot, startDate, endDate);

  // Calculate estimated contact time: 30 minutes from now
  function getEstimatedContactTime() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    return `${hours}:${minutes} ${ampm}`;
  }
  const estimatedContact = getEstimatedContactTime();

  return (
    <div className="min-h-screen flex flex-col items-center bg-background">
      <div className="w-full max-w-lg bg-card rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        <div className="p-4 flex flex-col items-center gap-6">
          {/* Booking Confirmed */}
          <div className="flex flex-col items-center gap-2">
            <CheckCircleIcon className="h-12 w-12 text-green-600 dark:text-green-400" />
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              Booking placed!
            </div>
            <div className="text-base text-foreground font-medium">
              Booking ID: <span className="font-mono">{bookingDetails.id}</span>
            </div>
            <div className="text-center mt-2">
              Your booking is placed &amp; locked in our system
              <br />
              We&apos;ve successfully reserved your {experienceType}. Our local{" "}
              {partnerType} will contact you shortly to finalize the details and
              confirm your adventure.
            </div>
          </div>

          {/* Expected Host Contact */}
          <div className="w-full bg-green-50 dark:bg-green-950/30 rounded-xl p-4 flex flex-col gap-1 border border-green-100 dark:border-green-900/50">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-semibold">
              <PhoneIcon className="h-5 w-5" /> Expected Host Contact
            </div>
            <div className="text-sm text-foreground">
              Estimated contact time:{" "}
              <span className="font-semibold">{estimatedContact}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Your dedicated host will reach out within{" "}
              <span className="font-semibold">{contactWithin}</span> to confirm{" "}
              {detailsType} and provide final instructions for your {bookingType} booking.
            </div>
          </div>

          {/* Email Confirmation Sent */}
          <div className="w-full bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 flex flex-col gap-1 border border-blue-100 dark:border-blue-900/50">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-semibold">
              <EnvelopeIcon className="h-5 w-5" /> Email Confirmation Sent
            </div>
            <div className="text-sm text-foreground">
              A detailed confirmation email has been sent to{" "}
              <span className="font-semibold">{email}</span> with your booking
              details and contact information.
            </div>
          </div>

          {/* Payment Protection */}
          {/* <div className="w-full bg-yellow-50 rounded-xl p-4 flex flex-col gap-1 border border-yellow-100">
            <div className="flex items-center gap-2 text-yellow-700 font-semibold">
              <ShieldCheckIcon className="h-5 w-5" /> Payment Protection
            </div>
            <div className="text-sm text-gray-700">
              You won&apos;t be charged until you confirm the vehicle with your
              host. This ensures you&apos;re completely satisfied with your
              safari arrangement before any payment is processed.
            </div>
          </div> */}

          {/* Booking Details */}
          <div className="w-full bg-card rounded-xl p-4 flex flex-col gap-3 border border-border">
            <div className="text-sm font-semibold text-card-foreground mb-1">
              {sectionTitle}
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <MapPinIcon className="h-5 w-5" />{" "}
              <span className="font-medium">Location:</span> <span className="font-light">{location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <CalendarIcon className="h-5 w-5" />{" "}
              <span className="font-medium">Date & Time:</span> <span className="font-light">{dateTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <EnvelopeIcon className="h-5 w-5" />{" "}
              <span className="font-medium">Email:</span> <span className="font-light">{email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <PhoneIcon className="h-5 w-5" />{" "}
              <span className="font-medium">Pickup:</span>{" "}
              <span className="font-light">{fromGate ? "Pickup from park gate" : pickup.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span className="inline-block">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 17.25V19a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 19v-1.75M6.75 17.25v-2.625c0-.621.504-1.125 1.125-1.125h7.25c.621 0 1.125.504 1.125 1.125v2.625M6.75 17.25h10.5M9 10.5V7.875A3.375 3.375 0 0112.375 4.5h.25A3.375 3.375 0 0116 7.875V10.5"
                  />
                </svg>
              </span>
              <span className="font-medium">{resourceLabel}:</span> <span className="font-light">{vehicle}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <span className="inline-block">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4.5 17.25V19a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 19v-1.75M6.75 17.25v-2.625c0-.621.504-1.125 1.125-1.125h7.25c.621 0 1.125.504 1.125 1.125v2.625M6.75 17.25h10.5M9 10.5V7.875A3.375 3.375 0 0112.375 4.5h.25A3.375 3.375 0 0116 7.875V10.5"
                  />
                </svg>
              </span>
              <span className="font-medium">Total Passengers:</span>{" "}
              <span className="font-light">{group.adults + group.children}</span>
            </div>
          </div>

          {/* Payment Details */}
          <div className="w-full bg-card rounded-xl p-4 flex flex-col gap-3 border border-border">
            <div className="text-lg font-semibold text-card-foreground mb-1">
              Payment Details
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-foreground">Total Amount Paid:</span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">
                {currency} {paymentAmount}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border last:border-b-0">
              <span className="text-foreground">Payment Status:</span>
              <span className="font-bold text-lg text-green-600 dark:text-green-400">Paid</span>
            </div>
          </div>

          {/* What Happens Next */}
          <div className="w-full bg-muted/30 rounded-xl p-4 flex flex-col gap-2 border border-border">
            <div className="text-lg font-semibold text-card-foreground mb-1">
              What Happens Next?
            </div>
            <ul className="list-disc pl-5 text-foreground text-sm flex flex-col gap-1">
              <li>
                Your local {partnerType} will contact you within{" "}
                {contactWithin}
              </li>
              <li>Confirm {detailsType} and pickup arrangements</li>
              <li>Receive your confirmation code and {contactType}</li>
              <li>Complete payment only after {confirmationType}</li>
              <li>Enjoy your responsible wildlife adventure!</li>
            </ul>
          </div>

          <Link
            href={`/review?order_id=${encodeURIComponent(bookingId)}&return=${encodeURIComponent(`/booking/payment/success?bookingId=${bookingId}`)}`}
            className="mt-4 w-full inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-3 font-semibold hover:bg-primary/90 transition"
          >
            Write a review
          </Link>
          <Button
            className="mt-4 w-full"
            variant="primary"
            onClick={() => router.push("/")}
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background p-4">
      {/* <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 drop-shadow-sm text-center">
        RAAHI
      </h1> */}
 
      <div className="flex flex-grow w-full items-center justify-center">
        <Suspense fallback={<FullScreenLoader />}>
          <PaymentSuccessPageContent />
        </Suspense>
      </div>
    </main>
  );
}
