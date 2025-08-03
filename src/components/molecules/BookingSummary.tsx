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
  pickupLocation: PickupLocation;
  paymentAmount?: number; // NEW
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ location, date, timeSlot, vehicleType, pickupLocation, paymentAmount }) => {
  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-2xl shadow-lg p-6 border border-orange-100">
      <h3 className="font-extrabold text-xl mb-4 text-orange-600 tracking-tight">Booking Summary</h3>
      <ul className="divide-y divide-orange-100">
        <li className="py-2 flex items-center justify-between">
          <span className="text-gray-500 font-medium">Location</span>
          <span className="text-gray-900 font-semibold">{location}</span>
        </li>
        <li className="py-2 flex items-center justify-between">
          <span className="text-gray-500 font-medium">Date</span>
          <span className="text-gray-900 font-semibold">{date}</span>
        </li>
        <li className="py-2 flex items-center justify-between">
          <span className="text-gray-500 font-medium">Time Slot</span>
          <span className="text-gray-900 font-semibold">{timeSlot}</span>
        </li>
        <li className="py-2 flex items-center justify-between">
          <span className="text-gray-500 font-medium">Vehicle Type</span>
          <span className="text-gray-900 font-semibold">{vehicleType}</span>
        </li>
        <li className="py-2 flex flex-col items-start">
          <span className="text-gray-500 font-medium mb-1">Pickup Location</span>
          <span className="text-gray-900 font-semibold">{pickupLocation?.address || 'N/A'}</span>
          {pickupLocation?.country && (
            <span className="text-gray-500 text-xs">{pickupLocation.country}</span>
          )}
          {pickupLocation?.coordinate && (
            <span className="text-gray-400 text-xs">Lat: {pickupLocation.coordinate.lat}, Lng: {pickupLocation.coordinate.lng}</span>
          )}
        </li>
        {typeof paymentAmount === 'number' && (
          <li className="py-2 flex items-center justify-between">
            <span className="text-gray-500 font-medium">Payment Amount</span>
            <span className="text-gray-900 font-semibold">${(paymentAmount / 100).toFixed(2)} USD</span>
          </li>
        )}
      </ul>
    </div>
  );
};

export default BookingSummary; 