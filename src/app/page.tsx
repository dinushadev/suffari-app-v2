"use client";

import { ResourceLocationList } from '../components/organisms';
import { useLocations } from '../data/useLocations';
import { useRouter } from 'next/navigation';
import { Loader } from '../components/atoms';

export default function Home() {
  const router = useRouter();
  const { data: locations, isLoading, error } = useLocations();
  const handleSelect = (id: string) => {
    router.push(`/location/${id}`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-background p-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-orange mb-2 drop-shadow-sm text-center">RAAHI</h1>
      <p className="mb-8 text-lg sm:text-xl text-foreground font-medium text-center max-w-xl drop-shadow-sm flex items-center justify-center gap-2">Conscious Travel <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame w-4 h-4 text-[#E6D7C3] hover:text-[#D4C5A9] transition-colors duration-300 cursor-pointer" aria-hidden="true"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg> Responsible Tourism</p>
      {isLoading && <Loader />}
      {error && <div className="text-orange">Error loading locations</div>}
      {locations && (
        <ResourceLocationList locations={locations} onSelect={handleSelect} />
      )}
    </main>
  );
}
