/**
 * Shared subscription-related types.
 * Import from "@/types" instead of defining locally in page files.
 */

export type BillingCycle = "monthly" | "yearly";

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "pending_cancellation"
  | "expired";

export interface PublicProduct {
  id: number;
  saasProductId?: number;
  name: string;
  description: string;
  planTier?: string;
  features: string[];
  tag: string;
  productFamily: string;
  creditPoints?: number;
  usageLimits?: Record<string, unknown>;
  pricing?: {
    INR: { monthly: number; yearly: number };
    USD: { monthly: number; yearly: number };
  };
}

export interface PublicBundle {
  id: number;
  name: string;
  description?: string;
  features: string[];
  creditPoints?: number;
  pricing: {
    INR: { monthly: number; yearly: number };
    USD: { monthly: number; yearly: number };
  };
}

/** Tier ordering matches backend planTier values */
export const PLAN_TIERS = ["free", "standard", "pro", "enterprise"] as const;
export type PlanTier = (typeof PLAN_TIERS)[number];

/** Returns true when a subscription's expiresAt is in the past, regardless of status field */
export function isSubscriptionExpired(expiresAt?: string | null): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() < Date.now();
}

/** Format paise → human-readable currency string */
export function formatAmount(amount: number, currency: string): string {
  if (!amount) return "Free";
  const val = amount / 100;
  return currency === "INR"
    ? `₹${val.toLocaleString("en-IN")}`
    : `$${val.toLocaleString("en-US")}`;
}

/** Format paise → INR string */
export function formatInr(paise: number): string {
  if (!paise) return "Free";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

/** Normalize a string for family/saasId matching (strips spaces, dashes, underscores, lowercase) */
export function normalizeKey(s?: string): string {
  return s?.toLowerCase().replace(/[\s_-]+/g, "") || "";
}
