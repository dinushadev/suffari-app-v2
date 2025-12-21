import {
  BriefcaseIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

import { Guide } from "@/types/guide";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ButtonV2, CustomImage } from "@/components/atoms";
import { useState } from "react";

interface GuideCardProps {
  guide: Guide;
  onBook?: (guide: Guide) => void;
}

export const GuideCard = ({ guide, onBook }: GuideCardProps) => {
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  // Get name from user object (new API) or bio (legacy)
  const firstName = guide.user?.firstName || guide.bio?.firstName || "";
  const lastName = guide.user?.lastName || guide.bio?.lastName || "";
  const otherName = guide.user?.otherName || guide.bio?.preferredName;
  const fullName = otherName
    ? `${otherName} (${firstName} ${lastName})`
    : `${firstName} ${lastName}`;
  
  // Get description from bio
  const description = guide.bio?.description?.trim();
  const summary =
    description && description.length > 140
      ? `${description.slice(0, 137)}...`
      : description;

  // Use yearsOfExperience directly (new API) or calculate from license (legacy)
  const experienceYears = guide.yearsOfExperience ?? (() => {
    if (!guide.license?.issueDate) return null;
    const issueYear = new Date(guide.license.issueDate).getFullYear();
    const currentYear = new Date().getFullYear();
    return Math.max(currentYear - issueYear, 0);
  })();

  // Format currency amount
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Get rates (prefer rates over pricing for backward compatibility)
  const rates = guide.rates || guide.pricing || [];
  
  // Get primary rate for mobile display
  const primaryRate = rates.length > 0 ? rates[0] : null;
  const primaryRateLabel = primaryRate?.type === "hourly" ? "Hour" : primaryRate?.type === "daily" ? "Day" : primaryRate?.type || "";

  // Get languages with mobile limits
  const languages = guide.speakingLanguages || guide.speaking_languages || [];
  const visibleLanguages = showAllLanguages ? languages : languages.slice(0, 2);
  const remainingLanguages = languages.length - 2;
  
  // Always show all expertise items
  const expertise = guide.expertise || [];

  // Validate and get image source - use placeholder for invalid URLs
  const getImageSrc = () => {
    if (!guide.profileImage) {
      return "/images/placeholder.svg";
    }
    
    const imageUrl = guide.profileImage.trim();
    
    // Check for common invalid/placeholder URLs
    const invalidPatterns = [
      "example.com",
      "placeholder.com",
      "placehold.co",
      "via.placeholder.com",
      "dummyimage.com",
    ];
    
    // If it's a relative path, use it directly
    if (imageUrl.startsWith("/")) {
      return imageUrl;
    }
    
    try {
      const url = new URL(imageUrl);
      // Check if hostname is invalid or matches placeholder patterns
      if (
        !url.hostname ||
        invalidPatterns.some((pattern) => url.hostname.includes(pattern))
      ) {
        return "/images/placeholder.svg";
      }
      return imageUrl;
    } catch {
      // If URL parsing fails, use placeholder
      return "/images/placeholder.svg";
    }
  };

  return (
    <Card className="flex h-full flex-col rounded-3xl border border-border/30 sm:border-border/40 bg-card/95 text-card-foreground shadow-md sm:shadow-lg shadow-primary/5 transition hover:-translate-y-0.5 sm:hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="flex flex-1 flex-col gap-4 sm:gap-5 p-4 sm:p-6">
        {/* 1. Header: Image (Left) + "Available" Badge (Top Right) */}
        <div className="relative flex items-start gap-4">
          {/* Profile Image */}
          <div className="group relative h-20 w-20 sm:h-28 sm:w-28 flex-shrink-0 overflow-hidden rounded-xl sm:rounded-2xl border border-border/40 bg-gradient-to-br from-accent/40 to-secondary/30 shadow-sm">
            <CustomImage
              src={getImageSrc()}
              alt={fullName}
              fill
              sizes="(max-width: 640px) 80px, 112px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          
          {/* Availability Badge - Top Right */}
          <span
            className={`absolute top-0 right-0 rounded-full px-2.5 py-1 text-[10px] sm:text-xs font-semibold uppercase tracking-wide border ${
              guide.available
                ? "bg-emerald-500/10 text-emerald-700 border-emerald-500/20"
                : "bg-red-500/10 text-red-700 border-red-500/20"
            }`}
          >
            {guide.available ? "Available" : "Fully booked"}
          </span>
        </div>

        {/* 2. Identity: Name (H3) + Category (Small text below name) */}
        <div className="flex flex-col gap-1">
          <h3 className="text-xl sm:text-2xl font-semibold text-foreground">
            {fullName}
          </h3>
          <p className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {guide.resourceType?.category || "Guide"}
          </p>
        </div>

        {/* 3. Trust: Verified Icon + Years Exp */}
        <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
          {guide.license?.licenseNumber && (
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <ShieldCheckIcon className="h-4 w-4" />
              <span>Verified</span>
            </div>
          )}
          {experienceYears !== null && (
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
              <BriefcaseIcon className="h-4 w-4" />
              <span>{experienceYears}+ yrs experience</span>
            </div>
          )}
        </div>

        {/* 4. Cost: $ Rate/hr (Bold/Highlight) */}
        {rates.length > 0 && (
          <div className="flex flex-col gap-2">
            {rates.map((rate, index) => {
              // Use displayPrice if available, otherwise fallback to rate.amount and rate.currency
              const displayAmount = rate.displayPrice?.amount ?? rate.amount;
              const displayCurrency = rate.displayPrice?.currency ?? rate.currency;
              const usd = rate.displayPriceUsd;
              const hasUsdRate = (usd?.amount ?? 0) > 0;
              
              return (
                <div
                  key={`${guide.id}-rate-${index}`}
                  className="flex flex-col gap-1"
                >
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-sm sm:text-base text-muted-foreground">
                      {rate.type === "hourly" ? "/hr" : rate.type === "daily" ? "/day" : `/${rate.type}`}
                    </span>
                    <span className="text-lg sm:text-xl font-bold text-primary">
                      {formatCurrency(displayAmount, displayCurrency)}
                    </span>
                    {hasUsdRate && usd && (
                      <span className="text-sm text-muted-foreground">
                        ({formatCurrency(usd.amount, usd.currency)})
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 5. Context: Description + Languages + Expertise */}
        <div className="flex flex-col gap-4">
          {/* Description (Short snippet) */}
          {summary && (
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {summary}
            </p>
          )}

          {/* Languages (Pill tags) */}
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {visibleLanguages.map((language) => (
                <span
                  key={`${guide.id}-${language}`}
                  className="rounded-full border border-accent/50 bg-accent/20 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold tracking-wide text-accent-foreground"
                  title={language}
                >
                  {language}
                </span>
              ))}
              {!showAllLanguages && remainingLanguages > 0 && (
                <button
                  onClick={() => setShowAllLanguages(true)}
                  className="rounded-full border border-accent/50 bg-accent/20 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold tracking-wide text-accent-foreground hover:bg-accent/30 transition"
                >
                  +{remainingLanguages} more
                </button>
              )}
            </div>
          )}

          {/* Expertise (Pill tags) */}
          {expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {expertise.map((skill) => (
                <span
                  key={`${guide.id}-${skill}`}
                  className="rounded-full bg-primary/10 px-2 py-0.5 sm:px-3 sm:py-1 text-[10px] sm:text-xs font-semibold text-primary"
                  title={skill}
                >
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border/40 bg-background/60 p-4 text-sm text-foreground">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Contact
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href={`tel:${guide.contactDetails.phone}`}
              className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary transition hover:bg-primary/20"
            >
              <PhoneIcon className="h-4 w-4" />
              {guide.contactDetails.phone}
            </a>
            <a
              href={`mailto:${guide.contactDetails.email}`}
              className="flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-secondary transition hover:bg-secondary/20"
            >
              <EnvelopeIcon className="h-4 w-4" />
              <span className="truncate">{guide.contactDetails.email}</span>
            </a>
            {guide.contactDetails.whatsapp && (
              <a
                href={`https://wa.me/${guide.contactDetails.whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-full bg-green-100 dark:bg-green-950/30 px-3 py-1 text-green-800 dark:text-green-400 transition hover:bg-green-200 dark:hover:bg-green-900/50"
              >
                <PhoneIcon className="h-4 w-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div> */}
      </CardContent>
      
      {/* 6. Action: "Book this guide" Button (Primary Color) */}
      <CardFooter className="p-4 pt-0 sm:p-6 sm:pt-0">
        <ButtonV2
          variant="primary"
          className="w-full rounded-2xl py-2.5 sm:py-3 text-sm sm:text-base font-semibold shadow-sm shadow-primary/40 min-h-[44px]"
          onClick={() => onBook?.(guide)}
        >
          Book this guide
        </ButtonV2>
      </CardFooter>
    </Card>
  );
};

export default GuideCard;
