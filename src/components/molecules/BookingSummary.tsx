import React from 'react';

interface PickupLocation {
  placeId?: string;
  coordinate?: { lat: number; lng: number };
  address?: string;
  country?: string;
}

interface BookingSummaryProps {
  location: string;
  date: string;
  timeSlot: string;
  vehicleType: string;
  groupType: string; // Added groupType
  pickupLocation: PickupLocation;
  paymentAmount?: number; // NEW
  resourceCategory?: string; // Category to determine label (e.g., "safari_vehicles", "guide")
  startDate?: string; // Start date for date range display
  endDate?: string; // End date for date range display
  currency?: string; // Currency code for payment amount display
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ location, date, timeSlot, vehicleType, groupType, pickupLocation, paymentAmount, resourceCategory, startDate, endDate, currency = "USD" }) => {
  // Determine the label based on category
  const resourceLabel = resourceCategory === 'safari_vehicles' || !resourceCategory 
    ? 'Vehicle Type' 
    : 'Guide';
  
  // Format date and time display
  const formatDateRange = () => {
    if (startDate && endDate) {
      try {
        const start = new Date(startDate);
        const end = new Date(endDate);
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
            return `${startFormatted}${timeSlot ? ` • ${timeSlot}` : ''}`;
          }
          // Otherwise show date range
          return `${startFormatted} - ${endFormatted}`;
        }
      } catch (e) {
        console.error("Error formatting date range:", e);
      }
    }
    // Fallback to original date and timeSlot display
    return `${date}${timeSlot ? ` • ${timeSlot}` : ''}`;
  };

  const dateTimeDisplay = formatDateRange();

  return (
    <div className="bg-card text-card-foreground rounded-2xl shadow-lg p-6 border border-border">
      <h3 className="font-extrabold text-xl mb-4 text-primary tracking-tight">Booking Summary</h3>
      <ul className="divide-y divide-border">
        <li className="py-2 flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Location</span>
          <span className="text-foreground font-semibold">{location}</span>
        </li>
        <li className="py-2 flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Date & Time</span>
          <span className="text-foreground font-semibold">{dateTimeDisplay}</span>
        </li>
        <li className="py-2 flex items-center justify-between">
          <span className="text-muted-foreground font-medium">{resourceLabel}</span>
          <span className="text-foreground font-semibold">{vehicleType}</span>
        </li>
        <li className="py-2 flex items-center justify-between">
          <span className="text-muted-foreground font-medium">Group Size</span>
          <span className="text-foreground font-semibold">{groupType}</span>
        </li>
        <li className="py-2 flex flex-col items-start">
          <span className="text-muted-foreground font-medium mb-1">Pickup Location</span>
          <span className="text-foreground font-semibold">{pickupLocation?.address || 'N/A'}</span>
          {pickupLocation?.country && (
            <span className="text-muted-foreground text-xs">{pickupLocation.country}</span>
          )}
          {pickupLocation?.coordinate && (
            <span className="text-muted-foreground/80 text-xs">Lat: {pickupLocation.coordinate.lat}, Lng: {pickupLocation.coordinate.lng}</span>
          )}
        </li>
        {typeof paymentAmount === 'number' && (
          <li className="py-2 flex items-center justify-between">
            <span className="text-muted-foreground font-medium">Payment Amount</span>
            <span className="text-foreground font-semibold">{currency} {(paymentAmount ).toFixed(2)}</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default BookingSummary; 