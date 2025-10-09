"use client";
import React from "react";
import { useParams, useRouter } from "next/navigation";
import { StarIcon, HeartIcon } from "@heroicons/react/24/solid";
import { useLocationDetails } from "../../../data/useLocationDetails";
import { Button, CustomImage, Loader } from "../../../components/atoms";
import { FullScreenLoader } from "../../../components/atoms";
import { ButtonV2 } from "../../../components/atoms";

export default function LocationDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { data: location, isLoading, error } = useLocationDetails(id);
  const [isLoadingBooking, setIsLoadingBooking] = React.useState(false);

  const handleSelectRide = () => {
    setIsLoadingBooking(true);
    router.push(`/booking?location=${location?.id}`);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen flex flex-col items-center bg-background p-4">
  
        <p className="text-lg sm:text-xl text-foreground font-medium text-center max-w-xl drop-shadow-sm flex items-center justify-center gap-2">
          Loading Safari Location...
        </p>
        <FullScreenLoader />
      </main>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="bg-ivory border border-ash rounded-2xl shadow p-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Location Not Found
          </h1>
          <p className="mb-4 text-foreground">
            Sorry, we couldn&apos;t find the safari location you are looking
            for.
          </p>
          <button
            className="bg-foreground hover:bg-foreground-dark text-foreground font-bold px-6 py-2 rounded-xl border border-ash"
            onClick={() => router.back()}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center p-0 sm:p-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: location.name,
            address: {
              "@type": "PostalAddress",
              streetAddress: location.address,
              // Add more address details if available
            },
            image: location.thumbnail,
            description: location.about,
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: location.rating, // Assuming 'rating' is a numeric value
              reviewCount: 10, // Placeholder: Replace with actual review count if available
            },
            url: `https://raahi.io/location/${location.id}`, // Replace with your actual domain
          }),
        }}
      />
      <div className="w-full max-w-md bg-ivory border border-ash rounded-3xl shadow-xl overflow-hidden mt-0 sm:mt-8 relative">
        {/* Hero Image & Overlay */}
        <div className="relative h-64 sm:h-80 w-full">
          <CustomImage
            src={location.thumbnail}
            alt={location.name}
            className="w-full h-full object-cover"
            fill
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-4 left-4 z-10">
            <button
              className="bg-accent/20 border border-ash rounded-full p-2 hover:bg-accent/60 focus:outline-none shadow"
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <span className="text-xl text-foreground">&#8592;</span>
            </button>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <button
              className="bg-secondary/80 border border-ash rounded-full p-2 hover:bg-secondary/30 focus:outline-none shadow group"
              aria-label="Add to favorites"
            >
              <HeartIcon className="w-6 h-6 text-accent group-hover:text-accent transition" />
            </button>
          </div>
          <div className="absolute bottom-6 left-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow mb-1">
              {location.name}
            </h1>
            <div className="flex items-center gap-4 flex-wrap">
              <span className="text-white text-base font-medium">
                {location.address}
              </span>
              <span className="flex items-center gap-1 text-white font-bold text-base">
                <StarIcon className="w-5 h-5" /> {location.rating}
              </span>
            </div>
          </div>
        </div>
        {/* Details Card */}
        <div className=" rounded-t-3xl -mt-4 pt-8 px-6 pb-6">
          <h2 className="font-bold text-xl mb-3 text-foreground">About</h2>
          <p className="text-base text-foreground mb-6 leading-relaxed">
            {location.about}
          </p>
          {/* Image Carousel */}
          <div className="flex gap-3 mb-6 overflow-x-auto">
            {location.images?.map((img: string, i: number) => (
              <CustomImage
                key={i}
                src={img}
                alt="Gallery"
                className="w-20 h-20 rounded-xl object-cover border-2 border-ash"
                width={80}
                height={80}
              />
            ))}
          </div>
          {/* Facilities */}
          <h3 className="font-bold text-lg mb-3 text-foreground">
            What can do
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            {location.facilities?.map((f: string, i: number) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center bg-foreground/10 border border-ash rounded-xl p-3 text-center h-24"
              >
                <span className="text-sm text-foreground font-medium leading-tight">{f}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Sticky Book Now Button for mobile */}
        <div className="sticky bottom-0 left-0 right-0 bg-ivory border-t border-ash rounded-b-3xl px-6 pb-6 pt-4 z-20">
          <ButtonV2
            className="w-full text-lg py-4 rounded-2xl shadow-lg "
            onClick={handleSelectRide}
            loading={isLoadingBooking}
          >
            Select Your Ride
          </ButtonV2>
        </div>
      </div>
    </div>
  );
}
