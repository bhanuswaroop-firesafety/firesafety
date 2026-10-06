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
} from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({
    meta: [
      { title: "Admin Login | Sri Udharchi Enterprises" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const { user, isAdmin, loading, authConfigError, loginWithGoogle, loginWithEmail } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

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
      // Once logged in, the auth state listener checks Firestore users collection
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 text-foreground">
      <div className="w-full max-w-md">
        {/* Brand header */}
        <div className="mb-6 text-center">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
            <Shield className="size-3.5" />
            <span>Secure Admin Portal</span>
          </div>
          <h1 className="mt-2 font-display text-2xl font-black text-foreground">
            Administrator Login
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Access is restricted to authorized accounts with the{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">
              admin
            </code>{" "}
            role in the Firestore users collection.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
          {authConfigError && (
            <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-600 dark:text-amber-400">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="size-4 shrink-0" />
                <span>Firebase Authentication Setup Required</span>
              </div>
              <p className="mt-1 leading-relaxed opacity-90">
                Authentication is not yet enabled in the Firebase Console for project{" "}
                <code className="rounded bg-amber-500/15 px-1 py-0.5 font-mono font-bold">
                  sri-udharchi-enterprises-c3be7
                </code>
                . Please enable Email/Password and/or Google under Authentication &gt; Sign-in
                method in the Firebase Console before attempting to sign in.
              </p>
            </div>
          )}
          {/* If user is logged in but not an admin in Firestore */}
          {user && !isAdmin && (
            <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-xs text-destructive">
              <div className="flex items-center gap-2 font-bold">
                <ShieldAlert className="size-4" />
                <span>Access Denied</span>
              </div>
              <p className="mt-1 text-muted-foreground">
                Signed in as <strong className="text-foreground">{user.email}</strong>, but this
                account lacks the <code className="font-mono text-destructive">role: "admin"</code>{" "}
                field in the Firestore <code className="font-mono">users</code> collection.
              </p>
            </div>
          )}

          {/* 1-Click Google Sign In */}
          <button
            type="button"
            disabled={submitting}
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:border-primary disabled:opacity-50"
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

          <div className="relative my-6 text-center text-xs text-muted-foreground">
            <span className="relative z-10 bg-card px-3">or sign in with email</span>
            <div className="absolute inset-0 top-1/2 -z-0 border-t border-border" />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
              <div className="relative mt-1">
                <input
                  type="email"
                  required
                  placeholder="sriudharchienterprises@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background pl-3.5 pr-9 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <Mail className="absolute right-3 top-2.5 size-4 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground">Password</label>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background pl-3.5 pr-9 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                {errorMsg}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>Sign In as Admin</span>
                  <ArrowRight className="size-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-[11px] text-muted-foreground">
            <Lock className="size-3.5 shrink-0 text-primary mt-0.5" />
            <span>
              <strong>RBAC Protected:</strong> Authentication is handled by Firebase Auth, and
              dashboard authorization is enforced via the Firestore{" "}
              <code className="font-mono">users/{`{uid}`}</code> document role.
            </span>
          </div>

          <div className="mt-5 text-center text-xs text-muted-foreground">
            <a href="/" className="hover:text-primary transition-colors">
              ← Return to Sri Udharchi Enterprises
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
