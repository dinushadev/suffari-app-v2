"use client";
import React from 'react';
import CustomImage from '../atoms/CustomImage';

export interface VehicleTypeOption {
  label: string;
  value: string;
  description?: string;
  icon?: string; // Add icon property
  imageUrl?: string; // Add imageUrl property
}

interface VehicleTypeSelectorProps {
  options: VehicleTypeOption[];
  selected: string;
  onSelect: (value: string) => void;
}

const defaultIcons: Record<string, string> = {
  private: '🚙',
  shared: '🚐',
  luxury: '🛻',
};

const VehicleTypeSelector: React.FC<VehicleTypeSelectorProps> = ({ options, selected, onSelect }) => {
  return (
    <div className="flex flex-col gap-3">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`flex items-center gap-4 border border-ash rounded-xl p-4 text-left transition focus:outline-none shadow-sm
            bg-ivory
            ${selected === option.value ? 'border-orange ring-2 ring-orange/30 scale-[1.03]' : 'hover:border-orange hover:scale-[1.01]'}
            hover:shadow-md active:scale-95 duration-150`}
          onClick={() => onSelect(option.value)}
        >
          <span className="w-12 h-12 flex items-center justify-center">
            {option.imageUrl ? (
              <CustomImage src={option.imageUrl} alt={option.label} width={48} height={48} className="rounded-lg object-cover" />
            ) : (
              <span className="text-3xl">{option.icon || defaultIcons[option.value] || '🚙'}</span>
            )}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-foreground text-lg">{option.label}</div>
            {option.description && <div className="text-sm text-ash">{option.description}</div>}
          </div>
          {selected === option.value && (
            <span className="ml-2 text-orange text-xl animate-bounce">✓</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default VehicleTypeSelector; 