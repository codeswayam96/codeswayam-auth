import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";

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
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <html lang="en">
        <body className={`${inter.className} bg-background min-h-screen`}>
          {children}
          <Toaster richColors position="top-right" />
        </body>
      </html>
    </GoogleOAuthProvider>
  );
}
