'use client';

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent, type ChangeEvent } from "react";
import { Eye, EyeOff, ArrowLeft, RefreshCw, ShieldCheck, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth, SUPER_ADMIN_EMAILS } from "@/lib/auth-context";
import { isEmailAuthorizedAdmin } from "@/lib/db-service";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
} from "@/lib/firebase";
import adminHeroImg from "@/assets/admin-login-hero.jpg";

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
  const navigate = useNavigate();
  const { user, isAdmin, loading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Restore remembered email on initial load
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const rememberedEmail = localStorage.getItem("sue_admin_remember_email");
        if (rememberedEmail) {
          setFormData((prev) => ({
            ...prev,
            email: rememberedEmail,
            rememberMe: true,
          }));
        } else {
          // Helpful default hint for Bhanu
          setFormData((prev) => ({
            ...prev,
            email: "bhanuswaroop04@gmail.com",
          }));
        }
      } catch {}
    }
  }, []);

  // Redirect to admin dashboard if already signed in with admin privileges
  useEffect(() => {
    if (!loading && user && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [user, isAdmin, loading, navigate]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const targetEmail = formData.email.trim();
    if (!targetEmail) {
      setErrorMsg("Please enter your admin email address.");
      return;
    }

    if (!formData.password) {
      setErrorMsg("Please enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      // Security check: Check if email is an authorized administrator (Super Admin or added in /authorized_admins)
      const isAuthorized = await isEmailAuthorizedAdmin(targetEmail);
      if (!isAuthorized) {
        setErrorMsg(
          "Access Denied: This email address is not an authorized administrator. Please contact your executive administrator to be provisioned.",
        );
        return;
      }

      // Authenticate via Firebase SDK with live user-entered credentials (NO hardcoded password)
      const credential = await signInWithEmailAndPassword(auth, targetEmail, formData.password);

      if (credential.user) {
        const authenticatedEmail = credential.user.email?.toLowerCase() || "";
        const verifyAuth = await isEmailAuthorizedAdmin(authenticatedEmail);
        if (!verifyAuth) {
          await signOut(auth);
          setErrorMsg(
            "Access Denied: This account is not authorized to access the Executive Administration Portal.",
          );
          return;
        }

        // Save email preference if rememberMe is enabled
        if (typeof window !== "undefined") {
          try {
            if (formData.rememberMe) {
              localStorage.setItem("sue_admin_remember_email", targetEmail);
            } else {
              localStorage.removeItem("sue_admin_remember_email");
            }
          } catch {}
        }

        // Successfully authenticated! Navigate to /admin
        navigate({ to: "/admin" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      let userFriendlyError = msg
        .replace("Firebase: ", "")
        .replace(/\(auth\/[^)]+\)/, "")
        .trim();

      if (msg.includes("auth/invalid-credential") || msg.includes("invalid-credential")) {
        userFriendlyError = "Invalid email or password. Please verify and try again.";
      } else if (msg.includes("auth/user-not-found")) {
        userFriendlyError =
          "No Firebase user found with this email. You can sign in using 'Continue with Google' or request admin credentials.";
      } else if (msg.includes("auth/wrong-password")) {
        userFriendlyError = "Incorrect password. You can use 'Forgot password?' to reset it.";
      }

      setErrorMsg(userFriendlyError);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleEmail = result.user?.email?.toLowerCase() || "";

      // Enforce authorized administrator check
      const isAuthorized = await isEmailAuthorizedAdmin(googleEmail);
      if (!isAuthorized) {
        await signOut(auth);
        setErrorMsg(
          `Access Denied: Account (${googleEmail || "unknown"}) is not registered as an authorized administrator. Please request executive provisioning.`,
        );
        return;
      }

      navigate({ to: "/admin" });
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

  const handleForgotPassword = async () => {
    const targetEmail = formData.email.trim();
    if (!targetEmail) {
      setErrorMsg("Please enter your admin email address first, then click 'Forgot password?'.");
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      setSuccessMsg(
        `Password reset instructions have been dispatched to ${targetEmail}. Please check your inbox and spam folder.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        "Could not send password reset email: " +
          msg
            .replace("Firebase: ", "")
            .replace(/\(auth\/[^)]+\)/, "")
            .trim(),
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex flex-col md:flex-row overflow-x-hidden">
      {/* Left Panel - Image Section */}
      <div className="w-full md:flex-1 relative min-h-[260px] md:min-h-screen overflow-hidden">
        {/* Back Button */}
        <div className="absolute top-6 left-6 z-20">
          <button
            type="button"
            onClick={() => navigate({ to: "/" })}
            aria-label="Return to Sri Udharchi Enterprises homepage"
            className="size-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-black/60 transition-all border border-white/20 shadow-lg text-white group"
          >
            <ArrowLeft className="size-5 transition-transform group-hover:-translate-x-0.5" />
          </button>
        </div>

        {/* Hero Image */}
        <div className="absolute inset-0">
          <img
            src={adminHeroImg}
            alt="Sri Udharchi Enterprises Industrial Fire Safety Engineering"
            className="w-full h-full object-cover object-center scale-100 transition-transform duration-1000 hover:scale-105"
          />
          {/* Subtle gradient overlay to enhance visual depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-900/20" />
        </div>

        {/* Brand Caption Overlay */}
        <div className="absolute bottom-6 left-6 right-6 z-10 hidden md:block text-white">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold backdrop-blur-md mb-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            <ShieldCheck className="size-3.5 text-emerald-400" />
            <span>Industrial Safety Command</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white drop-shadow-md">
            Sri Udharchi Enterprises
          </h2>
          <p className="text-xs text-slate-300 max-w-sm mt-0.5 leading-relaxed drop-shadow">
            Authorized administrative access for real-time fire safety catalog, customer lead management, and live order tracking.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-bold uppercase tracking-wider mb-3">
              <span>Admin Portal</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-sm">
              Sri Udharchi Enterprises Administration &middot;{" "}
              <button
                type="button"
                onClick={() => navigate({ to: "/login" })}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Client Portal
              </button>
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-700 flex items-start gap-2.5 animate-in fade-in duration-200">
              <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
              <div className="leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-start gap-2.5 animate-in fade-in duration-200">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600 mt-0.5" />
              <div className="leading-relaxed">{successMsg}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-5">
            {/* Email Address */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="bhanuswaroop04@gmail.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all text-sm placeholder:text-gray-400"
                required
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your admin password"
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 transition-all text-sm placeholder:text-gray-400"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
              >
                {resetLoading ? "Sending..." : "Forgot password?"}
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-black text-white py-3.5 px-4 rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <RefreshCw className="size-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-3 bg-white text-gray-500 font-semibold tracking-wider">
                  or
                </span>
              </div>
            </div>

            {/* Google Social Button */}
            <div>
              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 font-medium text-sm transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
              >
                {/* Google SVG */}
                <svg className="w-5 h-5 mr-2.5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span>Continue with Google Workspace</span>
              </button>
            </div>

            {/* Administrator Security Note */}
            <div className="pt-2 text-center">
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Super Administrator: <span className="font-semibold text-gray-700">bhanuswaroop04@gmail.com</span> &amp; Authorized Personnel
                <br />
                Strict role-based access control enforced via Cloud Firestore security rules.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
