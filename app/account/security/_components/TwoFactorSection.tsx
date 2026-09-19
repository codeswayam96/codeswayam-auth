"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { AlertCircle, CheckCircle, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { generate2FA, enable2FA, disable2FA } from "@/lib/api";

interface TwoFactorSectionProps {
  enabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

/**
 * TwoFactorSection — 2FA enable/disable with QR code setup dialog.
 */
export function TwoFactorSection({ enabled, onStatusChange }: TwoFactorSectionProps) {
  const [loading, setLoading]   = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [qrCode, setQrCode]     = useState("");
  const [secret, setSecret]     = useState("");
  const [token, setToken]       = useState("");

  const startSetup = async () => {
    setLoading(true);
    try {
      const data = await generate2FA();
      setQrCode(data.qrCodeDataUrl);
      setSecret(data.secret);
      setShowSetup(true);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyAndEnable = async () => {
    setLoading(true);
    try {
      await enable2FA(secret, token);
      onStatusChange(true);
      setShowSetup(false);
      setToken("");
      toast.success("Two-factor authentication enabled successfully");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    setLoading(true);
    try {
      await disable2FA();
      onStatusChange(false);
      toast.success("Two-factor authentication disabled");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Smartphone size={18} className="text-primary" /> Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border">
            <div className="flex items-center gap-3">
              {enabled
                ? <CheckCircle size={20} className="text-green-600" />
                : <AlertCircle size={20} className="text-amber-600" />}
              <div>
                <p className="font-medium">{enabled ? "Enabled" : "Disabled"}</p>
                <p className="text-xs text-muted-foreground">
                  {enabled ? "Your account is protected with 2FA" : "Secure your account with 2FA"}
                </p>
              </div>
            </div>
            <Button variant={enabled ? "outline" : "default"} onClick={enabled ? handleDisable : startSetup} disabled={loading}>
              {loading && <Loader2 size={14} className="animate-spin mr-2" />}
              {enabled ? "Disable" : "Enable"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* QR Code Setup Dialog */}
      <Dialog open={showSetup} onOpenChange={setShowSetup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Enhance your account security by requiring a verification code on sign-in.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-3">
                Scan this QR code with an authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
              </p>
              <div className="bg-white p-4 rounded inline-block">
                {qrCode
                  ? <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
                  : <div className="w-40 h-40 bg-muted flex items-center justify-center rounded"><Loader2 size={24} className="animate-spin text-muted-foreground" /></div>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="verification-code">Enter verification code</Label>
              <Input id="verification-code" placeholder="000000" maxLength={6} value={token} onChange={(e) => setToken(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSetup(false)}>Cancel</Button>
            <Button onClick={verifyAndEnable} disabled={loading || token.length !== 6}>
              {loading && <Loader2 size={14} className="animate-spin mr-2" />}
              Verify &amp; Enable
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
