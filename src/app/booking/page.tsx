"use client";
import React, { useState, Suspense } from 'react';
import { VehicleTypeSelector, DatePicker, TimeSlotPicker, PickupLocationInput, GroupSizeSelector } from '../../components/molecules';
import { Button, CustomImage, Loader } from '../../components/atoms';
import { useSearchParams, useRouter } from 'next/navigation';
import resourceLocations, { LocationDetails } from '../../data/resourceLocations';
import { useVehicleTypes } from '../../data/useVehicleTypes';
import type { PickupLocation } from '../../components/molecules/PickupLocationInput';
import { supabase } from "../../data/apiConfig";
import { useCreateBooking } from "../../data/useCreateBooking";
import { useLocationDetails } from '../../data/useLocationDetails';

const timeSlotOptions = [
  {
    label: 'Full Day',
    value: 'fullday',
    description: '6:00 AM - 6:00 PM • Complete wilderness experience with lunch break',
  },
  {
    label: 'Morning',
    value: 'morning',
    description: '6:00 AM - 10:00 AM • Best for wildlife activity and cooler temperatures',
  },
  {
    label: 'Evening',
    value: 'evening',
    description: '3:30 PM - 7:00 PM • Perfect for spotting predators and golden hour photography',
  },
];

function generateSessionId() {
  return 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const locationId = searchParams.get('location');
  const router = useRouter();

  const [vehicle, setVehicle] = useState('');
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('morning');
  const [pickup, setPickup] = useState<PickupLocation>({});
  const [fromGate, setFromGate] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  const { data: location, isLoading: locationLoading, error: locationError } = useLocationDetails(locationId || '');
  const { data: vehicleTypes, isLoading: vehicleTypesLoading, error: vehicleTypesError } = useVehicleTypes();
  const createBookingMutation = useCreateBooking();

  // Prefill from localStorage if available
  React.useEffect(() => {
    const saved = localStorage.getItem("pendingBooking");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data) {
          setVehicle(data.vehicle || '');
          setDate(data.date || '');
          setTimeSlot(data.timeSlot || 'morning');
          setPickup(data.pickup || {});
          setFromGate(!!data.fromGate);
        }
        localStorage.removeItem("pendingBooking");
      } catch {}
    }
  }, []);

  // Redirect if no locationId
  React.useEffect(() => {
    if (!locationId) {
      router.push('/');
    }
  }, [locationId, router]);

  if (!locationId) {
    return <Loader />;
  }

  if (locationLoading) {
    return <Loader />;
  }

  if (locationError || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-ivory border border-ash rounded-2xl shadow p-8 text-center">
          <h1 className="text-2xl font-bold text-orange mb-2">Location Not Found</h1>
          <p className="mb-4 text-foreground">Sorry, we couldn&apos;t find the selected location.</p>
          <Button onClick={() => router.push('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Map API data to VehicleTypeSelector format
  const vehicleOptions = vehicleTypes?.map((v) => ({
    label: v.name,
    value: v.id,
    description: v.discription, // use API field
    imageUrl: v.imageUrl,      // use API field
    price: v.price,
    featureList: v.featureList,
    numberOfGuests: v.numberOfGuests,
  })) || [];

  // Validation: all fields must be filled
  const isFormValid =
    !!vehicle &&
    !!date &&
    !!timeSlot &&
    ((pickup && pickup.address && pickup.address.trim().length > 0) || fromGate);

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
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    let customer = {
      email: null as string | null,
      phone: null as string | null,
      sessionId: null as string | null,
    };
    if (!session || !session.user) {
      // Guest user
      let sessionId = localStorage.getItem('raahi_session_id');
      if (!sessionId) {
        sessionId = generateSessionId();
        localStorage.setItem('raahi_session_id', sessionId);
      }
      customer.sessionId = sessionId;
      // Optionally, collect guest email/phone from form if available
    } else {
      // Logged in user
      const { email = null, phone = null } = session.user;
      customer.email = email || null;
      customer.phone = phone || null;
      customer.sessionId = null;
    }
    // Prepare booking data in required structure, using null for missing values
    const bookingData = {
      customer,
      locationId: locationId || null,
      resourceTypeId: vehicle || null,
      schedule: {
        date: date || null,
        timeSlot: timeSlot || null,
      },
      group: {
        adults: adults ?? null,
        children: children ?? null,
        size: (adults != null && children != null) ? adults + children : null,
      },
      pickupLocation: fromGate
        ? {
            placeId: null,
            coordinate: { lat: 0, lng: 0 },
            address: 'Pickup from park gate',
            country: null,
          }
        : {
            placeId: pickup.placeId || null,
            coordinate: pickup.coordinate || { lat: 0, lng: 0 },
            address: pickup.address || null,
            country: pickup.country || null,
          },
    };
    try {
      const data = await createBookingMutation.mutateAsync(bookingData);
      const bookingId = data.id; // Assuming the API returns 'id' as the booking ID

      if (session && session.user) {
        router.push(`/booking/payment?orderId=${bookingId}`);
      } else {
        const pendingData = {
          bookingId,
          // Removed other params as they are no longer needed on the payment page
        };
        localStorage.setItem('pendingBookingData', JSON.stringify(pendingData));
        router.push(`/auth?returnUrl=/booking/payment?orderId=${bookingId}`);
      }
    } catch (err) {
      alert((err as Error).message || "Booking failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      <div className="w-full max-w-lg bg-ivory rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        {/* Header with location image and name */}
        <div className="relative h-48 w-full rounded-t-3xl overflow-hidden">
          <CustomImage src={location.thumbnail} alt={location.name} className="w-full h-full object-cover" fill priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground drop-shadow mb-1">{location.name}</h1>
            <div className="text-foreground/90 text-base font-medium">{location.address}</div>
          </div>
        </div>
        {/* UX Note: Booking Recommendation */}
        <div className="mx-6 mt-4 mb-6 flex items-start gap-2 bg-orange/10 border-l-4 border-orange rounded-xl p-4">
          <svg className="w-6 h-6 text-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/></svg>
          <div className="text-sm text-foreground/80">
            <span className="font-semibold text-orange">Note:</span> We recommend booking at least <span className="font-semibold">24 hours in advance</span> for the best safari experience. Our expert guides will ensure you have an unforgettable wildlife adventure while practicing responsible tourism.
          </div>
        </div>
        <div className="p-6">
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Pickup Location</h2>
            <PickupLocationInput value={pickup} onChange={setPickup} fromGate={fromGate} onToggleGate={setFromGate} />
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Date</h2>
            <DatePicker value={date} onChange={setDate} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Time Slot</h2>
            <TimeSlotPicker options={timeSlotOptions} selected={timeSlot} onSelect={setTimeSlot} />
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Group Size</h2>
            <GroupSizeSelector 
              adults={adults} 
              children={children}
              onAdultsChange={setAdults}
              onChildrenChange={setChildren}
            />
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Vehicle Type</h2>
            {vehicleTypesLoading ? (
              <Loader />
            ) : vehicleTypesError ? (
              <div className="text-red-500">Failed to load vehicle types.</div>
            ) : (
              <VehicleTypeSelector options={vehicleOptions} selected={vehicle} onSelect={setVehicle} />
            )}
          </div>
          <div className="mb-8">
            {/* BookingSummary will be shown on the payment page instead */}
          </div>
          <Button
            variant="primary"
            className="w-full text-lg py-3 transition-transform duration-150 hover:scale-105"
            onClick={handleConfirm}
            disabled={!isFormValid}
          >
            Confirm & Pay
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