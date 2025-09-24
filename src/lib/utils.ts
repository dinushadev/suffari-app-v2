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



