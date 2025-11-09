import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { v4 as uuidv4 } from 'uuid';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateSessionId(): string {
  return uuidv4();
}

// You might need to add this type definition if not already present
type ClassValue = string | string[] | { [key: string]: boolean | undefined | null } | undefined | null;

/**
 * Normalize speaking_languages field from CSV string to array
 * Handles both CSV strings (from DB) and arrays (already normalized)
 * @param languages - Can be a CSV string, array, null, or undefined
 * @returns Always returns an array of strings
 */
export function normalizeLanguages(languages: string | string[] | null | undefined): string[] {
  if (!languages) return [];
  if (Array.isArray(languages)) return languages;
  if (typeof languages === "string") {
    // Split by comma and clean up whitespace
    return languages
      .split(",")
      .map((lang) => lang.trim())
      .filter((lang) => lang.length > 0);
  }
  return [];
}



