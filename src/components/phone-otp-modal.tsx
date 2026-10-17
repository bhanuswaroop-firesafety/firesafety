import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  SUPPORTED_COUNTRY_CODES,
  normalizePhoneNumber,
  formatIndianMobileDisplay,
} from "@/lib/phone-utils";
import type { ConfirmationResult } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import {
  Smartphone,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  RotateCcw,
  Edit2,
  ArrowRight,
  Clock,
  Sparkles,
  User,
  Building2,
  ChevronDown,
} from "lucide-react";

export interface PhoneOtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
}

export function PhoneOtpModal({
  isOpen,
  onClose,
  onSuccess,
  title = "Client Mobile Login",
  subtitle = "Sign in or register in seconds using real SMS OTP",
}: PhoneOtpModalProps) {
  const { sendPhoneOtp, verifyPhoneOtp, clearRecaptchaVerifier } = useAuth();

  const [step, setStep] = useState<"input_phone" | "enter_otp">("input_phone");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [showProfileDetails, setShowProfileDetails] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Clean reCAPTCHA verifier and reset state when opened or closed
  useEffect(() => {
    if (isOpen) {
      setStep("input_phone");
      setOtpCode("");
      setErrorMsg("");
      setSuccessMsg("");
    } else {
      clearRecaptchaVerifier();
    }
  }, [isOpen, clearRecaptchaVerifier]);

  // Resend countdown timer (45 seconds)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (resendCooldown > 0) {
      interval = setInterval(() => {
        setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendCooldown]);

  const phoneValidation = normalizePhoneNumber(phoneNumber, selectedCountryCode);

  const handlePhoneChange = (val: string) => {
    const digitsOnly = val.replace(/\D/g, "");
    if (digitsOnly.length > 15) return;
    setPhoneNumber(val);
    setErrorMsg("");
  };

  const handleSendOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!phoneValidation.valid) {
      setErrorMsg(phoneValidation.error || "Please enter a valid mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const confirmation = await sendPhoneOtp(phoneValidation.e164, "modal-recaptcha-container");
      setConfirmationResult(confirmation);
      setStep("enter_otp");
      setResendCooldown(45);
      setSuccessMsg(`6-Digit OTP sent via SMS to ${phoneValidation.formatted}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const code = (codeToVerify || otpCode).trim();
    if (code.length !== 6) {
      setErrorMsg("Please enter the complete 6-digit OTP code sent via SMS.");
      return;
    }

    if (!confirmationResult) {
      setErrorMsg("Verification session missing. Please request a new OTP.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setIsSubmitting(true);

    try {
      await verifyPhoneOtp(confirmationResult, code, {
        name: fullName,
        company: company,
      });

      setSuccessMsg("Logged in successfully via Mobile OTP!");
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isResending || isSubmitting) return;
    setIsResending(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const confirmation = await sendPhoneOtp(phoneValidation.e164, "modal-recaptcha-container");
      setConfirmationResult(confirmation);
      setResendCooldown(45);
      setSuccessMsg(`New OTP sent via SMS to ${phoneValidation.formatted}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          clearRecaptchaVerifier();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md p-6 rounded-2xl bg-card border border-border shadow-2xl">
        <DialogHeader className="text-left space-y-1">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-[11px] font-bold text-primary w-fit">
            <Smartphone className="size-3" />
            <span>Mobile Phone OTP</span>
          </div>
          <DialogTitle className="text-xl font-bold font-display text-foreground">
            {title}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            {subtitle}
          </DialogDescription>
        </DialogHeader>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{successMsg}</span>
          </div>
        )}

        {step === "input_phone" ? (
          /* STEP 1: PHONE NUMBER WITH COUNTRY CODE SELECTOR */
          <form onSubmit={handleSendOtp} className="space-y-4 pt-1">
            <div>
              <label htmlFor="modal-phone" className="block text-xs font-bold text-foreground mb-1.5">
                Mobile Phone Number *
              </label>
              <div className="flex rounded-xl border border-input bg-background focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 overflow-hidden shadow-xs">
                <div className="relative border-r border-border bg-muted/40 flex items-center">
                  <select
                    value={selectedCountryCode}
                    onChange={(e) => {
                      setSelectedCountryCode(e.target.value);
                      setErrorMsg("");
                    }}
                    aria-label="Country Code"
                    className="h-full pl-3 pr-7 py-2.5 text-xs font-bold bg-transparent text-foreground appearance-none cursor-pointer focus:outline-none"
                  >
                    {SUPPORTED_COUNTRY_CODES.map((c) => (
                      <option key={c.code} value={c.code} className="bg-card text-foreground">
                        {c.flag} {c.code}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 size-3 text-muted-foreground" />
                </div>

                <input
                  id="modal-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  required
                  placeholder={selectedCountryCode === "+91" ? "98765 43210" : "Mobile number"}
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm font-semibold tracking-wider text-foreground placeholder:text-muted-foreground/60 focus:outline-none"
                />

                {phoneValidation.valid && (
                  <div className="flex items-center pr-3">
                    <CheckCircle2 className="size-4 text-emerald-500 animate-in fade-in" />
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-muted-foreground">
                Enter your mobile number to receive a real 6-digit SMS verification code.
              </p>
            </div>

            {/* Optional profile name / facility details */}
            <div>
              <button
                type="button"
                onClick={() => setShowProfileDetails(!showProfileDetails)}
                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <Sparkles className="size-3" />
                <span>
                  {showProfileDetails
                    ? "Hide organization details"
                    : "+ Add Name & Company details (Optional)"}
                </span>
              </button>

              {showProfileDetails && (
                <div className="mt-2.5 grid gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Your Full Name
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        placeholder="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                      />
                      <User className="absolute right-2.5 top-2 size-3.5 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-muted-foreground">
                      Company / Enterprise
                    </label>
                    <div className="relative mt-1">
                      <input
                        type="text"
                        placeholder="Company Name"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs"
                      />
                      <Building2 className="absolute right-2.5 top-2 size-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !phoneValidation.valid}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 gap-2 shadow-md"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Requesting SMS Code...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <span>Send 6-Digit SMS OTP</span>
                  <ArrowRight className="size-3.5" />
                </div>
              )}
            </Button>
          </form>
        ) : (
          /* STEP 2: ENTER REAL SMS OTP */
          <div className="space-y-4 pt-1">
            <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-lg">📱</span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-muted-foreground">
                    Code Dispatched To
                  </p>
                  <p className="font-bold text-foreground font-mono text-xs">
                    {phoneValidation.formatted || phoneNumber}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setStep("input_phone");
                  setOtpCode("");
                  setErrorMsg("");
                }}
                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1 bg-background px-2 py-1 rounded border border-border disabled:opacity-50"
              >
                <Edit2 className="size-3" />
                <span>Change</span>
              </button>
            </div>

            {/* OTP Slots */}
            <div className="flex flex-col items-center justify-center py-1">
              <label className="text-xs font-bold text-foreground mb-2 text-center">
                Enter 6-Digit Verification Code
              </label>
              <InputOTP
                maxLength={6}
                value={otpCode}
                disabled={isSubmitting}
                onChange={(val) => {
                  setOtpCode(val);
                  if (val.length === 6) {
                    handleVerifyOtp(val);
                  }
                }}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="size-10 rounded-lg text-base font-bold border-2" />
                  <InputOTPSlot index={1} className="size-10 rounded-lg text-base font-bold border-2" />
                  <InputOTPSlot index={2} className="size-10 rounded-lg text-base font-bold border-2" />
                  <InputOTPSlot index={3} className="size-10 rounded-lg text-base font-bold border-2" />
                  <InputOTPSlot index={4} className="size-10 rounded-lg text-base font-bold border-2" />
                  <InputOTPSlot index={5} className="size-10 rounded-lg text-base font-bold border-2" />
                </InputOTPGroup>
              </InputOTP>
              <p className="mt-2 text-[10px] text-muted-foreground text-center">
                Enter the 6-digit verification code sent to your phone.
              </p>
            </div>

            {/* Resend & Actions */}
            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/60">
              {resendCooldown > 0 ? (
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3 text-muted-foreground" />
                  <span>Resend in <strong className="font-mono text-foreground">{resendCooldown}s</strong></span>
                </span>
              ) : (
                <button
                  type="button"
                  disabled={isResending || isSubmitting}
                  onClick={handleResendOtp}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 disabled:opacity-50"
                >
                  <RotateCcw className={`size-3 ${isResending ? "animate-spin" : ""}`} />
                  <span>Resend Code</span>
                </button>
              )}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setStep("input_phone");
                  setOtpCode("");
                }}
                className="text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-50"
              >
                Change number
              </button>
            </div>

            <Button
              type="button"
              onClick={() => handleVerifyOtp()}
              disabled={isSubmitting || otpCode.length < 6}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 shadow-md gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Verifying Code...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="size-4" />
                  <span>Verify Code &amp; Sign In</span>
                </div>
              )}
            </Button>
          </div>
        )}

        {/* reCAPTCHA Invisible Container */}
        <div id="modal-recaptcha-container" className="my-0.5 flex justify-center" />
      </DialogContent>
    </Dialog>
  );
}
