"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StarIcon, HeartIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import resourceLocations, { LocationDetails } from '../../../data/resourceLocations';
import { useLocationDetails } from '../../../data/useLocationDetails';
import { Button } from '../../../components/atoms';

export default function LocationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: location, isLoading, error } = useLocationDetails(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-ivory border border-ash rounded-2xl shadow p-8 text-center">
          <h1 className="text-2xl font-bold text-orange mb-2">Loading...</h1>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-ivory border border-ash rounded-2xl shadow p-8 text-center">
          <h1 className="text-2xl font-bold text-orange mb-2">Location Not Found</h1>
          <p className="mb-4 text-foreground">Sorry, we couldn&apos;t find the safari location you are looking for.</p>
          <button className="bg-orange hover:bg-orange-dark text-foreground font-bold px-6 py-2 rounded-xl border border-ash" onClick={() => router.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-ivory border border-ash rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 relative">
        {/* Hero Image & Overlay */}
        <div className="relative h-64 sm:h-80 w-full">
          <Image src={location.thumbnail} alt={location.name} className="w-full h-full object-cover" fill priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <button
              className="bg-ivory/80 border border-ash rounded-full p-2 hover:bg-orange/30 focus:outline-none shadow"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <span className="text-xl text-foreground">&#8592;</span>
            </button>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <button
              className="bg-ivory/80 border border-ash rounded-full p-2 hover:bg-orange/30 focus:outline-none shadow group"
              aria-label="Add to favorites"
            >
              <HeartIcon className="w-6 h-6 text-orange group-hover:text-orange-dark transition" />
            </button>
          </div>
          <div className="absolute bottom-6 left-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground drop-shadow mb-1">{location.name}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-foreground/90 text-base font-medium">{location.address}</span>
              <span className="text-foreground/90 text-base font-semibold">${location.price}/Package</span>
              <span className="flex items-center gap-1 text-orange font-bold text-base"><StarIcon className="w-5 h-5" /> {location.rating}</span>
            </div>
          </div>
        </div>
        {/* Details Card */}
        <div className="bg-ivory border-t border-ash rounded-t-3xl -mt-8 pt-8 px-6 pb-6">
          <h2 className="font-bold text-lg mb-2 text-orange">About</h2>
          <p className="text-foreground mb-4">{location.about}</p>
          {/* Image Carousel */}
          <div className="flex gap-3 mb-6 overflow-x-auto">
            {location.images?.map((img: string, i: number) => (
              <Image key={i} src={img} alt="Gallery" className="w-20 h-20 rounded-xl object-cover border-2 border-ash" width={80} height={80} />
            ))}
          </div>
          {/* Facilities */}
          <h3 className="font-bold text-base mb-2 text-orange">Package Facilities</h3>
          <div className="flex gap-4 flex-wrap mb-8">
            {location.facilities?.map((f: string, i: number) => (
              <div key={i} className="flex flex-col items-center bg-orange/10 border border-ash rounded-xl px-3 py-2 min-w-[64px]">
                <span className="text-xs text-orange font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Sticky Book Now Button for mobile */}
        <div className="sticky bottom-0 left-0 right-0 bg-ivory border-t border-ash rounded-b-3xl px-6 pb-6 pt-4 z-20">
          <Button
            className="w-full text-lg py-4 rounded-2xl shadow-lg "
            onClick={() => router.push(`/booking?location=${location.id}`)}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
} 