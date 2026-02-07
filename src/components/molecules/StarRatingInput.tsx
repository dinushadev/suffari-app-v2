"use client";

import React from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { StarIcon as StarIconOutline } from "@heroicons/react/24/outline";
import { cn } from "@/lib/utils";

export interface StarRatingInputProps {
  value: number;
  onChange: (rating: number) => void;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
}

const MAX_STARS = 5;

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  value,
  onChange,
  disabled = false,
  className,
  "aria-label": ariaLabel = "Rating",
}) => {
  return (
    <div
      className={cn("flex items-center gap-1", className)}
      role="group"
      aria-label={ariaLabel}
    >
      {Array.from({ length: MAX_STARS }, (_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= value;
        return (
          <button
            key={starValue}
            type="button"
            disabled={disabled}
            onClick={() => onChange(starValue)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onChange(starValue);
              }
            }}
            className={cn(
              "p-0.5 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background transition",
              !disabled ? "hover:scale-110 active:scale-95" : undefined
            )}
            aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
            aria-pressed={value === starValue}
          >
            {isFilled ? (
              <StarIcon className="w-8 h-8 text-primary" />
            ) : (
              <StarIconOutline className="w-8 h-8 text-muted-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StarRatingInput;
