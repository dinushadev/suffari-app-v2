import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from 'react';

interface Booking {
  id: string;
  resourceName: string;
  locationName: string;
  startTime: string;
  endTime: string;
  status: 'upcoming' | 'past' | 'canceled';
  // Add other relevant booking fields
}

interface BookingCardProps {
  booking: Booking;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking }) => {
  let cardClasses = "mb-4";
  let statusColorClass = "";

  switch (booking.status) {
    case "upcoming":
      cardClasses += " border-l-4 border-primary";
      statusColorClass = "text-primary font-semibold";
      break;
    case "past":
      cardClasses += " border-l-4 border-muted-foreground opacity-75";
      statusColorClass = "text-muted-foreground";
      break;
    case "canceled":
      cardClasses += " border-l-4 border-destructive";
      statusColorClass = "text-destructive font-semibold";
      break;
    default:
      break;
  }

  return (
    <Card className={cardClasses}>
      <CardHeader>
        <CardTitle>{booking.resourceName} at {booking.locationName}</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Status:</strong> <span className={statusColorClass}>{booking.status}</span></p>
        <p><strong>Time:</strong> {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleString()}</p>
        {/* Add more booking details here */}
      </CardContent>
    </Card>
  );
};

