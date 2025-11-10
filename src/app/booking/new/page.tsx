"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJsApiLoader } from "@react-google-maps/api";
import {
  ContactInfo,
  CustomPickupLocationInput,
  DatePicker,
  GroupSizeSelector,
} from "@/components/molecules";
import {
  ButtonV2,
  ErrorDisplay,
  Loader,
  PickupOption,
  FullScreenLoader,
} from "@/components/atoms";
import { useGuideDetails } from "@/data/useGuideDetails";
import {
  useCreateBooking,
  type BookingPayload,
} from "@/data/useCreateBooking";
import type { PickupLocation } from "@/components/molecules/PickupLocationInput";
import { supabase } from "@/data/apiConfig";
import type { GuidePricing } from "@/types/guide";
import { getTimezoneForLocation, convertLocalToUTC } from "@/lib/timezoneUtils";

const libraries: ("places")[] = ["places"];

type AirportOption = {
  id: string;
  label: string;
  description: string;
  pickupLocation: PickupLocation;
};

const initialAirportOptions: AirportOption[] = [
  {
    id: "cmb",
    label: "Bandaranaike International Airport (CMB)",
    description: "Colombo / Katunayake",
    pickupLocation: {
      address: "Bandaranaike International Airport, Katunayake, Sri Lanka",
      country: "Sri Lanka",
      placeId: "ChIJXS3yNbfv4joRN4uCAyFwvW4",
      coordinate: { lat: 7.1808, lng: 79.8841 },
    },
  },
  {
    id: "hri",
    label: "Mattala Rajapaksa International Airport (HRI)",
    description: "Hambantota",
    pickupLocation: {
      address: "Mattala Rajapaksa International Airport, Mattala, Sri Lanka",
      country: "Sri Lanka",
      placeId: "ChIJw1fz0v-g5joRDHBaRaxNUE8",
      coordinate: { lat: 6.2839, lng: 81.125 },
    },
  },
  {
    id: "rml",
    label: "Colombo International Airport, Ratmalana (RML)",
    description: "Ratmalana",
    pickupLocation: {
      address: "Colombo International Airport, Ratmalana, Sri Lanka",
      country: "Sri Lanka",
      placeId: "ChIJE9dyVs5a4joRSwAn-GRRRRk",
      coordinate: { lat: 6.8219, lng: 79.8854 },
    },
  },
];

const DEFAULT_LOCATION_ID = "bfe1341e-5e05-448c-af1d-e8ad749eb86d";

function generateSessionId() {
  return "sess_" + Math.random().toString(36).substring(2, 10) + Date.now();
}

function calculateStayLength(startDate: string, endDate: string): number {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = end.getTime() - start.getTime();
  if (diff < 0) return 0;
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

function NewBookingPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId =
    searchParams.get("location") || DEFAULT_LOCATION_ID;
  const guideIdParam = searchParams.get("guideId") || "";

  // Fetch guide details from API
  const {
    data: guideData,
    isLoading: guideLoading,
    error: guideError,
  } = useGuideDetails(guideIdParam);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [pickupMode, setPickupMode] = useState<"airport" | "custom">("airport");
  const [airportOptions, setAirportOptions] = useState<AirportOption[]>(initialAirportOptions);
  const [selectedAirportId, setSelectedAirportId] = useState<string>(
    initialAirportOptions[0]?.id || "cmb"
  );
  const [customPickup, setCustomPickup] = useState<PickupLocation>({});
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isNameValid, setIsNameValid] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);
  const [bookingError, setBookingError] = useState<unknown>(null);
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const createBookingMutation = useCreateBooking();

  // Fetch place IDs for airports using Google Places API
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined" || !window.google) return;

    const fetchPlaceIds = () => {
      initialAirportOptions.forEach((option) => {
        // If placeId already exists, skip fetching
        if (option.pickupLocation.placeId) {
          return;
        }

        const service = new window.google.maps.places.AutocompleteService();
        const geocoder = new window.google.maps.Geocoder();

        // First, try to find the place using autocomplete
        service.getPlacePredictions(
          {
            input: option.label,
            types: ["airport"],
            componentRestrictions: { country: "lk" },
          },
          (predictions) => {
            if (predictions && predictions.length > 0) {
              // Find the best match
              const bestMatch = predictions.find(
                (p) =>
                  p.description
                    .toLowerCase()
                    .includes(option.id.toLowerCase()) ||
                  p.description
                    .toLowerCase()
                    .includes(option.label.toLowerCase().split("(")[0].trim())
              ) || predictions[0];

              // Get place details using place_id
              geocoder.geocode(
                { placeId: bestMatch.place_id },
                (results, status) => {
                  if (status === "OK" && results && results[0]) {
                    const location = results[0].geometry.location;
                    setAirportOptions((prev) =>
                      prev.map((opt) =>
                        opt.id === option.id
                          ? {
                              ...opt,
                              pickupLocation: {
                                ...opt.pickupLocation,
                                placeId: results[0].place_id,
                                coordinate: {
                                  lat: location.lat(),
                                  lng: location.lng(),
                                },
                                address: results[0].formatted_address,
                              },
                            }
                          : opt
                      )
                    );
                  } else {
                    // Fallback: use reverse geocoding with existing coordinates
                    if (option.pickupLocation.coordinate) {
                      geocoder.geocode(
                        {
                          location: new window.google.maps.LatLng(
                            option.pickupLocation.coordinate.lat,
                            option.pickupLocation.coordinate.lng
                          ),
                        },
                        (results, status) => {
                          if (status === "OK" && results && results[0]) {
                            setAirportOptions((prev) =>
                              prev.map((opt) =>
                                opt.id === option.id
                                  ? {
                                      ...opt,
                                      pickupLocation: {
                                        ...opt.pickupLocation,
                                        placeId: results[0].place_id,
                                      },
                                    }
                                  : opt
                              )
                            );
                          }
                        }
                      );
                    }
                  }
                }
              );
            } else {
              // Fallback: use reverse geocoding with existing coordinates
              if (option.pickupLocation.coordinate) {
                geocoder.geocode(
                  {
                    location: new window.google.maps.LatLng(
                      option.pickupLocation.coordinate.lat,
                      option.pickupLocation.coordinate.lng
                    ),
                  },
                  (results, status) => {
                    if (status === "OK" && results && results[0]) {
                      setAirportOptions((prev) =>
                        prev.map((opt) =>
                          opt.id === option.id
                            ? {
                                ...opt,
                                pickupLocation: {
                                  ...opt.pickupLocation,
                                  placeId: results[0].place_id,
                                },
                              }
                            : opt
                        )
                      );
                    }
                  }
                );
              }
            }
          }
        );
      });
    };

    fetchPlaceIds();
  }, [isLoaded]);

  const selectedAirport = useMemo(
    () => airportOptions.find((option) => option.id === selectedAirportId),
    [selectedAirportId, airportOptions]
  );

  const selectedPickupLocation: PickupLocation | undefined =
    pickupMode === "airport" ? selectedAirport?.pickupLocation : customPickup;

  // Extract data from guide API response
  const guideName = guideData?.bio?.preferredName || 
    `${guideData?.bio?.firstName || ""} ${guideData?.bio?.lastName || ""}`.trim() || 
    "Guide";
  
  // Extract resourceTypeId - should be normalized by useGuideDetails hook
  // But keep fallback logic in case API structure is different
  const guideResourceTypeId = 
    guideData?.resourceTypeId ||           // Primary: normalized from hook
    guideData?.resourceType?.id ||          // Fallback: nested in resourceType object
    "";
  
  // Log guide data structure for debugging
  useEffect(() => {
    if (guideData) {
      console.log("Guide Data Structure:", {
        resourceTypeId: guideData.resourceTypeId,
        resourceType: guideData.resourceType,
        resourceType_id: guideData.resourceType?.id,
        extractedResourceTypeId: guideResourceTypeId,
      });
      if (!guideResourceTypeId) {
        console.warn("⚠️ resourceTypeId is missing from guide data! Full guide data:", guideData);
      }
    }
  }, [guideData, guideResourceTypeId]);
  
  const guideResourceLabel = guideData?.resourceType?.name || guideData?.resourceType?.description || "";
  // Use 'rates' from API, fallback to 'pricing' for backward compatibility
  const guidePricing: GuidePricing[] | null = guideData?.rates || guideData?.pricing || null;

  const stayLengthInDays = calculateStayLength(startDate, endDate);
  const totalGuests = adults + children;

  // Calculate payment estimate based on guide pricing if available
  const paymentEstimate = useMemo(() => {
    // If no guide data, return 0
    if (!guideData) return 0;
    
    // If no dates selected, return 0
    if (stayLengthInDays <= 0) return 0;

    // If guide rates/pricing is available, use it to calculate based on selected days
    if (guidePricing && guidePricing.length > 0) {
      // Prefer daily rate for multi-day bookings, otherwise use hourly
      const dailyRate = guidePricing.find((r) => r.type === "daily");
      const hourlyRate = guidePricing.find((r) => r.type === "hourly");
      
      // Use daily rate if available, otherwise use hourly
      const selectedRate = dailyRate || hourlyRate;
      
      if (selectedRate && selectedRate.amount && selectedRate.amount > 0) {
        if (selectedRate.type === "hourly") {
          // Default: 8 hours per day (09:00-17:00)
          const hoursPerDay = 8;
          const totalHours = stayLengthInDays * hoursPerDay;
          const calculatedAmount = selectedRate.amount * totalHours;
          return Number.isFinite(calculatedAmount) && calculatedAmount > 0 ? calculatedAmount : 0;
        } else if (selectedRate.type === "daily") {
          const calculatedAmount = selectedRate.amount * stayLengthInDays;
          return Number.isFinite(calculatedAmount) && calculatedAmount > 0 ? calculatedAmount : 0;
        }
      }
    }
    
    // Fallback: use resource type price if available
    const baseRate = guideData?.resourceType?.price;
    if (baseRate && baseRate > 0) {
      const fallbackAmount =
        baseRate *
        Math.max(1, totalGuests) *
        Math.max(1, stayLengthInDays);
      return Number.isFinite(fallbackAmount) && fallbackAmount > 0 ? fallbackAmount : 0;
    }
    
    return 0;
  }, [guidePricing, stayLengthInDays, totalGuests, guideData]);

  // Debug: Log guide data to console (remove in production)
  useEffect(() => {
    if (guideData) {
      console.log("Guide Data:", guideData);
      console.log("Guide Pricing:", guidePricing);
      console.log("Resource Type Price:", guideData?.resourceType?.price);
      console.log("Stay Length:", stayLengthInDays);
      console.log("Total Guests:", totalGuests);
      console.log("Payment Estimate:", paymentEstimate);
    }
  }, [guideData, guidePricing, stayLengthInDays, totalGuests, paymentEstimate]);

  const isDateRangeValid =
    !!startDate && !!endDate && calculateStayLength(startDate, endDate) > 0;

  const isPickupValid =
    pickupMode === "airport"
      ? !!selectedAirport
      : !!customPickup?.address && !!customPickup?.coordinate;

  const isFormValid =
    !!locationId &&
    !!guideIdParam &&
    !!guideResourceTypeId &&
    isDateRangeValid &&
    isPickupValid &&
    totalGuests > 0 &&
    isNameValid &&
    isPhoneValid;

  // Debug: Log form validation state
  useEffect(() => {
    console.log("Form Validation Debug:", {
      locationId: !!locationId,
      guideIdParam: !!guideIdParam,
      guideResourceTypeId: !!guideResourceTypeId,
      guideResourceTypeIdValue: guideResourceTypeId,
      isDateRangeValid,
      isPickupValid,
      totalGuests,
      isNameValid,
      isPhoneValid,
      isFormValid,
      startDate,
      endDate,
      pickupMode,
      selectedAirport: !!selectedAirport,
      customPickup: customPickup,
      name,
      phoneNumber,
    });
  }, [
    locationId,
    guideIdParam,
    guideResourceTypeId,
    isDateRangeValid,
    isPickupValid,
    totalGuests,
    isNameValid,
    isPhoneValid,
    isFormValid,
    startDate,
    endDate,
    pickupMode,
    selectedAirport,
    customPickup,
    name,
    phoneNumber,
  ]);

  const handleCreateBooking = async () => {
    console.log("Submit button clicked. Form valid:", isFormValid);
    if (!isFormValid) {
      console.log("Form validation failed. Cannot submit.");
      return;
    }
    setBookingError(null);
    setIsButtonLoading(true);
    try {
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
        email: session?.user?.email || null,
        phone: session?.user?.phone || null,
        sessionId: "",
      };

      if (!session || !session.user) {
        let sessionId = localStorage.getItem("raahi_session_id");
        if (!sessionId) {
          sessionId = generateSessionId();
          localStorage.setItem("raahi_session_id", sessionId);
        }
        customer.sessionId = sessionId;
      } else {
        customer.sessionId = generateSessionId();
      }

      const pickupForPayload: PickupLocation = selectedPickupLocation || {
        placeId: undefined,
        coordinate: { lat: 0, lng: 0 },
        address: "",
        country: undefined,
      };

      // For guide bookings: convert dates to ISO datetime strings
      // Both dates use 00:00:00 (midnight) for date-only selections
      // Use consistent timezone handling - ensure both dates use the same time format
      if (!startDate || !endDate) {
        setBookingError("Please select both start and end dates.");
        setIsButtonLoading(false);
        return;
      }

      // Validate that end date is not before start date
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        setBookingError("End date must be on or after the start date.");
        setIsButtonLoading(false);
        return;
      }

      // Get timezone for the location
      const locationTimezone = getTimezoneForLocation(
        locationId,
        pickupForPayload.country || undefined
      );

      // Convert local times in the location's timezone to UTC
      // Start date: beginning of day (00:00:00) - represents start of booking
      // End date: end of day (23:59:59.999) - represents end of booking
      const startDateTime = convertLocalToUTC(startDate, "00:00:00", locationTimezone);
      const endDateTime = convertLocalToUTC(endDate, "23:59:59.999", locationTimezone);

      // Debug logging
      console.log("Booking date/time values:", {
        startDate,
        endDate,
        locationTimezone,
        startDateTime,
        endDateTime,
        startDateParsed: new Date(startDateTime).toISOString(),
        endDateParsed: new Date(endDateTime).toISOString(),
      });

      const bookingPayload: BookingPayload = {
        customer: {
          email: customer.email,
          phone: customer.phone || phoneNumber || null,
          sessionId: customer.sessionId,
          name,
        },
        resourceTypeId: guideResourceTypeId,
        resourceId: guideIdParam || null,
        resourceOwnerId: null,
        locationId,
        schedule: {
          startDateTime,
          endDateTime,
          timezone: locationTimezone,
        },
        group: {
          adults,
          children,
          size: totalGuests,
        },
        pickupLocation: {
          placeId: pickupForPayload.placeId || null,
          coordinate: pickupForPayload.coordinate || { lat: 0, lng: 0 },
          address: pickupForPayload.address || "",
          country: pickupForPayload.country || null,
        },
        // Use calculated payment estimate based on guide pricing and selected days
        paymentAmount: Number.isFinite(paymentEstimate) ? paymentEstimate : 0,
      };

      const bookingResponse = await createBookingMutation.mutateAsync(
        bookingPayload
      );
      if (bookingResponse?.id) {
        router.push(`/booking/payment?orderId=${bookingResponse.id}`);
        return;
      }
    } catch (error) {
      console.error("Custom booking error:", error);
      setBookingError(error);
    } finally {
      setIsButtonLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background p-4">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        <header className="text-center space-y-2">
          <p className="text-sm uppercase tracking-tight text-muted-foreground">
            Plan Your Adventure
          </p>
          <h1 className="text-3xl font-extrabold text-foreground">
            Custom Booking Request
          </h1>
          <p className="text-muted-foreground">
            Tell us when you&apos;d like to travel, where to pick you up, and
            who&apos;s joining. We&apos;ll handle the rest.
          </p>
        </header>
        
        {!guideIdParam && (
          <div className="rounded-3xl border border-red-400 bg-red-50 p-4 text-sm text-red-600 shadow-sm">
            <p className="text-base font-semibold">
              Missing Guide ID
            </p>
            <p className="text-muted-foreground">
              Please provide a guide ID in the URL parameters to continue with the booking.
            </p>
          </div>
        )}

        {guideLoading && (
          <div className="flex justify-center items-center py-8">
            <Loader />
          </div>
        )}

        {guideError && (
          <div className="rounded-3xl border border-red-400 bg-red-50 p-4 text-sm text-red-600 shadow-sm">
            <p className="text-base font-semibold">
              Failed to Load Guide Details
            </p>
            <p className="text-muted-foreground">
              {guideError instanceof Error ? guideError.message : "An error occurred while loading guide information."}
            </p>
          </div>
        )}

        {guideData && (
          <div className="rounded-3xl border border-primary/40 bg-primary/10 p-4 text-sm text-primary shadow-sm">
            <p className="text-base font-semibold">
              You&apos;re booking {guideName}
            </p>
            <p className="text-muted-foreground">
              We&apos;ll reserve this guide with your request. Adjust the trip
              details below and submit when ready.
            </p>
          </div>
        )}

        {guideData && (
          <section className="w-full">
            <div className="space-y-6 bg-card p-6 rounded-3xl shadow-lg border border-border">
            <div>
              <h2 className="font-bold text-lg mb-2 text-foreground">
                Guide Details
              </h2>
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
                <p className="text-base font-semibold text-primary">
                  {guideName}
                </p>
                {guideData.bio?.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {guideData.bio.description}
                  </p>
                )}
                <p className="text-muted-foreground mt-2">
                  Experience type:{" "}
                  <span className="font-semibold text-foreground">
                    {guideResourceLabel || "Guide"}
                  </span>
                </p>
                {guideData.expertise && guideData.expertise.length > 0 && (
                  <p className="text-muted-foreground mt-2">
                    Expertise:{" "}
                    <span className="font-semibold text-foreground">
                      {guideData.expertise.join(", ")}
                    </span>
                  </p>
                )}
                {guideData.speaking_languages && guideData.speaking_languages.length > 0 && (
                  <p className="text-muted-foreground mt-2">
                    Languages:{" "}
                    <span className="font-semibold text-foreground">
                      {guideData.speaking_languages.join(", ")}
                    </span>
                  </p>
                )}
                <p className="mt-2 text-xs text-muted-foreground">
                  Need a different guide or experience? Return to the guides
                  list to switch before submitting.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h2 className="font-bold text-lg mb-2 text-foreground">
                  Start Date
                </h2>
                <DatePicker
                  value={startDate}
                  onChange={setStartDate}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
              <div>
                <h2 className="font-bold text-lg mb-2 text-foreground">
                  End Date
                </h2>
                <DatePicker
                  value={endDate}
                  onChange={setEndDate}
                  min={startDate || new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>
            {!isDateRangeValid && startDate && endDate && (
              <p className="text-sm text-red-500">
                End date must be on or after the start date.
              </p>
            )}

            {/* Dynamic Rate Display */}
            {stayLengthInDays > 0 && guideData && (() => {
              // Prefer daily rate for display, matching calculation logic
              const dailyRate = guidePricing?.find((r) => r.type === "daily");
              const hourlyRate = guidePricing?.find((r) => r.type === "hourly");
              const selectedRate = dailyRate || hourlyRate;
              
              return (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                  <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                    Booking Rate
                  </h3>
                  {selectedRate && selectedRate.amount > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-foreground">
                          {selectedRate.type === "hourly" ? "Hourly Rate" : "Daily Rate"}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {selectedRate.currency || "USD"} {selectedRate.amount.toFixed(2)}/{selectedRate.type === "hourly" ? "hour" : "day"}
                        </span>
                      </div>
                      {selectedRate.type === "hourly" ? (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {stayLengthInDays} day{stayLengthInDays !== 1 ? "s" : ""} × 8 hours/day
                          </span>
                          <span>
                            = {stayLengthInDays * 8} hours
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {stayLengthInDays} day{stayLengthInDays !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="text-base font-bold text-foreground">
                          Total Rate
                        </span>
                        <span className="text-lg font-bold text-primary">
                          {selectedRate.currency || "USD"} {paymentEstimate.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ) : guideData?.resourceType?.price && guideData.resourceType.price > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">
                        Base Rate per Guest per Day
                      </span>
                      <span className="text-sm font-semibold text-foreground">
                        ${guideData.resourceType.price.toFixed(2)} USD
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {stayLengthInDays} day{stayLengthInDays !== 1 ? "s" : ""} × {totalGuests} guest{totalGuests !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                      <span className="text-base font-bold text-foreground">
                        Estimated Total
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ${paymentEstimate.toFixed(2)} USD
                      </span>
                    </div>
                  </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">
                        Estimated Total
                      </span>
                      <span className="text-lg font-bold text-primary">
                        ${paymentEstimate.toFixed(2)} USD
                      </span>
                    </div>
                  )}
                </div>
              );
            })()}

            <div>
              <h2 className="font-bold text-lg mb-2 text-foreground">
                Pickup Preference
              </h2>
              <div className="flex flex-col gap-3 md:flex-row">
                <PickupOption
                  icon={<span role="img" aria-label="airport">✈️</span>}
                  label="Airport Pickup"
                  description="Meet you right at arrivals."
                  checked={pickupMode === "airport"}
                  onChange={() => setPickupMode("airport")}
                  value="airport"
                />
                <PickupOption
                  icon={<span role="img" aria-label="pin">📍</span>}
                  label="Custom Location"
                  description="Search any hotel or address."
                  checked={pickupMode === "custom"}
                  onChange={() => setPickupMode("custom")}
                  value="custom"
                />
              </div>

              {pickupMode === "airport" ? (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-muted-foreground mb-2">
                    Select Airport
                  </label>
                  <div className="space-y-3">
                    {airportOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedAirportId(option.id)}
                        className={`w-full text-left border-2 rounded-2xl p-4 transition-all ${
                          selectedAirportId === option.id
                            ? "border-primary bg-primary/10"
                            : "border-input bg-background hover:border-accent"
                        }`}
                      >
                        <p className="font-semibold text-foreground">
                          {option.label}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {option.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <CustomPickupLocationInput
                    value={customPickup}
                    onChange={setCustomPickup}
                    helperText="Search anywhere in Sri Lanka using Google Maps."
                  />
                </div>
              )}
            </div>

            <div>
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

            <div>
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
                  setIsPhoneValid(phoneValid);
                }}
              />
            </div>

            {bookingError !== null && (
              <ErrorDisplay
                error={bookingError}
                onRetry={handleCreateBooking}
                onSignIn={() => router.push("/auth")}
              />
            )}

            {/* Debug: Show validation status */}
            {process.env.NODE_ENV === "development" && (
              <div className="rounded-lg border border-yellow-400 bg-yellow-50 p-4 text-xs text-yellow-800">
                <p className="font-semibold mb-2">Form Validation Status:</p>
                <ul className="space-y-1">
                  <li className={locationId ? "text-green-600" : "text-red-600"}>
                    Location ID: {locationId ? "✓" : "✗"}
                  </li>
                  <li className={guideIdParam ? "text-green-600" : "text-red-600"}>
                    Guide ID: {guideIdParam ? "✓" : "✗"}
                  </li>
                  <li className={guideResourceTypeId ? "text-green-600" : "text-red-600"}>
                    Guide Resource Type ID: {guideResourceTypeId ? "✓" : "✗"} ({guideResourceTypeId || "empty"})
                  </li>
                  <li className={isDateRangeValid ? "text-green-600" : "text-red-600"}>
                    Date Range: {isDateRangeValid ? "✓" : "✗"}
                  </li>
                  <li className={isPickupValid ? "text-green-600" : "text-red-600"}>
                    Pickup Location: {isPickupValid ? "✓" : "✗"}
                  </li>
                  <li className={totalGuests > 0 ? "text-green-600" : "text-red-600"}>
                    Group Size: {totalGuests > 0 ? "✓" : "✗"} ({totalGuests} guests)
                  </li>
                  <li className={isNameValid ? "text-green-600" : "text-red-600"}>
                    Name Valid: {isNameValid ? "✓" : "✗"} ({name || "empty"})
                  </li>
                  <li className={isPhoneValid ? "text-green-600" : "text-red-600"}>
                    Phone Valid: {isPhoneValid ? "✓" : "✗"} ({phoneNumber || "empty"})
                  </li>
                  <li className={isFormValid ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                    Form Valid: {isFormValid ? "✓ READY TO SUBMIT" : "✗ CANNOT SUBMIT"}
                  </li>
                </ul>
              </div>
            )}

            <ButtonV2
              className="w-full"
              variant="primary"
              onClick={handleCreateBooking}
              disabled={!isFormValid}
              loading={isButtonLoading}
              type="button"
            >
              Submit Custom Booking
            </ButtonV2>
          </div>
        </section>
        )}
      </div>
    </main>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<FullScreenLoader />}>
      <NewBookingPageContent />
    </Suspense>
  );
}
