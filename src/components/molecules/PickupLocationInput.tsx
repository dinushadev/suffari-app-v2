"use client";
import React, { useState, useEffect } from 'react';
import PlacesAutocomplete from 'react-places-autocomplete';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import { PickupOption } from '../atoms';

export interface PickupLocation {
  placeId?: string;
  coordinate?: { lat: number; lng: number };
  address?: string;
  country?: string;
}

interface PickupLocationInputProps {
  value: PickupLocation;
  onChange: (value: PickupLocation) => void;
  fromGate: boolean;
  onToggleGate: (checked: boolean) => void;
}

const mapContainerStyle = {
  width: '100%',
  height: '250px',
  borderRadius: '0.75rem', // rounded-xl
  marginTop: '0.5rem',
};

function extractCountry(results: google.maps.GeocoderResult[]): string | undefined {
  if (!results || !results[0]) return undefined;
  const countryComp = results[0].address_components?.find((c: google.maps.GeocoderAddressComponent) => c.types.includes('country'));
  return countryComp?.long_name;
}

function geocodeAddress(address: string): Promise<PickupLocation | null> {
  return new Promise((resolve) => {
    if (!address) return resolve(null);
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
      if (status === 'OK' && results && results[0]) {
        const location = results[0].geometry.location;
        resolve({
          coordinate: { lat: location.lat(), lng: location.lng() },
          address: results[0].formatted_address,
          country: extractCountry(results),
          placeId: results[0].place_id,
        });
      } else {
        resolve(null);
      }
    });
  });
}

const PickupLocationInput: React.FC<PickupLocationInputProps> = ({ value, onChange, fromGate, onToggleGate }) => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(value?.coordinate || null);
  const [pickupMode, setPickupMode] = useState<'gate' | 'current' | 'custom'>(fromGate ? 'gate' : value?.address ? 'custom' : 'custom');
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries: ['places'],
  });

  // Reverse geocode for current location
  async function reverseGeocode(lat: number, lng: number): Promise<PickupLocation | null> {
    return new Promise((resolve) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          resolve({
            coordinate: { lat, lng },
            address: results[0].formatted_address,
            country: extractCountry(results),
            placeId: results[0].place_id,
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  useEffect(() => {
    if (pickupMode === 'gate') {
      onToggleGate(true);
      setCoords(null);
      onChange({ address: 'Pickup from park gate' });
    } else if (pickupMode === 'current') {
      onToggleGate(false);
      if (navigator.geolocation && isLoaded && window.google) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
          const { latitude, longitude } = pos.coords;
          setCoords({ lat: latitude, lng: longitude });
          const loc = await reverseGeocode(latitude, longitude);
          if (loc) onChange(loc);
        });
      }
    } else if (pickupMode === 'custom') {
      onToggleGate(false);
      if (value?.address && isLoaded && window.google) {
        geocodeAddress(value.address).then((loc) => {
          setCoords(loc?.coordinate || null);
          if (loc) onChange(loc);
        });
      } else {
        setCoords(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupMode, value?.address, isLoaded]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-3 mb-4 w-full">
        <PickupOption
          icon={
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M1.5 2.5h13v10a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1zM0 1h16v11.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 0 12.5zm3.75 4.5a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5M7 4.75a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0m1.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5" fill="#666"/></svg>
          }
          label="Pickup from park gate"
          description="Meet your driver at the main park entrance gate."
          checked={pickupMode === 'gate'}
          onChange={() => setPickupMode('gate')}
          value="gate"
        />
        <PickupOption
          icon={
            <svg width="24" height="24" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clipPath="url(#a)"><path fillRule="evenodd" clipRule="evenodd" d="M10.27 14.1a6.5 6.5 0 0 0 3.67-3.45q-1.24.21-2.7.34-.31 1.83-.97 3.1M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.48-1.52a7 7 0 0 1-.96 0H7.5a4 4 0 0 1-.84-1.32q-.38-.89-.63-2.08a40 40 0 0 0 3.92 0q-.25 1.2-.63 2.08a4 4 0 0 1-.84 1.31zm2.94-4.76q1.66-.15 2.95-.43a7 7 0 0 0 0-2.58q-1.3-.27-2.95-.43a18 18 0 0 1 0 3.44m-1.27-3.54a17 17 0 0 1 0 3.64 39 39 0 0 1-4.3 0 17 17 0 0 1 0-3.64 39 39 0 0 1 4.3 0m1.1-1.17q1.45.13 2.69.34a6.5 6.5 0 0 0-3.67-3.44q.65 1.26.98 3.1M8.48 1.5l.01.02q.41.37.84 1.31.38.89.63 2.08a40 40 0 0 0-3.92 0q.25-1.2.63-2.08a4 4 0 0 1 .85-1.32 7 7 0 0 1 .96 0m-2.75.4a6.5 6.5 0 0 0-3.67 3.44 29 29 0 0 1 2.7-.34q.31-1.83.97-3.1M4.58 6.28q-1.66.16-2.95.43a7 7 0 0 0 0 2.58q1.3.27 2.95.43a18 18 0 0 1 0-3.44m.17 4.71q-1.45-.12-2.69-.34a6.5 6.5 0 0 0 3.67 3.44q-.65-1.27-.98-3.1" fill="#666"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h16v16H0z"/></clipPath></defs></svg>
          }
          label="Pickup from my current location"
          description="We’ll use your device’s GPS to find you."
          checked={pickupMode === 'current'}
          onChange={() => setPickupMode('current')}
          value="current"
        />
        <PickupOption
          icon={<span role="img" aria-label="pin">📍</span>}
          label="Custom location"
          description="Search for a hotel or address using Google Maps."
          checked={pickupMode === 'custom'}
          onChange={() => setPickupMode('custom')}
          value="custom"
        />
      </div>
      {pickupMode === 'custom' && (
        <div className="relative w-full">
          <PlacesAutocomplete
            value={value?.address || ''}
            onChange={address => onChange({ ...value, address })}
            onSelect={address => onChange({ ...value, address })}
          >
            {({ getInputProps, suggestions, getSuggestionItemProps, loading }) => {
              return (
                <div>
                  <input
                    {...getInputProps({
                      placeholder: 'Enter pickup location or hotel (Google Maps search)',
                      className:
                        'border-2 border-ash rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-orange text-lg text-foreground placeholder-ash bg-ivory shadow-sm',
                      autoComplete: 'off',
                    })}
                  />
                  {suggestions.length > 0 && (
                    <div className="absolute left-0 right-0 mt-1 z-20 bg-background border border-ash w-full rounded shadow overflow-hidden">
                      {loading && <div className="p-2 text-gray-400">Loading...</div>}
                      {suggestions.map((suggestion) => {
                        const className =
                          suggestion.active
                            ? 'p-2 bg-orange-100/10 text-orange cursor-pointer'
                            : 'p-2 text-foreground cursor-pointer';
                        return (
                          <div
                            {...getSuggestionItemProps(suggestion, { className })}
                            key={suggestion.placeId}
                            onClick={() => onChange({
                              ...value,
                              address: suggestion.description,
                              placeId: suggestion.placeId,
                            })}
                          >
                            {suggestion.description}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Interactive map with pin for selected location */}
                  {isLoaded && coords && (
                    <div style={mapContainerStyle}>
                      <GoogleMap
                        mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
                        center={coords}
                        zoom={15}
                        options={{
                          disableDefaultUI: true,
                          clickableIcons: false,
                          gestureHandling: 'greedy',
                        }}
                      >
                        <Marker position={coords} />
                      </GoogleMap>
                    </div>
                  )}
                </div>
              );
            }}
          </PlacesAutocomplete>
        </div>
      )}
      {/* Show map for current location mode too */}
      {pickupMode === 'current' && isLoaded && coords && (
        <div style={mapContainerStyle}>
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.75rem' }}
            center={coords}
            zoom={15}
            options={{
              disableDefaultUI: true,
              clickableIcons: false,
              gestureHandling: 'greedy',
            }}
          >
            <Marker position={coords} />
          </GoogleMap>
        </div>
      )}
    </div>
  );
};

export default PickupLocationInput; 