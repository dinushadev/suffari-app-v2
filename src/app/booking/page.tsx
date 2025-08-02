"use client";
import React, { useState, Suspense } from 'react';
import { VehicleTypeSelector, DatePicker, TimeSlotPicker, PickupLocationInput } from '../../components/molecules';
import { Button, CustomImage, Loader } from '../../components/atoms';
import { useSearchParams, useRouter } from 'next/navigation';
import resourceLocations, { LocationDetails } from '../../data/resourceLocations';
import { useVehicleTypes } from '../../data/useVehicleTypes';
import type { PickupLocation } from '../../components/molecules/PickupLocationInput';
import { supabase } from "@/data/apiConfig";

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
  const [pickup, setPickup] = useState<PickupLocation>({});
  const [fromGate, setFromGate] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const { data: vehicleTypes, isLoading: vehicleTypesLoading, error: vehicleTypesError } = useVehicleTypes();

  // Map API data to VehicleTypeSelector format
  const vehicleOptions = vehicleTypes?.map((v) => ({
    label: v.name,
    value: v.id,
    description: v.discription, // use API field
    imageUrl: v.imageUrl,      // use API field
  })) || [];

  // Validation: all fields must be filled
  const isFormValid =
    !!vehicle &&
    !!date &&
    !!timeSlot &&
    ((pickup && pickup.address && pickup.address.trim().length > 0) || fromGate);

  // Prefill from localStorage if available
  React.useEffect(() => {
    const saved = localStorage.getItem("pendingBooking");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data) {
          setVehicle(data.vehicle || 'private');
          setDate(data.date || '');
          setTimeSlot(data.timeSlot || 'morning');
          setPickup(data.pickup || {});
          setFromGate(!!data.fromGate);
        }
        localStorage.removeItem("pendingBooking");
      } catch {}
    }
  }, []);

  const router = useRouter();

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="bg-ivory rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-extrabold text-orange mb-2">Thank you!</h1>
          <p className="text-foreground mb-4">Your booking is confirmed.<br/><span className="font-mono text-orange">#SFR12345</span></p>
          <Button variant="primary" onClick={() => setConfirmed(false)}>Book Another Safari</Button>
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      localStorage.setItem("pendingBooking", JSON.stringify({
        vehicle,
        date,
        timeSlot,
        pickup,
        fromGate
      }));
      // Redirect to auth page
      router.push('/auth');
      return;
    }
    // Instead of confirming here, navigate to payment page with booking details
    router.push(`/booking/payment?vehicle=${vehicle}&date=${date}&timeSlot=${timeSlot}&fromGate=${fromGate}&pickup=${encodeURIComponent(JSON.stringify(pickup))}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      <div className="w-full max-w-lg bg-ivory rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        {/* Header with location image and name */}
        <div className="relative h-48 w-full rounded-t-3xl overflow-hidden">
          <CustomImage src={location.hero} alt={location.name} className="w-full h-full object-cover" fill priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground drop-shadow mb-1">{location.name}</h1>
            <div className="text-foreground/90 text-base font-medium">{location.subtitle}</div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Select Vehicle Type</h2>
            {vehicleTypesLoading ? (
              <Loader />
            ) : vehicleTypesError ? (
              <div className="text-red-500">Failed to load vehicle types.</div>
            ) : (
              <VehicleTypeSelector options={vehicleOptions} selected={vehicle} onSelect={setVehicle} />
            )}
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Select Date</h2>
            <DatePicker value={date} onChange={setDate} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Select Time Slot</h2>
            <TimeSlotPicker options={timeSlotOptions} selected={timeSlot} onSelect={setTimeSlot} />
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Pickup Location</h2>
            <PickupLocationInput value={pickup} onChange={setPickup} fromGate={fromGate} onToggleGate={setFromGate} />
          </div>
          <div className="mb-8">
            {/* BookingSummary will be shown on the payment page instead */}
          </div>
          <Button
            variant="primary"
            className="w-full text-lg py-3"
            onClick={handleConfirm}
            disabled={!isFormValid}
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
    <Suspense fallback={<Loader />}>
      <BookingPageContent />
    </Suspense>
  );
} 