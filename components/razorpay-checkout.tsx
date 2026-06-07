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
  saasProductId?: number;
  bundleId?: number;
  billingCycle: "monthly" | "yearly" | "lifetime";
  currency: "INR" | "USD";
  planName: string;
  label?: string;
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  style?: CSSProperties;
  fullWidth?: boolean;
  icon?: ReactNode;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  usePoints?: boolean;
  /**
   * Where to redirect after successful payment.
   * IMPORTANT for cross-domain flows: if the user is paying from auraflow.com,
   * pass the full URL of the page they should return to.
   * Defaults to the current page (window.location.href).
   *
   * @example
   * // From auraflow — redirect back to auraflow dashboard after payment
   * returnUrl={`${window.location.origin}/dashboard`}
   *
   * // From codeswayam-auth — stay on subscriptions page
   * returnUrl="/account/subscriptions"
   */
  returnUrl?: string;
  upgradeFromSubscriptionId?: number;
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
  returnUrl,
  upgradeFromSubscriptionId,
}: RazorpayButtonProps) {
  const [loading, setLoading] = useState(false);

  // Resolve where to go after payment.
  // If returnUrl is a relative path, keep it as-is (same domain).
  // If it's a full URL (starts with http), use it directly (cross-domain).
  const resolveReturnUrl = () => {
    if (returnUrl) return returnUrl;
    // Default: stay on current page
    return typeof window !== "undefined" ? window.location.href : "/";
  };

  const handleSuccess = () => {
    onSuccess?.();
    const url = resolveReturnUrl();
    // Small delay so toast is visible before redirect
    setTimeout(() => {
      if (url.startsWith("http")) {
        window.location.href = url;
      } else {
        window.location.href = url;
      }
    }, 800);
  };

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
        upgradeFromSubscriptionId,
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
              upgradeFromSubscriptionId,
            });

            toast.success(`🎉 Subscribed to ${planName}!`);
            handleSuccess();
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
    planName, onSuccess, onError, usePoints, upgradeFromSubscriptionId,
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
