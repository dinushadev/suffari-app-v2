"use client";
import React from 'react';
import CustomImage from '../atoms/CustomImage';

export interface VehicleTypeOption {
  label: string;
  value: string;
  description?: string;
  icon?: string; // Add icon property
  imageUrl?: string; // Add imageUrl property
  price?: number;
  featureList?: string[];
  numberOfGuests?: number;
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
          className={`flex gap-4 border border-ash rounded-2xl p-4 text-left transition focus:outline-none shadow-sm bg-ivory relative
            ${selected === option.value ? 'border-orange ring-2 ring-orange/30 scale-[1.03] bg-orange/5' : 'hover:border-orange hover:scale-[1.01]'}
            hover:shadow-md active:scale-95 duration-150`}
          onClick={() => onSelect(option.value)}
        >
          {/* Image */}
          <span className="w-20 h-20 flex items-center justify-center flex-shrink-0">
            {option.imageUrl ? (
              <CustomImage src={option.imageUrl} alt={option.label} width={80} height={80} className="rounded-xl object-cover border border-ash" />
            ) : (
              <span className="text-4xl">{option.icon || defaultIcons[option.value] || '🚙'}</span>
            )}
          </span>
          {/* Main content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-bold text-foreground text-lg leading-tight">{option.label}</div>
                {option.description && <div className="text-xs text-ash mb-1 leading-tight">{option.description}</div>}
                {option.numberOfGuests !== undefined && (
                  <div className="flex items-center gap-1 text-xs text-ash mt-1">
                    <span className="text-base">👥</span> {option.numberOfGuests} Guests
                  </div>
                )}
              </div>
              {option.price !== undefined && (
                <div className="bg-orange/10 text-orange font-bold px-3 py-1 rounded-lg text-sm whitespace-nowrap shadow-sm border border-orange/20">
                  LKR {option.price.toLocaleString()}
                </div>
              )}
            </div>
            {/* Features as chips */}
            {option.featureList && option.featureList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {option.featureList.map((feature, idx) => (
                  <span key={idx} className="bg-ash/10 text-xs text-foreground px-2 py-0.5 rounded-full border border-ash/20">
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
          {selected === option.value && (
            <span className="absolute top-2 right-2 text-orange text-2xl animate-bounce">✓</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default VehicleTypeSelector; 