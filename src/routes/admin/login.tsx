import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/button";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Administrator Portal Login | Sri Udharchi Enterprises" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

export function AdminLoginPage() {
  const {
    user,
    userProfile,
    isAdmin,
    loading,
    authConfigError,
    loginWithGoogle,
    loginWithEmail,
    loginAsDemo,
    logout,
  } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showFirebaseGuide, setShowFirebaseGuide] = useState(false);

  // If already logged in and verified as admin, redirect directly to dashboard
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleEmailLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
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

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setSubmitting(true);
    try {
      await loginWithGoogle();
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
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950 text-slate-100 p-4 sm:p-6">
      {/* Background Ambient Glow & Grid Pattern */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 size-[650px] rounded-full bg-red-600/15 blur-[140px]" />
        <div className="absolute -bottom-40 right-10 size-[450px] rounded-full bg-amber-500/10 blur-[130px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Top Branding Badge */}
        <div className="mb-6 text-center">
          <div className="flex justify-center">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-3 shadow-xl backdrop-blur-md">
              <BrandLogo />
            </div>
          </div>

          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/10 px-4 py-1.5 text-xs font-bold tracking-wide text-red-400 backdrop-blur-sm">
            <span className="size-2 rounded-full bg-red-500 animate-pulse" />
            <Shield className="size-3.5" />
            <span>SECURE EXECUTIVE ADMIN PORTAL</span>
          </div>

          <h1 className="mt-3 font-display text-2xl font-black text-white sm:text-3xl tracking-tight">
            Enterprise Command Center
          </h1>
          <p className="mt-1.5 text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
            Restricted to authorized safety administrators and inventory managers of Sri Udharchi
            Enterprises.
          </p>
        </div>

        {/* Main Glass Card */}
        <div className="rounded-2xl border border-slate-800/80 bg-slate-900/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl ring-1 ring-white/5">
          {/* Firebase Configuration Notice */}
          {authConfigError && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-amber-200">
                  <ShieldAlert className="size-4 shrink-0 text-amber-400" />
                  <span>Firebase Authentication Setup Required</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFirebaseGuide(!showFirebaseGuide)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-white"
                >
                  <span>{showFirebaseGuide ? "Hide Guide" : "Setup Guide"}</span>
                  <ChevronDown
                    className={`size-3 transition-transform ${showFirebaseGuide ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <p className="mt-1.5 text-[11px] leading-relaxed text-amber-300/90">
                Live Firebase Authentication is not yet activated in the Firebase Console for
                project{" "}
                <code className="rounded bg-amber-400/20 px-1 py-0.5 font-mono font-bold text-white">
                  sri-udharchi-enterprises-c3be7
                </code>
                . Please follow the setup guide below to enable sign-in providers in the console.
              </p>

              {showFirebaseGuide && (
                <div className="mt-3 pt-3 border-t border-amber-500/20 text-[11px] space-y-1.5 text-amber-200/90">
                  <div className="font-semibold text-white">To activate in Firebase Console:</div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-400">1.</span>
                    <span>
                      Go to console.firebase.google.com &gt; Select project{" "}
                      <strong>sri-udharchi-enterprises-c3be7</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-400">2.</span>
                    <span>
                      Navigate to <strong>Build &gt; Authentication</strong> &gt; Click{" "}
                      <strong>Get Started</strong>
                    </span>
                  </div>
                  <div className="flex items-start gap-1.5">
                    <span className="font-bold text-amber-400">3.</span>
                    <span>
                      Enable <strong>Email/Password</strong> and/or <strong>Google</strong> under
                      Sign-in method tab
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-3.5 pt-3 border-t border-amber-500/20 flex flex-wrap items-center justify-between gap-2">
                <span className="text-[11px] font-semibold text-amber-200/90">
                  Preview Admin Command Center:
                </span>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => loginAsDemo("admin")}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold h-8 gap-1.5 shadow-md shadow-red-950"
                >
                  <ShieldCheck className="size-3.5" />
                  <span>Launch Demo Admin Session</span>
                </Button>
              </div>
            </div>
          )}

          {/* Logged in but non-admin warning */}
          {user && !isAdmin && (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs text-red-200">
              <div className="flex items-center gap-2 font-bold text-red-300">
                <AlertTriangle className="size-4 text-red-400 shrink-0" />
                <span>Unauthorized Role: {userProfile?.role || "customer"}</span>
              </div>
              <p className="mt-1.5 text-[11px] text-red-200/80 leading-relaxed">
                Signed in as <strong className="text-white">{user.email}</strong>, but this account
                lacks the required{" "}
                <code className="font-mono font-bold text-red-300">role: "admin"</code> in
                Firestore.
              </p>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="text-xs h-7 border-red-500/30 text-red-200 hover:bg-red-500/20"
                  onClick={logout}
                >
                  Sign Out
                </Button>
                <a
                  href="/login"
                  className="text-xs self-center text-red-300 underline hover:text-white"
                >
                  Go to Client Portal
                </a>
              </div>
            </div>
          )}

          {/* Google Sign In */}
          <button
            type="button"
            disabled={submitting}
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-700/80 bg-slate-800/80 py-2.5 px-4 text-xs font-bold text-white transition-all hover:bg-slate-700/80 hover:border-slate-600 disabled:opacity-50"
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
            <span>Continue with Google Workspace</span>
          </button>

          <div className="relative my-5 text-center text-xs text-slate-500">
            <span className="relative z-10 bg-slate-900 px-3 uppercase text-[10px] tracking-wider font-semibold">
              Or Sign In with Credentials
            </span>
            <div className="absolute inset-0 top-1/2 -z-0 border-t border-slate-800" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Admin Email Address</label>
              <div className="relative mt-1">
                <input
                  type="email"
                  required
                  placeholder="sriudharchienterprises@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <Mail className="absolute right-3.5 top-3 size-4 text-slate-500" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300">Password</label>
                <span className="text-[11px] text-slate-500">IS 15683 Verified</span>
              </div>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs h-10 shadow-lg shadow-red-950/50"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Sign In as Administrator</span>
                  <ArrowRight className="size-4" />
                </div>
              )}
            </Button>
          </form>

          {/* Security & RBAC Footer */}
          <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-[11px] text-slate-400">
            <div className="flex items-center gap-2 font-bold text-slate-300">
              <Lock className="size-3.5 text-red-400" />
              <span>Role-Based Access Control</span>
            </div>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">
              Only authorized staff & administrators with explicit database roles in{" "}
              <code className="text-slate-400">/users</code> can view confidential quotes, client
              leads, and alter the product catalog.
            </p>
          </div>

          {/* Bottom navigation links */}
          <div className="mt-6 flex flex-wrap items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-4">
            <a href="/" className="hover:text-red-400 transition-colors">
              ← Return to Main Website
            </a>
            <a
              href="/login"
              className="text-red-400 hover:text-red-300 font-semibold transition-colors"
            >
              Client Portal Sign In →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
