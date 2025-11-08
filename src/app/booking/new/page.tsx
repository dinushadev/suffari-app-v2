"use client";

import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useJsApiLoader } from "@react-google-maps/api";
import {
  ContactInfo,
  CustomPickupLocationInput,
  DatePicker,
  GroupSizeSelector,
  VehicleTypeSelector,
} from "@/components/molecules";
import {
  ButtonV2,
  ErrorDisplay,
  Loader,
  PickupOption,
  FullScreenLoader,
} from "@/components/atoms";
import { useVehicleTypes } from "@/data/useVehicleTypes";
import {
  useCreateBooking,
  type BookingPayload,
} from "@/data/useCreateBooking";
import type { PickupLocation } from "@/components/molecules/PickupLocationInput";
import { supabase } from "@/data/apiConfig";

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
  const guideName = searchParams.get("guideName") || "";
  const guideResourceTypeId = searchParams.get("resourceTypeId") || "";
  const guideResourceLabel =
    searchParams.get("resourceLabel") || guideResourceTypeId || "";
  const guideResourcePriceParam = searchParams.get("resourcePrice");
  const guideResourcePrice = guideResourcePriceParam
    ? Number.parseFloat(guideResourcePriceParam) || 0
    : 0;

  const [vehicle, setVehicle] = useState(guideResourceTypeId);
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

  const {
    data: vehicleTypes,
    isLoading: vehicleTypesLoading,
    error: vehicleTypesError,
  } = useVehicleTypes();
  const createBookingMutation = useCreateBooking();

  useEffect(() => {
    if (guideResourceTypeId) {
      setVehicle((prev) =>
        prev === guideResourceTypeId ? prev : guideResourceTypeId
      );
    }
  }, [guideResourceTypeId]);

  // Fetch place IDs for airports using Google Places API
  useEffect(() => {
    if (!isLoaded || typeof window === "undefined" || !window.google) return;

    const fetchPlaceIds = () => {
      const updatedOptions = initialAirportOptions.map((option) => {
        // If placeId already exists, skip fetching
        if (option.pickupLocation.placeId) {
          return option;
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
        return option;
      });
    };

    fetchPlaceIds();
  }, [isLoaded]);

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

  const selectedAirport = useMemo(
    () => airportOptions.find((option) => option.id === selectedAirportId),
    [selectedAirportId]
  );

  const selectedPickupLocation: PickupLocation | undefined =
    pickupMode === "airport" ? selectedAirport?.pickupLocation : customPickup;

  const resolvedResourceTypeId = guideResourceTypeId || vehicle;
  const guidePreselected = Boolean(guideIdParam);

  const stayLengthInDays = calculateStayLength(startDate, endDate);
  const totalGuests = adults + children;
  const selectedVehicle = vehicleOptions.find(
    (v) => v.value === resolvedResourceTypeId
  );
  const baseRate =
    selectedVehicle?.price ??
    (guideResourceTypeId ? guideResourcePrice : undefined);
  const paymentEstimate =
    (baseRate || 0) *
    Math.max(1, totalGuests) *
    Math.max(1, stayLengthInDays || 1);

  const isDateRangeValid =
    !!startDate && !!endDate && calculateStayLength(startDate, endDate) > 0;

  const isPickupValid =
    pickupMode === "airport"
      ? !!selectedAirport
      : !!customPickup?.address && !!customPickup?.coordinate;

  const isFormValid =
    !!locationId &&
    !!resolvedResourceTypeId &&
    isDateRangeValid &&
    isPickupValid &&
    totalGuests > 0 &&
    isNameValid &&
    isPhoneValid;

  const handleCreateBooking = async () => {
    if (!isFormValid) return;
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
      // Default start time: 09:00:00, default end time: 17:00:00
      const startDateTime = startDate ? `${startDate}T09:00:00Z` : "";
      const endDateTime = endDate ? `${endDate}T17:00:00Z` : "";

      const bookingPayload: BookingPayload = {
        customer: {
          email: customer.email,
          phone: customer.phone || phoneNumber || null,
          sessionId: customer.sessionId,
          name,
        },
        resourceTypeId: resolvedResourceTypeId,
        resourceId: guideIdParam || null,
        resourceOwnerId: null,
        locationId,
        schedule: {
          startDateTime,
          endDateTime,
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
        paymentAmount: paymentEstimate,
      };

      const bookingResponse = await createBookingMutation.mutateAsync(
        bookingPayload
      );
      if (bookingResponse?.id) {
        router.push(`/booking/payment?bookingId=${bookingResponse.id}`);
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
        {guideName && (
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

        <section className="w-full">
          <div className="space-y-6 bg-card p-6 rounded-3xl shadow-lg border border-border">
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
                {guidePreselected ? "Guide" : "Vehicle"} Preference
              </h2>
              {guidePreselected ? (
                <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
                  <p className="text-base font-semibold text-primary">
                    {guideName}
                  </p>
                  <p className="text-muted-foreground">
                    Experience type:{" "}
                    <span className="font-semibold text-foreground">
                      {guideResourceLabel || guideResourceTypeId || "Guide"}
                    </span>
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Need a different guide or experience? Return to the guides
                    list to switch before submitting.
                  </p>
                </div>
              ) : vehicleTypesLoading ? (
                <Loader />
              ) : vehicleTypesError ? (
                <p className="text-red-500">Failed to load vehicle types.</p>
              ) : (
                <VehicleTypeSelector
                  options={vehicleOptions}
                  selected={vehicle}
                  onSelect={setVehicle}
                />
              )}
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

            <ButtonV2
              className="w-full"
              variant="primary"
              onClick={handleCreateBooking}
              disabled={!isFormValid}
              loading={isButtonLoading}
            >
              Submit Custom Booking
            </ButtonV2>
          </div>
        </section>
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
