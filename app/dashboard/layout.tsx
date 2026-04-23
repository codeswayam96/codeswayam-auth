import AccountLayout from "../account/layout";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AccountLayout>{children}</AccountLayout>;
}
