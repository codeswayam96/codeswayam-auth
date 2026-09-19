"use client";

/**
 * Dashboard types — used by ProductCard, BundleCard, and the page orchestrator.
 */

export interface SaaSProduct {
  id: string;
  saasId: string;
  productFamily: string;
  name: string;
  description: string;
  category: string;
  monthlyInr: number;
  yearlyInr: number;
  monthlyUsd: number;
  yearlyUsd: number;
  status: "active" | "beta" | "coming_soon";
  planTier?: string;
  isFreeTier?: boolean;
  features: string[];
}

export interface Bundle {
  id: string;
  name: string;
  description: string;
  monthlyInr: number;
  yearlyInr: number;
  monthlyUsd: number;
  yearlyUsd: number;
  features: string[];
}

export type BillingCycle = "monthly" | "yearly";

export function formatInr(paise: number): string {
  if (paise === 0) return "Free";
  return `₹${(paise / 100).toLocaleString("en-IN")}`;
}

export function yearlySaving(monthly: number, yearly: number): number {
  return Math.max(0, monthly * 12 - yearly);
}

export function yearlySavingPct(monthly: number, yearly: number): number {
  if (!monthly) return 0;
  return Math.round(((monthly * 12 - yearly) / (monthly * 12)) * 100);
}
