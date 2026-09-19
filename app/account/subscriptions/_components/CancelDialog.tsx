"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface CancelDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

/**
 * CancelDialog — confirmation modal before cancelling a subscription.
 */
export function CancelDialog({ open, onClose, onConfirm, loading }: CancelDialogProps) {
  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold leading-none tracking-tight">Cancel Subscription?</h3>
          <p className="text-sm text-muted-foreground">
            Your access remains active until the end of the current billing period. You can resubscribe anytime.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Keep Subscription</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 size={14} className="animate-spin mr-1" />}
            Yes, Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
