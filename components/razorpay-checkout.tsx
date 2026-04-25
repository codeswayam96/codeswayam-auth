"use client";

import { useState, useCallback, type ReactNode, type CSSProperties } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
  fetchProfile,
} from "@/lib/api";

// ─── Razorpay window type ──────────────────────────────────────────────────────
declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface RazorpayButtonProps {
  /** For single-product subscriptions */
  saasProductId?: number;
  /** For bundle subscriptions */
  bundleId?: number;
  /** Billing cycle */
  billingCycle: "monthly" | "yearly" | "lifetime";
  /** Payment currency */
  currency: "INR" | "USD";
  /** Display name for the plan (shown in Razorpay modal) */
  planName: string;
  /** Button label text */
  label?: string;
  /** Button size variant */
  size?: "default" | "sm" | "lg" | "icon";
  /** Extra className for the button */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
  /** Full width */
  fullWidth?: boolean;
  /** Optional icon to show before the label */
  icon?: ReactNode;
  /** Called after successful payment & verification */
  onSuccess?: () => void;
  /** Called on payment failure */
  onError?: (error: string) => void;
  /** Use referral points for discount */
  usePoints?: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function RazorpayButton({
  saasProductId,
  bundleId,
  billingCycle,
  currency,
  planName,
  label = "Subscribe",
  size = "default",
  className = "",
  style,
  fullWidth = false,
  icon,
  onSuccess,
  onError,
  usePoints = false,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      // 1. Load Razorpay script
      const ok = await loadRazorpayScript();
      if (!ok) {
        const msg = "Could not load payment gateway. Please try again.";
        toast.error(msg);
        onError?.(msg);
        setLoading(false);
        return;
      }

      // 2. Fetch user profile for prefill
      let user: { name?: string; email?: string } = {};
      try {
        const profile = await fetchProfile();
        user = profile?.data || profile || {};
      } catch {
        // prefill is best-effort
      }

      // 3. Create order
      const orderData = await createRazorpayOrder({
        saasProductId,
        bundleId,
        billingCycle,
        currency,
        usePoints,
      });

      // Free-tier shortcut — backend may return { free: true }
      if ((orderData as any).free) {
        toast.success(`🎉 Subscribed to ${planName}!`);
        onSuccess?.();
        setLoading(false);
        return;
      }

      // 4. Open Razorpay checkout
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "CodeSwayam",
        description: `${planName} — ${billingCycle}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name || "",
          email: user.email || "",
        },
        theme: {
          color: "#8b5cf6",
          backdrop_color: "rgba(0,0,0,0.6)",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setLoading(false);
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              saasProductId,
              bundleId,
              billingCycle,
              currency,
              amount: orderData.amount,
              pointsUsed: (orderData as any).pointsUsed,
            });

            toast.success(`🎉 Subscribed to ${planName}!`);
            onSuccess?.();
          } catch (e: any) {
            const msg = e.message || "Payment verification failed";
            toast.error(msg);
            onError?.(msg);
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        const msg = response?.error?.description || "Payment failed";
        toast.error(msg);
        onError?.(msg);
        setLoading(false);
      });
      rzp.open();
    } catch (e: any) {
      const msg = e.message || "Failed to initiate payment";
      toast.error(msg);
      onError?.(msg);
      setLoading(false);
    }
  }, [
    loading, saasProductId, bundleId, billingCycle, currency,
    planName, onSuccess, onError, usePoints,
  ]);

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      size={size}
      className={`${fullWidth ? "w-full" : ""} ${className}`}
      style={style}
    >
      {loading ? (
        <Loader2 size={16} className="animate-spin mr-1.5" />
      ) : icon ? (
        <span className="mr-1">{icon}</span>
      ) : null}
      {loading ? "Processing…" : label}
    </Button>
  );
}
