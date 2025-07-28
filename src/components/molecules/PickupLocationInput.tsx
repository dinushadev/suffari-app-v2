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
      <label className="flex items-center gap-2 text-base font-medium text-blue-900">
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
            className="border-2 border-blue-200 rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg text-gray-900 placeholder-gray-400 bg-white shadow-sm"
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