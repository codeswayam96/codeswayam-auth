"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogDescription,
  DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
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
        <DialogHeader>
          <DialogTitle>Cancel Subscription?</DialogTitle>
          <DialogDescription>
            Your access remains active until the end of the current billing period. You can resubscribe anytime.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
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
