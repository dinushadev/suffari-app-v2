import React from 'react';

interface BookingSummaryProps {
  location: string;
  date: string;
  timeSlot: string;
  vehicleType: string;
  pickupLocation: string;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ location, date, timeSlot, vehicleType, pickupLocation }) => {
  return (
    <div className="bg-gray-100 rounded p-4">
      <h3 className="font-bold mb-2">Booking Summary</h3>
      <ul className="text-sm">
        <li><strong>Location:</strong> {location}</li>
        <li><strong>Date:</strong> {date}</li>
        <li><strong>Time Slot:</strong> {timeSlot}</li>
        <li><strong>Vehicle Type:</strong> {vehicleType}</li>
        <li><strong>Pickup Location:</strong> {pickupLocation}</li>
      </ul>
    </div>
  );
};

export default BookingSummary; 