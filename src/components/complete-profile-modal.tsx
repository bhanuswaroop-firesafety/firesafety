import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { updateUserProfileDetails } from "@/lib/db-service";
import { doc, updateDoc, db } from "@/lib/firebase";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/button";
import {
  User,
  Mail,
  Building2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export function CompleteProfileModal() {
  const { user, userProfile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    if (!user) {
      setIsOpen(false);
      return;
    }

    // Check if user has skipped within the last 24 hours (stored on users/{uid} in Firestore)
    if (userProfile?.profileSkippedAt) {
      try {
        const skippedTime = new Date(userProfile.profileSkippedAt).getTime();
        const now = Date.now();
        const hoursPassed = (now - skippedTime) / (1000 * 60 * 60);
        if (hoursPassed < 24) {
          setIsOpen(false);
          return;
        }
      } catch {}
    }

    // Determine if profile is incomplete:
    // 1. Explicitly not marked as completed
    // 2. Or email is the placeholder phone email (@mobile.udharchi.in)
    // 3. Or name is default/empty
    const isProfileIncomplete =
      !userProfile?.profileCompleted &&
      (!userProfile?.displayName ||
        userProfile?.displayName === "Client User" ||
        userProfile?.displayName.startsWith("Client (") ||
        !userProfile?.email ||
        userProfile?.email.includes("@mobile.udharchi.in"));

    if (isProfileIncomplete) {
      // Pre-fill existing non-placeholder values if available
      if (
        userProfile?.displayName &&
        userProfile.displayName !== "Client User" &&
        !userProfile.displayName.startsWith("Client (")
      ) {
        setName(userProfile.displayName);
      }
      if (userProfile?.email && !userProfile.email.includes("@mobile.udharchi.in")) {
        setEmail(userProfile.email);
      }
      if (userProfile?.company) {
        setCompany(userProfile.company);
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [user, userProfile]);

  const handleSkip = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          profileSkippedAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn("Could not save profileSkippedAt to users collection:", e);
      }
    }
    setIsOpen(false);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName || cleanName.length < 2) {
      setErrorMsg("Please enter your full name (minimum 2 characters).");
      return;
    }

    if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!user) return;

    setSubmitting(true);
    try {
      await updateUserProfileDetails(user.uid, {
        displayName: cleanName,
        email: cleanEmail,
        company: company.trim(),
      });

      setSuccessMsg("Profile saved successfully!");

      setTimeout(() => {
        setIsOpen(false);
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-card border border-border shadow-2xl backdrop-blur-xl">
        <DialogHeader className="text-left space-y-1.5">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-0.5 text-[11px] font-bold text-primary w-fit">
            <Sparkles className="size-3" />
            <span>One-Time Setup</span>
          </div>
          <DialogTitle className="text-xl font-bold font-display text-foreground">
            Complete Your Profile
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Please share your name and business email so we can prepare formal quotations, tax
            invoices, and delivery dispatches for your facility.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
            <span className="flex-1 leading-relaxed">{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
          <div>
            <label htmlFor="complete-name" className="block text-xs font-bold text-foreground mb-1">
              Your Full Name *
            </label>
            <div className="relative">
              <input
                id="complete-name"
                type="text"
                required
                autoComplete="name"
                placeholder="e.g. Rajesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-input bg-background pl-9 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label htmlFor="complete-email" className="block text-xs font-bold text-foreground mb-1">
              Work / Business Email *
            </label>
            <div className="relative">
              <input
                id="complete-email"
                type="email"
                required
                autoComplete="email"
                placeholder="e.g. purchasing@enterprise.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-input bg-background pl-9 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">
              Official PDF quotations and safety certificates will be routed here.
            </p>
          </div>

          <div>
            <label
              htmlFor="complete-company"
              className="block text-xs font-bold text-foreground mb-1"
            >
              Company / Plant Facility (Optional)
            </label>
            <div className="relative">
              <input
                id="complete-company"
                type="text"
                autoComplete="organization"
                placeholder="e.g. Apex Heavy Manufacturing Corp"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full rounded-xl border border-input bg-background pl-9 pr-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Building2 className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
            <Button
              type="submit"
              disabled={submitting}
              className="w-full sm:flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 gap-2 shadow-md"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="size-3.5 animate-spin" />
                  <span>Saving Details...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <ShieldCheck className="size-4" />
                  <span>Save &amp; Complete Profile</span>
                  <ArrowRight className="size-3.5" />
                </div>
              )}
            </Button>

            <Button
              type="button"
              variant="ghost"
              onClick={handleSkip}
              className="w-full sm:w-auto text-xs text-muted-foreground hover:text-foreground"
            >
              <span>Skip for now</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
