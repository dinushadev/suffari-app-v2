import { useQuery } from "@tanstack/react-query";
import type { ServicesResponse } from "@/types/service";

const SERVICES_API_BASE =
  "http://alb-nv-nonprod-raahi-1-1384848655.us-east-1.elb.amazonaws.com/api";

export function getCountryCode(): string {
  const locales = [
    ...(typeof navigator !== "undefined" ? navigator.languages || [] : []),
    typeof navigator !== "undefined" ? navigator.language : "",
  ].filter(Boolean);

  for (const locale of locales) {
    const parts = locale.split("-");
    if (parts.length >= 2) return parts[parts.length - 1].toUpperCase();
  }
  return "US";
}

const fetchServices = async (countryCode: string): Promise<ServicesResponse> => {
  const res = await fetch(
    `${SERVICES_API_BASE}/services/by-location/${countryCode}`
  );
  if (!res.ok) throw new Error(`Failed to fetch services: ${res.status}`);
  return res.json();
};

export function useServices(countryCode: string) {
  return useQuery<ServicesResponse>({
    queryKey: ["services", countryCode],
    queryFn: () => fetchServices(countryCode),
    enabled: !!countryCode,
    staleTime: 5 * 60 * 1000,
  });
}

export function getServiceBase(locationServiceKey: string): string {
  if (!locationServiceKey) return "";
  return locationServiceKey.replace(/_[A-Z]{2,3}(?:-[A-Z]{2,3})?$/, "");
}

export function formatServiceLabel(serviceBase: string): string {
  return serviceBase
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");
}
