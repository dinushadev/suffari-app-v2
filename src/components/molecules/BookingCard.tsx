import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import React from "react";
import { Booking } from "@/types/booking";
import { ButtonV2 } from "@/components/atoms";
import { useRouter } from "next/navigation";

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
      cardClasses += " border-l-4 border-yellow-500 bg-yellow-50";
      statusColorClass = "text-yellow-700 font-semibold";
      break;
    case "confirmed":
      cardClasses += " border-l-4 border-green-500 bg-green-50";
      statusColorClass = "text-green-700 font-semibold";
      break;
    case "canceled":
      cardClasses += " border-l-4 border-red-500 bg-red-50";
      statusColorClass = "text-red-700 font-semibold";
      break;
    case "upcoming": // Handle upcoming status if it's still present
      cardClasses += " border-l-4 border-blue-500 bg-blue-50";
      statusColorClass = "text-blue-700 font-semibold";
      break;
    case "past": // Handle past status if it's still present
      cardClasses += " border-l-4 border-gray-400 bg-gray-100";
      statusColorClass = "text-gray-600";
      break;
    default:
      cardClasses += " border-l-4 border-gray-300 bg-gray-50";
      statusColorClass = "text-gray-700";
      break;
  }

  const formattedStartTime = new Date(booking.startTime).toLocaleString(
    undefined,
    {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );
  const formattedEndTime = new Date(booking.endTime).toLocaleString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          {booking.resourceType?.name || "N/A"} at{" "}
          {booking.location?.name || "N/A"}
        </CardTitle>
        <CardDescription className="text-sm text-gray-600">
          <p className="mt-1">
            <strong>Booking Id: </strong>
            {booking.id}{" "}
          </p>
          <p className="mt-1">
            <strong>Status:</strong>{" "}
            <span className={statusColorClass}>{booking.status}</span>
          </p>
          <p className="mt-1">
            <strong>Time:</strong> {formattedStartTime} - {formattedEndTime}
          </p>
        </CardDescription>
      </CardHeader>
      <CardContent className="text-base">
        <p className="mt-2">
          <strong>Group Size:</strong> Adults: {booking.group.adults}, Children:{" "}
          {booking.group.children} (Total: {booking.group.size})
        </p>
        <p className="mt-1">
          <strong>Pickup Location:</strong> {booking.pickupLocation.address}
        </p>
        <ButtonV2
          onClick={() => router.push(`/booking/cancel/${booking.id}`)}
          disabled={!canCancel}
          variant="destructive"
          className="mt-4"
        >
          Cancel Booking
        </ButtonV2>
      </CardContent>
    </Card>
  );
};
