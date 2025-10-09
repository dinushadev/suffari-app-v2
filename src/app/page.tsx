"use client";

import { ResourceLocationList } from "../components/organisms";
import { useLocations } from "../data/useLocations";
import { useRouter } from "next/navigation";
import { Loader } from "../components/atoms";

export default function Home() {
  // const router = useRouter(); // router is no longer directly used here, but keeping it for now in case other logic depends on it.
  const { data: locations, isLoading, error } = useLocations();
  // const handleSelect = (id: string) => {
  //   router.push(`/location/${id}`);
  // };

  return (
    <main className="min-h-screen flex flex-col items-center bg-background p-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 drop-shadow-sm text-center">
        RAAHI
      </h1>
      <p className="mb-8 text-lg sm:text-xl text-foreground font-medium text-center max-w-xl drop-shadow-sm flex items-center justify-center gap-2">
        Conscious Travel{" "}
        
        <img src="/images/logo-raahi.png" alt="RAAHI Logo" className="mb-4 w-10 h-10" />
        {" "}
        Responsible Tourism
      </p>
      {isLoading && <Loader />}
      {error && <div className="text-foreground">Error loading locations</div>}
      {locations && <ResourceLocationList locations={locations} />}
    </main>
  );
}
