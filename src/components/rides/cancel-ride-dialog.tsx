"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelRide } from "@/app/actions/rides";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface CancelRideDialogProps {
  rideId: string;
  locale: string;
}

export function CancelRideDialog({ rideId, locale: _locale }: CancelRideDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsCancelling(true);
    setError(null);

    const res = await cancelRide(rideId);
    if (res.error) {
      setError(res.error);
      setIsCancelling(false);
      return;
    }

    setIsOpen(false);
    setIsCancelling(false);
    router.refresh();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-9 text-xs rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50">
          Cancel Ride
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-2xl">
        <DialogHeader>
          <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900">
            Cancel this Ride?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 leading-relaxed">
            Are you sure you want to cancel this offered ride? This action cannot be undone.
            Your ride listing will be closed for commuters.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <p className="text-xs text-rose-500 font-medium py-1">{error}</p>
        )}

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isCancelling}
            className="h-9 text-xs rounded-xl"
          >
            Keep Ride
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isCancelling}
            className="h-9 text-xs rounded-xl bg-rose-600 hover:bg-rose-700 text-white"
          >
            {isCancelling ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Cancelling...
              </span>
            ) : (
              "Yes, Cancel Ride"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
