"use client";
import React, { useState, Suspense } from 'react';
import { VehicleTypeSelector, DatePicker, TimeSlotPicker, PickupLocationInput, BookingSummary } from '../../components/molecules';
import { Button } from '../../components/atoms';
import { useSearchParams } from 'next/navigation';
import resourceLocations, { LocationDetails } from '../../data/resourceLocations';
import Image from 'next/image';

const vehicleOptions = [
  { label: 'Private Jeep (1–6 pax)', value: 'private', description: 'Exclusive jeep for your group' },
  { label: 'Shared Jeep', value: 'shared', description: 'Share with other guests' },
  { label: 'Luxury Safari Jeep', value: 'luxury', description: 'Premium comfort and features' },
];

const timeSlotOptions = [
  { label: 'Morning (6:00 AM – 10:00 AM)', value: 'morning' },
  { label: 'Afternoon (2:00 PM – 6:00 PM)', value: 'afternoon' },
  { label: 'Full-day', value: 'fullday' },
];

function BookingPageContent() {
  const searchParams = useSearchParams();
  const locationId = searchParams.get('location');
  const location: LocationDetails = resourceLocations.find((l: LocationDetails) => l.id === locationId) || resourceLocations[0];

  const [vehicle, setVehicle] = useState('private');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('morning');
  const [pickup, setPickup] = useState('');
  const [fromGate, setFromGate] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const summary = {
    location: location.name,
    date,
    timeSlot: timeSlotOptions.find(t => t.value === timeSlot)?.label || '',
    vehicleType: vehicleOptions.find(v => v.value === vehicle)?.label || '',
    pickupLocation: fromGate ? 'Pickup from park gate' : pickup,
  };

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-green-100 p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-extrabold text-blue-900 mb-2">Thank you!</h1>
          <p className="text-green-700 mb-4">Your booking is confirmed.<br/>Reference: <span className="font-mono text-blue-700">#SFR12345</span></p>
          <Button variant="primary" onClick={() => setConfirmed(false)}>Book Another Safari</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-100 to-green-100 p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        {/* Header with location image and name */}
        <div className="relative h-48 w-full rounded-t-3xl overflow-hidden">
          <Image src={location.hero} alt={location.name} className="w-full h-full object-cover" fill priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow mb-1">{location.name}</h1>
            <div className="text-white/90 text-base font-medium">{location.subtitle}</div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-green-800">Select Vehicle Type</h2>
            <VehicleTypeSelector options={vehicleOptions} selected={vehicle} onSelect={setVehicle} />
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-green-800">Select Date</h2>
            <DatePicker value={date} onChange={setDate} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-green-800">Select Time Slot</h2>
            <TimeSlotPicker options={timeSlotOptions} selected={timeSlot} onSelect={setTimeSlot} />
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-green-800">Pickup Location</h2>
            <PickupLocationInput value={pickup} onChange={setPickup} fromGate={fromGate} onToggleGate={setFromGate} />
          </div>
          <div className="mb-8">
            <BookingSummary
              location={summary.location}
              date={summary.date}
              timeSlot={summary.timeSlot}
              vehicleType={summary.vehicleType}
              pickupLocation={summary.pickupLocation}
            />
          </div>
          <Button
            variant="primary"
            className="w-full text-lg py-3"
            onClick={() => setConfirmed(true)}
            disabled={!date || (!pickup && !fromGate)}
          >
            Confirm &amp; Book
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BookingPageContent />
    </Suspense>
  );
} 