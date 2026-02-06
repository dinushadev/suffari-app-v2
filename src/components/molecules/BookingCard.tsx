import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import React from "react";
import Link from "next/link";
import { Booking } from "@/types/booking";
import { ButtonV2 } from "@/components/atoms";
import { useRouter } from 'next/navigation';
import { formatInTimezone, getTimezoneAbbreviation } from '@/lib/timezoneUtils';
import { cn } from '@/lib/utils';

interface BookingCardProps {
  booking: Booking;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  const router = useRouter();
  let cardClasses = "mb-4";
  let statusColorClass = "";

  const now = new Date();
  const bookingTime = new Date(booking.startTime);
  const bookingCreationTime = new Date(booking.createdAt);

  const timeUntilBooking =
    (bookingTime.getTime() - now.getTime()) / (1000 * 60 * 60); // in hours
  const timeSinceBookingCreation =
    (now.getTime() - bookingCreationTime.getTime()) / (1000 * 60); // in minutes

  const isSameDayTrip = bookingTime.toDateString() === now.toDateString();

  let canCancel = false;

  if (
    booking.status === "confirmed" ||
    booking.status === "upcoming" ||
    booking.status === "initiated"
  ) {
    // Free changes/cancel: up to [24 hours] before your drive
    if (timeUntilBooking > 24) {
      canCancel = true;
    }
    // or within 5 minutes of booking for same-day trips.
    else if (isSameDayTrip && timeSinceBookingCreation <= 5) {
      canCancel = true;
    }
    // Vendor cancels or park closes: Full refund or free rebooking
    else if (booking.vendorCanceled) {
      canCancel = true;
    }
  }

  switch (booking.status) {
    case "initiated":
      cardClasses += " border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-600";
      statusColorClass = "text-yellow-700 dark:text-yellow-400 font-semibold";
      break;
    case "confirmed":
      cardClasses += " border-l-4 border-green-500 bg-green-50 dark:bg-green-950/30 dark:border-green-600";
      statusColorClass = "text-green-700 dark:text-green-400 font-semibold";
      break;
    case "canceled":
      cardClasses += " border-l-4 border-red-500 bg-red-50 dark:bg-red-950/30 dark:border-red-600";
      statusColorClass = "text-red-700 dark:text-red-400 font-semibold";
      break;
    case "upcoming": // Handle upcoming status if it's still present
      cardClasses += " border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-600";
      statusColorClass = "text-blue-700 dark:text-blue-400 font-semibold";
      break;
    case "past": // Handle past status if it's still present
      cardClasses += " border-l-4 border-muted bg-muted/30";
      statusColorClass = "text-muted-foreground";
      break;
    default:
      cardClasses += " border-l-4 border-border bg-muted/20";
      statusColorClass = "text-foreground";
      break;
  }

  // Get timezone from booking schedule or default to Asia/Colombo
  const bookingTimezone = booking.schedule?.timezone || 'Asia/Colombo';

  // Booking has ended (for showing "Write a review") — use status or end time
  const isPastBooking =
    booking.status === "past" || new Date(booking.endTime).getTime() < now.getTime();

  // Message only for ongoing (started, not ended) or fulfilled (past/completed)
  const startMs = new Date(booking.startTime).getTime();
  const endMs = new Date(booking.endTime).getTime();
  const nowMs = now.getTime();
  const isOngoing = nowMs >= startMs && nowMs <= endMs;
  const showMessage = (isOngoing || isPastBooking) && booking.status !== "canceled";

  // Format dates in the booking's timezone
  const startDate = new Date(booking.startTime);
  const endDate = new Date(booking.endTime);
  const isSameDate = startDate.toDateString() === endDate.toDateString();
  
  // Format date/time display - show date range if different dates
  let formattedDateTime: string;
  if (isSameDate) {
    // Same date: show full start time and end time only
    const formattedStartTime = formatInTimezone(
      booking.startTime,
      bookingTimezone,
      'EEE, MMM d, yyyy h:mm a'
    );
    const formattedEndTime = formatInTimezone(
      booking.endTime,
      bookingTimezone,
      'h:mm a'
    );
    formattedDateTime = `${formattedStartTime} - ${formattedEndTime}`;
  } else {
    // Different dates: show date range
    const formattedStartDate = formatInTimezone(
      booking.startTime,
      bookingTimezone,
      'EEE, MMM d, yyyy'
    );
    const formattedEndDate = formatInTimezone(
      booking.endTime,
      bookingTimezone,
      'EEE, MMM d, yyyy'
    );
    formattedDateTime = `${formattedStartDate} - ${formattedEndDate}`;
  }
  
  // Get timezone abbreviation for display
  const timezoneAbbr = getTimezoneAbbreviation(bookingTimezone, new Date(booking.startTime));

  return (
    <Card className={cn(cardClasses, "min-w-0 overflow-hidden")}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">{booking.resourceType?.name || 'N/A'} at {booking.location?.name || 'N/A'}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          <span className="block mt-1"><strong>Status:</strong> <span className={statusColorClass}>{booking.status}</span></span>
          <span className="block mt-1"><strong>Date & Time:</strong> {formattedDateTime} {timezoneAbbr}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-base min-w-0">
        <div className="space-y-2">
          <p><strong>Group Size:</strong> Adults: {booking.group.adults}, Children: {booking.group.children} (Total: {booking.group.size})</p>
          <p><strong>Pickup Location:</strong> {booking.pickupLocation.address}</p>
        </div>
        {booking.status !== "canceled" && (
          <div className="mt-6 flex flex-wrap gap-2 w-full min-w-0">
            {showMessage && (
              <ButtonV2
                onClick={() => router.push(`/booking/${booking.id}/message`)}
                variant="primary"
                size="sm"
                className="flex-1 min-w-[7.5rem] max-w-full"
              >
                Message host
              </ButtonV2>
            )}
            {!isPastBooking && (
              <ButtonV2
                onClick={() => router.push(`/booking/cancel/${booking.id}`)}
                disabled={!canCancel}
                variant="destructive"
                size="sm"
                className="flex-1 min-w-[7.5rem] max-w-full"
              >
                Cancel booking
              </ButtonV2>
            )}
            {isPastBooking && (
              <Link
                href={`/review?order_id=${encodeURIComponent(booking.id)}&return=${encodeURIComponent("/booking/history")}`}
                className="inline-flex flex-1 min-w-[7.5rem] max-w-full items-center justify-center rounded-full bg-primary text-primary-foreground px-4 py-2 text-sm font-semibold hover:bg-primary/90 transition h-9"
              >
                Write a review
              </Link>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
