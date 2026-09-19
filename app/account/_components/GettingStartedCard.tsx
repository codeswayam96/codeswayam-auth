import React from "react";
import Link from "next/link";
import { BookOpen, Package, Shield, Wallet } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export function GettingStartedCard() {
  const steps = [
    {
      Icon: Package,
      title: "Browse Our Products",
      desc: "Explore all available SaaS tools and subscribe to what you need.",
      href: "/dashboard",
    },
    {
      Icon: Shield,
      title: "Secure Your Account",
      desc: "Enable two-factor authentication for stronger protection.",
      href: "/account/security",
    },
    {
      Icon: Wallet,
      title: "Manage Payment Methods",
      desc: "Add a payment method for seamless automatic billing.",
      href: "/account/billing",
    },
  ];

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 px-7 py-6">
      <div className="mb-5 flex items-center gap-2">
        <BookOpen size={15} className="text-violet-600" />
        <p className="text-sm font-bold text-violet-700">Getting Started</p>
      </div>

      <div className="space-y-5">
        {steps.map(({ Icon, title, desc, href }, i, arr) => (
          <div key={title}>
            <Link href={href} className="group flex items-start gap-4 no-underline">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-200 bg-white group-hover:border-violet-600 group-hover:bg-violet-600 transition-colors">
                <Icon size={14} className="text-violet-600 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 group-hover:text-violet-700 transition-colors">
                  {title}
                </p>
                <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
              </div>
            </Link>
            {i < arr.length - 1 && <Separator className="mt-5 bg-violet-200/50" />}
          </div>
        ))}
      </div>
    </div>
  );
}
