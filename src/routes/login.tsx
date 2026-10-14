import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/button";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldCheck,
  User,
  Building2,
  Phone,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Layers,
  FileText,
  Clock,
  ShieldAlert,
} from "lucide-react";

import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () =>
    seoHead({
      title: "Client & User Portal | Sri Udharchi Enterprises",
      description:
        "Sign in or register for Sri Udharchi Enterprises B2B portal to track quotations, manage safety inspection orders, and access equipment compliance records.",
      path: "/login",
      noIndex: true,
    }),
  component: LoginPage,
});

export interface LoginPageProps {
  initialMode?: "login" | "signup";
}

export function LoginPage({ initialMode = "login" }: LoginPageProps = {}) {
  const {
    user,
    userProfile,
    isAdmin,
    isStaff,
    isCustomer,
    loading,
    authConfigError,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginAsDemo,
    logout,
  } = useAuth();
  const navigate = useNavigate();

  // Mode: "login" or "signup"
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // Form Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Check query parameter ?tab=signup or ?tab=login or initialMode
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "signup" || window.location.pathname === "/signup" || initialMode === "signup") {
        setMode("signup");
      } else if (tab === "login") {
        setMode("login");
      }
    }
  }, [initialMode]);

  // When in signup mode and the user is authenticated, redirect to homepage immediately
  useEffect(() => {
    if (user && (mode === "signup" || initialMode === "signup")) {
      navigate({ to: "/" });
    }
  }, [user, mode, initialMode, navigate]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-muted" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
    if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
    return { score: 4, label: "Strong", color: "bg-emerald-500" };
  };

  const strength = getPasswordStrength(password);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      setSuccessMsg("Signed in successfully!");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg
          .replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim(),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const displayName = company ? `${name} (${company})` : name;
      await registerWithEmail(email, password, displayName, { phone, company });
      setSuccessMsg("Account created successfully! Redirecting to homepage...");
      setTimeout(() => {
        navigate({ to: "/" });
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg
          .replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim(),
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      await loginWithGoogle();
      if (mode === "signup" || initialMode === "signup") {
        setSuccessMsg("Signed up via Google! Redirecting to homepage...");
        setTimeout(() => {
          navigate({ to: "/" });
        }, 400);
      } else {
        setSuccessMsg("Authenticated via Google successfully!");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg
          .replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim(),
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SiteHeader />

      <main className="relative flex-1 py-12 md:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
        {/* Ambient Decorative Lighting */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/10 blur-[130px]" />
          <div className="absolute bottom-10 right-10 size-[400px] rounded-full bg-amber-500/10 blur-[120px]" />
        </div>

        <div className="relative z-10 w-full max-w-xl">
          {/* Top Headline & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-bold text-primary mb-3">
              <ShieldCheck className="size-3.5" />
              <span>B2B Client & Industrial Portal</span>
            </div>
            <h1 className="font-display text-3xl font-black text-foreground sm:text-4xl tracking-tight">
              {user
                ? "Your Client Account"
                : mode === "login"
                  ? "Welcome Back"
                  : "Create Client Account"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {user
                ? "Manage your active session, safety inquiries, and equipment quotations."
                : mode === "login"
                  ? "Access verified equipment quotes, safety inspection reports, and industrial orders."
                  : "Register your facility or enterprise for priority quotes and compliant fire safety hardware."}
            </p>
          </div>

          {/* IF USER IS ALREADY LOGGED IN: SHOW ACCOUNT CARD */}
          {user ? (
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-4 border-b border-border pb-6">
                <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display font-black text-xl shadow-inner">
                  {(userProfile?.displayName || user.email || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold text-foreground">
                      {userProfile?.displayName || user.displayName || "Client Account"}
                    </h2>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                        userProfile?.role === "admin"
                          ? "bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30"
                          : userProfile?.role === "staff"
                            ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      }`}
                    >
                      {userProfile?.role || "Customer"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Status Details */}
              <div className="grid gap-3 sm:grid-cols-2 my-6 text-xs">
                <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Account Status
                  </span>
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <span className="size-2 rounded-full bg-emerald-500" />
                    <span>Active & Verified</span>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Role Privileges
                  </span>
                  <div className="font-semibold text-foreground">
                    {userProfile?.role === "admin"
                      ? "Full Executive Portal Access"
                      : userProfile?.role === "staff"
                        ? "Field Staff & Lead Review"
                        : "Quotation & Product Requests"}
                  </div>
                </div>
              </div>

              {/* Profile Details from Database */}
              {(userProfile?.company || userProfile?.phone || userProfile?.lastLoginAt) && (
                <div className="grid gap-3 sm:grid-cols-2 mb-6 text-xs border-t border-border pt-4">
                  {userProfile?.company && (
                    <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Company / Facility
                      </span>
                      <p className="font-semibold text-foreground">{userProfile.company}</p>
                    </div>
                  )}
                  {userProfile?.phone && (
                    <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Phone Contact
                      </span>
                      <p className="font-semibold text-foreground">{userProfile.phone}</p>
                    </div>
                  )}
                  {userProfile?.lastLoginAt && (
                    <div className="rounded-xl border border-border bg-muted/20 p-3 space-y-0.5 sm:col-span-2">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Last Database Authentication
                      </span>
                      <p className="font-mono text-xs text-muted-foreground">
                        {new Date(userProfile.lastLoginAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation & Actions */}
              <div className="space-y-3">
                {isAdmin && (
                  <Button
                    onClick={() => navigate({ to: "/admin" })}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 gap-2"
                  >
                    <Shield className="size-4" />
                    <span>Open Administrator Portal</span>
                    <ArrowRight className="size-3.5" />
                  </Button>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <a href="/products">
                    <Button variant="outline" className="w-full text-xs">
                      <Layers className="size-3.5" />
                      <span>Browse Products</span>
                    </Button>
                  </a>
                  <a href="/contact">
                    <Button variant="outline" className="w-full text-xs">
                      <FileText className="size-3.5" />
                      <span>Request Quote</span>
                    </Button>
                  </a>
                </div>

                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 mt-2"
                >
                  <span>Sign Out of Account</span>
                </Button>
              </div>
            </div>
          ) : (
            /* AUTH FORM CARD */
            <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              {/* Tabs: Sign In / Create Account */}
              <div className="grid grid-cols-2 rounded-xl bg-muted/60 p-1 mb-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`rounded-lg py-2.5 transition-all ${
                    mode === "login"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("signup");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className={`rounded-lg py-2.5 transition-all ${
                    mode === "signup"
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* Google Sign-in */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleAuth}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-bold text-foreground transition-all hover:bg-muted hover:border-primary/50 disabled:opacity-50"
              >
                <svg className="size-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-5 text-center text-xs text-muted-foreground">
                <span className="relative z-10 bg-card px-3 uppercase text-[10px] tracking-wider font-semibold">
                  Or with Email & Password
                </span>
                <div className="absolute inset-0 top-1/2 -z-0 border-t border-border" />
              </div>

              {/* Firebase Console Status Notice & Interactive Demo Login */}
              {authConfigError && (
                <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-900 dark:text-amber-200">
                  <div className="flex items-start gap-2.5">
                    <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold text-foreground">
                        Firebase Authentication Setup Notice
                      </p>
                      <p className="text-[11px] leading-relaxed text-muted-foreground">
                        Live Firebase Auth is not yet activated in the Firebase Console for project{" "}
                        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-primary font-bold">
                          sri-udharchi-enterprises-c3be7
                        </code>
                        . Please enable Email/Password under Authentication in the Firebase Console to allow live client accounts.
                      </p>
                    </div>
                  </div>

                  <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-muted-foreground">
                      Test portal features immediately:
                    </span>
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => loginAsDemo("customer")}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-8 gap-1.5"
                    >
                      <ShieldCheck className="size-3.5" />
                      <span>Explore Demo Client Portal</span>
                    </Button>
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {errorMsg && (
                <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{errorMsg}</div>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed">{successMsg}</div>
                </div>
              )}

              {/* TAB 1: LOGIN FORM */}
              {mode === "login" && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="login-email" className="text-xs font-semibold text-foreground">Email Address</label>
                    <div className="relative mt-1">
                      <input
                        id="login-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        required
                        placeholder="client@company.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <Mail className="absolute right-3.5 top-3 size-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label htmlFor="login-password" className="text-xs font-semibold text-foreground">Password</label>
                      <button
                        type="button"
                        onClick={() =>
                          alert(
                            "Password reset: Please contact our support team at info@udharchienterprises.com or call dispatch at +91 86398 58221.",
                          )
                        }
                        className="text-[11px] text-primary hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative mt-1">
                      <input
                        id="login-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 shadow-lg shadow-primary/20 gap-2"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="size-4 animate-spin" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Sign In to Account</span>
                        <ArrowRight className="size-4" />
                      </div>
                    )}
                  </Button>
                </form>
              )}

              {/* TAB 2: SIGNUP FORM */}
              {mode === "signup" && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-name" className="text-xs font-semibold text-foreground">Full Name *</label>
                      <div className="relative mt-1">
                        <input
                          id="signup-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          placeholder="Ramesh Kumar"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <User className="absolute right-3.5 top-3 size-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="signup-company" className="text-xs font-semibold text-foreground">
                        Company / Enterprise
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="signup-company"
                          name="company"
                          type="text"
                          autoComplete="organization"
                          placeholder="Steel Mills Ltd. (Optional)"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Building2 className="absolute right-3.5 top-3 size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="signup-email" className="text-xs font-semibold text-foreground">
                        Work Email Address *
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="signup-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="ramesh@steelmills.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Mail className="absolute right-3.5 top-3 size-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="signup-phone" className="text-xs font-semibold text-foreground">Phone Number</label>
                      <div className="relative mt-1">
                        <input
                          id="signup-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          placeholder="+91 98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                        <Phone className="absolute right-3.5 top-3 size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="signup-password" className="text-xs font-semibold text-foreground">
                      Choose Password *
                    </label>
                    <div className="relative mt-1">
                      <input
                        id="signup-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        placeholder="At least 6 characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>

                    {/* Password Strength Indicator */}
                    {password && (
                      <div className="mt-2 space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-muted-foreground">Strength:</span>
                          <span className="font-bold text-foreground">{strength.label}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 h-1.5">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`rounded-full transition-colors ${
                                strength.score >= step ? strength.color : "bg-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="signup-confirm-password" className="text-xs font-semibold text-foreground">
                      Confirm Password *
                    </label>
                    <input
                      id="signup-confirm-password"
                      name="confirm-password"
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>

                  <label htmlFor="signup-terms" className="flex items-start gap-2 pt-1 cursor-pointer">
                    <input
                      id="signup-terms"
                      name="terms"
                      type="checkbox"
                      required
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="size-4 rounded border-input text-primary focus:ring-primary mt-0.5"
                    />
                    <span className="text-[11px] text-muted-foreground leading-relaxed">
                      I agree to the industrial safety terms of service and consent to receiving
                      quotation updates.
                    </span>
                  </label>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 shadow-lg shadow-primary/20 gap-2 mt-2"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="size-4 animate-spin" />
                        <span>Registering Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Create Client Account</span>
                        <ArrowRight className="size-4" />
                      </div>
                    )}
                  </Button>
                </form>
              )}

              {/* Footer Switcher & Admin Link */}
              <div className="mt-6 border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
                <div>
                  {mode === "login" ? (
                    <span>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("signup")}
                        className="font-bold text-primary hover:underline"
                      >
                        Create one now
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => setMode("login")}
                        className="font-bold text-primary hover:underline"
                      >
                        Sign In here
                      </button>
                    </span>
                  )}
                </div>

                <a
                  href="/admin/login"
                  className="font-semibold text-foreground hover:text-primary transition-colors flex items-center gap-1"
                >
                  <Lock className="size-3 text-primary" />
                  <span>Admin Portal →</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
