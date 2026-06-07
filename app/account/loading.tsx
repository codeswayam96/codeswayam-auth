import { BrandLoader } from "@/components/brand-loader";

export default function AccountLoading() {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <BrandLoader size="md" text="Syncing account data..." />
    </div>
  );
}
