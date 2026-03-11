import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@react-oauth/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Authentication | Code Swayam",
  description: "Centralized login and security for Code Swayam applications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      <html lang="en">
        <body className={`${inter.className} bg-gray-50 min-h-screen`}>{children}</body>
      </html>
    </GoogleOAuthProvider>
  );
}
