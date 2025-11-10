"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useBookingDetails } from "@/data/useBookingDetails";
import { useCancelBooking } from "@/data/useCancelBooking";
import { useQueryClient } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { ButtonV2 } from "@/components/atoms";
import Loader from "@/components/atoms/Loader";
import { Booking } from "@/types/booking";
import { formatInTimezone, getTimezoneAbbreviation } from "@/lib/timezoneUtils";

const CancelBookingPage = () => {
  const router = useRouter();
  const params = useParams();
  const bookingId = params.id;
  const [reason, setReason] = useState("");
  const [showOtherReasonInput, setShowOtherReasonInput] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cancellationReasons = [
    "Change of plans",
    "Found another option",
    "Weather conditions",
    "Emergency",
  ];

  const { data: booking, isLoading, isError } = useBookingDetails(bookingId as string);
  const queryClient = useQueryClient();
  const cancelBookingMutation = useCancelBooking();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-red-500">Error loading booking details or booking not found.</p>
        <ButtonV2 onClick={() => router.back()} className="mt-4">Go Back</ButtonV2>
      </div>
    );
  }

  const typedBooking = booking as Booking;

  // Get timezone from booking schedule or default to Asia/Colombo
  const bookingTimezone = typedBooking.schedule?.timezone || 'Asia/Colombo';
  
  // Format dates in the booking's timezone
  const startDate = new Date(typedBooking.startTime);
  const endDate = new Date(typedBooking.endTime);
  const isSameDate = startDate.toDateString() === endDate.toDateString();
  
  // Format date/time display - show date range if different dates
  let formattedDateTime: string;
  if (isSameDate) {
    // Same date: show full start time and end time only
    const formattedStartTime = formatInTimezone(
      typedBooking.startTime,
      bookingTimezone,
      'EEE, MMM d, yyyy h:mm a'
    );
    const formattedEndTime = formatInTimezone(
      typedBooking.endTime,
      bookingTimezone,
      'h:mm a'
    );
    formattedDateTime = `${formattedStartTime} - ${formattedEndTime}`;
  } else {
    // Different dates: show date range
    const formattedStartDate = formatInTimezone(
      typedBooking.startTime,
      bookingTimezone,
      'EEE, MMM d, yyyy'
    );
    const formattedEndDate = formatInTimezone(
      typedBooking.endTime,
      bookingTimezone,
      'EEE, MMM d, yyyy'
    );
    formattedDateTime = `${formattedStartDate} - ${formattedEndDate}`;
  }
  
  // Get timezone abbreviation for display
  const timezoneAbbr = getTimezoneAbbreviation(bookingTimezone, new Date(typedBooking.startTime));

  const handleConfirmCancellation = async () => {
    if (!reason.trim()) {
      alert("Please provide a reason for cancellation.");
      return;
    }

    try {
      await cancelBookingMutation.mutateAsync({ bookingId: bookingId as string, reason });
      setSuccessMessage(`Booking ${bookingId} cancelled successfully!`);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      setTimeout(() => {
        router.push("/booking/history");
      }, 3000); // Redirect after 3 seconds
    } catch (error) {
      console.error("Error cancelling booking:", error);
      setErrorMessage(`Failed to cancel booking ${bookingId}.`);
      // Error will persist until manually dismissed
    }
  };

  return (
    <div className="container mx-auto py-8 px-8 min-h-screen flex flex-col">
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> {successMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      )}
      <div className="flex-grow overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Confirm Cancellation</h1>
        <p className="text-lg text-gray-700 mb-6">Please review your booking details before confirming cancellation.</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">{typedBooking.resourceType?.name || 'N/A'} at {typedBooking.location?.name || 'N/A'}</CardTitle>
            <CardDescription className="text-sm text-gray-600">
              <p className="mt-1"><strong>Status:</strong> <span className="capitalize">{typedBooking.status}</span></p>
              <p className="mt-1"><strong>Date & Time:</strong> {formattedDateTime} {timezoneAbbr}</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-base">
            <p className="mt-2"><strong>Group Size:</strong> Adults: {typedBooking.group.adults}, Children: {typedBooking.group.children} (Total: {typedBooking.group.size})</p>
            <p className="mt-1"><strong>Pickup Location:</strong> {typedBooking.pickupLocation.address}</p>
          </CardContent>
        </Card>

        <div className="mt-6">
          <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-2 block">Reason for Cancellation</label>
          <div className="flex flex-wrap gap-2 mb-4">
            {cancellationReasons.map((r) => (
              <ButtonV2
                key={r}
                variant={reason === r ? "primary" : "secondary"}
                onClick={() => {
                  setReason(r);
                  setShowOtherReasonInput(false);
                }}
                className="capitalize"
              >
                {r}
              </ButtonV2>
            ))}
            <ButtonV2
              variant={showOtherReasonInput ? "primary" : "secondary"}
              onClick={() => {
                setReason("");
                setShowOtherReasonInput(true);
              }}
              className="capitalize"
            >
              Other
            </ButtonV2>
          </div>

          {showOtherReasonInput && (
            <Input
              id="other-reason"
              placeholder="Enter your reason for cancellation"
              className="mt-2"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
        </div>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-end gap-4">
        <ButtonV2 variant="ghost" onClick={() => router.back()} className="w-full sm:w-auto">Go Back</ButtonV2>
        <ButtonV2 onClick={handleConfirmCancellation} disabled={!reason.trim()} variant="destructive" className="w-full sm:w-auto">Confirm Cancellation</ButtonV2>
      </div>
    </div>
  );
};

export default CancelBookingPage;
