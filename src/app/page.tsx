"use client";

import { ResourceLocationList } from '../components/organisms';
import { useLocations } from '../data/useLocations';
import { useRouter } from 'next/navigation';
import { Button } from '../components/atoms';

export default function Home() {
  const router = useRouter();
  const { data: locations, isLoading, error } = useLocations();
  const handleSelect = (id: string) => {
    router.push(`/location/${id}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-background p-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-orange mb-2 drop-shadow-sm text-center">Safari Booking App</h1>
     
      <p className="mb-8 text-lg sm:text-xl text-foreground font-medium text-center max-w-xl drop-shadow-sm">Browse popular safari locations in Sri Lanka and book your adventure!</p>
      {isLoading && <div className="text-foreground">Loading...</div>}
      {error && <div className="text-orange">Error loading locations</div>}
      {locations && (
        <ResourceLocationList locations={locations} onSelect={handleSelect} />
      )}
    </main>
  );
}
