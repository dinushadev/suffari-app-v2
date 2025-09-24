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
        >
          <Link href={`/location/${location.id}`} className="flex items-center w-full gap-4">
            <CustomImage
              src={location.thumbnail}
              alt={location.name}
              width={128}
              height={128}
              className="w-32 h-32 object-cover rounded-xl flex-shrink-0 border-4 border-background shadow"
            />
            <div className="flex-1 min-w-0 py-2">
              <h2 className="font-extrabold text-xl text-foreground mb-1 drop-shadow-sm">{location.name}</h2>
              {location.subtitle && (
                <div className="text-primary text-sm mb-1 font-medium">{location.subtitle}</div>
              )}
              <div className="text-muted-foreground text-sm whitespace-pre-line leading-relaxed">{location.description}</div>
            </div>
            <button
              className="ml-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 focus:outline-none self-center shadow border border-primary/20"
              aria-label={`View details for ${location.name}`}
            >
              <ArrowRightIcon className="w-6 h-6" />
            </button>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ResourceLocationList; 