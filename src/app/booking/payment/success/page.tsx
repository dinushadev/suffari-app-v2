"use client";
import React from "react";
import BookingSummary from "../../../../components/molecules/BookingSummary";
import { Button } from "../../../../components/atoms";
import { useRouter, useSearchParams } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const vehicle = searchParams.get("vehicle") || "";
  const date = searchParams.get("date") || "";
  const timeSlot = searchParams.get("timeSlot") || "";
  const fromGate = searchParams.get("fromGate") === "true";
  const pickupRaw = searchParams.get("pickup");
  const pickup = pickupRaw ? JSON.parse(pickupRaw) : {};
  const amount = Number(searchParams.get("amount")) || 0;
  const summary = {
    location: "Selected Location",
    date,
    timeSlot,
    vehicleType: vehicle,
    pickupLocation: fromGate ? { address: "Pickup from park gate" } : pickup,
    paymentAmount: amount,
  };
  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      <div className="w-full max-w-lg bg-ivory rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        <div className="p-6 flex flex-col items-center">
          <div className="text-green-600 text-3xl font-bold mb-4">Payment Successful!</div>
          <div className="mb-6 text-lg text-center">Thank you for your booking. Here is your order summary:</div>
          <BookingSummary
            location={summary.location}
            date={summary.date}
            timeSlot={summary.timeSlot}
            vehicleType={summary.vehicleType}
            pickupLocation={summary.pickupLocation}
            paymentAmount={summary.paymentAmount}
          />
          <Button className="mt-8 w-full" variant="primary" onClick={() => router.push("/")}>Back to Home</Button>
        </div>
      </div>
    </div>
  );
}