import React from "react";
import { AlertTriangle, XCircle } from "lucide-react";

interface AccountStatusBannerProps {
  status?: string;
  rejectionReason?: string | null;
}

export function AccountStatusBanner({ status, rejectionReason }: AccountStatusBannerProps) {
  if (!status) return null;

  const STATUS_BANNERS: Record<
    string,
    { bg: string; border: string; text: string; icon: React.ReactNode; title: string; body: string }
  > = {
    suspended: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: <XCircle size={16} className="text-red-600 shrink-0" />,
      title: "Account Suspended",
      body: rejectionReason
        ? `Your account has been suspended. Reason: ${rejectionReason}. Please contact support.`
        : "Your account has been suspended. Please contact support@codeswayam.com for assistance.",
    },
    rejected: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: <XCircle size={16} className="text-red-600 shrink-0" />,
      title: "Account Rejected",
      body: rejectionReason
        ? `Your account was rejected. Reason: ${rejectionReason}.`
        : "Your account registration was not approved. Contact support for details.",
    },
    pending_deletion: {
      bg: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-800",
      icon: <AlertTriangle size={16} className="text-amber-600 shrink-0" />,
      title: "Deletion Requested",
      body: "Your account is scheduled for deletion and is pending admin review. You can still cancel this request by contacting support.",
    },
  };

  const banner = STATUS_BANNERS[status];
  if (!banner) return null;

  return (
    <div className={`${banner.bg} ${banner.border} border-b px-4 sm:px-6 py-3`}>
      <div className="max-w-[1440px] mx-auto flex items-center gap-3">
        {banner.icon}
        <div className="min-w-0">
          <span className={`font-bold text-sm ${banner.text}`}>{banner.title}: </span>
          <span className={`text-sm ${banner.text} opacity-90`}>{banner.body}</span>
        </div>
        <a
          href="mailto:support@codeswayam.com"
          className={`ml-auto shrink-0 text-xs font-bold underline ${banner.text} whitespace-nowrap`}
        >
          Contact Support
        </a>
      </div>
    </div>
  );
}
