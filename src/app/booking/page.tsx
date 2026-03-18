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
import { Button, CustomImage, Loader, ErrorDisplay } from "../../components/atoms";
import { useSearchParams, useRouter } from "next/navigation";
import { useBookingConfig, findVehicleForPricingId } from "../../data/useBookingConfig";
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
import { getTimezoneForLocation, convertLocalToUTC } from "../../lib/timezoneUtils";
import { getDefaultCurrency } from "../../lib/currencyUtils";

function generateSessionId() {
  return "sess_" + Math.random().toString(36).substr(2, 9) + Date.now();
}

function BookingPageContent() {
  const searchParams = useSearchParams();
  const locationId = searchParams.get("location");
  const router = useRouter();

  const [vehicle, setVehicle] = useState("");
  const [date, setDate] = useState("");
  const [timeSlot, setTimeSlot] = useState("");
  const [pickup, setPickup] = useState<PickupLocation>({});
  const [fromGate, setFromGate] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [currentBookingId, setCurrentBookingId] = useState<string | undefined>(
    undefined
  );
  const [name, setName] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [bookingError, setBookingError] = useState<unknown>(null);
  const [isNameValid, setIsNameValid] = useState<boolean>(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState<boolean>(false);

  const {
    data: location,
    isLoading: locationLoading,
    error: locationError,
  } = useLocationDetails(locationId || "");
  const {
    data: bookingConfig,
    isLoading: configLoading,
    error: configError,
  } = useBookingConfig(locationId || "");
  const createBookingMutation = useCreateBooking();
  const {
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
          setTimeSlot(data.timeSlot || "");
          setPickup(data.pickup || {});
          setFromGate(!!data.fromGate);
        }
        localStorage.removeItem("pendingBooking");
      } catch { }
    }
  }, []);

  // Default to the first timeslot once config is loaded
  React.useEffect(() => {
    if (bookingConfig?.timeSlots?.length && !timeSlot) {
      setTimeSlot(bookingConfig.timeSlots[0].value);
    }
  }, [bookingConfig, timeSlot]);

  // Derive timeslot options from config
  const timeSlotOptions = React.useMemo(
    () =>
      bookingConfig?.timeSlots
        ?.slice()
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((ts) => ({
          label: ts.label,
          value: ts.value,
          description: `${ts.timeRange} · ${ts.description}`,
        })) ?? [],
    [bookingConfig]
  );

  // Derive vehicle options with prices for the currently selected timeslot
  const vehicleOptions = React.useMemo(() => {
    if (!bookingConfig) return [];
    const { vehicles, pricingMatrix } = bookingConfig;

    // Collect unique vehicleIds from pricingMatrix (preserving first-seen order)
    const seenVehicleIds: string[] = [];
    for (const entry of pricingMatrix) {
      if (!seenVehicleIds.includes(entry.vehicleId)) {
        seenVehicleIds.push(entry.vehicleId);
      }
    }

    // Find the active timeslot id that matches the selected timeslot value
    const activeTimeSlot = bookingConfig.timeSlots.find(
      (ts) => ts.value === timeSlot
    );

    return seenVehicleIds.map((vehicleId) => {
      const vehicle = findVehicleForPricingId(vehicleId, vehicles);
      const priceEntry = pricingMatrix.find(
        (p) =>
          p.vehicleId === vehicleId &&
          p.timeSlotId === (activeTimeSlot?.id ?? "")
      );
      return {
        label: vehicle?.name ?? vehicleId,
        value: vehicleId,
        description: vehicle?.description,
        imageUrl: vehicle?.imageUrl,
        featureList: vehicle?.featureList,
        numberOfGuests: vehicle?.capacity?.recommended,
        price: priceEntry?.pricing?.local?.amount,
        currency: priceEntry?.pricing?.local?.currency,
        displayPriceUsd: priceEntry?.pricing?.usd
          ? {
              amount: priceEntry.pricing.usd.amount,
              currency: priceEntry.pricing.usd.currency,
            }
          : undefined,
      };
    });
  }, [bookingConfig, timeSlot]);

  // Extract currency from selected vehicle option
  const selectedVehicleOption = vehicleOptions.find((v) => v.value === vehicle);
  const currency = selectedVehicleOption?.currency ?? getDefaultCurrency();

  // Validation: all fields must be filled
  const errors = React.useMemo(() => {
    const errs: Record<string, string> = {};
    if (!vehicle) errs.vehicle = "Vehicle type is required";
    if (!date) errs.date = "Date is required";
    if (!timeSlot) errs.timeSlot = "Time slot is required";
    if (!fromGate && (!pickup?.address || pickup.address.trim().length === 0)) {
      errs.pickup = "Pickup location is required";
    }
    if (!name.trim()) errs.name = "Name is required";
    else if (!isNameValid) errs.name = "Please enter a valid name";
    if (!phoneNumber.trim()) errs.phoneNumber = "Phone number is required";
    else if (!isPhoneNumberValid) errs.phoneNumber = "Please enter a valid phone number";
    if (adults + children <= 0) errs.group = "At least one guest is required";
    return errs;
  }, [vehicle, date, timeSlot, pickup, fromGate, name, isNameValid, phoneNumber, isPhoneNumberValid, adults, children]);

  const isFormValid =
    !!vehicle &&
    !!date &&
    !!timeSlot &&
    ((pickup && pickup.address && pickup.address.trim().length > 0) ||
      fromGate) &&
    adults + children > 0 &&
    isNameValid &&
    isPhoneNumberValid;

  // Redirect if no locationId
  React.useEffect(() => {
    if (!locationId) {
      router.push("/");
    }
  }, [locationId, router]);

  // Error persistence - errors stay visible until manually dismissed
  // Removed auto-dismiss functionality to keep errors visible

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
    const {
      data: { session },
    } = await supabase.auth.getSession();
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
      // Optionally, collect guest email/phone from form if available
    } else {
      // Logged in user
      const { email = null, phone = null } = session.user;
      customer.email = email || null;
      customer.phone = phone || null;
      customer.sessionId = generateSessionId();
    }
    console.log("customer", customer);

    const selectedVehicle = vehicleOptions.find((v) => v.value === vehicle);
    const paymentAmount = selectedVehicle
      ? (selectedVehicle.price || 0) * (adults + children)
      : 0;

    // Get timezone for the location
    const pickupCountry = fromGate
      ? location.pickupLocations?.[0]?.country || null
      : pickup.country || null;
    const locationTimezone = getTimezoneForLocation(locationId || "", pickupCountry || undefined);

    // Derive start time from config timeSlot's timeRange (e.g. "06:00 - 10:00" → "06:00:00")
    const getTimeForSlot = (slot: string): string => {
      const configSlot = bookingConfig?.timeSlots.find((ts) => ts.value === slot);
      if (configSlot?.timeRange) {
        const startPart = configSlot.timeRange.split("-")[0].trim();
        if (/^\d{2}:\d{2}$/.test(startPart)) return `${startPart}:00`;
      }
      return "09:00:00";
    };

    // Convert local time in location's timezone to UTC
    const timeForSlot = getTimeForSlot(timeSlot);
    const startDateTime = date ? convertLocalToUTC(date, timeForSlot, locationTimezone) : "";

    // Prepare booking data in required structure, using null for missing values
    const bookingData: BookingPayload = {
      customer: {
        email: customer.email || null,
        phone: customer.phone || phoneNumber || null,
        sessionId: customer.sessionId || generateSessionId(),
        name: name || null,
      },
      resourceTypeId: vehicle || "",
      resourceId: null, // Optional field, not currently used
      resourceOwnerId: null, // Optional field, not currently used
      locationId: locationId || "",
      schedule: {
        startDateTime,
        timeSlot: timeSlot || "",
        timezone: locationTimezone,
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
    console.log("bookingData", bookingData);
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

      // Get timezone for the location
      const pickupCountry = fromGate
        ? location.pickupLocations?.[0]?.country || null
        : pickup.country || null;
      const locationTimezone = getTimezoneForLocation(locationId || "", pickupCountry || undefined);

      // Derive start time from config timeSlot's timeRange (e.g. "06:00 - 10:00" → "06:00:00")
      const getTimeForSlot = (slot: string): string => {
        const configSlot = bookingConfig?.timeSlots.find((ts) => ts.value === slot);
        if (configSlot?.timeRange) {
          const startPart = configSlot.timeRange.split("-")[0].trim();
          if (/^\d{2}:\d{2}$/.test(startPart)) return `${startPart}:00`;
        }
        return "09:00:00";
      };

      // Convert local time in location's timezone to UTC
      const timeForSlot = getTimeForSlot(timeSlot);
      const startDateTime = date ? convertLocalToUTC(date, timeForSlot, locationTimezone) : "";

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
          startDateTime,
          timeSlot: timeSlot,
          timezone: locationTimezone,
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
      setBookingError(err);
      setIsButtonLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center bg-background p-4">
      {isButtonLoading && <FullScreenLoader />}
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
          {configError && (
            <div className="mb-4">
              <ErrorDisplay
                error={configError}
                onRetry={() => {
                  window.location.reload();
                }}
                onSignIn={() => {
                  router.push('/auth');
                }}
              />
            </div>
          )}

          {bookingDetailsError && (
            <div className="mb-4">
              <ErrorDisplay
                error={bookingDetailsError}
                onRetry={() => {
                  window.location.reload();
                }}
                onSignIn={() => {
                  router.push('/auth');
                }}
              />
            </div>
          )}

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">
              Pickup Location
            </h2>
            <PickupLocationInput
              value={pickup}
              onChange={(val) => {
                setPickup(val);
                setTouched((prev) => ({ ...prev, pickup: true }));
              }}
              fromGate={fromGate}
              onToggleGate={(val) => {
                setFromGate(val);
              }}
            />
            {touched.pickup && errors.pickup && (
              <p className="mt-1 text-xs text-red-500">{errors.pickup}</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">Date</h2>
            <DatePicker
              value={date}
              onChange={(val) => {
                setDate(val);
                setTouched((prev) => ({ ...prev, date: true }));
              }}
              min={new Date().toISOString().split("T")[0]}
            />
            {touched.date && errors.date && (
              <p className="mt-1 text-xs text-red-500">{errors.date}</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">
              Game Drive Option
            </h2>
            <TimeSlotPicker
              options={timeSlotOptions}
              selected={timeSlot}
              onSelect={(val) => {
                setTimeSlot(val);
                setTouched((prev) => ({ ...prev, timeSlot: true }));
              }}
            />
            {touched.timeSlot && errors.timeSlot && (
              <p className="mt-1 text-xs text-red-500">{errors.timeSlot}</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">
              Group Size
            </h2>
            <GroupSizeSelector
              adults={adults}
              numChildren={children}
              onAdultsChange={(val) => {
                setAdults(val);
                setTouched((prev) => ({ ...prev, group: true }));
              }}
              onChildrenChange={(val) => {
                setChildren(val);
                setTouched((prev) => ({ ...prev, group: true }));
              }}
              maxAdults={Math.max(0, 6 - children)}
              maxChildren={Math.max(0, 6 - adults)}
            />
            {adults + children >= 6 && (
              <div className="mt-3 flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <svg
                  className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-amber-700">
                  <span className="font-semibold">Maximum 6 guests per booking.</span>{" "}
                  Travelling with a larger group? Simply{" "}
                  <span className="font-semibold">make a second booking</span>{" "}
                  for the remaining guests — same date and time works great!
                </p>
              </div>
            )}
            {touched.group && errors.group && (
              <p className="mt-1 text-xs text-red-500">{errors.group}</p>
            )}
          </div>

          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">
              Vehicle Type
            </h2>
            {configLoading ? (
              <Loader />
            ) : configError ? (
              <div className="text-red-600 dark:text-red-400">Failed to load vehicle types.</div>
            ) : (
              <VehicleTypeSelector
                options={vehicleOptions}
                selected={vehicle}
                onSelect={(val) => {
                  setVehicle(val);
                  setTouched((prev) => ({ ...prev, vehicle: true }));
                }}
              />
            )}
            {touched.vehicle && errors.vehicle && (
              <p className="mt-1 text-xs text-red-500">{errors.vehicle}</p>
            )}
          </div>
          <div className="mb-6">
            <h2 className="font-bold text-lg mb-2 text-foreground">
              Contact Information
            </h2>
            <ContactInfo
              onContactInfoChange={(
                newName,
                newPhoneNumber,
                nameValid,
                phoneValid
              ) => {
                setName(newName);
                setPhoneNumber(newPhoneNumber);
                setIsNameValid(nameValid);
                setIsPhoneNumberValid(phoneValid);
              }}
              onFieldTouched={(field) => {
                setTouched((prev) => ({ ...prev, [field]: true }));
              }}
            />
            {(touched.name && errors.name) || (touched.phoneNumber && errors.phoneNumber) ? (
              <div className="mt-1 space-y-1">
                {touched.name && errors.name && (
                  <p className="text-xs text-red-500">{errors.name}</p>
                )}
                {touched.phoneNumber && errors.phoneNumber && (
                  <p className="text-xs text-red-500">{errors.phoneNumber}</p>
                )}
              </div>
            ) : null}
          </div>
          <div className="mb-8">
            {/* BookingSummary will be shown on the payment page instead */}
          </div>

          {bookingError ? (
            <div className="mb-6">
              <ErrorDisplay
                error={bookingError}
                onRetry={() => {
                  setBookingError(null);
                  handleConfirm();
                }}
                onSignIn={() => {
                  router.push('/auth');
                }}
              />
            </div>
          ) : null}

          <ButtonV2
            variant="primary"
            className="w-full"
            onClick={handleConfirm}
            disabled={!isFormValid}
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
