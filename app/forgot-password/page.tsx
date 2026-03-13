"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message || "Request failed");
      }
      setSent(true);
    } catch {
      // Show success regardless to prevent email enumeration
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail size={24} className="text-primary" />
          </div>
          <CardTitle className="text-xl">
            {sent ? "Check Your Email" : "Forgot Password"}
          </CardTitle>
          <CardDescription>
            {sent
              ? "If an account exists with that email, you'll receive a password reset link shortly."
              : "Enter your email address and we'll send you a link to reset your password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="text-center space-y-4">
              <CheckCircle2 size={48} className="mx-auto text-green-500" />
              <p className="text-sm text-muted-foreground">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <button
                  className="text-primary hover:underline font-medium"
                  onClick={() => { setSent(false); setEmail(""); }}
                >
                  try again
                </button>
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
                {loading && <Loader2 size={14} className="animate-spin" />}
                Send Reset Link
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
