"use client";
import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';

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
          className="flex items-center bg-gradient-to-br from-blue-50 to-green-50 rounded-3xl shadow-lg p-6 gap-6 hover:shadow-2xl transition cursor-pointer flex-col sm:flex-row border border-blue-100"
          onClick={() => onSelect(location.id)}
        >
          <img
            src={location.thumbnail}
            alt={location.name}
            className="w-full sm:w-48 h-48 object-cover rounded-2xl flex-shrink-0 mb-4 sm:mb-0 border-4 border-white shadow"
          />
          <div className="flex-1 min-w-0">
            <div className="font-extrabold text-2xl text-blue-900 mb-2 drop-shadow-sm">{location.name}</div>
            {location.subtitle && (
              <div className="text-green-700 text-base mb-2 font-medium">{location.subtitle}</div>
            )}
            <div className="text-gray-800 text-base whitespace-pre-line leading-relaxed">{location.description}</div>
          </div>
          <button
            className="ml-0 sm:ml-4 bg-blue-100 hover:bg-blue-200 rounded-full p-3 focus:outline-none self-start sm:self-center shadow"
            tabIndex={-1}
            aria-label={`View details for ${location.name}`}
            onClick={e => { e.stopPropagation(); onSelect(location.id); }}
          >
            <ArrowRightIcon className="w-7 h-7 text-blue-500" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ResourceLocationList; 