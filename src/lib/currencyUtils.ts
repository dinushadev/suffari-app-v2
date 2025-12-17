import { Guide } from "@/types/guide";

/**
 * Get default currency from environment variable or fallback to USD
 */
export function getDefaultCurrency(): string {
  return process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "USD";
}

/**
 * Extract currency from resource type (for safari vehicles)
 */
export function getCurrencyFromResourceType(resourceType: { currency?: string }): string {
  return resourceType?.currency || getDefaultCurrency();
}

/**
 * Extract currency from guide rates (prefers displayPrice.currency)
 */
export function getCurrencyFromGuide(guide: Guide | null | undefined): string {
  if (!guide) {
    return getDefaultCurrency();
  }

  // Try rates first (preferred) - use displayPrice.currency if available
  if (guide.rates && guide.rates.length > 0) {
    const firstRate = guide.rates[0];
    if (firstRate.displayPrice?.currency) {
      return firstRate.displayPrice.currency;
    }
    if (firstRate.currency) {
      return firstRate.currency;
    }
  }

  // Fallback to pricing (legacy)
  if (guide.pricing && guide.pricing.length > 0) {
    const firstPricing = guide.pricing[0];
    if (firstPricing.displayPrice?.currency) {
      return firstPricing.displayPrice.currency;
    }
    if (firstPricing.currency) {
      return firstPricing.currency;
    }
  }

  return getDefaultCurrency();
}

/**
 * Get display amount from guide rate (prefers displayPrice.amount)
 */
export function getDisplayAmountFromRate(rate: { amount: number; displayPrice?: { amount: number } }): number {
  return rate.displayPrice?.amount ?? rate.amount;
}

/**
 * Format currency amount for display
 */
export function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || getDefaultCurrency(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch (error) {
    // Fallback to simple format if currency is invalid
    return `${currency || getDefaultCurrency()} ${amount.toFixed(2)}`;
  }
}

