"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useJsApiLoader } from "@react-google-maps/api";
import type { PickupLocation } from "./PickupLocationInput";

type Prediction = google.maps.places.AutocompletePrediction;

const libraries: ("places")[] = ["places"];

function extractCountry(
  results: google.maps.GeocoderResult[]
): string | undefined {
  if (!results || !results[0]) return undefined;
  const countryComp = results[0].address_components?.find((component) =>
    component.types.includes("country")
  );
  return countryComp?.long_name;
}

interface CustomPickupLocationInputProps {
  value: PickupLocation;
  onChange: (value: PickupLocation) => void;
  placeholder?: string;
  helperText?: string;
}

const CustomPickupLocationInput: React.FC<CustomPickupLocationInputProps> = ({
  value,
  onChange,
  placeholder = "Search for a hotel, landmark, or address",
  helperText = "Search uses Google Maps so you get precise pickup details.",
}) => {
  const [inputValue, setInputValue] = useState(value?.address || "");
  const [suggestions, setSuggestions] = useState<Prediction[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sessionToken, setSessionToken] =
    useState<google.maps.places.AutocompleteSessionToken | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoadingResults, setIsLoadingResults] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (value?.address) {
      setInputValue((prev) =>
        prev === value.address ? prev : value.address || ""
      );
    }
  }, [value?.address]);

  useEffect(() => {
    if (
      !isLoaded ||
      !isHydrated ||
      !inputValue ||
      typeof window === "undefined"
    ) {
      setSuggestions([]);
      setSessionToken(null);
      return;
    }

    if (!sessionToken) {
      setSessionToken(new window.google.maps.places.AutocompleteSessionToken());
    }

    const service = new window.google.maps.places.AutocompleteService();
    setIsLoadingResults(true);
    service.getPlacePredictions(
      {
        input: inputValue,
        componentRestrictions: { country: "lk" },
        sessionToken: sessionToken || undefined,
      },
      (predictions) => {
        setSuggestions(predictions || []);
        setIsLoadingResults(false);
      }
    );
  }, [inputValue, isLoaded, isHydrated, sessionToken]);

  const handleSuggestionSelect = (prediction: Prediction) => {
    if (!isLoaded || typeof window === "undefined" || !window.google) return;
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode(
      { placeId: prediction.place_id },
      (results, status) => {
        if (status === "OK" && results && results[0]) {
          const { geometry, formatted_address, place_id } = results[0];
          const location = geometry.location;
          const updated: PickupLocation = {
            placeId: place_id,
            coordinate: { lat: location.lat(), lng: location.lng() },
            address: formatted_address,
            country: extractCountry(results),
          };
          setInputValue(formatted_address);
          setSuggestions([]);
          setShowSuggestions(false);
          onChange(updated);
        }
        setSessionToken(null);
      }
    );
  };

  const helperContent = useMemo(() => {
    if (loadError) {
      return "Google Maps failed to load. Please refresh and try again.";
    }
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return "Missing Google Maps API key. Contact support.";
    }
    return helperText;
  }, [helperText, loadError]);

  return (
    <div className="relative w-full">
      <input
        type="text"
        className="appearance-none border-2 border-input rounded-lg p-3 w-full h-12 text-lg text-foreground placeholder-muted-foreground bg-card shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
        placeholder={placeholder}
        value={inputValue}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        onChange={(event) => {
          setInputValue(event.target.value);
          if (!event.target.value) {
            setSuggestions([]);
            onChange({});
          }
        }}
      />
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-xl border border-border bg-background shadow-lg max-h-60 overflow-auto">
          {suggestions.map((prediction) => (
            <button
              key={prediction.place_id}
              type="button"
              className="w-full text-left px-4 py-3 hover:bg-accent transition-colors"
              onClick={() => handleSuggestionSelect(prediction)}
            >
              <p className="text-sm font-medium text-foreground">
                {prediction.structured_formatting?.main_text ||
                  prediction.description}
              </p>
              {prediction.structured_formatting?.secondary_text && (
                <p className="text-xs text-muted-foreground">
                  {prediction.structured_formatting.secondary_text}
                </p>
              )}
            </button>
          ))}
        </div>
      )}
      {isLoadingResults && (
        <p className="mt-2 text-xs text-muted-foreground">Searching…</p>
      )}
      {helperContent && (
        <p className="mt-2 text-xs text-muted-foreground">{helperContent}</p>
      )}
    </div>
  );
};

export default CustomPickupLocationInput;
