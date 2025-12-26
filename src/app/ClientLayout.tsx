"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import Script from 'next/script';
import Header from "@/components/organisms/Header";
import Footer from "@/components/organisms/Footer";
import "@/lib/amplifyConfig"; // Initialize AWS Amplify

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <>
      {/* Google Maps API script - set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your .env.local */}
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
        strategy="beforeInteractive"
      />
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </div>
      </QueryClientProvider>
    </>
  );
}