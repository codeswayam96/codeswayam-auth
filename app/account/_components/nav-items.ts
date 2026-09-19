import {
  Home,
  User,
  CreditCard,
  Settings,
  Shield,
  DollarSign,
  LayoutDashboard,
  Coins,
  Users,
  FileText,
  Activity,
  Bell,
  LayoutGrid,
} from "lucide-react";

export interface NavItem {
  href: string;
  icon: any;
  label: string;
}

export const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/account", icon: Home, label: "Overview" },
  { href: "/account/profile", icon: User, label: "Profile" },
  { href: "/account/apps", icon: LayoutGrid, label: "My Apps" },
  { href: "/account/subscriptions", icon: CreditCard, label: "Subscriptions" },
  { href: "/account/security", icon: Shield, label: "Security" },
  { href: "/account/billing", icon: DollarSign, label: "Billing" },
  { href: "/account/credits", icon: Coins, label: "Credits" },
  { href: "/invoices", icon: FileText, label: "Invoices" },
  { href: "/account/notifications", icon: Bell, label: "Notifications" },
  { href: "/account/activity", icon: Activity, label: "Activity" },
  { href: "/account/referrals", icon: Users, label: "Referrals" },
  { href: "/account/preferences", icon: Settings, label: "Preferences" },
];

export const adminItems: NavItem[] = [
  { href: "/account/admin/domains", icon: Shield, label: "SSO Domains" },
  { href: "/account/admin/referrals", icon: Users, label: "Referral Panel" },
  { href: "/account/admin/security", icon: Shield, label: "Security Center" },
];
