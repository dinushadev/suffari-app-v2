"use client";

import { useEffect, useState, useMemo } from "react";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { useServices, getCountryCode, getServiceBase, formatServiceLabel } from "@/data/useServices";
import { ServiceCard, ServiceCardSkeleton } from "@/components/molecules/ServiceCard";
import ServiceFilterBar from "@/components/molecules/ServiceFilterBar";
import type { ServiceItem } from "@/types/service";

export default function ServicesPage() {
  const [countryCode, setCountryCode] = useState<string>("");
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>("");
  const [selectedServiceBase, setSelectedServiceBase] = useState<string | null>(null);
  const [gridKey, setGridKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  useEffect(() => {
    setCountryCode(getCountryCode());
  }, []);

  const { data, isLoading, isError } = useServices(countryCode);

  // Default to first category
  useEffect(() => {
    if (data?.categories?.length && !selectedCategoryKey) {
      setSelectedCategoryKey(data.categories[0].category_key);
    }
  }, [data, selectedCategoryKey]);

  const currentCategory = useMemo(
    () => data?.categories.find((c) => c.category_key === selectedCategoryKey),
    [data, selectedCategoryKey]
  );

  const uniqueServiceBases = useMemo(() => {
    if (!currentCategory) return [];
    const seen = new Set<string>();
    const bases: { base: string; label: string }[] = [];
    for (const s of currentCategory.services) {
      if (!s.location_service_key) continue;
      const base = getServiceBase(s.location_service_key);
      if (!seen.has(base)) {
        seen.add(base);
        bases.push({ base, label: formatServiceLabel(base) });
      }
    }
    return bases;
  }, [currentCategory]);

  const filteredServices = useMemo<ServiceItem[]>(() => {
    if (!currentCategory) return [];
    const valid = currentCategory.services.filter((s) => !!s.location_service_key);
    if (!selectedServiceBase) return valid;
    return valid.filter(
      (s) => getServiceBase(s.location_service_key) === selectedServiceBase
    );
  }, [currentCategory, selectedServiceBase]);

  const handleCategoryChange = (key: string) => {
    setSelectedCategoryKey(key);
    setSelectedServiceBase(null);
    setGridKey((k) => k + 1);
  };

  const handleServiceBaseChange = (base: string | null) => {
    setSelectedServiceBase(base);
    setGridKey((k) => k + 1);
  };

  return (
    <div className="bg-background">
      {/* Filter bar */}
      <div className="sticky top-[64px] z-40 bg-background/90 backdrop-blur-md border-b border-border px-6 py-3 flex justify-center items-center">
        <ServiceFilterBar
          countryCode={countryCode}
          onCountryChange={(code) => setCountryCode(code)}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateTimeChange={(date, time) => { setSelectedDate(date); setSelectedTime(time); }}
          categories={data?.categories ?? []}
          selectedCategoryKey={selectedCategoryKey}
          onCategoryChange={handleCategoryChange}
          onSearch={() => setGridKey((k) => k + 1)}
        />
      </div>

      {/* Service-base filter pills */}
      {!isLoading && uniqueServiceBases.length > 0 && (
        <div className="max-w-screen-2xl mx-auto px-6 pt-5 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleServiceBaseChange(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                selectedServiceBase === null
                  ? "bg-foreground text-background"
                  : "border border-border text-foreground hover:border-foreground"
              }`}
            >
              All
            </button>

            {uniqueServiceBases.map(({ base, label }) => (
              <button
                key={base}
                onClick={() => handleServiceBaseChange(base)}
                className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                  selectedServiceBase === base
                    ? "bg-foreground text-background"
                    : "border border-border text-foreground hover:border-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cards grid */}
      <div className="max-w-screen-2xl mx-auto px-6 pt-5 pb-16">
        {isError && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <SparklesIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold text-foreground mb-1">
              Could not load services
            </p>
            <p className="text-muted-foreground text-sm">
              Please check your connection and try again.
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ServiceCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <SparklesIcon className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-base font-semibold text-foreground">
              No services available in this filter
            </p>
            <button
              onClick={() => handleServiceBaseChange(null)}
              className="mt-3 text-sm text-primary hover:underline font-medium"
            >
              Clear filter
            </button>
          </div>
        ) : (
          <div
            key={gridKey}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredServices.map((service, i) => (
              <ServiceCard
                key={service.location_service_key}
                service={service}
                categoryKey={selectedCategoryKey}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
