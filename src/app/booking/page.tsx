"use client";
import React, { useState, Suspense } from 'react';
import { VehicleTypeSelector, DatePicker, TimeSlotPicker, PickupLocationInput, GroupSizeSelector } from '../../components/molecules';
import { Button, CustomImage, Loader } from '../../components/atoms';
import { useSearchParams, useRouter } from 'next/navigation';
import { useVehicleTypes } from '../../data/useVehicleTypes';
import type { PickupLocation } from '../../components/molecules/PickupLocationInput';
import { useCreateBooking, type BookingPayload } from "../../data/useCreateBooking";
import { useLocationDetails } from '../../data/useLocationDetails';
import { supabase } from "../../data/apiConfig";
import type { BookingResponse } from "../../data/useCreateBooking"; // Import BookingResponse type
import { useBookingDetails } from "../../data/useBookingDetails";

const timeSlotOptions = [
  {
    label: 'Full-day',
    value: 'full-day',
    description: 'All-day adventure with lunch. Plenty of time to explore.',
  },
  {
    label: 'Morning',
    value: 'morning',
    description: 'Cool, early start as the nature awakens.',
  },
  {
    label: 'Afternoon/Evening',
    value: 'afternoon',
    description: 'Relaxed late-day drive in shifting light',
  },
  {
    label: 'Night',
    value: 'night',
    description: 'Explore after dark. Night gears are recommended.',
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
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | undefined>(undefined);
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState<number>(0);

  const { data: location, isLoading: locationLoading, error: locationError } = useLocationDetails(locationId || '');
  const { data: vehicleTypes, isLoading: vehicleTypesLoading, error: vehicleTypesError } = useVehicleTypes();
  const createBookingMutation = useCreateBooking();
  const { data: bookingDetails, isLoading: bookingDetailsLoading, error: bookingDetailsError } = useBookingDetails(currentBookingId || '');

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
    setIsButtonLoading(true); // Start loading
    await new Promise(resolve => setTimeout(resolve, 2000)); // Add a 2-second delay for debugging

    // Re-add session check and customer object creation
    const { data: { session } } = await supabase.auth.getSession();
    const customer = {
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
      customer.sessionId  = generateSessionId();
    }
    console.log('customer',customer);

    const selectedVehicle = vehicleOptions.find((v) => v.value === vehicle);
    const paymentAmount = selectedVehicle ? (selectedVehicle.price || 0) * (adults + children) : 0;

    // Prepare booking data in required structure, using null for missing values
    const bookingData: BookingPayload = {
      customer: {
        email: customer.email || null,
        phone: customer.phone || null,
        sessionId: customer.sessionId || generateSessionId(),
      },
      resourceTypeId: vehicle || '',
      resourceId: null, // Optional field, not currently used
      resourceOwnerId: null, // Optional field, not currently used
      locationId: locationId || '',
      schedule: {
        date: date || '',
        timeSlot: timeSlot || '',
      },
      group: {
        adults: adults,
        children: children,
        size: adults + children,
      },
      pickupLocation: {
        placeId: fromGate ? location.pickupLocations?.[0]?.placeId || null : pickup.placeId || null,
        coordinate: fromGate ? location.pickupLocations?.[0]?.coordinate || { lat: 0, lng: 0 } : pickup.coordinate || { lat: 0, lng: 0 },
        address: fromGate ? location.pickupLocations?.[0]?.address || 'Pickup from park gate' : pickup.address || '',
        country: fromGate ? location.pickupLocations?.[0]?.country || null : pickup.country || null,
      },
      paymentAmount,
    };
    console.log('bookingData',bookingData);
    try {
      const data: BookingResponse = await createBookingMutation.mutateAsync(bookingData);
      const bookingId = data.id; // Assuming the API returns 'id' as the booking ID
      setCurrentBookingId(bookingId);
      setCurrentPaymentAmount(paymentAmount);
      console.log('redirctiong to booking payment page with bookingId',bookingId);
      window.location.href = `/booking/payment?orderId=${bookingId}`;
    } catch (err) {
      setIsButtonLoading(false); // End loading
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow mb-1">{location.name}</h1>
            <div className="text-white/90 text-base font-medium">{location.address}</div>
          </div>
        </div>
        {/* UX Note: Booking Recommendation */}
        <div className="mx-6 mt-4 mb-6 flex items-start gap-2 bg-accent/10 border-l-4 border-orange rounded-xl p-4">
          <svg className="w-6 h-6 text-orange flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01"/></svg>
          <div className="text-sm text-foreground">
            <span className="font-semibold text-orange">Note:</span> For a seamless journey, please reserve at least <span className="font-semibold text-orange">24 hours ahead</span>
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
            <h2 className="font-bold text-lg mb-2 text-orange">Game Drive Option</h2>
            <TimeSlotPicker options={timeSlotOptions} selected={timeSlot} onSelect={setTimeSlot} />
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Group Size</h2>
            <GroupSizeSelector 
              adults={adults} 
              numChildren={children}
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
            className="w-full transition-transform duration-150 hover:scale-105"
            onClick={handleConfirm}
            disabled={!isFormValid || isButtonLoading}
          >
            {isButtonLoading ? (
              <div className="flex items-center justify-center">
                {/* <Loader /> */}
                <span>Confirming...</span>
              </div>
            ) : (
              "Confirm & Pay"
            )}
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