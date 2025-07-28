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
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={fromGate}
          onChange={e => onToggleGate(e.target.checked)}
        />
        Pickup from park gate
      </label>
      {!fromGate && (
        <input
          type="text"
          className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter pickup location"
          value={value}
          onChange={e => onChange(e.target.value)}
        />
      )}
    </div>
  );
};

export default PickupLocationInput; 