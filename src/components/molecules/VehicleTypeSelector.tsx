import React from 'react';

export interface VehicleTypeOption {
  label: string;
  value: string;
  description?: string;
}

interface VehicleTypeSelectorProps {
  options: VehicleTypeOption[];
  selected: string;
  onSelect: (value: string) => void;
}

const VehicleTypeSelector: React.FC<VehicleTypeSelectorProps> = ({ options, selected, onSelect }) => {
  return (
    <div className="flex flex-col gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`border rounded p-3 text-left transition focus:outline-none ${selected === option.value ? 'border-blue-600 bg-blue-50' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
          onClick={() => onSelect(option.value)}
        >
          <div className="font-semibold">{option.label}</div>
          {option.description && <div className="text-sm text-gray-500">{option.description}</div>}
        </button>
      ))}
    </div>
  );
};

export default VehicleTypeSelector; 