"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { GuideCard } from "@/components/molecules/GuideCard";
import { useGuides } from "@/data/useGuides";
import Loader from "@/components/atoms/Loader";
import { ErrorDisplay } from "@/components/atoms/ErrorDisplay";
import type { Guide } from "@/types/guide";

const GuidesPage = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build API params
  const apiParams = useMemo(() => {
    const params: {
      resourceType?: string;
      speakingLanguage?: string;
      search?: string;
    } = {};

    if (resourceFilter && resourceFilter !== "all") {
      params.resourceType = resourceFilter;
    }

    if (languageFilter && languageFilter !== "all") {
      params.speakingLanguage = languageFilter;
    }

    if (debouncedSearch && debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
    }

    return params;
  }, [resourceFilter, languageFilter, debouncedSearch]);

  // Fetch guides from API
  const { data: guides = [], isLoading, error, refetch } = useGuides(apiParams);

  // Extract available languages from guides
  const languages = useMemo(() => {
    const values = new Set<string>();
    guides.forEach((guide) =>
      guide.speaking_languages.forEach((language) => values.add(language))
    );
    return Array.from(values).sort();
  }, [guides]);

  // Category options with display labels
  const categoryOptions = [
    { value: "naturalist", label: "Naturalist" },
    { value: "heritage_specialist", label: "Heritage Specialist" },
    { value: "bird_watcher", label: "Bird Watcher" },
  ];

  const handleBookGuide = (guide: Guide) => {
    const params = new URLSearchParams();
    params.set("guideId", guide.id);
    const preferredName =
      guide.bio.preferredName ||
      `${guide.bio.firstName} ${guide.bio.lastName}`.trim();
    params.set("guideName", preferredName);
    if (guide.resourceTypeId) {
      params.set("resourceTypeId", guide.resourceTypeId);
    }
    if (guide.resourceType?.name) {
      params.set("resourceLabel", guide.resourceType.name);
    }
    if (guide.resourceType?.price) {
      params.set("resourcePrice", String(guide.resourceType.price));
    }
    if (guide.pricing && guide.pricing.length > 0) {
      params.set("guidePricing", JSON.stringify(guide.pricing));
    }
    router.push(`/booking/new?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-background px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
        <header className="text-center space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
            Local Expertise
          </p>
          <h1 className="mt-3 text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">
            Meet your next guide
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Browse verified guides, explore their strengths, and connect with the
            perfect storyteller for your next conscious travel experience.
          </p>
        </header>

        <div className="grid w-full gap-4 rounded-3xl border border-border/40 bg-card/60 p-4 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr]">
          <label className="relative flex flex-col gap-1 text-sm font-medium text-muted-foreground sm:col-span-2 lg:col-span-1">
            Search guides
            <div className="relative">
              <Input
                value={searchTerm}
                placeholder="Search by name, city, or expertise"
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                🔍
              </span>
            </div>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-muted-foreground">
            Speaking language
            <Select
              value={languageFilter}
              onChange={(event) => setLanguageFilter(event.target.value)}
            >
              <option value="all">All languages</option>
              {languages.map((language) => (
                <option key={language} value={language}>
                  {language}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex flex-col gap-1 text-sm font-medium text-muted-foreground">
            Category
            <Select
              value={resourceFilter}
              onChange={(event) => setResourceFilter(event.target.value)}
            >
              <option value="all">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </Select>
          </label>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : error ? (
          <div className="py-4">
            <ErrorDisplay error={error} onRetry={() => refetch()} />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {guides.length > 0 ? (
              guides.map((guide) => (
                <GuideCard
                  key={guide.id}
                  guide={guide}
                  onBook={handleBookGuide}
                />
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-border/60 bg-card/40 p-10 text-center">
                <p className="text-lg font-semibold text-foreground">
                  No guides match your criteria
                </p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Try adjusting your filters or search term to explore more verified
                  storytellers from our RAAHI community.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
};

export default GuidesPage;
