import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/providers";
import { Analytics } from "@codeswayam/analytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CodeSwayam — One Account, Every Tool",
  description:
    "Sign in once at auth.codeswayam.com and access every app across the CodeSwayam platform. Secure SSO with Google OAuth, role-based access, and enterprise-grade cookie security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-background min-h-screen`}>
        <Analytics
          gtmId={process.env.NEXT_PUBLIC_GTM_ID}
          ga4Id={process.env.NEXT_PUBLIC_GA4_ID}
          gscVerification={process.env.NEXT_PUBLIC_GSC_VERIFICATION}
          appName="codeswayam-auth"
        />
        <Providers>
          {children}
        </Providers>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
