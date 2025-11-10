import { formatInTimeZone, fromZonedTime, toZonedTime } from 'date-fns-tz';

/**
 * Map location IDs and countries to IANA timezone identifiers
 * IANA timezones are preferred over offsets as they handle DST automatically
 */
export const LOCATION_TIMEZONES: Record<string, string> = {
  // Sri Lanka locations (default)
  'Sri Lanka': 'Asia/Colombo',
  'bfe1341e-5e05-448c-af1d-e8ad749eb86d': 'Asia/Colombo', // Default location ID
  
  // Add more location-specific mappings as needed
  // Example: 'location-id-123': 'Asia/Colombo',
};

/**
 * Get IANA timezone for a location based on locationId or country
 * @param locationId - The location ID
 * @param country - Optional country name
 * @returns IANA timezone string (defaults to Asia/Colombo for Sri Lanka)
 */
export function getTimezoneForLocation(locationId: string, country?: string): string {
  // Try location-specific mapping first
  if (locationId && LOCATION_TIMEZONES[locationId]) {
    return LOCATION_TIMEZONES[locationId];
  }
  
  // Fallback to country mapping
  if (country && LOCATION_TIMEZONES[country]) {
    return LOCATION_TIMEZONES[country];
  }
  
  // Default to Sri Lanka timezone (Asia/Colombo = UTC+5:30)
  return 'Asia/Colombo';
}

/**
 * Convert local date and time in a specific timezone to UTC ISO string
 * @param date - Date string in format YYYY-MM-DD
 * @param time - Time string in format HH:MM:SS
 * @param timezone - IANA timezone identifier (e.g., 'Asia/Colombo')
 * @returns ISO 8601 UTC string
 */
export function convertLocalToUTC(
  date: string,
  time: string,
  timezone: string
): string {
  // Parse date and time components
  const [year, month, day] = date.split('-').map(Number);
  const [hours, minutes, seconds = 0] = time.split(':').map(Number);
  
  // Create a Date object representing the local time components
  // We'll treat this as if it's in UTC first, then adjust using timezone offset
  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  
  // Create a date object - this will be interpreted as local time
  // We need to use fromZonedTime which treats the date as if it's in the specified timezone
  // and converts it to UTC
  const localDate = new Date(dateStr);
  
  // fromZonedTime: treats the input date as if it's in the specified timezone
  // and returns the UTC equivalent
  const utcDate = fromZonedTime(localDate, timezone);
  
  return utcDate.toISOString();
}

/**
 * Convert UTC ISO string to a Date object in a specific timezone
 * @param utcDateTime - ISO 8601 UTC string
 * @param timezone - IANA timezone identifier
 * @returns Date object adjusted to the timezone
 */
export function convertUTCToLocal(
  utcDateTime: string,
  timezone: string
): Date {
  return toZonedTime(new Date(utcDateTime), timezone);
}

/**
 * Format a date/time in a specific timezone for display
 * @param date - Date object or ISO string
 * @param timezone - IANA timezone identifier
 * @param format - date-fns format string (e.g., 'EEE, MMM d, yyyy h:mm a')
 * @returns Formatted date string
 */
export function formatInTimezone(
  date: Date | string,
  timezone: string,
  format: string = 'EEE, MMM d, yyyy h:mm a'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return formatInTimeZone(dateObj, timezone, format);
}

/**
 * Get timezone abbreviation for display (e.g., IST, PST)
 * @param timezone - IANA timezone identifier
 * @param date - Optional date to get abbreviation for (handles DST)
 * @returns Timezone abbreviation string
 */
export function getTimezoneAbbreviation(
  timezone: string,
  date: Date = new Date()
): string {
  // Use Intl.DateTimeFormat to get timezone abbreviation
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    timeZoneName: 'short',
  });
  
  const parts = formatter.formatToParts(date);
  const tzPart = parts.find(part => part.type === 'timeZoneName');
  return tzPart?.value || timezone;
}

