"use client";
import React, { useState, Suspense } from "react";
import {
  VehicleTypeSelector,
  DatePicker,
  TimeSlotPicker,
  PickupLocationInput,
  GroupSizeSelector,
  ContactInfo,
} from "../../components/molecules";
import { Button, CustomImage, Loader } from "../../components/atoms";
import { useSearchParams, useRouter } from "next/navigation";
import { useVehicleTypes } from "../../data/useVehicleTypes";
import type { PickupLocation } from "../../components/molecules/PickupLocationInput";
import {
  useCreateBooking,
  type BookingPayload,
} from "../../data/useCreateBooking";
import { useLocationDetails } from "../../data/useLocationDetails";
import { supabase } from "../../data/apiConfig";
import type { BookingResponse } from "../../data/useCreateBooking";
import { useBookingDetails } from "../../data/useBookingDetails";
import { ButtonV2 } from "../../components/atoms";
import { FullScreenLoader } from "../../components/atoms";

const timeSlotOptions = [
  {
    label: "Full-day",
    value: "full-day",
    description: "All-day adventure with lunch. Plenty of time to explore.",
  },
  {
    label: "Morning",
    value: "morning",
    description: "Cool, early start as the nature awakens.",
  },
  {
    label: "Afternoon/ Evening",
    value: "afternoon",
    description: "Relaxed late-day drive in shifting light",
  },
  {
    label: "Night",
    value: "night",
    description: "Explore after dark. Night gears are recommended.",
  },
];

function generateSessionId() {
  return "sess_" + Math.random().toString(36).substr(2, 9) + Date.now();
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const locationId = searchParams.get("location");
  const router = useRouter();

  const [vehicle, setVehicle] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("morning");
  const [pickup, setPickup] = useState<PickupLocation>({});
  const [fromGate, setFromGate] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | undefined>(
    undefined
  );
  const [currentPaymentAmount, setCurrentPaymentAmount] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [isNameValid, setIsNameValid] = useState<boolean>(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState<boolean>(false);

  const {
    data: location,
    isLoading: locationLoading,
    error: locationError,
  } = useLocationDetails(locationId || "");
  const {
    data: vehicleTypes,
    isLoading: vehicleTypesLoading,
    error: vehicleTypesError,
  } = useVehicleTypes();
  const createBookingMutation = useCreateBooking();
  const {
    data: bookingDetails,
    isLoading: bookingDetailsLoading,
    error: bookingDetailsError,
  } = useBookingDetails(currentBookingId || "");

  // Prefill from localStorage if available
  React.useEffect(() => {
    const saved = localStorage.getItem("pendingBooking");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data) {
          setVehicle(data.vehicle || "");
          setDate(data.date || "");
          setTimeSlot(data.timeSlot || "morning");
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
      router.push("/");
    }
  }, [locationId, router]);

  // Auto-dismiss error after 10 seconds
  React.useEffect(() => {
    if (bookingError) {
      const timer = setTimeout(() => {
        setBookingError(null);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [bookingError]);

  if (!locationId) {
    return (
      <main className="min-h-screen flex flex-col items-center bg-background p-4">
      
        <FullScreenLoader />
      </main>
    );
  }

  if (locationLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center bg-background p-4">
    
        <FullScreenLoader />
      </main>
    );
  }

  if (locationError || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-ivory border border-ash rounded-2xl shadow text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Location Not Found
          </h1>
          <p className="mb-4 text-foreground">
            Sorry, we couldn&apos;t find the selected location.
          </p>
          <Button onClick={() => router.push("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Map API data to VehicleTypeSelector format
  const vehicleOptions =
    vehicleTypes?.map((v) => ({
      label: v.name,
      value: v.id,
      description: v.discription,
      imageUrl: v.imageUrl,
      price: v.price,
      featureList: v.featureList,
      numberOfGuests: v.numberOfGuests,
    })) || [];

  // Validation: all fields must be filled
  const isFormValid =
    !!vehicle &&
    !!date &&
    !!timeSlot &&
    ((pickup && pickup.address && pickup.address.trim().length > 0) ||
      fromGate) &&
    isNameValid &&
    isPhoneNumberValid;

  if (confirmed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <div className="bg-ivory rounded-3xl shadow-xl p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-extrabold text-foreground mb-2">
            Thank you!
          </h1>
          <p className="text-foreground mb-4">
            Your booking is confirmed.
            <br />
            <span className="font-mono text-foreground">#SFR12345</span>
          </p>
          <Button variant="primary" onClick={() => setConfirmed(false)}>
            Book Another Safari
          </Button>
        </div>
      </div>
    );
  }

  const handleConfirm = async () => {
    // Reset any previous errors
    setBookingError(null);
    setIsButtonLoading(true);

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
        phone: customer.phone || phoneNumber || null,
        sessionId: customer.sessionId || generateSessionId(),
        name: name || null,
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
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        setBookingError(
          "Unable to verify session. Please refresh the page and try again."
        );
        setIsButtonLoading(false);
        return;
      }

      const customer = {
        email: null as string | null,
        phone: null as string | null,
        sessionId: null as string | null,
      };

      if (!session || !session.user) {
        // Guest user
        let sessionId = localStorage.getItem("raahi_session_id");
        if (!sessionId) {
          sessionId = generateSessionId();
          localStorage.setItem("raahi_session_id", sessionId);
        }
        customer.sessionId = sessionId;
      } else {
        // Logged in user
        const { email = null, phone = null } = session.user;
        customer.email = email;
        customer.phone = phone;
        customer.sessionId = generateSessionId();
      }

      const selectedVehicle = vehicleOptions.find((v) => v.value === vehicle);

      // Validate vehicle selection
      if (!selectedVehicle) {
        setBookingError("Please select a valid vehicle type.");
        setIsButtonLoading(false);
        return;
      }

      const paymentAmount = selectedVehicle
        ? (selectedVehicle.price || 0) * (adults + children)
        : 0;

      // Prepare booking data in required structure
      const bookingData: BookingPayload = {
        customer: {
          email: customer.email || null,
          phone: customer.phone || phoneNumber || null,
          sessionId: customer.sessionId || generateSessionId(),
          name: name || null,
        },
        resourceTypeId: vehicle,
        resourceId: null,
        resourceOwnerId: null,
        locationId: locationId || "",
        schedule: {
          date: date,
          timeSlot: timeSlot,
        },
        group: {
          adults: adults,
          children: children,
          size: adults + children,
        },
        pickupLocation: {
          placeId: fromGate
            ? location.pickupLocations?.[0]?.placeId || null
            : pickup.placeId || null,
          coordinate: fromGate
            ? location.pickupLocations?.[0]?.coordinate || { lat: 0, lng: 0 }
            : pickup.coordinate || { lat: 0, lng: 0 },
          address: fromGate
            ? location.pickupLocations?.[0]?.address || "Pickup from park gate"
            : pickup.address || "",
          country: fromGate
            ? location.pickupLocations?.[0]?.country || null
            : pickup.country || null,
        },
        paymentAmount,
      };

      console.log("Submitting booking data:", bookingData);

      const data: BookingResponse = await createBookingMutation.mutateAsync(
        bookingData
      );

      if (data && data.id) {
        const bookingId = data.id;
        setCurrentBookingId(bookingId);
        setCurrentPaymentAmount(paymentAmount);
        console.log(
          "Redirecting to booking payment page with bookingId",
          bookingId
        );
        window.location.href = `/booking/payment?orderId=${bookingId}`;
      } else {
        throw new Error("No booking ID received from server");
      }
    } catch (err: unknown) {
      console.error("Booking error:", err);

      // Define type guards for specific error structures
      interface ApiResponseError {
        response?: {
          data?: {
            message?: string;
          };
        };
      }

      interface CodeError {
        code?: string;
      }

      const isApiResponseError = (e: unknown): e is ApiResponseError => {
        return (
          typeof e === "object" &&
          e !== null &&
          "response" in e &&
          typeof (e as { response: unknown }).response === "object" &&
          (e as { response: unknown }).response !== null &&
          "data" in (e as { response: { data: unknown } }).response &&
          typeof (e as { response: { data: unknown } }).response.data ===
            "object" &&
          (e as { response: { data: unknown } }).response.data !== null &&
          "message" in
            (e as { response: { data: { message: unknown } } }).response.data &&
          typeof (
            e as { response: { data: { message: unknown } } }
          ).response.data.message === "string"
        );
      };

      const isCodeError = (e: unknown): e is CodeError => {
        return (
          typeof e === "object" &&
          e !== null &&
          "code" in e &&
          typeof (e as { code: unknown }).code === "string"
        );
      };

      // Handle different types of errors
      if (isApiResponseError(err) && err.response?.data?.message) {
        setBookingError(err.response.data.message);
      } else if (err instanceof Error) {
        setBookingError(err.message);
      } else if (isCodeError(err) && err.code) {
        setBookingError(`Booking failed with error code: ${err.code}`);
      } else {
        setBookingError(
          "Booking failed. Please try again or contact support if the problem persists."
        );
      }

      setIsButtonLoading(false);
    }
  };

  // Use the correct mutation status properties
  const isMutationLoading = createBookingMutation.status === "pending";
  const isMutationError = createBookingMutation.status === "error";

  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      {isButtonLoading && (

          <FullScreenLoader />
       
      )}
      <div className="w-full max-w-lg bg-ivory rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 p-0">
        {/* Header with location image and name */}
        <div className="relative h-48 w-full rounded-t-3xl overflow-hidden">
          <CustomImage
            src={location.thumbnail}
            alt={location.name}
            className="w-full h-full object-cover"
            fill
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow mb-1">
              {location.name}
            </h1>
            <div className="text-white/90 text-base font-medium">
              {location.address}
            </div>
          </div>
        </div>

        {/* UX Note: Booking Recommendation */}
        <div className="mx-6 mt-4 mb-6 flex items-start gap-2 bg-accent/10 border-l-4 border-foreground rounded-xl p-4">
          <svg
            className="w-6 h-6 text-foreground flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01"
            />
          </svg>
          <div className="text-sm text-foreground">
            <span className="font-semibold text-foreground">Note:</span> For a
            seamless journey, please reserve at least{" "}
            <span className="font-semibold text-foreground">
              24 hours ahead
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Error displays for data loading */}
          {vehicleTypesError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-yellow-700 text-sm">
                  Unable to load vehicle types. Please refresh the page.
                </p>
              </div>
            </div>
          )}

          {bookingDetailsError && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <svg
                  className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
                <p className="text-yellow-700 text-sm">
                  Unable to load booking details.
                </p>
              </div>
            </div>
          )}

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">
              Pickup Location
            </h2>
            <PickupLocationInput
              value={pickup}
              onChange={setPickup}
              fromGate={fromGate}
              onToggleGate={setFromGate}
            />
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">Date</h2>
            <DatePicker
              value={date}
              onChange={setDate}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">
              Game Drive Option
            </h2>
            <TimeSlotPicker
              options={timeSlotOptions}
              selected={timeSlot}
              onSelect={setTimeSlot}
            />
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">
              Group Size
            </h2>
            <GroupSizeSelector
              adults={adults}
              numChildren={children}
              onAdultsChange={setAdults}
              onChildrenChange={setChildren}
            />
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">
              Vehicle Type
            </h2>
            {vehicleTypesLoading ? (
              <Loader />
            ) : vehicleTypesError ? (
              <div className="text-red-500">Failed to load vehicle types.</div>
            ) : (
              <VehicleTypeSelector
                options={vehicleOptions}
                selected={vehicle}
                onSelect={setVehicle}
              />
            )}
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-orange">Contact Information</h2>
            <ContactInfo onContactInfoChange={(newName, newPhoneNumber, nameValid, phoneValid) => {
              setName(newName);
              setPhoneNumber(newPhoneNumber);
              setIsNameValid(nameValid);
              setIsPhoneNumberValid(phoneValid);
            }} />
          </div>
          <div className="mb-8">
            {/* BookingSummary will be shown on the payment page instead */}
          </div>
          <ButtonV2
            variant="primary"
            className="w-full transition-transform duration-150 hover:scale-105 disabled:hover:scale-100"
            onClick={handleConfirm}
            disabled={!isFormValid }
            loading={isButtonLoading}
          >
     
              Confirm & Pay
         
          </ButtonV2>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-background p-4">
   
      <p className="text-lg sm:text-xl text-foreground font-medium text-center max-w-xl drop-shadow-sm flex items-center justify-center gap-2">
        Preparing Your Booking...
      </p>
      <div className="flex flex-grow w-full items-center justify-center">
        <Suspense fallback={<FullScreenLoader />}>
          <BookingPageContent />
        </Suspense>
      </div>
    </main>
  );
}
