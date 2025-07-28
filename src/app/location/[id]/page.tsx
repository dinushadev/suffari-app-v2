"use client";
import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StarIcon, HeartIcon } from '@heroicons/react/24/solid';
import resourceLocations, { LocationDetails } from '../../../data/resourceLocations';

export default function LocationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const location: LocationDetails | undefined = resourceLocations.find(
    (loc: LocationDetails) => loc.id === id
  );

  if (!location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
        <div className="bg-white rounded-2xl shadow p-8 text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-2">Location Not Found</h1>
          <p className="mb-4 text-gray-600">Sorry, we couldn't find the safari location you are looking for.</p>
          <button className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-xl" onClick={() => router.back()}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-green-100 flex flex-col items-center p-0 sm:p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 relative">
        {/* Hero Image & Overlay */}
        <div className="relative h-64 sm:h-80 w-full">
          <img src={location.hero} alt={location.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <button
              className="bg-white/80 rounded-full p-2 hover:bg-blue-100 focus:outline-none shadow"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <span className="text-xl">&#8592;</span>
            </button>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <button
              className="bg-white/80 rounded-full p-2 hover:bg-pink-100 focus:outline-none shadow group"
              aria-label="Add to favorites"
            >
              <HeartIcon className="w-6 h-6 text-pink-400 group-hover:text-pink-600 transition" />
            </button>
          </div>
          <div className="absolute bottom-6 left-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow mb-1">{location.name}</h1>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-white/90 text-base font-medium">{location.subtitle}</span>
              <span className="text-white/90 text-base font-semibold">${location.price}/Package</span>
              <span className="flex items-center gap-1 text-yellow-300 font-bold text-base"><StarIcon className="w-5 h-5" /> {location.rating}</span>
            </div>
          </div>
        </div>
        {/* Details Card */}
        <div className="bg-white rounded-t-3xl -mt-8 pt-8 px-6 pb-6">
          <h2 className="font-bold text-lg mb-2">About</h2>
          <p className="text-gray-600 mb-4">{location.about}</p>
          {/* Image Carousel */}
          <div className="flex gap-3 mb-6 overflow-x-auto">
            {location.images.map((img: string, i: number) => (
              <img key={i} src={img} alt="Gallery" className="w-20 h-20 rounded-xl object-cover border-2 border-blue-100" />
            ))}
          </div>
          {/* Facilities */}
          <h3 className="font-bold text-base mb-2">Package Facilities</h3>
          <div className="flex gap-4 flex-wrap mb-8">
            {location.facilities.map((f: {icon: string; label: string}, i: number) => (
              <div key={i} className="flex flex-col items-center bg-blue-50 rounded-xl px-3 py-2 min-w-[64px]">
                <span className="text-2xl mb-1">{f.icon}</span>
                <span className="text-xs text-blue-900 font-medium">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Sticky Book Now Button for mobile */}
        <div className="sticky bottom-0 left-0 right-0 bg-white rounded-b-3xl px-6 pb-6 pt-4 z-20">
          <button
            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-bold text-lg rounded-2xl py-4 shadow-lg transition"
            onClick={() => router.push(`/booking?location=${location.id}`)}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
} 