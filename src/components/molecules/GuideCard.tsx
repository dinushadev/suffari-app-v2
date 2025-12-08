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

interface GuideCardProps {
  guide: Guide;
  onBook?: (guide: Guide) => void;
}

export const GuideCard = ({ guide, onBook }: GuideCardProps) => {
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
    <Card className="flex h-full flex-col rounded-3xl border border-border/40 bg-card/95 text-card-foreground shadow-lg shadow-primary/5 transition hover:-translate-y-1 hover:shadow-xl">
      <CardContent className="flex flex-1 flex-col gap-6 p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="group relative h-28 w-28 flex-shrink-0 overflow-hidden rounded-2xl border border-border/40 bg-gradient-to-br from-accent/40 to-secondary/30">
            <CustomImage
              src={getImageSrc()}
              alt={fullName}
              fill
              sizes="112px"
              className="object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-1 flex-col gap-3 text-sm">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                    {guide.resourceType?.category || "Guide"}
                  </p>
                  <h3 className="text-2xl font-semibold text-foreground">
                    {fullName}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {guide.resourceType?.name}
                  </p>
                </div>
                <span
                  className={`rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide ${
                    guide.available
                      ? "bg-emerald-100/80 text-emerald-800"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {guide.available ? "Available now" : "Fully booked"}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
                {guide.license?.licenseNumber && (
                  <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                    <ShieldCheckIcon className="h-4 w-4" />
                    Certified Guide
                  </div>
                )}
                {experienceYears !== null && (
                  <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
                    <BriefcaseIcon className="h-4 w-4" />
                    {experienceYears}+ yrs experience
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4">
                {guide.address?.city && guide.address?.state && (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPinIcon className="h-4 w-4 text-primary" />
                    {guide.address.city}, {guide.address.state}
                  </p>
                )}
                {rates.length > 0 && (
                  <div className="flex items-center gap-3">
                    {rates.map((rate, index) => (
                      <div
                        key={`${guide.id}-rate-${index}`}
                        className="flex items-baseline gap-1.5"
                      >
                        <span className="text-xs text-muted-foreground">
                          {rate.type === "hourly" ? "Hour" : rate.type === "daily" ? "Day" : rate.type}
                        </span>
                        <span className="text-base font-semibold text-foreground">
                          {formatCurrency(rate.amount, rate.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {summary && (
          <p className="rounded-2xl border border-dashed border-border/40 bg-background/50 p-4 text-sm text-muted-foreground">
            {summary}
          </p>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Speaking languages
          </p>
          <div className="flex flex-wrap gap-2">
            {(guide.speakingLanguages || guide.speaking_languages || []).map((language) => (
              <span
                key={`${guide.id}-${language}`}
                className="rounded-full border border-accent/50 bg-accent/20 px-3 py-1 text-xs font-semibold tracking-wide text-accent-foreground"
              >
                {language}
              </span>
            ))}
          </div>
        </div>

        {guide.expertise.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Signature expertise
            </p>
            <div className="flex flex-wrap gap-2">
              {guide.expertise.map((skill) => (
                <span
                  key={`${guide.id}-${skill}`}
                  className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

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
                className="flex items-center gap-2 rounded-full bg-green-100 px-3 py-1 text-green-800 transition hover:bg-green-200"
              >
                <PhoneIcon className="h-4 w-4" />
                WhatsApp
              </a>
            )}
          </div>
        </div> */}
      </CardContent>
      <CardFooter className="p-5 pt-0 sm:p-6 sm:pt-0">
        <ButtonV2
          variant="primary"
          className="w-full rounded-2xl py-3 text-base font-semibold shadow-sm shadow-primary/40"
          onClick={() => onBook?.(guide)}
        >
          Book this guide
        </ButtonV2>
      </CardFooter>
    </Card>
  );
};

export default GuideCard;
