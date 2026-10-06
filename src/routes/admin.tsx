import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { firebaseConfig } from "@/lib/firebase";
import {
  subscribeProducts,
  subscribeInquiries,
  updateInquiryStatus,
  deleteInquiry,
  subscribeUsers,
  updateUserRole,
  subscribeCategories,
  CATEGORIES,
} from "@/lib/db-service";
import type { ProductItem, InquiryItem, UserItem, CategoryItem } from "@/lib/types";
import { ProductManager } from "@/components/admin/product-manager";
import { AdminAnalytics } from "@/components/admin/admin-analytics";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/button";
import {
  AlertTriangle,
  BarChart3,
  Boxes,
  Check,
  CheckCircle2,
  ChevronRight,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  Filter,
  Lock,
  LogOut,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCheck,
  Users,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Portal | Sri Udharchi Enterprises" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const {
    user,
    userProfile,
    isAdmin,
    loading: authLoading,
    authConfigError,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
  } = useAuth();

  // Navigation tab in Admin
  const [activeTab, setActiveTab] = useState<
    "analytics" | "products" | "inquiries" | "users" | "system"
  >("analytics");

  // Auth form state
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authProcessing, setAuthProcessing] = useState(false);

  // Firestore Data State
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);

  // Inquiries Table State
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState<
    "all" | "new" | "contacted" | "closed"
  >("all");
  const [inquirySortOrder, setInquirySortOrder] = useState<"newest" | "oldest" | "name">("newest");
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryItem | null>(null);
  const [inquiryToDelete, setInquiryToDelete] = useState<InquiryItem | null>(null);

  // Users Table State
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<"all" | "admin" | "staff" | "customer">(
    "all",
  );
  const [selfDemotionWarning, setSelfDemotionWarning] = useState<{
    targetRole: "admin" | "staff" | "customer";
  } | null>(null);

  // Notifications
  const [actionSuccess, setActionSuccess] = useState("");
  const [initialCreateOpen, setInitialCreateOpen] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  // Subscriptions only when admin is authenticated
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubProducts = subscribeProducts((data) => setProducts(data));
    const unsubCategories = subscribeCategories((data) => setCategories(data));
    const unsubInquiries = subscribeInquiries((data) => setInquiries(data));
    const unsubUsers = subscribeUsers((data) => setUsersList(data));

    return () => {
      unsubProducts();
      unsubCategories();
      unsubInquiries();
      unsubUsers();
    };
  }, [user, isAdmin]);

  // Escape key handler to dismiss open modals for keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (inquiryToDelete) setInquiryToDelete(null);
        else if (selectedInquiry) setSelectedInquiry(null);
        else if (selfDemotionWarning) setSelfDemotionWarning(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [inquiryToDelete, selectedInquiry, selfDemotionWarning]);

  const handleEmailAuth = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthProcessing(true);
    try {
      if (authMode === "login") {
        await loginWithEmail(emailInput, passwordInput);
      } else {
        await registerWithEmail(emailInput, passwordInput, nameInput);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthError(msg.replace("Firebase: ", ""));
    } finally {
      setAuthProcessing(false);
    }
  };

  const showSuccessMessage = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2500);
  };

  // Filtered inquiries for the inquiries table
  const filteredInquiries = useMemo(() => {
    return inquiries
      .filter((inq) => {
        const matchesStatus = inquiryStatusFilter === "all" || inq.status === inquiryStatusFilter;
        const q = inquirySearch.toLowerCase();
        const matchesSearch =
          !inquirySearch ||
          inq.name.toLowerCase().includes(q) ||
          inq.email.toLowerCase().includes(q) ||
          inq.phone.toLowerCase().includes(q) ||
          (inq.service && inq.service.toLowerCase().includes(q)) ||
          (inq.facility && inq.facility.toLowerCase().includes(q)) ||
          (inq.message && inq.message.toLowerCase().includes(q));

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (inquirySortOrder === "name") {
          return a.name.localeCompare(b.name);
        }
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (inquirySortOrder === "oldest") {
          return tA - tB;
        }
        return tB - tA;
      });
  }, [inquiries, inquiryStatusFilter, inquirySearch, inquirySortOrder]);

  // Export Inquiries to CSV
  const handleExportCSV = () => {
    if (inquiries.length === 0) {
      showSuccessMessage("No inquiries available to export.");
      return;
    }

    const headers = [
      "ID",
      "Date",
      "Customer Name",
      "Email Address",
      "Phone Number",
      "Service Requested",
      "Facility / Sector",
      "Status",
      "Message",
    ];

    const rows = filteredInquiries.map((inq) => [
      `"${inq.id || ""}"`,
      `"${inq.createdAt ? new Date(inq.createdAt).toLocaleString() : ""}"`,
      `"${(inq.name || "").replace(/"/g, '""')}"`,
      `"${inq.email || ""}"`,
      `"${inq.phone || ""}"`,
      `"${(inq.service || "").replace(/"/g, '""')}"`,
      `"${(inq.facility || "").replace(/"/g, '""')}"`,
      `"${inq.status || "new"}"`,
      `"${(inq.message || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.download = `sri-udharchi-leads-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccessMessage(`Exported ${filteredInquiries.length} leads to CSV.`);
  };

  // Filtered users for the users table
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const q = userSearch.toLowerCase();
      const matchesSearch =
        !userSearch ||
        u.email.toLowerCase().includes(q) ||
        (u.displayName && u.displayName.toLowerCase().includes(q));
      return matchesRole && matchesSearch;
    });
  }, [usersList, userRoleFilter, userSearch]);

  // Handle User Role Change
  const handleRoleChange = async (userId: string, newRole: "admin" | "staff" | "customer") => {
    // If current logged in user tries to demote themselves
    if (user?.uid === userId && newRole !== "admin") {
      setSelfDemotionWarning({ targetRole: newRole });
      return;
    }
    try {
      await updateUserRole(userId, newRole);
      showSuccessMessage(`Updated user role to "${newRole.toUpperCase()}".`);
    } catch (err: unknown) {
      showSuccessMessage(
        "Failed to update role: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  const confirmSelfDemotion = async () => {
    if (!selfDemotionWarning || !user) return;
    try {
      await updateUserRole(user.uid, selfDemotionWarning.targetRole);
      setSelfDemotionWarning(null);
      showSuccessMessage(`Role changed. You will lose admin rights on refresh.`);
    } catch (err: unknown) {
      showSuccessMessage(
        "Error updating role: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  // Delete lead handler
  const handleConfirmDeleteLead = async () => {
    if (!inquiryToDelete?.id) return;
    try {
      await deleteInquiry(inquiryToDelete.id);
      showSuccessMessage(`Lead from "${inquiryToDelete.name}" deleted.`);
      setInquiryToDelete(null);
      if (selectedInquiry?.id === inquiryToDelete.id) {
        setSelectedInquiry(null);
      }
    } catch (err: unknown) {
      showSuccessMessage(
        "Failed to delete lead: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <RefreshCw className="size-5 animate-spin text-primary" />
          <span>Connecting to Firebase authentication...</span>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Clean Admin Login View
  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
        <div className="w-full max-w-md">
          <div className="mb-6 text-center">
            <div className="flex justify-center">
              <BrandLogo />
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
              <Lock className="size-3.5" />
              <span>Admin Management Portal</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Sign in with your authorized Firebase administrator credentials.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
            {authConfigError && (
              <div className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-amber-600 dark:text-amber-400">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldAlert className="size-4 shrink-0" />
                  <span>Firebase Auth Setup Notice</span>
                </div>
                <p className="mt-1 leading-relaxed text-[11px] opacity-90">
                  Firebase Authentication is not yet enabled in the Firebase Console for project{" "}
                  <code className="rounded bg-amber-500/15 px-1 py-0.5 font-mono font-bold">
                    sri-udharchi-enterprises-c3be7
                  </code>
                  . Please enable Email/Password or Google under Authentication &gt; Sign-in method
                  in the Firebase Console before signing in.
                </p>
              </div>
            )}

            {/* Quick 1-Click Google Sign In */}
            <Button
              type="button"
              variant="outline"
              disabled={authProcessing}
              className="w-full gap-2 text-xs font-semibold"
              onClick={async () => {
                setAuthError("");
                setAuthProcessing(true);
                try {
                  await loginWithGoogle();
                } catch (err: unknown) {
                  const msg = err instanceof Error ? err.message : String(err);
                  setAuthError(msg.replace("Firebase: ", ""));
                } finally {
                  setAuthProcessing(false);
                }
              }}
            >
              <svg className="size-4" viewBox="0 0 24 24">
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
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </Button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or with Email</span>
              </div>
            </div>

            {authError && (
              <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                {authError}
              </div>
            )}

            <form onSubmit={handleEmailAuth} className="space-y-3">
              {authMode === "register" && (
                <div>
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Venkatesh / Administrator"
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="admin@udharchienterprises.com"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground">Password</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••"
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <Button type="submit" disabled={authProcessing} className="w-full">
                {authProcessing ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : authMode === "login" ? (
                  "Sign In to Admin Panel"
                ) : (
                  "Create Admin Account"
                )}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between border-t border-border pt-4 text-xs">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError("");
                }}
                className="text-primary hover:underline font-medium"
              >
                {authMode === "login"
                  ? "New administrator? Create account"
                  : "Already registered? Sign in"}
              </button>

              <a href="/" className="text-muted-foreground hover:underline">
                Back to Site
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated with Firebase, but lacks the 'admin' role in the Firestore 'users' collection
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4 text-foreground">
        <div className="w-full max-w-md text-center">
          <div className="flex justify-center">
            <BrandLogo />
          </div>
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-card p-6 shadow-xl sm:p-8">
            <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="size-8" />
            </div>
            <h1 className="mt-4 font-display text-xl font-black text-foreground">
              Admin Access Restricted
            </h1>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              You are signed in with Firebase Authentication, but your record in the Firestore{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-destructive">
                users
              </code>{" "}
              collection does not have{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-destructive">
                role: "admin"
              </code>
              .
            </p>

            <div className="mt-5 rounded-xl border border-border bg-muted/40 p-3.5 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Account:</span>
                <span className="text-foreground font-semibold truncate max-w-[200px]">
                  {user.email}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Firebase UID:</span>
                <span className="text-foreground text-[10px] truncate max-w-[200px]">
                  {user.uid}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Firestore Role:</span>
                <span className="rounded bg-destructive/15 px-1.5 py-0.5 font-bold text-destructive">
                  {userProfile?.role || "none"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required Role:</span>
                <span className="rounded bg-success/15 px-1.5 py-0.5 font-bold text-success">
                  "admin"
                </span>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <Button variant="outline" className="w-full" onClick={logout}>
                <LogOut className="size-4" />
                <span>Sign Out & Switch Account</span>
              </Button>
              <a href="/" className="block">
                <Button variant="ghost" className="w-full text-xs text-muted-foreground">
                  Return to Public Website
                </Button>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-4">
            <BrandLogo />
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary sm:inline-flex">
              Admin Portal
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-bold text-foreground">
                {user.displayName || (user.email ? user.email.split("@")[0] : "Admin")}
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-success" />
                <span>{userProfile?.role || "Admin"}</span>
                <span className="opacity-60">({user.email})</span>
              </div>
            </div>

            <a href="/" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="hidden sm:flex">
                <span>View Public Site</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </a>

            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Content */}
      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        {/* Success Alert Banner */}
        {actionSuccess && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-success/30 bg-success/10 p-4 text-sm font-semibold text-success">
            <div className="flex items-center gap-2">
              <Check className="size-5" />
              <span>{actionSuccess}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionSuccess("")}
              className="opacity-70 hover:opacity-100"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Stats Row - Clickable Cards to jump to tab */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            onClick={() => setActiveTab("products")}
            className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Products
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Boxes className="size-5" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-black text-foreground">
              {products.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Across {CATEGORIES.length} categories
            </p>
          </div>

          <div
            onClick={() => setActiveTab("inquiries")}
            className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Customer Inquiries
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Mail className="size-5" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-black text-foreground">
              {inquiries.length}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {inquiries.filter((i) => i.status === "new").length} pending response
            </p>
          </div>

          <div
            onClick={() => setActiveTab("users")}
            className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Registered Users
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                <Users className="size-5" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-black text-foreground">
              {usersList.length || 1}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Staff & Administrators</p>
          </div>

          <div
            onClick={() => setActiveTab("system")}
            className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-success/40 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Firebase Project
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success transition-transform group-hover:scale-110">
                <Database className="size-5" />
              </div>
            </div>
            <div className="mt-3 text-sm font-bold text-foreground truncate">
              {firebaseConfig.projectId}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-success font-semibold">
              <span className="size-1.5 rounded-full bg-success" />
              <span>Firestore Connected</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-8 flex flex-wrap gap-2 border-b border-border pb-4">
          {[
            {
              id: "analytics",
              label: "Operations & Charts",
              count: null,
              icon: BarChart3,
            },
            {
              id: "products",
              label: "Products Catalog",
              count: products.length,
              icon: Boxes,
            },
            {
              id: "inquiries",
              label: "Customer Leads",
              count: inquiries.length,
              newBadge: inquiries.filter((i) => i.status === "new").length,
              icon: Mail,
            },
            {
              id: "users",
              label: "Users & Staff",
              count: usersList.length || 1,
              icon: Users,
            },
            {
              id: "system",
              label: "Firebase & System",
              count: null,
              icon: Database,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              <span>{tab.label}</span>
              {tab.newBadge ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === tab.id
                      ? "bg-primary-foreground text-primary"
                      : "bg-primary/20 text-primary"
                  }`}
                >
                  {tab.newBadge} New
                </span>
              ) : tab.count !== null ? (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        {/* TAB 1: OPERATIONS & CHARTS ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="mt-6">
            <AdminAnalytics
              products={products}
              inquiries={inquiries}
              usersList={usersList}
              categories={categories}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenAddProduct={() => {
                setActiveTab("products");
                setInitialCreateOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 2: PRODUCTS MANAGEMENT */}
        {activeTab === "products" && (
          <div className="mt-6">
            <ProductManager
              products={products}
              categories={categories}
              onNotify={showSuccessMessage}
              initialCreateOpen={initialCreateOpen}
            />
          </div>
        )}

        {/* TAB 3: CUSTOMER LEADS & INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Quote Requests & Website Inquiries
                </h2>
                <p className="text-xs text-muted-foreground">
                  Incoming leads captured directly from customer quote submissions on your website.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCSV}
                  className="gap-1.5"
                  title="Export all leads as CSV spreadsheet"
                >
                  <Download className="size-3.5" />
                  <span>Export CSV</span>
                </Button>
              </div>
            </div>

            {/* Inquiries Filter Bar */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
                {/* Search Bar */}
                <div className="relative sm:col-span-2 lg:col-span-5">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or service..."
                    value={inquirySearch}
                    onChange={(e) => setInquirySearch(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  {inquirySearch && (
                    <button
                      type="button"
                      onClick={() => setInquirySearch("")}
                      className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Status Tabs */}
                <div className="sm:col-span-1 lg:col-span-4 flex items-center gap-1.5 overflow-x-auto">
                  {(
                    [
                      { id: "all", label: "All", count: inquiries.length },
                      {
                        id: "new",
                        label: "New",
                        count: inquiries.filter((i) => i.status === "new").length,
                      },
                      {
                        id: "contacted",
                        label: "Contacted",
                        count: inquiries.filter((i) => i.status === "contacted").length,
                      },
                      {
                        id: "closed",
                        label: "Closed",
                        count: inquiries.filter((i) => i.status === "closed").length,
                      },
                    ] as const
                  ).map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => setInquiryStatusFilter(filter.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                        inquiryStatusFilter === filter.id
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {filter.label} ({filter.count})
                    </button>
                  ))}
                </div>

                {/* Sort Order */}
                <div className="sm:col-span-1 lg:col-span-3">
                  <select
                    value={inquirySortOrder}
                    onChange={(e) =>
                      setInquirySortOrder(e.target.value as "newest" | "oldest" | "name")
                    }
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="newest">Sort: Newest First</option>
                    <option value="oldest">Sort: Oldest First</option>
                    <option value="name">Sort: Customer Name (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">Customer</th>
                      <th className="px-5 py-3">Contact Details</th>
                      <th className="px-5 py-3">Service / Facility</th>
                      <th className="px-5 py-3">Message</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredInquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                          {inquiries.length === 0
                            ? "No customer leads yet. New submissions from your Contact page will appear here."
                            : "No leads match your current search or status filters."}
                        </td>
                      </tr>
                    ) : (
                      filteredInquiries.map((inq) => (
                        <tr
                          key={inq.id || inq.createdAt}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="font-bold text-foreground">{inq.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {inq.createdAt
                                ? new Date(inq.createdAt).toLocaleDateString()
                                : "Recent"}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-1.5 text-xs text-foreground font-semibold">
                              <Phone className="size-3 text-primary" />
                              <a href={`tel:${inq.phone}`} className="hover:underline">
                                {inq.phone}
                              </a>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Mail className="size-3" />
                              <a href={`mailto:${inq.email}`} className="hover:underline">
                                {inq.email}
                              </a>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-foreground">
                              {inq.service || "General Inquiry"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {inq.facility || "Standard"}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <p className="max-w-xs text-xs text-muted-foreground line-clamp-2">
                              {inq.message || "No specific message provided."}
                            </p>
                          </td>
                          <td className="px-5 py-4">
                            <select
                              value={inq.status}
                              onChange={async (e) => {
                                if (!inq.id) return;
                                const nextStatus = e.target.value as "new" | "contacted" | "closed";
                                await updateInquiryStatus(inq.id, nextStatus);
                                showSuccessMessage(
                                  `Lead marked as "${nextStatus === "closed" ? "Closed / Won" : nextStatus === "contacted" ? "Contacted" : "New Lead"}".`,
                                );
                              }}
                              className={`rounded-md px-2.5 py-1 text-xs font-bold border ${
                                inq.status === "new"
                                  ? "bg-primary/10 border-primary text-primary"
                                  : inq.status === "contacted"
                                    ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                                    : "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                              }`}
                            >
                              <option value="new">New Lead</option>
                              <option value="contacted">Contacted / Working</option>
                              <option value="closed">Closed / Won Deal</option>
                            </select>
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => setSelectedInquiry(inq)}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                title="View Lead Details"
                                aria-label={`View lead details for ${inq.name}`}
                              >
                                <Eye className="size-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setInquiryToDelete(inq)}
                                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                title="Delete Lead"
                                aria-label={`Delete lead for ${inq.name}`}
                              >
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* INQUIRY DETAILS MODAL */}
            {selectedInquiry && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div>
                      <h3 className="font-display text-lg font-bold text-foreground">
                        Customer Lead Overview
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Submitted on{" "}
                        {selectedInquiry.createdAt
                          ? new Date(selectedInquiry.createdAt).toLocaleString()
                          : "Unknown"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedInquiry(null)}
                      className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                      aria-label="Close modal"
                    >
                      <X className="size-5" />
                    </button>
                  </div>

                  <div className="mt-4 space-y-4 text-xs">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Customer Name
                        </span>
                        <div className="mt-1 font-bold text-foreground text-sm">
                          {selectedInquiry.name}
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Pipeline Status
                        </span>
                        <div className="mt-1">
                          <select
                            value={selectedInquiry.status}
                            onChange={async (e) => {
                              if (!selectedInquiry.id) return;
                              const s = e.target.value as "new" | "contacted" | "closed";
                              await updateInquiryStatus(selectedInquiry.id, s);
                              setSelectedInquiry({ ...selectedInquiry, status: s });
                              showSuccessMessage(`Lead status updated to "${s}".`);
                            }}
                            className="rounded-md border border-input bg-background px-2.5 py-1 text-xs font-bold"
                          >
                            <option value="new">New Lead</option>
                            <option value="contacted">Contacted / Working</option>
                            <option value="closed">Closed / Won Deal</option>
                          </select>
                        </div>
                      </div>

                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Phone Number
                        </span>
                        <div className="mt-1 flex items-center justify-between font-mono font-bold text-foreground">
                          <span>{selectedInquiry.phone}</span>
                          <div className="flex items-center gap-1">
                            <a
                              href={`tel:${selectedInquiry.phone}`}
                              className="rounded p-1 text-primary hover:bg-primary/10"
                              title="Call"
                              aria-label="Call customer"
                            >
                              <Phone className="size-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(selectedInquiry.phone, "phone")}
                              className="rounded p-1 text-muted-foreground hover:bg-muted"
                              title="Copy"
                              aria-label="Copy phone number"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </div>
                        </div>
                        {copiedText === "phone" && (
                          <span className="text-[10px] text-success">Copied phone!</span>
                        )}
                      </div>

                      <div className="rounded-xl border border-border bg-muted/20 p-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                          Email Address
                        </span>
                        <div className="mt-1 flex items-center justify-between font-mono font-bold text-foreground truncate">
                          <span className="truncate">{selectedInquiry.email}</span>
                          <div className="flex items-center gap-1 shrink-0">
                            <a
                              href={`mailto:${selectedInquiry.email}`}
                              className="rounded p-1 text-primary hover:bg-primary/10"
                              title="Email"
                              aria-label="Email customer"
                            >
                              <Mail className="size-3.5" />
                            </a>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(selectedInquiry.email, "email")}
                              className="rounded p-1 text-muted-foreground hover:bg-muted"
                              title="Copy"
                              aria-label="Copy email address"
                            >
                              <Copy className="size-3.5" />
                            </button>
                          </div>
                        </div>
                        {copiedText === "email" && (
                          <span className="text-[10px] text-success">Copied email!</span>
                        )}
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Service Requested
                          </span>
                          <div className="font-semibold text-foreground">
                            {selectedInquiry.service || "General Inquiry"}
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Facility / Industry
                          </span>
                          <div className="font-semibold text-foreground">
                            {selectedInquiry.facility || "Standard"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-muted/20 p-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Customer Message / Requirements
                      </span>
                      <p className="mt-1 whitespace-pre-wrap leading-relaxed text-foreground">
                        {selectedInquiry.message || "No specific message provided."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2 border-t border-border pt-4">
                    <Button variant="outline" size="sm" onClick={() => setSelectedInquiry(null)}>
                      Close
                    </Button>
                    <a href={`tel:${selectedInquiry.phone}`}>
                      <Button size="sm">
                        <Phone className="size-3.5" />
                        <span>Call Customer</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* DELETE LEAD CONFIRMATION MODAL */}
            {inquiryToDelete && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                      <AlertTriangle className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        Delete Customer Lead?
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        This action will permanently delete the inquiry record from Firestore.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-xs">
                    <div>
                      <strong>Customer:</strong> {inquiryToDelete.name}
                    </div>
                    <div className="mt-1 text-muted-foreground">
                      <strong>Email:</strong> {inquiryToDelete.email} | <strong>Phone:</strong>{" "}
                      {inquiryToDelete.phone}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => setInquiryToDelete(null)}>
                      Cancel
                    </Button>
                    <Button variant="destructive" size="sm" onClick={handleConfirmDeleteLead}>
                      Delete Permanently
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: USERS & STAFF MANAGEMENT */}
        {activeTab === "users" && (
          <div className="mt-6 space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">
                  Users & Role Access Management
                </h2>
                <p className="text-xs text-muted-foreground">
                  Manage administrators, safety technicians, and staff authorized to access this
                  portal.
                </p>
              </div>
            </div>

            {/* Users Filter Bar */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-12">
                <div className="relative sm:col-span-2 md:col-span-7">
                  <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search by user email or name..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-1 md:col-span-5 flex items-center gap-1.5 overflow-x-auto">
                  {(
                    [
                      { id: "all", label: "All Users" },
                      { id: "admin", label: "Admins" },
                      { id: "staff", label: "Staff" },
                      { id: "customer", label: "Customers" },
                    ] as const
                  ).map((rf) => (
                    <button
                      key={rf.id}
                      type="button"
                      onClick={() => setUserRoleFilter(rf.id)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                        userRoleFilter === rf.id
                          ? "bg-primary text-primary-foreground"
                          : "border border-border bg-muted/40 text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {rf.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">User Profile</th>
                      <th className="px-5 py-3">Email Address</th>
                      <th className="px-5 py-3">Current Role</th>
                      <th className="px-5 py-3">Registered Date</th>
                      <th className="px-5 py-3 text-right">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                          No users found matching search criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => {
                        const isSelf = user?.uid === u.id || user?.email === u.email;
                        return (
                          <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                  {(u.displayName || u.email || "U").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 font-bold text-foreground">
                                    <span>
                                      {u.displayName || (u.email ? u.email.split("@")[0] : "User")}
                                    </span>
                                    {isSelf && (
                                      <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                                        You
                                      </span>
                                    )}
                                  </div>
                                  <div className="font-mono text-[10px] text-muted-foreground">
                                    {u.id}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-xs font-medium text-foreground">
                              {u.email}
                            </td>
                            <td className="px-5 py-4">
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                  u.role === "admin"
                                    ? "bg-primary/10 text-primary"
                                    : u.role === "staff"
                                      ? "bg-secondary/20 text-foreground"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {u.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-muted-foreground">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent"}
                            </td>
                            <td className="px-5 py-4 text-right">
                              <select
                                value={u.role}
                                onChange={(e) =>
                                  handleRoleChange(
                                    u.id,
                                    e.target.value as "admin" | "staff" | "customer",
                                  )
                                }
                                className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                              >
                                <option value="admin">Administrator</option>
                                <option value="staff">Staff / Technician</option>
                                <option value="customer">Viewer / Customer</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Role Explainer Card */}
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 font-bold text-xs text-primary">
                  <ShieldCheck className="size-4" />
                  <span>Administrator</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Full control over Firestore products catalog, customer leads management, user
                  roles assignment, and database seeding.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                  <UserCheck className="size-4" />
                  <span>Staff / Technician</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Authorized to review quotation inquiries, update lead status, and view product
                  specifications and pricing.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 font-bold text-xs text-muted-foreground">
                  <Users className="size-4" />
                  <span>Viewer / Customer</span>
                </div>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                  Standard account permissions with read access restricted according to Firestore
                  security rules.
                </p>
              </div>
            </div>

            {/* Self Demotion Warning Modal */}
            {selfDemotionWarning && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="w-full max-w-md rounded-2xl border border-amber-500/40 bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
                      <AlertTriangle className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-foreground">
                        Change Your Own Admin Role?
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Warning: Changing your own role to {selfDemotionWarning.targetRole} will
                        revoke your administrative privileges.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelfDemotionWarning(null)}
                    >
                      Keep Admin Role
                    </Button>
                    <Button variant="destructive" size="sm" onClick={confirmSelfDemotion}>
                      Confirm Change
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: FIREBASE & SYSTEM OVERVIEW */}
        {activeTab === "system" && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Firebase Project & Cloud Infrastructure
              </h2>
              <p className="text-xs text-muted-foreground">
                Connected to official client production cloud infrastructure.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display text-base font-bold text-foreground">
                  Firebase Credentials In Use
                </h3>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Project ID</span>
                    <span className="font-mono font-bold text-foreground">
                      {firebaseConfig.projectId}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Auth Domain</span>
                    <span className="font-mono text-foreground">{firebaseConfig.authDomain}</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Storage Bucket</span>
                    <span className="font-mono text-foreground">
                      {firebaseConfig.storageBucket}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Messaging Sender ID</span>
                    <span className="font-mono text-foreground">
                      {firebaseConfig.messagingSenderId}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">App ID</span>
                    <span className="font-mono text-foreground">{firebaseConfig.appId}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display text-base font-bold text-foreground">
                  Active Firestore Collections
                </h3>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      col: "products",
                      count: products.length,
                      desc: "Catalog of fire protection systems & industrial gear",
                    },
                    {
                      col: "inquiries",
                      count: inquiries.length,
                      desc: "Customer leads & quotation requests",
                    },
                    {
                      col: "users",
                      count: usersList.length || 1,
                      desc: "User profiles, roles, and administrative privileges",
                    },
                    {
                      col: "categories",
                      count: categories.length,
                      desc: "Product categorization definitions",
                    },
                  ].map((c) => (
                    <div
                      key={c.col}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-primary">/{c.col}</span>
                          <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                            {c.count} items
                          </span>
                        </div>
                        <div className="text-muted-foreground mt-0.5">{c.desc}</div>
                      </div>
                      <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success">
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
