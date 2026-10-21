import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/button";
import {
  UserPlus,
  User,
  ShieldCheck,
  Lock,
  ArrowRight,
  FileCheck2,
  PackageCheck,
  CheckCircle2,
} from "lucide-react";

export interface AuthRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string | undefined;
  redirectUrl?: string | undefined;
  allowDismiss?: boolean | undefined;
}

export function AuthRequiredModal({
  isOpen,
  onClose,
  productName,
  redirectUrl = "/products",
  allowDismiss = true,
}: AuthRequiredModalProps) {
  const signupUrl = `/signup?redirect=${encodeURIComponent(redirectUrl)}`;
  const loginUrl = `/login?redirect=${encodeURIComponent(redirectUrl)}`;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && allowDismiss && onClose()}>
        <DialogContent className="sm:max-w-md p-6 overflow-hidden border-border/80 bg-card shadow-2xl">
          <div className="flex flex-col items-center text-center">
            {/* Shield / Key Icon with subtle pulse */}
            <div className="relative mb-3 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
              <Lock className="size-6 text-primary" />
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-black">
                !
              </span>
            </div>

            <DialogHeader className="space-y-1.5 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary mx-auto mb-1">
                <ShieldCheck className="size-3.5" />
                <span>Account Required</span>
              </div>
              <DialogTitle className="text-xl sm:text-2xl font-bold font-display text-foreground leading-tight">
                You must have an account. Please signup
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed pt-1">
                {productName ? (
                  <>
                    To proceed with purchasing, ordering, or requesting an instant quotation for{" "}
                    <span className="font-semibold text-foreground">"{productName}"</span>, please create an account or sign in.
                  </>
                ) : (
                  <>
                    To proceed with purchasing industrial safety equipment, placing orders, or requesting instant quotations, please create an account or sign in.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>

            {/* Value perks */}
            <div className="my-4 w-full rounded-xl border border-border/70 bg-muted/40 p-3 text-left space-y-2">
              <div className="flex items-center gap-2 text-xs text-foreground/90">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <span>Quick registration with Email or Google</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground/90">
                <FileCheck2 className="size-4 text-emerald-500 shrink-0" />
                <span>Access verified BIS/ISI compliance test certificates</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-foreground/90">
                <PackageCheck className="size-4 text-emerald-500 shrink-0" />
                <span>Track equipment dispatch, quotations, and service renewals</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full space-y-2.5">
              {/* Primary Signup Button */}
              <a href={signupUrl} className="block w-full">
                <Button size="lg" className="w-full justify-center text-sm font-bold shadow-md gap-2">
                  <UserPlus className="size-4" /> Sign Up / Create Account
                </Button>
              </a>

              {/* Sign In Button */}
              <a href={loginUrl} className="block w-full">
                <Button variant="outline" className="w-full justify-center text-xs font-bold gap-1.5 h-9">
                  <User className="size-3.5" /> Already have an account? Sign In
                </Button>
              </a>

              {allowDismiss && (
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-muted-foreground hover:text-foreground font-semibold pt-1 transition-colors block mx-auto underline-offset-4 hover:underline cursor-pointer"
                >
                  Continue browsing catalog
                </button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
