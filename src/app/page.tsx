"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { CustomImage } from "../components/atoms";

export default function Home() {
  const router = useRouter();

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  return (
    <main className="min-h-screen flex flex-col items-center bg-background p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground mb-2 drop-shadow-sm text-center">
          RAAHI
        </h1>
        <p className="mb-8 sm:mb-12 text-lg sm:text-xl text-foreground font-medium text-center max-w-xl drop-shadow-sm flex items-center justify-center gap-2">
          Conscious Travel{" "}
          <Image
            src="/images/logo-raahi.png"
            alt="RAAHI Logo"
            width={40}
            height={40}
            className="mb-1 w-10 h-10"
          />{" "}
          Responsible Tourism
        </p>

        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl">
          {/* Guide Tile */}
          <button
            onClick={() => handleNavigate("/guide")}
            className="group relative overflow-hidden rounded-3xl bg-card border-2 border-border hover:border-primary transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="relative aspect-[4/3] w-full">
              <CustomImage
                src="/images/placeholder.svg"
                alt="Book a Guide"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  Guide
                </h2>
                <p className="text-white/90 text-sm sm:text-base drop-shadow-md">
                  Connect with local experts
                </p>
              </div>
            </div>
          </button>

          {/* Safari Tile */}
          <button
            onClick={() => handleNavigate("/suffari")}
            className="group relative overflow-hidden rounded-3xl bg-card border-2 border-border hover:border-primary transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <div className="relative aspect-[4/3] w-full">
              <CustomImage
                src="/images/yala1.jpg"
                alt="Safari Jeeps"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2 drop-shadow-lg">
                  Safari
                </h2>
                <p className="text-white/90 text-sm sm:text-base drop-shadow-md">
                  Explore with safari jeeps
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </main>
  );
}
