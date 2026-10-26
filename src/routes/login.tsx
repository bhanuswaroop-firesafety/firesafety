import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
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
  RotateCcw,
  Star,
  Truck,
  Zap,
  Calendar,
  Bell,
  X,
  Package,
  Copy,
  ExternalLink,
  Search,
  Check,
  Send,
} from "lucide-react";
import {
  formatIndianMobileDisplay,
} from "@/lib/phone-utils";
import {
  subscribeOrders,
  cancelOrder,
  submitFeedback,
  subscribeReminders,
  subscribeNotifications,
  markNotificationRead,
  getOrderForTracking,
  getUserEmailByPhone,
} from "@/lib/db-service";
import type {
  OrderItem,
  FeedbackItem,
  ReminderItem,
  NotificationItem,
} from "@/lib/types";
import { formatKolkataDisplay, getDaysDiff, getKolkataDateString } from "@/lib/date-utils";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/login")({
  head: () =>
    seoHead({
      title: "Account Sign In & Sign Up | Sri Udharchi Enterprises",
      description:
        "Sign in or create an account with Sri Udharchi Enterprises to purchase fire safety equipment, track deliveries, and manage quotations.",
      path: "/login",
      noIndex: true,
    }),
  component: LoginPage,
});

export interface LoginPageProps {
  initialMode?: "login" | "signup";
  initialTab?: "orders" | "tracking" | "renewals" | "notifications" | "profile";
}

const TRACKING_STEPS = [
  {
    step: 1,
    title: "Order Placed",
    desc: "Order received & verified",
    icon: Package,
  },
  {
    step: 2,
    title: "Confirmed & Certified",
    desc: "Equipment inspected & packed",
    icon: ShieldCheck,
  },
  {
    step: 3,
    title: "Dispatched / Shipped",
    desc: "Handed over to courier partner",
    icon: Truck,
  },
  {
    step: 4,
    title: "In Transit / Hub",
    desc: "Arrived at regional delivery hub",
    icon: Zap,
  },
  {
    step: 5,
    title: "Delivered & Certified",
    desc: "Delivered & certified on site",
    icon: CheckCircle2,
  },
];

function getTrackingStepIndex(status?: string): number {
  if (!status) return 1;
  const s = status.toLowerCase();
  if (s === "placed" || s === "pending") return 1;
  if (s === "confirmed") return 2;
  if (s === "shipped" || s === "dispatched") return 3;
  if (s === "out_for_delivery" || s === "in_transit") return 4;
  if (s === "delivered") return 5;
  if (s === "cancelled") return -1;
  return 1;
}

export function LoginPage({ initialMode = "login", initialTab }: LoginPageProps = {}) {
  const {
    user,
    userProfile,
    isAdmin,
    loginWithGoogle,
    loginWithEmail,
    loginWithIdentifier,
    registerWithEmail,
    sendPasswordReset,
    logout,
  } = useAuth();
  const navigate = useNavigate();

  // Mode: "login" or "signup"
  const [mode, setMode] = useState<"login" | "signup">(initialMode);

  // Login Form Identifier: Accepts 10-digit mobile number or email address
  const [loginIdentifier, setLoginIdentifier] = useState("");

  // Email / Password Form Fields
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

  // Password Reset Modal States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [isExistingAccountError, setIsExistingAccountError] = useState(false);

  // Customer Account Portal State (Tasks A, C, D, E)
  const [accountTab, setAccountTab] = useState<"orders" | "tracking" | "renewals" | "notifications" | "profile">(
    initialTab || "orders",
  );
  const [userOrders, setUserOrders] = useState<OrderItem[]>([]);
  const [userReminders, setUserReminders] = useState<ReminderItem[]>([]);
  const [userNotifications, setUserNotifications] = useState<NotificationItem[]>([]);

  // Live Order Tracking States
  const [selectedTrackingOrderId, setSelectedTrackingOrderId] = useState<string | null>(null);
  const [trackingSearchInput, setTrackingSearchInput] = useState<string>("");
  const [guestTrackingOrder, setGuestTrackingOrder] = useState<OrderItem | null>(null);
  const [isSearchingTracking, setIsSearchingTracking] = useState<boolean>(false);
  const [trackingSearchError, setTrackingSearchError] = useState<string>("");
  const [copiedAwb, setCopiedAwb] = useState<boolean>(false);

  // Task D: Feedback Modal State
  const [feedbackOrder, setFeedbackOrder] = useState<OrderItem | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState("");

  // Task C: Cancel Order Modal State
  const [cancellingOrder, setCancellingOrder] = useState<OrderItem | null>(null);
  const [cancelReason, setCancelReason] = useState("Need to adjust quantity or order specifications");
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Order Status History Modal
  const [historyOrder, setHistoryOrder] = useState<OrderItem | null>(null);

  // If user was prompted to login to open a specific product or page, redirect back there
  useEffect(() => {
    if (user) {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirect = params?.get("redirect");
      if (redirect && redirect.startsWith("/") && redirect !== "/login" && redirect !== "/signup") {
        window.location.href = redirect;
      }
    }
  }, [user]);

  // Real-time subscriptions for logged-in customer data
  useEffect(() => {
    if (!user) return;

    const unsubOrders = subscribeOrders((allOrders) => {
      const myOrders = allOrders.filter((o) => {
        const matchesUid = o.customerId === user.uid;
        const matchesEmail = Boolean(user.email && o.customerEmail?.toLowerCase() === user.email.toLowerCase());
        const cleanUserPhone = (user.phoneNumber || userProfile?.phone || "").replace(/\D/g, "");
        const cleanOrderPhone = (o.customerPhone || "").replace(/\D/g, "");
        const matchesPhone = Boolean(
          cleanUserPhone.length >= 10 &&
            cleanOrderPhone.length >= 10 &&
            (cleanUserPhone.endsWith(cleanOrderPhone) || cleanOrderPhone.endsWith(cleanUserPhone)),
        );
        return matchesUid || matchesEmail || matchesPhone;
      });
      setUserOrders(myOrders);
    });

    const unsubReminders = subscribeReminders((allReminders) => {
      const myReminders = allReminders.filter((r) => {
        const matchesUid = r.userId === user.uid;
        const matchesEmail = Boolean(user.email && r.customerEmail?.toLowerCase() === user.email.toLowerCase());
        const cleanUserPhone = (user.phoneNumber || userProfile?.phone || "").replace(/\D/g, "");
        const cleanRemPhone = (r.customerPhone || "").replace(/\D/g, "");
        const matchesPhone = Boolean(
          cleanUserPhone.length >= 10 &&
            cleanRemPhone.length >= 10 &&
            (cleanUserPhone.endsWith(cleanRemPhone) || cleanRemPhone.endsWith(cleanUserPhone)),
        );
        return matchesUid || matchesEmail || matchesPhone;
      });
      setUserReminders(myReminders);
    });

    const unsubNotes = subscribeNotifications(user.uid, (notes) => {
      setUserNotifications(notes);
    });

    return () => {
      unsubOrders();
      unsubReminders();
      unsubNotes();
    };
  }, [user, userProfile]);

  // Task D: Find any delivered order overdue for feedback (delivered >= 3 days ago without feedback)
  const overdueFeedbackOrder = useMemo(() => {
    if (!userOrders || userOrders.length === 0) return null;
    const now = Date.now();
    const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
    return userOrders.find((o) => {
      if (o.status !== "delivered" || o.feedbackGiven) return false;
      if (!o.deliveredAt) return false;
      const delTime = new Date(o.deliveredAt).getTime();
      return now - delTime >= threeDaysMs;
    });
  }, [userOrders]);

  // Check query parameter ?tab=... or ?orderId=... or ?q=...
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get("tab");
      if (tab === "signup" || window.location.pathname === "/signup" || initialMode === "signup") {
        setMode("signup");
      } else if (tab === "login") {
        setMode("login");
      }
      if (tab === "tracking" || tab === "orders" || tab === "renewals" || tab === "notifications" || tab === "profile") {
        setAccountTab(tab);
      } else if (initialTab) {
        setAccountTab(initialTab);
      }
      const orderIdParam = params.get("orderId");
      if (orderIdParam) {
        setSelectedTrackingOrderId(orderIdParam);
        setTrackingSearchInput(orderIdParam);
      }
      const qParam = params.get("q") || params.get("trackingNumber");
      if (qParam) {
        setTrackingSearchInput(qParam);
      }
    }
  }, [initialMode, initialTab]);

  const activeTrackingOrder = useMemo(() => {
    if (guestTrackingOrder) return guestTrackingOrder;
    if (selectedTrackingOrderId) {
      const found = userOrders.find(
        (o) => o.id === selectedTrackingOrderId || o.orderNumber === selectedTrackingOrderId,
      );
      if (found) return found;
    }
    return userOrders[0] || null;
  }, [guestTrackingOrder, selectedTrackingOrderId, userOrders]);

  const handleGuestTrackingSearch = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const queryStr = trackingSearchInput.trim();
    if (!queryStr) {
      setTrackingSearchError("Please enter your Order Number (e.g. SUE-ORD-...) or 10-digit mobile number.");
      return;
    }
    setIsSearchingTracking(true);
    setTrackingSearchError("");
    try {
      const order = await getOrderForTracking(queryStr);
      if (order) {
        setGuestTrackingOrder(order);
        setSelectedTrackingOrderId(order.id || order.orderNumber || null);
      } else {
        setTrackingSearchError(`No order found matching "${queryStr}". Please check your Order ID or phone number.`);
      }
    } catch (err: any) {
      setTrackingSearchError(err?.message || "Failed to search for order. Please try again.");
    } finally {
      setIsSearchingTracking(false);
    }
  };

  const handleCopyAwb = (awb: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(awb);
      setCopiedAwb(true);
      setTimeout(() => setCopiedAwb(false), 2000);
    }
  };

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

  // Handle Mobile Number or Email Login
  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsExistingAccountError(false);

    const targetIdentifier = (loginIdentifier || email).trim();
    if (!targetIdentifier) {
      setErrorMsg("Please enter your 10-digit mobile number or email address.");
      return;
    }

    if (!password) {
      setErrorMsg("Please enter your account password.");
      return;
    }

    setSubmitting(true);
    try {
      await loginWithIdentifier(targetIdentifier, password);
      setSuccessMsg("Signed in successfully! Redirecting...");
      setTimeout(() => {
        navigate({ to: "/" });
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const code = (err as { code?: string }).code || "";
      if (code === "auth/user-not-found" || msg.includes("user-not-found")) {
        setErrorMsg("No account found with these details. Please verify your mobile number / email or create an account.");
      } else if (
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential" ||
        msg.includes("wrong-password") ||
        msg.includes("invalid-credential")
      ) {
        setErrorMsg("Incorrect password. Please verify your password or click 'Forgot / Reset Password'.");
      } else if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
        setErrorMsg("Please enter a valid 10-digit mobile number or email address.");
      } else if (code === "auth/too-many-requests" || msg.includes("too-many-requests")) {
        setErrorMsg("Too many unsuccessful attempts. Please wait a moment or reset your password.");
      } else {
        const cleaned = msg
          .replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim();
        setErrorMsg(cleaned || "Failed to sign in. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Full Details Signup (Name, Mobile Number, Email, Password)
  const handleSignupSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setIsExistingAccountError(false);

    const cleanName = name.trim();
    if (!cleanName) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    const cleanPhone = phone.trim().replace(/\D/g, "").slice(-10);
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      // Check if this mobile number is already registered
      const existingEmailForPhone = await getUserEmailByPhone(cleanPhone);
      if (existingEmailForPhone) {
        setErrorMsg(
          `An account is already registered with mobile number +91 ${cleanPhone}. Please log in using your mobile number.`,
        );
        setIsExistingAccountError(true);
        setSubmitting(false);
        return;
      }

      const displayName = company ? `${cleanName} (${company.trim()})` : cleanName;
      await registerWithEmail(cleanEmail, password, displayName, { phone: cleanPhone, company: company.trim() });
      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        navigate({ to: "/" });
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const code = (err as { code?: string }).code || "";
      if (
        code === "auth/email-already-in-use" ||
        msg.includes("email-already-in-use") ||
        msg.includes("already registered")
      ) {
        setErrorMsg("This email is already registered. Please log in with your mobile number or email.");
        setIsExistingAccountError(true);
      } else if (code === "auth/invalid-email" || msg.includes("invalid-email")) {
        setErrorMsg("Please enter a valid email address.");
      } else if (code === "auth/weak-password" || msg.includes("weak-password")) {
        setErrorMsg("Password is too weak. Please use at least 6 characters.");
      } else {
        const cleaned = msg
          .replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim();
        setErrorMsg(cleaned || "Failed to create account. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Password Reset Request (Supports Mobile Number or Email)
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setResetError("");
    setResetSuccess("");
    const rawInput = (resetEmail || loginIdentifier || email).trim();
    if (!rawInput) {
      setResetError("Please enter your registered 10-digit mobile number or email address.");
      return;
    }

    setResetSubmitting(true);
    try {
      let targetEmail = rawInput.toLowerCase();
      if (!rawInput.includes("@")) {
        const cleanPhone = rawInput.replace(/\D/g, "").slice(-10);
        if (cleanPhone.length < 10) {
          throw new Error("Please enter a valid 10-digit mobile number or email address.");
        }
        const resolvedEmail = await getUserEmailByPhone(cleanPhone);
        if (!resolvedEmail) {
          throw new Error(`No account found registered with mobile number +91 ${cleanPhone}.`);
        }
        targetEmail = resolvedEmail;
      }

      await sendPasswordReset(targetEmail);
      setResetSuccess(
        `A password reset link has been dispatched to ${targetEmail}. Please check your inbox (and spam folder) to set a new password.`,
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setResetError(msg);
    } finally {
      setResetSubmitting(false);
    }
  };

  // Google Sign In
  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);
    try {
      await loginWithGoogle();
      setSuccessMsg("Signed in with Google! Redirecting...");
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

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between">
      <SiteHeader />

      <main className="relative flex-1 py-12 md:py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
        {/* Ambient Decorative Lighting */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-10 left-1/2 -translate-x-1/2 size-[600px] rounded-full bg-primary/10 blur-[130px]" />
          <div className="absolute bottom-10 right-10 size-[400px] rounded-full bg-amber-500/10 blur-[120px]" />
        </div>

        <div className={`relative z-10 w-full ${user ? "max-w-5xl" : "max-w-lg"}`}>
          {/* Top Headline & Branding */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-bold text-primary mb-3">
              <ShieldCheck className="size-3.5" />
              <span>Sri Udharchi Enterprises</span>
            </div>
            <h1 className="font-display text-3xl font-black text-foreground sm:text-4xl tracking-tight">
              {user
                ? "My Account"
                : mode === "login"
                  ? "Welcome Back"
                  : "Create an Account"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
              {user
                ? "Manage your safety equipment orders, renewals, and quotations."
                : mode === "login"
                  ? "Sign in to your account to view orders, quotations, and tracking."
                  : "Sign up to buy safety equipment, track deliveries, and request quotations."}
            </p>
          </div>

          {/* IF USER IS ALREADY LOGGED IN: SHOW COMPREHENSIVE CUSTOMER PORTAL */}
          {user ? (
            <div className="space-y-6">
              {/* Task D: Gentle Reminder Banner if feedback is overdue (>= 3 days after delivery) */}
              {overdueFeedbackOrder && (
                <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 sm:p-5 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-in fade-in">
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="size-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Star className="size-5 fill-current" />
                    </div>
                    <div>
                      <div className="font-bold text-sm">Gentle Reminder: Rate your delivered safety equipment</div>
                      <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                        Order #{overdueFeedbackOrder.orderNumber || overdueFeedbackOrder.id} was delivered on{" "}
                        {formatKolkataDisplay(overdueFeedbackOrder.deliveredAt || overdueFeedbackOrder.updatedAt)}. Your rating ensures safety compliance!
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setFeedbackOrder(overdueFeedbackOrder);
                      setFeedbackRating(5);
                      setFeedbackComment("");
                      setFeedbackSuccess("");
                    }}
                    className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs gap-1.5 shadow-sm"
                  >
                    <Star className="size-3.5 fill-current" />
                    <span>Rate Order</span>
                  </Button>
                </div>
              )}

              {/* User Identity Header Card */}
              <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-xl backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-5">
                  <div className="flex items-center gap-4">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-display font-black text-xl shadow-inner">
                      {(userProfile?.displayName || user.phoneNumber || user.email || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-display text-lg font-bold text-foreground">
                          {userProfile?.displayName || user.displayName || "Customer Account"}
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
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                        {(user.phoneNumber || userProfile?.phone) && (
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <span>📱</span>
                            <span>{formatIndianMobileDisplay(user.phoneNumber || userProfile?.phone || "")}</span>
                            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-1.5 py-0.2 rounded font-bold">
                              Verified
                            </span>
                          </span>
                        )}
                        {user.email && !user.email.includes("@mobile.udharchi.in") && (
                          <span className="flex items-center gap-1">
                            <Mail className="size-3" />
                            <span>{user.email}</span>
                          </span>
                        )}
                        {userProfile?.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="size-3" />
                            <span>{userProfile.company}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {isAdmin && (
                      <Button
                        onClick={() => navigate({ to: "/admin" })}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 gap-1.5 cursor-pointer"
                      >
                        <Shield className="size-3.5" />
                        <span>Admin Console</span>
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => navigate({ to: "/products" })}
                      className="text-xs font-semibold border-border hover:bg-muted h-9 cursor-pointer"
                    >
                      <span>Browse Products</span>
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={async () => {
                        await logout();
                      }}
                      className="text-xs h-9 gap-1 font-semibold cursor-pointer"
                    >
                      <RotateCcw className="size-3.5" />
                      <span>Sign Out / Switch</span>
                    </Button>
                  </div>
                </div>

                {/* Sub-Tabs Navigation */}
                <div className="flex items-center gap-2 overflow-x-auto pt-4 text-xs font-bold scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setAccountTab("orders")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                      accountTab === "orders"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Package className="size-3.5" />
                    <span>My Orders ({userOrders.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountTab("tracking")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                      accountTab === "tracking"
                        ? "bg-blue-600 text-white shadow-sm font-bold"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Truck className="size-3.5" />
                    <span>Live Tracking</span>
                    {userOrders.some((o) => o.status === "shipped") && (
                      <span className="size-2 rounded-full bg-blue-400 animate-pulse" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountTab("renewals")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                      accountTab === "renewals"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <RotateCcw className="size-3.5" />
                    <span>Upcoming Renewals ({userReminders.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountTab("notifications")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                      accountTab === "notifications"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <Bell className="size-3.5" />
                    <span>Alerts &amp; Notices ({userNotifications.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAccountTab("profile")}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all shrink-0 ${
                      accountTab === "profile"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <User className="size-3.5" />
                    <span>Profile Details</span>
                  </button>
                </div>
              </div>

              {/* TAB CONTENT: ORDERS */}
              {accountTab === "orders" && (
                <div className="space-y-4">
                  {userOrders.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-3">
                      <div className="size-12 rounded-full bg-muted/60 mx-auto flex items-center justify-center text-muted-foreground">
                        <Package className="size-6" />
                      </div>
                      <h3 className="font-bold text-foreground">No orders or bookings placed yet</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        Explore our certified fire safety, rescue equipment, and personal protective systems.
                      </p>
                      <a href="/products" className="inline-block pt-2">
                        <Button className="text-xs font-bold gap-2">
                          <Layers className="size-3.5" />
                          <span>Browse Industrial Products</span>
                        </Button>
                      </a>
                    </div>
                  ) : (
                    userOrders.map((order) => {
                      const isPriority = order.shippingType === "priority";
                      const canCancel = order.status === "placed" || order.status === "confirmed";
                      const isShipped = order.status === "shipped";
                      const isDelivered = order.status === "delivered";
                      const isCancelled = order.status === "cancelled";

                      return (
                        <div
                          key={order.id || order.orderNumber}
                          className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-md hover:border-primary/40 transition-all space-y-4"
                        >
                          {/* Order Header */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-sm font-black text-foreground">
                                  #{order.orderNumber || order.id}
                                </span>
                                {/* Shipping Type Badge (Task A) */}
                                {isPriority ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                    <Zap className="size-3 fill-current" />
                                    <span>Priority Dispatch (2 to 4 days)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border">
                                    <Truck className="size-3" />
                                    <span>Standard Delivery (5 to 7 days)</span>
                                  </span>
                                )}

                                {/* Status Badge */}
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${
                                    isCancelled
                                      ? "bg-red-500/15 text-red-600 border border-red-500/30"
                                      : isDelivered
                                        ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                                        : isShipped
                                          ? "bg-blue-500/15 text-blue-600 border border-blue-500/30"
                                          : order.status === "confirmed"
                                            ? "bg-purple-500/15 text-purple-600 border border-purple-500/30"
                                            : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                                  }`}
                                >
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1">
                                Placed on {formatKolkataDisplay(order.createdAt)}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                                Total Invoice
                              </span>
                              <span className="font-mono text-lg font-black text-foreground">
                                ₹{(order.total || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>

                          {/* Task A: Expected Delivery Window */}
                          <div className="rounded-xl bg-muted/40 p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 border border-border/60">
                            <div className="flex items-center gap-2 text-foreground font-medium">
                              <Calendar className="size-3.5 text-primary" />
                              <span>
                                Expected Delivery:{" "}
                                <strong>
                                  {order.expectedDeliveryFrom && order.expectedDeliveryTo
                                    ? `${formatKolkataDisplay(order.expectedDeliveryFrom)} to ${formatKolkataDisplay(order.expectedDeliveryTo)}`
                                    : order.estimatedDelivery || "5 to 7 business days"}
                                </strong>
                              </span>
                            </div>
                            {order.shippingCharge !== undefined && (
                              <span className="text-muted-foreground text-[11px]">
                                Shipping Charge:{" "}
                                <strong className="text-foreground">
                                  {order.shippingCharge > 0 ? `₹${order.shippingCharge}` : "Free / Included"}
                                </strong>
                              </span>
                            )}
                          </div>

                          {/* Items Summary */}
                          <div className="space-y-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                              Ordered Items ({order.items?.length || 0})
                            </span>
                            <div className="divide-y divide-border/40 text-xs">
                              {order.items?.map((it, idx) => (
                                <div key={idx} className="py-1.5 flex items-center justify-between">
                                  <div>
                                    <span className="font-semibold text-foreground">{it.name}</span>
                                    <span className="text-muted-foreground ml-2">× {it.quantity}</span>
                                  </div>
                                  <span className="font-mono text-muted-foreground">
                                    ₹{((it.price || 0) * (it.quantity || 1)).toLocaleString("en-IN")}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Shipped Banner with Courier & Track Button */}
                          {isShipped && (
                            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3.5 text-xs text-blue-900 dark:text-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5">
                                <div className="size-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                                  <Truck className="size-4 animate-pulse" />
                                </div>
                                <div>
                                  <div className="font-bold flex items-center gap-1.5 flex-wrap">
                                    <span>Dispatched via {order.courierName || "Express Courier"}</span>
                                    {order.trackingNumber && (
                                      <span className="font-mono text-blue-700 dark:text-blue-300 bg-blue-500/15 px-1.5 py-0.5 rounded text-[11px]">
                                        AWB: {order.trackingNumber}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-blue-800/80 dark:text-blue-300/80 mt-0.5">
                                    {order.dispatchNote || "In transit with real-time carrier tracking enabled."}
                                  </p>
                                </div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedTrackingOrderId(order.id || order.orderNumber || null);
                                  setAccountTab("tracking");
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-1.5 shrink-0 shadow-xs"
                              >
                                <Truck className="size-3.5" />
                                <span>Track Live Shipment</span>
                              </Button>
                            </div>
                          )}

                          {/* Task D: Delivered & Feedback Action */}
                          {isDelivered && (
                            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-300">
                                  <CheckCircle2 className="size-4 text-emerald-600" />
                                  <span>Order Delivered &amp; Certified</span>
                                </div>
                                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                                  Delivered on {formatKolkataDisplay(order.deliveredAt || order.updatedAt)}
                                </p>
                              </div>

                              <div>
                                {order.feedbackGiven ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/20 px-3 py-1.5 rounded-lg">
                                    <CheckCircle2 className="size-3.5" />
                                    <span>Feedback Submitted ✓</span>
                                  </span>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      setFeedbackOrder(order);
                                      setFeedbackRating(5);
                                      setFeedbackComment("");
                                      setFeedbackSuccess("");
                                    }}
                                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs gap-1.5 shadow-sm"
                                  >
                                    <Star className="size-3.5 fill-current" />
                                    <span>Rate Your Order</span>
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Actions & Audit History Button */}
                          <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs gap-2 flex-wrap">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setHistoryOrder(order)}
                                className="text-muted-foreground hover:text-foreground text-[11px] flex items-center gap-1 font-medium"
                              >
                                <Clock className="size-3" />
                                <span>Status History ({order.statusHistory?.length || 1})</span>
                              </button>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedTrackingOrderId(order.id || order.orderNumber || null);
                                  setAccountTab("tracking");
                                }}
                                className="text-xs bg-blue-600 hover:bg-blue-700 text-white h-8 gap-1.5 font-semibold shadow-xs"
                              >
                                <Truck className="size-3.5" />
                                <span>Track Order</span>
                              </Button>

                              {/* Task C: Cancel Order button ONLY when placed or confirmed */}
                              {canCancel && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setCancellingOrder(order);
                                    setCancelReason("Need to adjust quantity or order specifications");
                                    setCancelError("");
                                  }}
                                  className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10 h-8"
                                >
                                  Cancel Order
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB CONTENT: LIVE ORDER TRACKING & COURIER */}
              {accountTab === "tracking" && (
                <OrderTrackingSection
                  order={activeTrackingOrder}
                  userOrders={userOrders}
                  selectedOrderId={selectedTrackingOrderId}
                  onSelectOrder={(id) => {
                    setSelectedTrackingOrderId(id);
                    setGuestTrackingOrder(null);
                  }}
                  searchInput={trackingSearchInput}
                  onSearchInputChange={setTrackingSearchInput}
                  onSearchSubmit={handleGuestTrackingSearch}
                  isSearching={isSearchingTracking}
                  searchError={trackingSearchError}
                  copiedAwb={copiedAwb}
                  onCopyAwb={handleCopyAwb}
                  onOpenRenewals={() => setAccountTab("renewals")}
                  isGuest={false}
                />
              )}

              {/* TAB CONTENT: UPCOMING RENEWALS & REFILLS (Task E) */}
              {accountTab === "renewals" && (
                <div className="space-y-4">
                  {userReminders.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-3">
                      <div className="size-12 rounded-full bg-muted/60 mx-auto flex items-center justify-center text-muted-foreground">
                        <RotateCcw className="size-6" />
                      </div>
                      <h3 className="font-bold text-foreground">No Upcoming Refills or Renewals</h3>
                      <p className="text-xs text-muted-foreground max-w-md mx-auto">
                        Sri Udharchi automatically monitors warranty, chemical expiration, and mandatory hydro-test refill cycles for your registered equipment. Reminders appear here once equipment orders are delivered.
                      </p>
                    </div>
                  ) : (
                    userReminders.map((rem) => {
                      const today = getKolkataDateString();
                      const daysLeft = getDaysDiff(today, rem.renewalDate);
                      const isOverdue = daysLeft < 0;
                      const isDueSoon = daysLeft >= 0 && daysLeft <= 14;

                      return (
                        <div
                          key={rem.id || rem.reminderId}
                          className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-md hover:border-primary/40 transition-all space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-foreground text-sm sm:text-base">
                                  {rem.productName || "Safety Equipment Refill"}
                                </h3>
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                                    rem.status === "completed"
                                      ? "bg-emerald-500/15 text-emerald-600"
                                      : isOverdue
                                        ? "bg-red-500/15 text-red-600"
                                        : isDueSoon
                                          ? "bg-amber-500/15 text-amber-600"
                                          : "bg-blue-500/15 text-blue-600"
                                  }`}
                                >
                                  {rem.status === "completed" ? "Completed" : isOverdue ? "Overdue" : rem.status}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Associated with Order #{rem.orderId} • Cycle #{rem.cycle || 1}
                              </p>
                            </div>

                            <div className="text-right">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                                Renewal Schedule
                              </span>
                              <span
                                className={`text-xs font-bold ${
                                  isOverdue
                                    ? "text-red-500"
                                    : isDueSoon
                                      ? "text-amber-500"
                                      : "text-foreground"
                                }`}
                              >
                                {isOverdue
                                  ? `${Math.abs(daysLeft)} days overdue`
                                  : daysLeft === 0
                                    ? "Due Today"
                                    : `${daysLeft} days remaining`}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                Install / Delivery Date
                              </span>
                              <p className="font-semibold text-foreground">
                                {formatKolkataDisplay(rem.installDate)}
                              </p>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                Renewal Due Date
                              </span>
                              <p className="font-semibold text-foreground">
                                {formatKolkataDisplay(rem.renewalDate)} ({rem.renewalMonths} Months)
                              </p>
                            </div>

                            <div className="rounded-xl border border-border/60 bg-muted/30 p-3 space-y-1">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                Alert Notification Date
                              </span>
                              <p className="font-semibold text-foreground">
                                {formatKolkataDisplay(rem.alertDate)}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/60">
                            <span className="text-[11px] text-muted-foreground">
                              Periodic inspection mandated under IS safety compliance
                            </span>
                            <a
                              href={`/contact?subject=Refill%20Inspection%20Booking%20for%20Order%20${rem.orderId}`}
                            >
                              <Button size="sm" className="text-xs font-bold gap-1.5 h-8">
                                <RotateCcw className="size-3" />
                                <span>Book Service / Refill</span>
                              </Button>
                            </a>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB CONTENT: NOTIFICATIONS */}
              {accountTab === "notifications" && (
                <div className="space-y-4">
                  {userNotifications.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-3">
                      <div className="size-12 rounded-full bg-muted/60 mx-auto flex items-center justify-center text-muted-foreground">
                        <Bell className="size-6" />
                      </div>
                      <h3 className="font-bold text-foreground">No Unread Alerts</h3>
                      <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                        In-app notifications for order dispatches, delivery confirmations, and refill alerts will be logged here.
                      </p>
                    </div>
                  ) : (
                    userNotifications.map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-2xl border p-4 sm:p-5 transition-all flex items-start justify-between gap-3 ${
                          n.read
                            ? "bg-card border-border opacity-70"
                            : "bg-card border-primary/40 shadow-sm"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              n.type === "renewal"
                                ? "bg-amber-500/20 text-amber-600"
                                : "bg-primary/20 text-primary"
                            }`}
                          >
                            <Bell className="size-4" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-sm text-foreground">{n.title}</h4>
                              {!n.read && (
                                <span className="size-2 rounded-full bg-primary shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {n.message}
                            </p>
                            <span className="text-[10px] text-muted-foreground font-mono block">
                              {formatKolkataDisplay(n.createdAt)}
                            </span>
                          </div>
                        </div>

                        {!n.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => n.id && markNotificationRead(n.id)}
                            className="text-[11px] text-muted-foreground hover:text-foreground h-7 px-2"
                          >
                            Mark Read
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB CONTENT: PROFILE */}
              {accountTab === "profile" && (
                <div className="rounded-2xl border border-border bg-card p-6 shadow-xl space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2 text-xs">
                    <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Full Name
                      </span>
                      <p className="font-semibold text-foreground text-sm">
                        {userProfile?.displayName || user.displayName || "Customer"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Phone Number
                      </span>
                      <p className="font-semibold text-foreground text-sm">
                        {formatIndianMobileDisplay(user.phoneNumber || userProfile?.phone || "")}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Email Address
                      </span>
                      <p className="font-semibold text-foreground text-sm">
                        {user.email || "Not specified"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">
                        Company / Business Name
                      </span>
                      <p className="font-semibold text-foreground text-sm">
                        {userProfile?.company || "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      Your saved account details for orders and services.
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => navigate({ to: "/contact" })}
                      className="text-xs h-9"
                    >
                      Update Details via Support
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : accountTab === "tracking" ? (
            /* GUEST TRACKING VIEW */
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-card border border-border/80 rounded-2xl p-4 shadow-sm backdrop-blur">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <Truck className="size-5 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-foreground block">
                      Live Delivery &amp; Courier Tracking
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Real-time carrier tracking for industrial fire safety equipment
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAccountTab("orders");
                      setMode("login");
                    }}
                    className="text-xs h-8 font-semibold cursor-pointer"
                  >
                    <User className="size-3.5 mr-1" />
                    <span>Sign In</span>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setAccountTab("orders");
                      setMode("signup");
                    }}
                    className="text-xs h-8 font-bold shadow-xs cursor-pointer"
                  >
                    <span>Create Account</span>
                  </Button>
                </div>
              </div>

              <OrderTrackingSection
                order={activeTrackingOrder}
                searchInput={trackingSearchInput}
                onSearchInputChange={setTrackingSearchInput}
                onSearchSubmit={handleGuestTrackingSearch}
                isSearching={isSearchingTracking}
                searchError={trackingSearchError}
                copiedAwb={copiedAwb}
                onCopyAwb={handleCopyAwb}
                onOpenRenewals={() => {
                  setAccountTab("orders");
                  setMode("login");
                }}
                isGuest={true}
                onSwitchToAuth={() => {
                  setAccountTab("orders");
                  setMode("login");
                }}
              />
            </div>
          ) : (
            /* AUTH FORM CARD */
            <div className="rounded-3xl border border-border/80 bg-card/95 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              {/* Primary Mode Tabs: Sign In / Create Account */}
              <div className="grid grid-cols-2 rounded-2xl bg-muted/60 p-1 mb-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setErrorMsg("");
                    setSuccessMsg("");
                    setIsExistingAccountError(false);
                  }}
                  className={`rounded-xl py-2.5 transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-card text-foreground shadow-sm font-bold"
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
                    setIsExistingAccountError(false);
                  }}
                  className={`rounded-xl py-2.5 transition-all cursor-pointer ${
                    mode === "signup"
                      ? "bg-card text-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* PRIMARY ONE-CLICK AUTH: GOOGLE */}
              <button
                type="button"
                disabled={submitting}
                onClick={handleGoogleAuth}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background py-3 px-4 text-xs font-bold text-foreground transition-all hover:bg-muted hover:border-primary/50 shadow-xs active:scale-[0.99] disabled:opacity-50 cursor-pointer mb-5"
              >
                <svg className="size-4 shrink-0" viewBox="0 0 24 24">
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
                <span>{mode === "login" ? "Continue with Google" : "Sign Up with Google"}</span>
              </button>

              {/* DIVIDER */}
              <div className="relative mb-5 text-center text-xs text-muted-foreground">
                <span className="relative z-10 bg-card px-3 uppercase text-[10px] tracking-wider font-semibold text-muted-foreground">
                  {mode === "login"
                    ? "Or sign in with mobile number / email"
                    : "Or create account with full details"}
                </span>
                <div className="absolute inset-0 top-1/2 -z-0 border-t border-border" />
              </div>

              {/* Status Messages */}
              {errorMsg && (
                <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive flex items-start gap-2.5 animate-in fade-in">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div className="leading-relaxed font-medium">{errorMsg}</div>
                    {(isExistingAccountError || errorMsg.includes("already registered")) && (
                      <div className="pt-2 border-t border-destructive/20 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setErrorMsg("");
                            setIsExistingAccountError(false);
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-bold text-[11px] shadow-xs hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                          <User className="size-3" />
                          <span>Log In to this Account</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setResetEmail(loginIdentifier || email || phone);
                            setShowResetModal(true);
                            setResetError("");
                            setResetSuccess("");
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold text-[11px] hover:bg-muted transition-colors cursor-pointer"
                        >
                          <Lock className="size-3 text-muted-foreground" />
                          <span>Reset Password</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {successMsg && (
                <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2 animate-in fade-in">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                  <div className="flex-1 leading-relaxed font-medium">{successMsg}</div>
                </div>
              )}

              {/* LOGIN FORM */}
              {mode === "login" && (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="login-identifier" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                        <Phone className="size-3.5 text-primary" />
                        <span>Mobile Number / Email Address</span>
                      </label>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        10-digit Mobile or Email
                      </span>
                    </div>
                    <div className="relative mt-1">
                      <input
                        id="login-identifier"
                        name="loginIdentifier"
                        type="text"
                        inputMode="text"
                        autoComplete="username tel email"
                        required
                        placeholder="Enter 10-digit mobile number or email"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        className="w-full rounded-xl border border-input bg-background pl-3.5 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                      />
                      <div className="absolute right-3.5 top-3 flex items-center gap-1 text-muted-foreground pointer-events-none">
                        {loginIdentifier.includes("@") ? (
                          <Mail className="size-4 text-primary" />
                        ) : (
                          <Phone className="size-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="login-password"
                        className="text-xs font-semibold text-foreground flex items-center gap-1.5"
                      >
                        <Lock className="size-3.5 text-primary" />
                        <span>Password</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(loginIdentifier || email);
                          setShowResetModal(true);
                          setResetError("");
                          setResetSuccess("");
                        }}
                        className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                      >
                        Forgot / Reset Password?
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
                        className="w-full rounded-xl border border-input bg-background pl-3.5 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 shadow-lg shadow-primary/20 gap-2 mt-2 cursor-pointer"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="size-4 animate-spin" />
                        <span>Signing In...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Sign In</span>
                        <ArrowRight className="size-4" />
                      </div>
                    )}
                  </Button>
                </form>
              )}

              {/* SIGNUP FORM */}
              {mode === "signup" && (
                <form onSubmit={handleSignupSubmit} className="space-y-3.5">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="signup-name"
                        className="text-xs font-semibold text-foreground"
                      >
                        Full Name *
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="signup-name"
                          name="name"
                          type="text"
                          autoComplete="name"
                          required
                          placeholder="Your Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background pl-3.5 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                        />
                        <User className="absolute right-3.5 top-3 size-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="signup-phone"
                        className="text-xs font-semibold text-foreground flex items-center justify-between"
                      >
                        <span>Mobile Number *</span>
                        <span className="text-[10px] text-muted-foreground font-normal">For order updates</span>
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="signup-phone"
                          name="phone"
                          type="tel"
                          autoComplete="tel"
                          required
                          placeholder="98765 43210"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background pl-3.5 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                        />
                        <Phone className="absolute right-3.5 top-3 size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="signup-email"
                        className="text-xs font-semibold text-foreground"
                      >
                        Email Address *
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="signup-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          required
                          placeholder="name@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background pl-3.5 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                        />
                        <Mail className="absolute right-3.5 top-3 size-4 text-muted-foreground" />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="signup-company"
                        className="text-xs font-semibold text-foreground"
                      >
                        Company Name (Optional)
                      </label>
                      <div className="relative mt-1">
                        <input
                          id="signup-company"
                          name="company"
                          type="text"
                          autoComplete="organization"
                          placeholder="e.g. Acme Enterprises"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full rounded-xl border border-input bg-background pl-3.5 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                        />
                        <Building2 className="absolute right-3.5 top-3 size-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="signup-password"
                      className="text-xs font-semibold text-foreground"
                    >
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
                        className="w-full rounded-xl border border-input bg-background pl-3.5 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
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
                    <label
                      htmlFor="signup-confirm-password"
                      className="text-xs font-semibold text-foreground"
                    >
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
                      className="mt-1 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                    />
                  </div>

                  <label
                    htmlFor="signup-terms"
                    className="flex items-start gap-2 pt-1 cursor-pointer"
                  >
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
                      I agree to the{" "}
                      <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium hover:text-primary/80">
                        Terms of Service
                      </a>{" "}
                      and acknowledge the{" "}
                      <a href="/privacy" target="_blank" rel="noopener noreferrer" className="text-primary underline font-medium hover:text-primary/80">
                        Privacy Policy
                      </a>.
                    </span>
                  </label>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[11px] text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className="font-bold text-primary hover:underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setShowResetModal(true);
                        setResetError("");
                        setResetSuccess("");
                      }}
                      className="text-[11px] font-bold text-primary hover:underline cursor-pointer"
                    >
                      Forgot / Reset Password?
                    </button>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 shadow-lg shadow-primary/20 gap-2 mt-2 cursor-pointer"
                  >
                    {submitting ? (
                      <div className="flex items-center gap-2">
                        <RefreshCw className="size-4 animate-spin" />
                        <span>Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span>Create Account</span>
                        <ArrowRight className="size-4" />
                      </div>
                    )}
                  </Button>
                </form>
              )}

              {/* Trust & Compliance Micro-Badges */}
              <div className="mt-5 grid grid-cols-3 gap-2 border-t border-border/60 pt-4 text-[10px] text-muted-foreground text-center">
                <div className="flex flex-col items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  <span className="font-semibold text-foreground/80">NBC 2016 Certified</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Lock className="size-3.5 text-primary" />
                  <span className="font-semibold text-foreground/80">256-Bit SSL Encrypted</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Zap className="size-3.5 text-amber-500" />
                  <span className="font-semibold text-foreground/80">Instant Verification</span>
                </div>
              </div>

              {/* Footer Switcher */}
              <div className="mt-6 border-t border-border pt-4 flex flex-col items-center justify-center text-xs text-muted-foreground gap-2">
                <div>
                  {mode === "login" ? (
                    <span>
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("signup");
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className="font-bold text-primary hover:underline cursor-pointer"
                      >
                        Create one now
                      </button>
                    </span>
                  ) : (
                    <span>
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setMode("login");
                          setErrorMsg("");
                          setSuccessMsg("");
                        }}
                        className="font-bold text-primary hover:underline cursor-pointer"
                      >
                        Sign In here
                      </button>
                    </span>
                  )}
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setShowResetModal(true);
                      setResetError("");
                      setResetSuccess("");
                    }}
                    className="text-[11px] text-muted-foreground hover:text-primary transition-colors cursor-pointer"
                  >
                    Forgot or need to reset your password?{" "}
                    <span className="font-bold text-primary underline">Reset Password</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FORGOT / RESET PASSWORD MODAL */}
          {showResetModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-xs animate-in fade-in">
              <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-2xl backdrop-blur-xl animate-in zoom-in-95">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetModal(false);
                    setResetError("");
                    setResetSuccess("");
                  }}
                  className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="size-4" />
                </button>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Lock className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg font-bold text-foreground">
                      Reset Password
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Receive an official password reset link via email
                    </p>
                  </div>
                </div>

                {resetSuccess ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-700 dark:text-emerald-400 flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
                      <div className="flex-1 leading-relaxed font-medium">{resetSuccess}</div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Please check your inbox as well as your <strong>Spam / Junk folder</strong>. Open the secure link from Firebase to set your new password.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setResetSuccess("");
                        }}
                      >
                        Send to another email
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => {
                          setShowResetModal(false);
                          setMode("login");
                        }}
                      >
                        Back to Login
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Enter your registered email address below. We'll send you a password reset link to securely update your credentials.
                    </p>

                    {resetError && (
                      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                        <AlertCircle className="size-4 shrink-0 mt-0.5" />
                        <div className="flex-1 leading-relaxed">{resetError}</div>
                      </div>
                    )}

                    <div>
                      <label
                        htmlFor="modal-reset-email"
                        className="text-xs font-semibold text-foreground mb-1 block"
                      >
                        Registered Mobile Number or Email *
                      </label>
                      <div className="relative">
                        <input
                          id="modal-reset-email"
                          type="text"
                          required
                          autoComplete="username tel email"
                          placeholder="Enter 10-digit mobile number or email"
                          value={resetEmail}
                          onChange={(e) => {
                            setResetEmail(e.target.value);
                            setResetError("");
                          }}
                          className="w-full rounded-xl border border-input bg-background pl-3.5 pr-10 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
                        />
                        <div className="absolute right-3.5 top-3 text-muted-foreground pointer-events-none">
                          {resetEmail.includes("@") ? (
                            <Mail className="size-4 text-primary" />
                          ) : (
                            <Phone className="size-4" />
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setShowResetModal(false);
                          setResetError("");
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        disabled={resetSubmitting || !resetEmail.trim()}
                        className="gap-1.5"
                      >
                        {resetSubmitting ? (
                          <>
                            <RefreshCw className="size-3.5 animate-spin" />
                            <span>Sending Reset Link...</span>
                          </>
                        ) : (
                          <>
                            <Mail className="size-3.5" />
                            <span>Send Reset Link</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* TASK D: RATE YOUR ORDER MODAL */}
          {feedbackOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
              <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <Star className="size-5 text-amber-500 fill-amber-500" />
                    <h3 className="font-display font-bold text-foreground text-base">
                      Rate Order #{feedbackOrder.orderNumber || feedbackOrder.id}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeedbackOrder(null)}
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {feedbackSuccess ? (
                  <div className="py-6 text-center space-y-2">
                    <div className="size-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="size-6" />
                    </div>
                    <h4 className="font-bold text-foreground text-sm">{feedbackSuccess}</h4>
                    <p className="text-xs text-muted-foreground">
                      Your rating has been saved to certified order records.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-xs text-muted-foreground">
                      How was the product quality, industrial certification compliance, and delivery dispatch speed?
                    </p>

                    {/* 1-5 Star Selection */}
                    <div className="space-y-1.5 text-center py-2 bg-muted/30 rounded-xl border border-border/60">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                        Select Rating (1 to 5 Stars)
                      </label>
                      <div className="flex items-center justify-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setFeedbackRating(star)}
                            className="p-1 transition-transform hover:scale-125 focus:outline-none"
                          >
                            <Star
                              className={`size-8 transition-colors ${
                                star <= feedbackRating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        {feedbackRating === 5
                          ? "5 Stars - Outstanding Compliance & Speed"
                          : feedbackRating === 4
                            ? "4 Stars - High Quality & Prompt Delivery"
                            : feedbackRating === 3
                              ? "3 Stars - Satisfactory Standard"
                              : feedbackRating === 2
                                ? "2 Stars - Needs Improvement"
                                : "1 Star - Unsatisfactory"}
                      </span>
                    </div>

                    {/* Optional Comment */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-foreground">
                        Your Feedback / Remarks <span className="text-muted-foreground font-normal">(Optional)</span>
                      </label>
                      <textarea
                        value={feedbackComment}
                        onChange={(e) => setFeedbackComment(e.target.value)}
                        placeholder="Write any comments regarding packaging, dispatch, equipment quality, or test reports..."
                        rows={3}
                        className="w-full rounded-xl border border-input bg-background p-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFeedbackOrder(null)}
                        disabled={feedbackSubmitting}
                        className="text-xs h-9"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={async () => {
                          if (!feedbackOrder || !user) return;
                          setFeedbackSubmitting(true);
                          try {
                            const prodIds = feedbackOrder.items?.map((it) => it.productId || it.name) || [];
                            await submitFeedback({
                              orderId: feedbackOrder.orderNumber || feedbackOrder.id || "ORD",
                              userId: user.uid,
                              productIds: prodIds,
                              rating: feedbackRating,
                              comment: feedbackComment.trim(),
                            });
                            setFeedbackSuccess("Thank you! Your feedback has been recorded.");
                            setTimeout(() => {
                              setFeedbackOrder(null);
                              setFeedbackSuccess("");
                            }, 1500);
                          } catch (err: any) {
                            alert(err.message || "Failed to submit feedback");
                          } finally {
                            setFeedbackSubmitting(false);
                          }
                        }}
                        disabled={feedbackSubmitting}
                        className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs h-9 gap-1.5"
                      >
                        {feedbackSubmitting ? (
                          <RefreshCw className="size-3.5 animate-spin" />
                        ) : (
                          <Star className="size-3.5 fill-current" />
                        )}
                        <span>Submit Feedback</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TASK C: CANCEL ORDER MODAL */}
          {cancellingOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
              <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-5 text-destructive" />
                    <h3 className="font-display font-bold text-foreground text-base">
                      Cancel Order #{cancellingOrder.orderNumber || cancellingOrder.id}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCancellingOrder(null)}
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
                  <p className="font-medium">
                    Orders can only be cancelled while in <strong>Placed</strong> or <strong>Confirmed</strong> status. Once shipped, dispatch transit cannot be reversed.
                  </p>
                </div>

                {cancelError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    {cancelError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-foreground">
                    Reason for Cancellation
                  </label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full rounded-xl border border-input bg-background p-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="Need to adjust quantity or order specifications">
                      Need to adjust quantity or order specifications
                    </option>
                    <option value="Ordered duplicate items by mistake">
                      Ordered duplicate items by mistake
                    </option>
                    <option value="Project timeline or site installation delayed">
                      Project timeline or site installation delayed
                    </option>
                    <option value="Found alternative industrial specification">
                      Found alternative industrial specification
                    </option>
                    <option value="Other administrative reason">Other administrative reason</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCancellingOrder(null)}
                    disabled={cancelSubmitting}
                    className="text-xs h-9"
                  >
                    Keep Order
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={cancelSubmitting}
                    onClick={async () => {
                      if (!cancellingOrder) return;
                      setCancelSubmitting(true);
                      setCancelError("");
                      try {
                        const targetId = cancellingOrder.id || cancellingOrder.orderNumber || "";
                        if (!targetId) throw new Error("Order identifier missing.");
                        await cancelOrder(
                          targetId,
                          cancelReason,
                          user?.displayName || userProfile?.displayName || user?.phoneNumber || "Customer",
                        );
                        setCancellingOrder(null);
                      } catch (err: any) {
                        setCancelError(err.message || "Order already shipped. Please contact support at +91 8639858221.");
                      } finally {
                        setCancelSubmitting(false);
                      }
                    }}
                    className="text-xs h-9 font-bold gap-1.5"
                  >
                    {cancelSubmitting && <RefreshCw className="size-3.5 animate-spin" />}
                    <span>Confirm Cancellation</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ORDER STATUS HISTORY MODAL */}
          {historyOrder && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in">
              <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4 animate-in zoom-in-95 max-h-[85vh] flex flex-col">
                <div className="flex items-center justify-between border-b border-border pb-3 shrink-0">
                  <div className="flex items-center gap-2">
                    <Clock className="size-5 text-primary" />
                    <h3 className="font-display font-bold text-foreground text-base">
                      Audit Trail #{historyOrder.orderNumber || historyOrder.id}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHistoryOrder(null)}
                    className="size-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="overflow-y-auto space-y-3 pr-1 text-xs">
                  {historyOrder.statusHistory && historyOrder.statusHistory.length > 0 ? (
                    historyOrder.statusHistory.map((h, i) => (
                      <div
                        key={i}
                        className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-primary text-[11px]">
                            {h.status}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            {formatKolkataDisplay(h.timestamp)}
                          </span>
                        </div>
                        <p className="text-foreground">{h.note}</p>
                        {h.updatedBy && (
                          <span className="text-[10px] text-muted-foreground block">
                            Logged by: {h.updatedBy}
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No status transitions recorded yet.
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border flex justify-end shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setHistoryOrder(null)}
                    className="text-xs h-8"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}

interface OrderTrackingSectionProps {
  order: OrderItem | null;
  userOrders?: OrderItem[];
  selectedOrderId?: string | null;
  onSelectOrder?: (orderId: string) => void;
  searchInput: string;
  onSearchInputChange: (val: string) => void;
  onSearchSubmit: (e: FormEvent) => void;
  isSearching: boolean;
  searchError: string;
  copiedAwb: boolean;
  onCopyAwb: (awb: string) => void;
  onOpenRenewals?: () => void;
  isGuest?: boolean;
  onSwitchToAuth?: () => void;
}

function OrderTrackingSection({
  order,
  userOrders,
  selectedOrderId,
  onSelectOrder,
  searchInput,
  onSearchInputChange,
  onSearchSubmit,
  isSearching,
  searchError,
  copiedAwb,
  onCopyAwb,
  onOpenRenewals,
  isGuest,
  onSwitchToAuth,
}: OrderTrackingSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. If user has multiple registered orders */}
      {userOrders && userOrders.length > 0 && onSelectOrder && (
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Package className="size-3.5 text-primary" />
              Select Order to Track:
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              {userOrders.length} order{userOrders.length === 1 ? "" : "s"} found
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {userOrders.map((ord) => {
              const isSelected =
                (ord.id || ord.orderNumber) === (selectedOrderId || order?.id || order?.orderNumber);
              const isShipped = ord.status === "shipped";
              const isDelivered = ord.status === "delivered";

              return (
                <button
                  key={ord.id || ord.orderNumber}
                  type="button"
                  onClick={() => onSelectOrder(ord.id || ord.orderNumber || "")}
                  className={`rounded-xl px-3.5 py-2.5 text-left border transition-all shrink-0 cursor-pointer ${
                    isSelected
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold shadow-xs"
                      : "border-border bg-muted/30 text-muted-foreground hover:border-border/80 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-mono text-xs font-black text-foreground">
                    <span>#{ord.orderNumber || ord.id}</span>
                    {isShipped && <span className="size-2 rounded-full bg-blue-500 animate-pulse" />}
                    {isDelivered && <CheckCircle2 className="size-3 text-emerald-500" />}
                  </div>
                  <div className="text-[10px] mt-0.5 capitalize flex items-center gap-1 opacity-80">
                    <span>{ord.status}</span>
                    {ord.courierName && <span>• {ord.courierName}</span>}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. Search Bar for tracking any order */}
      <form
        onSubmit={onSearchSubmit}
        className="flex flex-col sm:flex-row gap-2 rounded-2xl border border-border bg-card p-3 shadow-sm"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchInputChange(e.target.value)}
            placeholder="Search by Order ID (e.g. SUE-ORD-88219), phone, or courier AWB..."
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
        <Button
          type="submit"
          disabled={isSearching || !searchInput.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 h-9 shrink-0 shadow-xs cursor-pointer"
        >
          {isSearching && <RefreshCw className="size-3.5 animate-spin" />}
          <Truck className="size-3.5" />
          <span>Track Shipment</span>
        </Button>
      </form>

      {searchError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          <span>{searchError}</span>
        </div>
      )}

      {/* 3. Empty State if no order found/selected */}
      {!order ? (
        <div className="rounded-2xl border border-border bg-card p-10 text-center space-y-3">
          <div className="size-14 rounded-2xl bg-blue-500/10 text-blue-600 mx-auto flex items-center justify-center">
            <Truck className="size-7 animate-pulse" />
          </div>
          <h3 className="font-bold text-foreground text-base">Track Any Delivery in Real Time</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Enter your Order ID (from your confirmation SMS or invoice) or courier Airway Bill (AWB) above to view live dispatch status, partner courier tracking, and safety compliance timeline.
          </p>
          {isGuest && onSwitchToAuth && (
            <div className="pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSwitchToAuth}
                className="text-xs font-semibold gap-1.5"
              >
                <User className="size-3.5" />
                <span>Sign in to view all your registered orders</span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* 4. Active Order Tracking Display */
        <div className="space-y-6">
          {/* Top Header Card */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-base font-black text-foreground">
                    #{order.orderNumber || order.id}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 ${
                      order.status === "shipped"
                        ? "bg-blue-500/15 text-blue-600 border border-blue-500/30"
                        : order.status === "delivered"
                          ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                          : order.status === "cancelled"
                            ? "bg-destructive/15 text-destructive border border-destructive/30"
                            : "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                    }`}
                  >
                    {order.status === "shipped" && (
                      <span className="size-2 rounded-full bg-blue-500 animate-pulse" />
                    )}
                    <span>{order.status}</span>
                  </span>

                  {order.shippingType === "priority" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 border border-amber-500/30">
                      <Zap className="size-3 fill-current" /> Priority Dispatch
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Ordered on {formatKolkataDisplay(order.createdAt)} • Customer:{" "}
                  <strong className="text-foreground">{order.customerName}</strong>
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Expected Delivery Window
                </span>
                <span className="font-bold text-foreground text-xs sm:text-sm">
                  {order.expectedDeliveryFrom && order.expectedDeliveryTo
                    ? `${formatKolkataDisplay(order.expectedDeliveryFrom)} to ${formatKolkataDisplay(order.expectedDeliveryTo)}`
                    : order.estimatedDelivery || "5 to 7 business days"}
                </span>
              </div>
            </div>

            {/* 5-Step Visual Stepper */}
            <div className="py-2">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {TRACKING_STEPS.map((st) => {
                  const currentIdx = getTrackingStepIndex(order.status);
                  const isComplete = currentIdx >= st.step;
                  const isCurrent = currentIdx === st.step;
                  const IconComponent = st.icon;

                  return (
                    <div
                      key={st.step}
                      className={`rounded-xl p-3 border transition-all ${
                        isCurrent
                          ? "border-blue-500 bg-blue-500/10 shadow-sm ring-1 ring-blue-500/30"
                          : isComplete
                            ? "border-emerald-500/30 bg-emerald-500/5 text-foreground"
                            : "border-border/60 bg-muted/20 text-muted-foreground opacity-60"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div
                          className={`size-7 rounded-lg flex items-center justify-center ${
                            isCurrent
                              ? "bg-blue-500 text-white animate-pulse"
                              : isComplete
                                ? "bg-emerald-500 text-white"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {isComplete && !isCurrent ? (
                            <Check className="size-4 stroke-[3]" />
                          ) : (
                            <IconComponent className="size-3.5" />
                          )}
                        </div>
                        <span className="text-[10px] font-mono font-bold">
                          0{st.step}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-foreground leading-tight">
                        {st.title}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                        {st.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Live Courier & Dispatch Details Card */}
          {(order.courierName || order.trackingNumber || order.dispatchNote) && (
            <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-card to-card p-5 sm:p-6 shadow-md space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="size-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                    <Truck className="size-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
                      Courier Partner &amp; Live Tracking
                    </span>
                    <h4 className="font-display text-base font-bold text-foreground">
                      {order.courierName || "Express Surface Logistics"}
                    </h4>
                  </div>
                </div>

                {order.shippedAt && (
                  <div className="text-left sm:text-right text-xs">
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                      Dispatched On
                    </span>
                    <span className="font-mono font-semibold text-foreground">
                      {formatKolkataDisplay(order.shippedAt)}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* AWB Card */}
                {order.trackingNumber && (
                  <div className="rounded-xl border border-border bg-background p-3.5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Airway Bill / Tracking Number (AWB)
                    </span>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm sm:text-base font-black text-foreground tracking-wider select-all">
                        {order.trackingNumber}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onCopyAwb(order.trackingNumber!)}
                        className="h-8 px-2.5 text-xs font-semibold gap-1 shrink-0 cursor-pointer"
                        title="Copy AWB Number"
                      >
                        {copiedAwb ? (
                          <>
                            <Check className="size-3.5 text-emerald-500" />
                            <span className="text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Tracking Link Card */}
                <div className="rounded-xl border border-border bg-background p-3.5 flex flex-col justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                      Official Carrier Portal
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Access carrier-level GPS checkpoints &amp; transit scan logs.
                    </p>
                  </div>
                  <a
                    href={
                      order.trackingUrl ||
                      (order.courierName?.includes("Blue Dart")
                        ? `https://www.bluedart.com/tracking?trackNumber=${encodeURIComponent(order.trackingNumber || "")}`
                        : order.courierName?.includes("Delhivery")
                          ? `https://www.delhivery.com/track/package/${encodeURIComponent(order.trackingNumber || "")}`
                          : order.courierName?.includes("DTDC")
                            ? `https://www.dtdc.in/tracking/tracking_results.asp?strCnno=${encodeURIComponent(order.trackingNumber || "")}`
                            : "https://www.google.com/search?q=" + encodeURIComponent(`${order.courierName || "courier"} tracking ${order.trackingNumber || ""}`))
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button
                      size="sm"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-1.5 h-8 shadow-xs cursor-pointer"
                    >
                      <span>Track on Carrier Website</span>
                      <ExternalLink className="size-3.5" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Dispatch Note */}
              {order.dispatchNote && (
                <div className="rounded-xl bg-muted/40 border border-border/80 p-3 text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Routing &amp; Packaging Notes
                  </span>
                  <p className="text-foreground leading-relaxed">
                    {order.dispatchNote}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Maintenance / Refill Timeline Link Card */}
          {order.items?.some((it) => it.renewalMonths) && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="size-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <RotateCcw className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">
                    Automatic Safety Maintenance Schedule Activated 🛡️
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    This order includes safety equipment with periodic service/refill cycles. Automatic reminders will be sent to your account before each cycle.
                  </p>
                </div>
              </div>
              {onOpenRenewals && (
                <Button
                  size="sm"
                  onClick={onOpenRenewals}
                  className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold gap-1.5 shrink-0 cursor-pointer"
                >
                  <RotateCcw className="size-3.5" />
                  <span>View Refill Timeline</span>
                </Button>
              )}
            </div>
          )}

          {/* Audit Trail & Milestone History */}
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-md space-y-4">
            <h4 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              <span>Status History &amp; Milestone Timeline</span>
            </h4>

            {(!order.statusHistory || order.statusHistory.length === 0) ? (
              <div className="text-xs text-muted-foreground py-2">
                No milestone entries recorded yet.
              </div>
            ) : (
              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                {order.statusHistory.map((item, idx) => (
                  <div key={idx} className="relative text-xs space-y-1">
                    <div className="absolute -left-6 top-1 size-2 rounded-full bg-primary ring-4 ring-background" />
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span
                        className={`rounded px-1.5 py-0.5 font-mono font-bold uppercase text-[10px] ${
                          item.status === "placed"
                            ? "bg-amber-500/10 text-amber-600"
                            : item.status === "confirmed"
                              ? "bg-purple-500/10 text-purple-600"
                              : item.status === "shipped" || item.status === "dispatched"
                                ? "bg-blue-500/10 text-blue-600"
                                : item.status === "delivered"
                                  ? "bg-emerald-500/10 text-emerald-600"
                                  : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {item.status}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {formatKolkataDisplay(item.timestamp)}
                      </span>
                    </div>
                    {item.note && (
                      <div className="text-foreground leading-relaxed text-[11px] font-medium">
                        {item.note}
                      </div>
                    )}
                    {item.courierName && (
                      <div className="text-[11px] text-blue-600 dark:text-blue-400 font-mono">
                        Carrier: {item.courierName} {item.trackingNumber ? `• AWB: ${item.trackingNumber}` : ""}
                      </div>
                    )}
                    {item.updatedBy && (
                      <div className="text-[10px] text-muted-foreground">
                        Updated by: <span className="font-medium text-foreground">{item.updatedBy}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Need Help? Hotline card */}
          <div className="rounded-2xl border border-border bg-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 text-emerald-500 shrink-0" />
              <span>
                Have an urgent delivery question? Contact our 24/7 Logistics Desk at{" "}
                <strong className="text-foreground">+91 8639858221</strong>
              </span>
            </div>
            <a
              href="https://wa.me/918639858221?text=Hello%20Sri%20Udharchi%20Enterprises,%20I%20am%20inquiring%20about%20my%20delivery."
              target="_blank"
              rel="noreferrer"
            >
              <Button size="sm" variant="outline" className="text-xs font-semibold gap-1.5 h-8">
                <span>WhatsApp Logistics</span>
              </Button>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

