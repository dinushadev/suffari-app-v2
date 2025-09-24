"use client";
import React from 'react';
import { ArrowRightIcon } from '@heroicons/react/24/solid';
import { CustomImage } from '../atoms';
import Link from 'next/link';

export interface ResourceLocation {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
  subtitle?: string;
}

interface ResourceLocationListProps {
  locations: ResourceLocation[];
  // onSelect: (id: string) => void; // Removed onSelect prop
}

const ResourceLocationList: React.FC<ResourceLocationListProps> = ({ locations }) => {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      {locations.map((location) => (
        <div
          key={location.id}
          className="flex items-center bg-card border border-border rounded-3xl shadow-lg p-6 gap-6 hover:shadow-2xl transition flex-col sm:flex-row"
          // onClick={() => onSelect(location.id)} // Removed onClick from div
        >
          <Link href={`/location/${location.id}`} className="flex items-center bg-card hover:shadow-2xl transition cursor-pointer flex-col sm:flex-row w-full">
          <CustomImage
            src={location.thumbnail}
            alt={location.name}
            width={192}
            height={192}
            className="w-full sm:w-48 h-48 object-cover rounded-2xl flex-shrink-0 mb-4 sm:mb-0 border-4 border-background shadow"
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-2xl text-foreground mb-2 drop-shadow-sm">{location.name}</h2>
            {location.subtitle && (
              <div className="text-primary text-base mb-2 font-medium">{location.subtitle}</div>
            )}
            <div className="text-muted-foreground text-base whitespace-pre-line leading-relaxed">{location.description}</div>
          </div>
          <button
            className="ml-0 sm:ml-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-3 focus:outline-none self-start sm:self-center shadow border border-primary/20"
            aria-label={`View details for ${location.name}`}
            // onClick={e => { e.stopPropagation(); onSelect(location.id); }} // Removed onClick from button as Link handles navigation
          >
            <ArrowRightIcon className="w-7 h-7" />
          </button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ResourceLocationList; 