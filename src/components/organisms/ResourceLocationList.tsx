"use client";
import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { CustomImage } from '../atoms';

export interface ResourceLocation {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  subtitle?: string;
}

interface ResourceLocationListProps {
  locations: ResourceLocation[];
  onSelect: (id: string) => void;
}

const ResourceLocationList: React.FC<ResourceLocationListProps> = ({ locations, onSelect }) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      {locations.map((location) => (
        <div
          key={location.id}
          className="flex items-center bg-ivory border border-ash rounded-3xl shadow-lg p-6 gap-6 hover:shadow-2xl transition cursor-pointer flex-col sm:flex-row"
          onClick={() => onSelect(location.id)}
        >
          <CustomImage
            src={location.thumbnail}
            alt={location.name}
            width={192}
            height={192}
            className="w-full sm:w-48 h-48 object-cover rounded-2xl flex-shrink-0 mb-4 sm:mb-0 border-4 border-background shadow"
          />
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-2xl text-foreground mb-2 drop-shadow-sm">{location.name}</div>
            {location.subtitle && (
              <div className="text-orange text-base mb-2 font-medium">{location.subtitle}</div>
            )}
            <div className="text-ash text-base whitespace-pre-line leading-relaxed">{location.description}</div>
          </div>
          <button
            className="ml-0 sm:ml-4 bg-background hover:bg-orange rounded-full p-3 focus:outline-none self-start sm:self-center shadow border border-ash"
            tabIndex={-1}
            aria-label={`View details for ${location.name}`}
            onClick={e => { e.stopPropagation(); onSelect(location.id); }}
          >
            <ArrowRightIcon className="w-7 h-7 text-orange" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ResourceLocationList; 