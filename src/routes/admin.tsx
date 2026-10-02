import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  subscribeProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  seedDefaultProducts,
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
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/button";
import {
  Boxes,
  Check,
  ChevronRight,
  Database,
  ExternalLink,
  Eye,
  FileSpreadsheet,
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
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    logout,
  } = useAuth();

  // Navigation tab in Admin
  const [activeTab, setActiveTab] = useState<"products" | "inquiries" | "users" | "system">(
    "products",
  );

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
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const [actionSuccess, setActionSuccess] = useState("");

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
            {/* Quick 1-Click Google Sign In */}
            <button
              type="button"
              onClick={loginWithGoogle}
              className="flex w-full items-center justify-center gap-3 rounded-lg border border-border bg-background py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-muted hover:border-primary"
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
              <span className="relative z-10 bg-card px-3">or continue with email</span>
              <div className="absolute inset-0 top-1/2 -z-0 border-t border-border" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {authMode === "register" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Admin Name"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="sriudharchienterprises@gmail.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-input bg-background px-3.5 py-2 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {authError && (
                <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive">
                  {authError}
                </div>
              )}

              <Button type="submit" disabled={authProcessing} className="w-full">
                {authProcessing ? (
                  <RefreshCw className="size-4 animate-spin" />
                ) : authMode === "login" ? (
                  "Sign In to Admin Panel"
                ) : (
                  "Register New Account"
                )}
              </Button>
            </form>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => {
                  setAuthMode(authMode === "login" ? "register" : "login");
                  setAuthError("");
                }}
                className="hover:text-primary"
              >
                {authMode === "login"
                  ? "Don't have an account? Register"
                  : "Already registered? Sign In"}
              </button>
              <a href="/" className="hover:text-primary">
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

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === "All" || p.category === categoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-4">
            <BrandLogo />
            <span className="hidden rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary sm:inline-flex">
              Admin Panel
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <div className="text-xs font-bold text-foreground">
                {user.displayName || user.email?.split("@")[0]}
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
            <button onClick={() => setActionSuccess("")} className="opacity-70 hover:opacity-100">
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Total Products
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Customer Inquiries
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
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

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Registered Users
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
            </div>
            <div className="mt-3 font-display text-3xl font-black text-foreground">
              {usersList.length || 1}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Staff & Administrators</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Firebase Project
              </span>
              <div className="flex size-9 items-center justify-center rounded-lg bg-success/10 text-success">
                <Database className="size-5" />
              </div>
            </div>
            <div className="mt-3 text-sm font-bold text-foreground truncate">
              sri-udharchi-enterprises
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
            { id: "products", label: "Products Catalog", count: products.length, icon: Boxes },
            { id: "inquiries", label: "Customer Leads", count: inquiries.length, icon: Mail },
            { id: "users", label: "Users & Staff", count: usersList.length || 1, icon: Users },
            { id: "system", label: "Firebase & System", count: null, icon: Database },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <tab.icon className="size-4" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    activeTab === tab.id
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: PRODUCTS MANAGEMENT */}
        {activeTab === "products" && (
          <div className="mt-6">
            <ProductManager
              products={products}
              categories={categories}
              onNotify={showSuccessMessage}
            />
          </div>
        )}

        {/* TAB 2: CUSTOMER LEADS & INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Quote Requests & Website Inquiries
              </h2>
              <p className="text-xs text-muted-foreground">
                Incoming leads captured directly from the quote form on your website.
              </p>
            </div>

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
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {inquiries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                          No customer leads yet. New submissions from your Contact page will appear
                          here.
                        </td>
                      </tr>
                    ) : (
                      inquiries.map((inq) => (
                        <tr
                          key={inq.id || inq.createdAt}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="font-bold text-foreground">{inq.name}</div>
                            <div className="text-[11px] text-muted-foreground">
                              {new Date(inq.createdAt).toLocaleDateString()}
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
                              onChange={(e) =>
                                inq.id &&
                                updateInquiryStatus(
                                  inq.id,
                                  e.target.value as "new" | "contacted" | "closed",
                                )
                              }
                              className={`rounded-md px-2.5 py-1 text-xs font-bold border ${
                                inq.status === "new"
                                  ? "bg-primary/10 border-primary text-primary"
                                  : inq.status === "contacted"
                                    ? "bg-warning/10 border-warning text-warning"
                                    : "bg-success/10 border-success text-success"
                              }`}
                            >
                              <option value="new">New Lead</option>
                              <option value="contacted">Contacted</option>
                              <option value="closed">Closed / Won</option>
                            </select>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => inq.id && deleteInquiry(inq.id)}
                              className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                              title="Delete Lead"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: USERS & STAFF MANAGEMENT */}
        {activeTab === "users" && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Users & Role Access
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage administrators, technicians, and sales personnel authorized to access this
                portal.
              </p>
            </div>

            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3">User</th>
                      <th className="px-5 py-3">Email Address</th>
                      <th className="px-5 py-3">Assigned Role</th>
                      <th className="px-5 py-3">Created Date</th>
                      <th className="px-5 py-3 text-right">Change Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {usersList.map((u) => (
                      <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                              {(u.displayName || u.email || "U")[0].toUpperCase()}
                            </div>
                            <span className="font-bold text-foreground">
                              {u.displayName || u.email?.split("@")[0]}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-xs font-medium text-foreground">{u.email}</td>
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
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <select
                            value={u.role}
                            onChange={(e) =>
                              updateUserRole(u.id, e.target.value as "admin" | "staff" | "customer")
                            }
                            className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                          >
                            <option value="admin">Administrator</option>
                            <option value="staff">Staff / Technician</option>
                            <option value="customer">Viewer / Customer</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: FIREBASE & SYSTEM OVERVIEW */}
        {activeTab === "system" && (
          <div className="mt-6 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold text-foreground">
                Firebase Project & System Status
              </h2>
              <p className="text-xs text-muted-foreground">
                Connected to official client cloud infrastructure.
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
                      sri-udharchi-enterprises
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Auth Domain</span>
                    <span className="font-mono text-foreground">
                      sri-udharchi-enterprises.firebaseapp.com
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Storage Bucket</span>
                    <span className="font-mono text-foreground">
                      sri-udharchi-enterprises.firebasestorage.app
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Messaging Sender ID</span>
                    <span className="font-mono text-foreground">926181788536</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">App ID</span>
                    <span className="font-mono text-foreground">
                      1:926181788536:web:4a0cec1729851f2921568d
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <h3 className="font-display text-base font-bold text-foreground">
                  Active Firestore Collections
                </h3>
                <div className="mt-4 space-y-3">
                  {[
                    { col: "products", desc: "Catalog of fire protection systems & safety gear" },
                    { col: "inquiries", desc: "Customer leads & quotation requests" },
                    { col: "users", desc: "User profiles, roles, and administrative privileges" },
                    { col: "categories", desc: "Product categorization definitions" },
                  ].map((c) => (
                    <div
                      key={c.col}
                      className="flex items-center justify-between rounded-lg border border-border p-3 text-xs"
                    >
                      <div>
                        <div className="font-mono font-bold text-primary">/{c.col}</div>
                        <div className="text-muted-foreground">{c.desc}</div>
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
