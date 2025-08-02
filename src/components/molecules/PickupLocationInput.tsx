"use client";
import React from 'react';

interface PickupLocationInputProps {
  value: string;
  onChange: (value: string) => void;
  fromGate: boolean;
  onToggleGate: (checked: boolean) => void;
}

const PickupLocationInput: React.FC<PickupLocationInputProps> = ({ value, onChange, fromGate, onToggleGate }) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="flex items-center gap-2 text-base font-medium text-foreground">
        <input
          type="checkbox"
          checked={fromGate}
          onChange={e => onToggleGate(e.target.checked)}
        />
        Pickup from park gate
      </label>
      {!fromGate && (
        <>
          {/* TODO: Integrate Google Maps Autocomplete here */}
          <input
            type="text"
            className="border-2 border-ash rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-orange text-lg text-foreground placeholder-ash bg-ivory shadow-sm"
            placeholder="Enter pickup location or hotel (Google Maps search)"
            value={value}
            onChange={e => onChange(e.target.value)}
            autoComplete="off"
          />
        </>
      )}
    </div>
  );
};

export default PickupLocationInput; 