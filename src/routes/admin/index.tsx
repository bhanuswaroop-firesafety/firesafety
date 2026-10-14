import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo, type FormEvent } from "react";
import { AdminLoginPage } from "./login";
import { useAuth, SUPER_ADMIN_EMAILS } from "@/lib/auth-context";
import { db, firebaseConfig, collection, getDocs } from "@/lib/firebase";
import {
  subscribeProducts,
  subscribeInquiries,
  updateInquiryStatus,
  deleteInquiry,
  subscribeUsers,
  updateUserRole,
  subscribeCategories,
  subscribeOrders,
  updateOrderStatus,
  deleteOrder,
  subscribeAuthorizedAdmins,
  addAuthorizedAdmin,
  removeAuthorizedAdmin,
} from "@/lib/db-service";
import type {
  ProductItem,
  InquiryItem,
  UserItem,
  CategoryItem,
  OrderItem,
  AuthorizedAdminItem,
} from "@/lib/types";
import { ProductManager } from "@/components/admin/product-manager";
import { AdminAnalytics } from "@/components/admin/admin-analytics";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/button";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Boxes,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Copy,
  CreditCard,
  Crown,
  Database,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  Filter,
  FolderKanban,
  Globe,
  IndianRupee,
  Key,
  Layers,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Phone,
  Printer,
  QrCode,
  RefreshCw,
  Search,
  Settings,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Trash2,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin Portal | Sri Udharchi Enterprises" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const { user, userProfile, isAdmin, loading: authLoading, logout } = useAuth();

  // Navigation tab in Admin Sidebar
  const [activeTab, setActiveTab] = useState<
    "analytics" | "products" | "orders" | "inquiries" | "users" | "settings" | "system"
  >("analytics");

  // Mobile sidebar toggle
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Firestore Data State (Live Real-time Subscriptions)
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);

  // Orders Table State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "pending" | "confirmed" | "dispatched" | "delivered" | "cancelled"
  >("all");
  const [orderSortOrder, setOrderSortOrder] = useState<"newest" | "oldest" | "amount">("newest");
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<OrderItem | null>(null);

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

  // Authorized Admins State
  const [authorizedAdmins, setAuthorizedAdmins] = useState<AuthorizedAdminItem[]>([]);
  const [isAddAdminModalOpen, setIsAddAdminModalOpen] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [newAdminForm, setNewAdminForm] = useState({
    email: "",
    displayName: "",
    password: "",
    department: "Operations & Field Safety",
    phone: "",
  });
  const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);
  const [adminModalError, setAdminModalError] = useState("");
  const [adminCreatedInfo, setAdminCreatedInfo] = useState<{
    email: string;
    password?: string;
    displayName: string;
  } | null>(null);
  const [adminToDelete, setAdminToDelete] = useState<AuthorizedAdminItem | null>(null);

  // System Diagnostics State
  const [latencyTesting, setLatencyTesting] = useState(false);
  const [latencyResult, setLatencyResult] = useState<string | null>(null);

  // Notifications
  const [actionSuccess, setActionSuccess] = useState("");
  const [initialCreateOpen, setInitialCreateOpen] = useState(false);
  const [copiedText, setCopiedText] = useState("");

  // Subscriptions only when admin is authenticated
  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubProducts = subscribeProducts((data) => setProducts(data));
    const unsubCategories = subscribeCategories((data) => setCategories(data));
    const unsubOrders = subscribeOrders((data) => setOrders(data));
    const unsubInquiries = subscribeInquiries((data) => setInquiries(data));
    const unsubUsers = subscribeUsers((data) => setUsersList(data));
    const unsubAuthorizedAdmins = subscribeAuthorizedAdmins((data) => setAuthorizedAdmins(data));

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubInquiries();
      unsubUsers();
      unsubAuthorizedAdmins();
    };
  }, [user, isAdmin]);

  // Escape key handler to dismiss open modals for keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (orderToDelete) setOrderToDelete(null);
        else if (selectedOrder) setSelectedOrder(null);
        else if (inquiryToDelete) setInquiryToDelete(null);
        else if (selectedInquiry) setSelectedInquiry(null);
        else if (selfDemotionWarning) setSelfDemotionWarning(null);
        else if (adminToDelete) setAdminToDelete(null);
        else if (isAddAdminModalOpen) setIsAddAdminModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    orderToDelete,
    selectedOrder,
    inquiryToDelete,
    selectedInquiry,
    selfDemotionWarning,
    adminToDelete,
    isAddAdminModalOpen,
  ]);

  const showSuccessMessage = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(""), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2500);
  };

  // Test Firestore Connection & Latency
  const handleTestLatency = async () => {
    setLatencyTesting(true);
    setLatencyResult(null);
    const t0 = performance.now();
    try {
      await getDocs(collection(db, "products"));
      const t1 = performance.now();
      const ms = Math.round(t1 - t0);
      setLatencyResult(`Live Cloud Firestore response: ${ms}ms — Healthy & Fully Operational`);
    } catch (err: unknown) {
      const t1 = performance.now();
      const ms = Math.round(t1 - t0);
      setLatencyResult(
        `Latency test (${ms}ms): ${err instanceof Error ? err.message : String(err)}`,
      );
    } finally {
      setLatencyTesting(false);
    }
  };

  // Filtered Orders for the Orders View
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesStatus = orderStatusFilter === "all" || o.status === orderStatusFilter;
        const q = orderSearch.toLowerCase();
        const matchesSearch =
          !orderSearch ||
          (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
          (o.customerName && o.customerName.toLowerCase().includes(q)) ||
          (o.customerEmail && o.customerEmail.toLowerCase().includes(q)) ||
          (o.customerPhone && o.customerPhone.toLowerCase().includes(q)) ||
          (o.shippingAddress && o.shippingAddress.toLowerCase().includes(q)) ||
          (o.companyName && o.companyName.toLowerCase().includes(q));

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => {
        if (orderSortOrder === "amount") {
          return (b.total || 0) - (a.total || 0);
        }
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        if (orderSortOrder === "oldest") {
          return tA - tB;
        }
        return tB - tA;
      });
  }, [orders, orderStatusFilter, orderSearch, orderSortOrder]);

  // Export Orders to CSV
  const handleExportOrdersCSV = () => {
    if (orders.length === 0) {
      showSuccessMessage("No customer orders available to export.");
      return;
    }

    const headers = [
      "Order Number",
      "Date",
      "Customer Name",
      "Phone",
      "Email",
      "Delivery Address",
      "Company",
      "GSTIN",
      "Payment Mode",
      "Subtotal",
      "GST",
      "Shipping",
      "Total Invoiced (INR)",
      "Status",
    ];

    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber || o.id || ""}"`,
      `"${o.createdAt ? new Date(o.createdAt).toLocaleString() : ""}"`,
      `"${(o.customerName || "").replace(/"/g, '""')}"`,
      `"${o.customerPhone || ""}"`,
      `"${o.customerEmail || ""}"`,
      `"${(o.shippingAddress || "").replace(/"/g, '""')}"`,
      `"${(o.companyName || "").replace(/"/g, '""')}"`,
      `"${o.gstin || ""}"`,
      `"${o.paymentMethod || ""}"`,
      `"${o.subtotal || 0}"`,
      `"${o.gst || 0}"`,
      `"${o.shipping || 0}"`,
      `"${o.total || 0}"`,
      `"${o.status || "pending"}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.download = `sri-udharchi-orders-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccessMessage(`Exported ${filteredOrders.length} orders to CSV.`);
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

  // Export Users to CSV
  const handleExportUsersCSV = () => {
    if (usersList.length === 0) {
      showSuccessMessage("No users available to export.");
      return;
    }

    const headers = [
      "User ID",
      "Display Name",
      "Email Address",
      "Role",
      "Company",
      "Phone",
      "Registered Date",
      "Last Login",
    ];

    const rows = filteredUsers.map((u) => [
      `"${u.id || ""}"`,
      `"${(u.displayName || "").replace(/"/g, '""')}"`,
      `"${u.email || ""}"`,
      `"${u.role || "customer"}"`,
      `"${(u.company || "").replace(/"/g, '""')}"`,
      `"${(u.phone || "").replace(/"/g, '""')}"`,
      `"${u.createdAt ? new Date(u.createdAt).toISOString() : ""}"`,
      `"${u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : ""}"`,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const dateStr = new Date().toISOString().split("T")[0];
    link.download = `sri-udharchi-users-${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showSuccessMessage(`Exported ${filteredUsers.length} users to CSV.`);
  };

  // Filtered users for the users table
  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      const matchesRole = userRoleFilter === "all" || u.role === userRoleFilter;
      const q = userSearch.toLowerCase();
      const matchesSearch =
        !userSearch ||
        u.email.toLowerCase().includes(q) ||
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.company && u.company.toLowerCase().includes(q));
      return matchesRole && matchesSearch;
    });
  }, [usersList, userRoleFilter, userSearch]);

  // Handle User Role Change
  const handleRoleChange = async (userId: string, newRole: "admin" | "staff" | "customer") => {
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

  // Password Generator Helper for New Administrators
  const generateSecurePassword = () => {
    const charset = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*";
    let pwd = "";
    const uppers = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    const lowers = "abcdefghijkmnpqrstuvwxyz";
    const nums = "23456789";
    const specials = "!@#$%&*";
    pwd += uppers[Math.floor(Math.random() * uppers.length)];
    pwd += lowers[Math.floor(Math.random() * lowers.length)];
    pwd += nums[Math.floor(Math.random() * nums.length)];
    pwd += specials[Math.floor(Math.random() * specials.length)];
    for (let i = 0; i < 8; i++) {
      pwd += charset[Math.floor(Math.random() * charset.length)];
    }
    const shuffled = pwd
      .split("")
      .sort(() => 0.5 - Math.random())
      .join("");
    setNewAdminForm((prev) => ({ ...prev, password: shuffled }));
    showSuccessMessage("Generated high-strength administrative password.");
  };

  // Create Administrator Account & Provision Login
  const handleCreateAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAdminModalError("");

    const email = newAdminForm.email.trim().toLowerCase();
    if (!email) {
      setAdminModalError("Please enter an email address for the administrator.");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      setAdminModalError("Please enter a valid email address (e.g. admin@sriudharchi.com).");
      return;
    }

    if (newAdminForm.password && newAdminForm.password.trim().length < 6) {
      setAdminModalError("Initial password must be at least 6 characters long.");
      return;
    }

    setIsCreatingAdmin(true);
    try {
      const res = await addAuthorizedAdmin({
        email,
        displayName: newAdminForm.displayName.trim() || email.split("@")[0],
        password: newAdminForm.password.trim() || undefined,
        department: newAdminForm.department.trim() || "Operations",
        phone: newAdminForm.phone.trim() || undefined,
        addedBy: user?.email || "Super Administrator",
      });

      if (!res.success) {
        setAdminModalError(res.message || "Failed to authorize administrator.");
        return;
      }

      showSuccessMessage(res.message);
      setAdminCreatedInfo({
        email,
        password: newAdminForm.password.trim() || undefined,
        displayName: newAdminForm.displayName.trim() || email.split("@")[0],
      });
      // Reset input form
      setNewAdminForm({
        email: "",
        displayName: "",
        password: "",
        department: "Operations & Field Safety",
        phone: "",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAdminModalError("Error authorizing administrator: " + msg);
    } finally {
      setIsCreatingAdmin(false);
    }
  };

  // Revoke Administrator Privileges
  const handleConfirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    try {
      await removeAuthorizedAdmin(adminToDelete.email);
      showSuccessMessage(`Administrator privileges revoked for ${adminToDelete.email}.`);
      setAdminToDelete(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showSuccessMessage("Failed to revoke privileges: " + msg);
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

  // Delete order handler
  const handleConfirmDeleteOrder = async () => {
    if (!orderToDelete?.id) return;
    try {
      await deleteOrder(orderToDelete.id);
      showSuccessMessage(`Order "${orderToDelete.orderNumber || orderToDelete.id}" deleted.`);
      setOrderToDelete(null);
      if (selectedOrder?.id === orderToDelete.id) {
        setSelectedOrder(null);
      }
    } catch (err: unknown) {
      showSuccessMessage(
        "Failed to delete order: " + (err instanceof Error ? err.message : String(err)),
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

  // Not logged in -> Show Clean Executive Admin Login View
  if (!user) {
    return <AdminLoginPage />;
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

  // Section 1: Core Operations & Commerce
  const operationsNavItems = [
    {
      id: "analytics" as const,
      label: "Operations & Analytics",
      icon: BarChart3,
      badge: null,
      urgentBadge: null,
    },
    {
      id: "products" as const,
      label: "Products Catalog",
      icon: Boxes,
      badge: products.length > 0 ? products.length : null,
      urgentBadge: null,
    },
    {
      id: "orders" as const,
      label: "Orders & Dispatches",
      icon: ShoppingBag,
      badge: orders.length > 0 ? orders.length : null,
      urgentBadge:
        orders.filter((o) => o.status === "pending").length > 0
          ? `${orders.filter((o) => o.status === "pending").length} Pending`
          : null,
    },
    {
      id: "inquiries" as const,
      label: "Customer Leads & RFQs",
      icon: Mail,
      badge: inquiries.length > 0 ? inquiries.length : null,
      urgentBadge:
        inquiries.filter((i) => i.status === "new").length > 0
          ? `${inquiries.filter((i) => i.status === "new").length} New`
          : null,
    },
  ];

  // Section 2: Administration & Configuration
  const adminNavItems = [
    {
      id: "users" as const,
      label: "Users & Staff (RBAC)",
      icon: Users,
      badge:
        authorizedAdmins.length > 0
          ? `${1 + authorizedAdmins.filter((a) => a.email.toLowerCase() !== "bhanuswaroop04@gmail.com").length} Admins`
          : usersList.length > 0
            ? usersList.length
            : null,
      urgentBadge: null,
    },
    {
      id: "settings" as const,
      label: "Business Profile & Settings",
      icon: Settings,
      badge: "GSTIN",
      urgentBadge: null,
    },
    {
      id: "system" as const,
      label: "Firebase & System Health",
      icon: Database,
      badge: "Live",
      urgentBadge: null,
    },
  ];

  // Section 3: Direct Public Portal & Storefront Navigation
  const publicQuickLinks = [
    {
      href: "/products",
      label: "Browse Products Store",
      icon: ShoppingCart,
    },
    {
      href: "/projects",
      label: "Turnkey Projects Portfolio",
      icon: FolderKanban,
    },
    {
      href: "/services",
      label: "Safety Services & AMC",
      icon: Layers,
    },
    {
      href: "/industries",
      label: "Industry Solutions",
      icon: Building2,
    },
    {
      href: "/",
      label: "Live Homepage",
      icon: Globe,
    },
  ];

  const sidebarNavItems = [...operationsNavItems, ...adminNavItems];

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* ======================================================== */}
      {/* 1. DESKTOP EXECUTIVE SIDEBAR */}
      {/* ======================================================== */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card shrink-0 sticky top-0 h-screen select-none">
        {/* Brand & Portal Header */}
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <BrandLogo />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
              Admin Portal
            </span>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-500">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Firestore</span>
            </span>
          </div>
        </div>

        {/* Navigation Links Grouped */}
        <nav className="flex-1 p-3 space-y-3.5 overflow-y-auto" aria-label="Admin Navigation">
          {/* Group 1: Operations */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Operations & Commerce
            </div>
            {operationsNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`size-4 shrink-0 ${
                        isActive ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.urgentBadge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? "bg-primary-foreground text-primary"
                            : "bg-primary/20 text-primary"
                        }`}
                      >
                        {item.urgentBadge}
                      </span>
                    )}
                    {item.badge !== null && !item.urgentBadge && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Group 2: Administration */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Administration & System
            </div>
            {adminNavItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm font-bold"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`size-4 shrink-0 ${
                        isActive ? "text-primary-foreground" : "text-primary"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {item.badge !== null && (
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          isActive
                            ? "bg-primary-foreground/20 text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Group 3: Direct Public Portal & Storefront Navigation */}
          <div className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
              Storefront & Portals
            </div>
            {publicQuickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-all"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{link.label}</span>
                  </div>
                  <ExternalLink className="size-3 opacity-50 shrink-0" />
                </a>
              );
            })}
          </div>

          {/* Dispatch Hotline Quick Widget */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-2.5 text-[11px] space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-primary text-[10px] uppercase tracking-wider">
              <Phone className="size-3" />
              <span>Dispatch Desk</span>
            </div>
            <div className="font-bold text-foreground text-xs">+91 8639858221</div>
            <div className="text-[10px] text-muted-foreground truncate">
              AP Central Depot, Visakhapatnam
            </div>
          </div>
        </nav>

        {/* Admin User Card & Sign Out Footer */}
        <div className="p-4 border-t border-border bg-muted/20 space-y-3">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
              {(user.displayName || user.email || "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-foreground truncate">
                {user.displayName || (user.email ? user.email.split("@")[0] : "Admin")}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate">
                <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                <span className="capitalize">{userProfile?.role || "Admin"}</span>
                <span className="opacity-60 truncate">({user.email})</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background py-1.5 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="size-3" />
              <span>Public Site</span>
            </a>
            <button
              type="button"
              onClick={logout}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/20 bg-destructive/10 py-1.5 text-[11px] font-semibold text-destructive hover:bg-destructive/20 transition-colors"
              title="Sign Out"
            >
              <LogOut className="size-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* 2. MOBILE RESPONSIVE SIDEBAR DRAWER */}
      {/* ======================================================== */}
      {isSidebarOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={() => setIsSidebarOpenMobile(false)}
          />
          <aside className="relative w-72 max-w-[85vw] bg-card border-r border-border z-10 flex flex-col h-full shadow-2xl">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setIsSidebarOpenMobile(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                aria-label="Close sidebar"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-3 overflow-y-auto">
              {/* Group 1: Operations */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Operations & Commerce
                </div>
                {operationsNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpenMobile(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                        isActive
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`size-4 ${
                            isActive ? "text-primary-foreground" : "text-primary"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.urgentBadge && (
                        <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold">
                          {item.urgentBadge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Group 2: Administration */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Administration & System
                </div>
                {adminNavItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsSidebarOpenMobile(false);
                      }}
                      className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold ${
                        isActive
                          ? "bg-primary text-primary-foreground font-bold shadow-sm"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon
                          className={`size-4 ${
                            isActive ? "text-primary-foreground" : "text-primary"
                          }`}
                        />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-[10px] font-bold">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Group 3: Direct Public Links */}
              <div className="space-y-1">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">
                  Storefront & Public Portals
                </div>
                {publicQuickLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-between rounded-xl px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Icon className="size-3.5 text-muted-foreground" />
                        <span className="truncate">{link.label}</span>
                      </div>
                      <ExternalLink className="size-3 opacity-50 shrink-0" />
                    </a>
                  );
                })}
              </div>
            </nav>

            <div className="p-4 border-t border-border bg-muted/20">
              <div className="text-xs font-bold text-foreground truncate">{user.email}</div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={logout}
              >
                <LogOut className="size-3.5" />
                <span>Logout</span>
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. MAIN DASHBOARD CONTENT AREA */}
      {/* ======================================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsSidebarOpenMobile(true)}
              className="lg:hidden rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Open sidebar navigation"
            >
              <Menu className="size-5" />
            </button>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-base font-bold text-foreground hidden sm:block">
                Executive Command Center
              </h1>
              <span className="text-xs text-muted-foreground hidden sm:inline">/</span>
              <span className="text-xs font-semibold text-primary capitalize">
                {activeTab === "analytics"
                  ? "Operations & Analytics"
                  : activeTab === "products"
                    ? "Products Catalog"
                    : activeTab === "orders"
                      ? "Orders & Dispatches"
                      : activeTab === "inquiries"
                        ? "Customer Leads & RFQs"
                        : activeTab === "users"
                          ? "Users & Staff"
                          : activeTab === "settings"
                            ? "Business Profile & Settings"
                            : "Firebase & System"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/" target="_blank" rel="noreferrer" className="hidden sm:flex">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <span>View Public Site</span>
                <ExternalLink className="size-3.5" />
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-destructive text-xs"
            >
              <LogOut className="size-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </header>

        {/* Main Content Body */}
        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          {/* Action Success Alert Banner */}
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

          {/* Quick Metrics KPI Bar */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            <div
              onClick={() => setActiveTab("products")}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Products in Catalog
                </span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Boxes className="size-4" />
                </div>
              </div>
              <div className="mt-2 font-display text-2xl font-black text-foreground">
                {products.length}
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                Across {categories.length} active categories
              </p>
            </div>

            <div
              onClick={() => setActiveTab("orders")}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Orders & Invoices
                </span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
                  <ShoppingBag className="size-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2 font-display text-2xl font-black text-foreground">
                <span>{orders.length}</span>
                {orders.filter((o) => o.status === "pending").length > 0 && (
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-500">
                    {orders.filter((o) => o.status === "pending").length} Pending
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                ₹{orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString("en-IN")} total volume
              </p>
            </div>

            <div
              onClick={() => setActiveTab("inquiries")}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Customer Leads
                </span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Mail className="size-4" />
                </div>
              </div>
              <div className="mt-2 flex items-baseline gap-2 font-display text-2xl font-black text-foreground">
                <span>{inquiries.length}</span>
                {inquiries.filter((i) => i.status === "new").length > 0 && (
                  <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                    {inquiries.filter((i) => i.status === "new").length} New
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {inquiries.filter((i) => i.status === "contacted").length} in active communication
              </p>
            </div>

            <div
              onClick={() => setActiveTab("system")}
              className="group cursor-pointer rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:border-success/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Database & Cloud
                </span>
                <div className="flex size-8 items-center justify-center rounded-lg bg-success/10 text-success transition-transform group-hover:scale-110">
                  <Database className="size-4" />
                </div>
              </div>
              <div className="mt-2 text-xs font-mono font-bold text-foreground truncate">
                {firebaseConfig.projectId}
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-success font-semibold">
                <span className="size-1.5 rounded-full bg-success animate-pulse" />
                <span>Live Firestore Online</span>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TAB 1: OPERATIONS & CHARTS ANALYTICS */}
          {/* ======================================================== */}
          {activeTab === "analytics" && (
            <div>
              <AdminAnalytics
                products={products}
                inquiries={inquiries}
                usersList={usersList}
                categories={categories}
                orders={orders}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenAddProduct={() => {
                  setActiveTab("products");
                  setInitialCreateOpen(true);
                }}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: PRODUCTS CATALOG MANAGEMENT */}
          {/* ======================================================== */}
          {activeTab === "products" && (
            <div>
              <ProductManager
                products={products}
                categories={categories}
                onNotify={showSuccessMessage}
                initialCreateOpen={initialCreateOpen}
              />
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: CUSTOMER ORDERS & INVOICES (LIVE FIRESTORE) */}
          {/* ======================================================== */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Customer Orders & Dispatches
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Real-time customer transactions placed via checkout. Manage fulfillment, status, and print proforma invoices.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportOrdersCSV}
                    className="gap-1.5 text-xs"
                    title="Export all orders as CSV spreadsheet"
                  >
                    <Download className="size-3.5" />
                    <span>Export CSV</span>
                  </Button>
                </div>
              </div>

              {/* Filter Bar */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-12">
                  {/* Search Bar */}
                  <div className="relative sm:col-span-2 lg:col-span-5">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by order #, customer name, phone, or company..."
                      value={orderSearch}
                      onChange={(e) => setOrderSearch(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                    {orderSearch && (
                      <button
                        type="button"
                        onClick={() => setOrderSearch("")}
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
                        { id: "all", label: "All", count: orders.length },
                        {
                          id: "pending",
                          label: "Pending",
                          count: orders.filter((o) => o.status === "pending").length,
                        },
                        {
                          id: "confirmed",
                          label: "Confirmed",
                          count: orders.filter((o) => o.status === "confirmed").length,
                        },
                        {
                          id: "dispatched",
                          label: "Dispatched",
                          count: orders.filter((o) => o.status === "dispatched").length,
                        },
                        {
                          id: "delivered",
                          label: "Delivered",
                          count: orders.filter((o) => o.status === "delivered").length,
                        },
                      ] as const
                    ).map((filter) => (
                      <button
                        key={filter.id}
                        type="button"
                        onClick={() => setOrderStatusFilter(filter.id)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                          orderStatusFilter === filter.id
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
                      value={orderSortOrder}
                      onChange={(e) =>
                        setOrderSortOrder(e.target.value as "newest" | "oldest" | "amount")
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      <option value="newest">Sort: Newest First</option>
                      <option value="oldest">Sort: Oldest First</option>
                      <option value="amount">Sort: Total Amount (High to Low)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3">Order Ref</th>
                        <th className="px-5 py-3">Customer Information</th>
                        <th className="px-5 py-3">Delivery Site</th>
                        <th className="px-5 py-3">Invoiced Total</th>
                        <th className="px-5 py-3">Fulfillment Status</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                            <div className="mx-auto max-w-sm">
                              <ShoppingBag className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                              <div className="font-bold text-foreground text-sm">
                                {orders.length === 0
                                  ? "No Customer Orders Placed Yet"
                                  : "No Orders Match Active Filters"}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                {orders.length === 0
                                  ? "Live orders placed by clients through the checkout portal stream directly into this dashboard in real-time."
                                  : "Try clearing your search query or switching the status filter to 'All'."}
                              </p>
                              {orders.length === 0 && (
                                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                  <span className="size-1.5 rounded-full bg-emerald-500" />
                                  <span>Live Firestore listener active on /orders</span>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => (
                          <tr
                            key={ord.id || ord.orderNumber}
                            className="hover:bg-muted/30 transition-colors"
                          >
                            <td className="px-5 py-4">
                              <div className="font-mono font-bold text-foreground">
                                {ord.orderNumber || ord.id}
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="size-3" />
                                <span>
                                  {ord.createdAt
                                    ? new Date(ord.createdAt).toLocaleDateString()
                                    : "Recent"}
                                </span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="font-bold text-foreground">{ord.customerName}</div>
                              {ord.companyName && (
                                <div className="text-[11px] font-semibold text-primary truncate max-w-[200px]">
                                  🏢 {ord.companyName}
                                </div>
                              )}
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <Phone className="size-3 text-primary" />
                                <a href={`tel:${ord.customerPhone}`} className="hover:underline">
                                  {ord.customerPhone}
                                </a>
                              </div>
                            </td>

                            <td className="px-5 py-4 text-xs">
                              <div className="max-w-xs text-muted-foreground line-clamp-2">
                                {ord.shippingAddress}
                              </div>
                              <div className="mt-1 text-[11px] uppercase font-semibold text-foreground">
                                Payment: <span className="text-primary font-bold">{ord.paymentMethod}</span>
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <div className="font-display font-black text-foreground text-base">
                                ₹{ord.total?.toLocaleString("en-IN")}
                              </div>
                              <div className="text-[11px] text-muted-foreground">
                                {ord.items?.length || 0} item{ord.items?.length === 1 ? "" : "s"}
                              </div>
                            </td>

                            <td className="px-5 py-4">
                              <select
                                value={ord.status || "pending"}
                                onChange={async (e) => {
                                  if (!ord.id) return;
                                  const nextStatus = e.target.value as OrderItem["status"];
                                  await updateOrderStatus(ord.id, nextStatus);
                                  showSuccessMessage(`Order updated to "${nextStatus.toUpperCase()}".`);
                                }}
                                className={`rounded-md px-2.5 py-1 text-xs font-bold border ${
                                  ord.status === "pending"
                                    ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                                    : ord.status === "confirmed"
                                      ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400"
                                      : ord.status === "dispatched"
                                        ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400"
                                        : ord.status === "delivered"
                                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                          : "bg-destructive/10 border-destructive text-destructive"
                                }`}
                              >
                                <option value="pending">Pending Review</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="dispatched">Dispatched</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>

                            <td className="px-5 py-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder(ord)}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  title="View Proforma Invoice"
                                  aria-label={`View invoice for order ${ord.orderNumber}`}
                                >
                                  <Eye className="size-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setOrderToDelete(ord)}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                  title="Delete Order"
                                  aria-label={`Delete order ${ord.orderNumber}`}
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

              {/* ORDER DETAILS & PROFORMA INVOICE MODAL */}
              {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display text-lg font-bold text-foreground">
                            Proforma Invoice & Order Summary
                          </h3>
                          <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-xs font-bold text-primary">
                            {selectedOrder.orderNumber || selectedOrder.id}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Order Date:{" "}
                          {selectedOrder.createdAt
                            ? new Date(selectedOrder.createdAt).toLocaleString()
                            : "Recent"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedOrder(null)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                        aria-label="Close modal"
                      >
                        <X className="size-5" />
                      </button>
                    </div>

                    <div className="mt-4 space-y-4 text-xs">
                      {/* Customer & Shipping Details */}
                      <div className="grid gap-3 sm:grid-cols-2 rounded-xl border border-border bg-muted/20 p-4">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Customer Information
                          </span>
                          <div className="mt-1 font-bold text-foreground text-sm">
                            {selectedOrder.customerName}
                          </div>
                          {selectedOrder.companyName && (
                            <div className="font-semibold text-primary">
                              🏢 {selectedOrder.companyName}
                            </div>
                          )}
                          {selectedOrder.gstin && (
                            <div className="text-muted-foreground">GSTIN: {selectedOrder.gstin}</div>
                          )}
                          <div className="mt-1 flex items-center gap-2">
                            <a
                              href={`tel:${selectedOrder.customerPhone}`}
                              className="font-mono text-primary hover:underline"
                            >
                              {selectedOrder.customerPhone}
                            </a>
                            <span>•</span>
                            <a
                              href={`mailto:${selectedOrder.customerEmail}`}
                              className="text-muted-foreground hover:underline"
                            >
                              {selectedOrder.customerEmail}
                            </a>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            Delivery Destination
                          </span>
                          <p className="mt-1 leading-relaxed text-foreground">
                            {selectedOrder.shippingAddress}
                          </p>
                          <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                            Payment Mode:{" "}
                            <span className="uppercase font-bold text-primary">
                              {selectedOrder.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Itemized Table */}
                      <div className="rounded-xl border border-border overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                            <tr>
                              <th className="p-3">Item Description</th>
                              <th className="p-3 text-center">Qty</th>
                              <th className="p-3 text-right">Unit Price</th>
                              <th className="p-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {selectedOrder.items?.map((item, idx) => (
                              <tr key={idx} className="hover:bg-muted/10">
                                <td className="p-3 font-medium text-foreground">{item.name}</td>
                                <td className="p-3 text-center text-muted-foreground">
                                  {item.quantity}
                                </td>
                                <td className="p-3 text-right text-muted-foreground">
                                  ₹{item.price?.toLocaleString("en-IN")}
                                </td>
                                <td className="p-3 text-right font-bold text-foreground">
                                  ₹{(item.price * item.quantity)?.toLocaleString("en-IN")}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Totals Summary */}
                      <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-xs">
                        <div className="flex justify-between text-muted-foreground">
                          <span>Subtotal</span>
                          <span className="font-medium text-foreground">
                            ₹{selectedOrder.subtotal?.toLocaleString("en-IN")}
                          </span>
                        </div>
                        {selectedOrder.discount > 0 && (
                          <div className="flex justify-between text-emerald-600 font-semibold">
                            <span>Promotional Discount</span>
                            <span>-₹{selectedOrder.discount?.toLocaleString("en-IN")}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-muted-foreground">
                          <span>Statutory GST (18%)</span>
                          <span className="font-medium text-foreground">
                            ₹{selectedOrder.gst?.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between text-muted-foreground">
                          <span>Freight & Handling</span>
                          <span className="font-medium text-foreground">
                            {selectedOrder.shipping === 0
                              ? "FREE"
                              : `₹${selectedOrder.shipping?.toLocaleString("en-IN")}`}
                          </span>
                        </div>
                        <div className="border-t border-border pt-2 flex justify-between items-baseline font-bold text-sm">
                          <span className="text-foreground">Total Invoiced Amount</span>
                          <span className="font-display text-lg text-primary font-black">
                            ₹{selectedOrder.total?.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-between items-center gap-2 border-t border-border pt-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.print()}
                          className="gap-1.5"
                        >
                          <Printer className="size-3.5" />
                          <span>Print Invoice</span>
                        </Button>
                        <a
                          href={`https://wa.me/91${selectedOrder.customerPhone?.replace(/\D/g, "")}?text=${encodeURIComponent(
                            `Hello ${selectedOrder.customerName}, this is Sri Udharchi Enterprises confirming your order #${selectedOrder.orderNumber} for ₹${selectedOrder.total?.toLocaleString("en-IN")}.`,
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Button size="sm" variant="secondary" className="gap-1.5 text-xs">
                            <Phone className="size-3.5" />
                            <span>WhatsApp Customer</span>
                          </Button>
                        </a>
                      </div>

                      <Button variant="outline" size="sm" onClick={() => setSelectedOrder(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* DELETE ORDER MODAL */}
              {orderToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/15 text-destructive">
                        <AlertTriangle className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-foreground">
                          Delete Customer Order?
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          This action will permanently delete order #
                          {orderToDelete.orderNumber || orderToDelete.id} from Firestore.
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-xs">
                      <div>
                        <strong>Customer:</strong> {orderToDelete.customerName}
                      </div>
                      <div className="mt-1 text-muted-foreground">
                        <strong>Amount:</strong> ₹{orderToDelete.total?.toLocaleString("en-IN")} •{" "}
                        <strong>Status:</strong> {orderToDelete.status}
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setOrderToDelete(null)}>
                        Cancel
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleConfirmDeleteOrder}>
                        Delete Permanently
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: CUSTOMER LEADS & INQUIRIES */}
          {/* ======================================================== */}
          {activeTab === "inquiries" && (
            <div className="space-y-6">
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
                          <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                            <div className="mx-auto max-w-sm">
                              <Mail className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                              <div className="font-bold text-foreground text-sm">
                                {inquiries.length === 0
                                  ? "No Customer Leads Yet"
                                  : "No Leads Match Active Filters"}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                {inquiries.length === 0
                                  ? "New quotation requests and contact form submissions stream directly from the public website into this dashboard."
                                  : "Try clearing your search query or switching the status filter to 'All'."}
                              </p>
                              {inquiries.length === 0 && (
                                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                                  <span className="size-1.5 rounded-full bg-primary" />
                                  <span>Live Firestore listener active on /inquiries</span>
                                </div>
                              )}
                            </div>
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

          {/* ======================================================== */}
          {/* TAB 5: USERS & STAFF ACCESS (RBAC) */}
          {/* ======================================================== */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Users & Executive Access Management
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Create executive administrators, provision login accounts, and manage client and staff permissions.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => {
                      setAdminModalError("");
                      setAdminCreatedInfo(null);
                      setIsAddAdminModalOpen(true);
                    }}
                    className="gap-2 text-xs h-9 bg-primary text-primary-foreground font-semibold shadow-sm hover:bg-primary/90 cursor-pointer"
                  >
                    <UserPlus className="size-4" />
                    <span>+ Add Administrator</span>
                  </Button>
                </div>
              </div>

              {/* Executive Administrators & Command Staff Card */}
              <div className="overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-b from-primary/5 via-card to-card p-5 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-xs">
                      <ShieldCheck className="size-5" />
                    </div>
                    <div>
                      <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-2">
                        <span>Authorized Executive Administrators</span>
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {1 + authorizedAdmins.filter((a) => a.email.toLowerCase() !== "bhanuswaroop04@gmail.com").length} Active
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Personnel granted executive command over catalog, order dispatch, RFQs, and access control.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setAdminModalError("");
                      setAdminCreatedInfo(null);
                      setIsAddAdminModalOpen(true);
                    }}
                    className="text-xs h-8 gap-1.5 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 shrink-0 cursor-pointer"
                  >
                    <UserPlus className="size-3.5" />
                    <span>Create Admin Login</span>
                  </Button>
                </div>

                {/* Admins Grid / List */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {/* Primary Super Administrator (Bhanu Swaroop) */}
                  <div className="relative flex flex-col justify-between rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 transition-shadow hover:shadow-xs">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="flex size-9 items-center justify-center rounded-full bg-amber-500 text-white font-bold text-xs shadow-xs shrink-0">
                            <Crown className="size-4.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 font-bold text-foreground text-xs">
                              <span>Bhanu Swaroop</span>
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-700 dark:text-amber-400">
                                ROOT
                              </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono truncate">
                              bhanuswaroop04@gmail.com
                            </div>
                          </div>
                        </div>
                        <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 shrink-0">
                          Super Admin
                        </span>
                      </div>

                      <div className="mt-3 space-y-1 text-[11px] text-muted-foreground border-t border-amber-500/10 pt-2.5">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground/80">Department:</span>
                          <span className="font-semibold text-primary">Platform & Security Root</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-foreground/80">Access Level:</span>
                          <span className="font-semibold text-foreground">Unrestricted Command</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3.5 pt-2 border-t border-amber-500/15 flex items-center justify-between text-[10px]">
                      <span className="text-muted-foreground italic">Protected root administrator</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <ShieldCheck className="size-3" />
                        <span>System Locked</span>
                      </span>
                    </div>
                  </div>

                  {/* Provisioned Additional Administrators */}
                  {authorizedAdmins
                    .filter((a) => a.email.toLowerCase() !== "bhanuswaroop04@gmail.com")
                    .map((admin) => (
                      <div
                        key={admin.id || admin.email}
                        className="relative flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-primary/40 hover:shadow-xs"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs shrink-0">
                                {(admin.displayName || admin.email).charAt(0).toUpperCase()}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-foreground text-xs truncate">
                                  {admin.displayName || admin.email.split("@")[0]}
                                </div>
                                <div className="text-[11px] text-muted-foreground font-mono truncate">
                                  {admin.email}
                                </div>
                              </div>
                            </div>
                            <span className="rounded-full bg-primary/10 border border-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary shrink-0">
                              Admin
                            </span>
                          </div>

                          <div className="mt-3 space-y-1 text-[11px] text-muted-foreground border-t border-border/60 pt-2.5">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-foreground/80">Unit:</span>
                              <span className="font-semibold text-foreground truncate max-w-[140px]">
                                {admin.department || "Operations"}
                              </span>
                            </div>
                            {admin.phone && (
                              <div className="flex items-center justify-between">
                                <span className="font-medium text-foreground/80">Phone:</span>
                                <span className="font-mono text-muted-foreground">{admin.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-[10px]">
                              <span>Added by:</span>
                              <span className="truncate max-w-[120px] text-muted-foreground">
                                {admin.addedBy || "Super Admin"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3.5 pt-2 border-t border-border/60 flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() =>
                              copyToClipboard(
                                `Sri Udharchi Enterprises Admin Portal\nURL: ${typeof window !== "undefined" ? window.location.origin : ""}/admin/login\nEmail: ${admin.email}${admin.initialPassword ? `\nPassword: ${admin.initialPassword}` : ""}`,
                                `Credentials for ${admin.email}`,
                              )
                            }
                            className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="size-3" />
                            <span>Copy Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setAdminToDelete(admin)}
                            className="text-[11px] font-semibold text-destructive/80 hover:text-destructive flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Trash2 className="size-3" />
                            <span>Revoke</span>
                          </button>
                        </div>
                      </div>
                    ))}
                </div>

                {authorizedAdmins.filter((a) => a.email.toLowerCase() !== "bhanuswaroop04@gmail.com").length === 0 && (
                  <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No additional secondary administrators provisioned yet. Click{" "}
                      <span className="font-semibold text-foreground">"+ Add Administrator"</span> above to grant administrative privileges to team members by entering their email address.
                    </p>
                  </div>
                )}
              </div>

              {/* Users Filter Bar */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by user email, name, company, or phone..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto">
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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportUsersCSV}
                      className="text-xs h-8 gap-1.5 shrink-0"
                    >
                      <Download className="size-3.5" />
                      <span>Export CSV</span>
                    </Button>
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
                        <th className="px-5 py-3">Email & Contact</th>
                        <th className="px-5 py-3">Role</th>
                        <th className="px-5 py-3">Activity & Logins</th>
                        <th className="px-5 py-3 text-right">Change Role</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-5 py-16 text-center text-muted-foreground">
                            <div className="mx-auto max-w-sm">
                              <Users className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                              <div className="font-bold text-foreground text-sm">
                                {usersList.length === 0
                                  ? "No Users Registered in Firestore"
                                  : "No Users Match Current Filters"}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                {usersList.length === 0
                                  ? "New user signups through the client login portal will automatically register here."
                                  : "Try clearing the search query or selecting 'All Users'."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSelf = user?.uid === u.id || user?.email === u.email;
                          return (
                            <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                                    {(u.displayName || u.email || "U").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                                      <span className="truncate">
                                        {u.displayName || (u.email ? u.email.split("@")[0] : "User")}
                                      </span>
                                      {isSelf && (
                                        <span className="rounded bg-primary/20 px-1.5 py-0.2 text-[10px] font-bold text-primary">
                                          You
                                        </span>
                                      )}
                                    </div>
                                    {u.company && (
                                      <div className="text-[11px] font-semibold text-primary truncate">
                                        🏢 {u.company}
                                      </div>
                                    )}
                                    <div className="font-mono text-[10px] text-muted-foreground truncate">
                                      {u.id}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 text-xs">
                                <div className="font-medium text-foreground">{u.email}</div>
                                {u.phone ? (
                                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Phone className="size-3 text-primary" />
                                    <span>{u.phone}</span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-muted-foreground/60 italic">No phone saved</div>
                                )}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                    u.role === "admin"
                                      ? "bg-primary/10 text-primary border border-primary/20"
                                      : u.role === "staff"
                                        ? "bg-secondary/20 text-foreground border border-border"
                                        : "bg-muted text-muted-foreground border border-border"
                                  }`}
                                >
                                  {u.role.toUpperCase()}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs">
                                <div className="text-foreground">
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Last Login:</span>
                                  {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Pre-tracking"}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">Created:</span>
                                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "Recent"}
                                </div>
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
                    Full control over Firestore products catalog, customer leads management, user roles assignment, and portal operations.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 font-bold text-xs text-foreground">
                    <UserCheck className="size-4" />
                    <span>Staff / Technician</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Authorized to review quotation inquiries, update lead status, and view product specifications and pricing.
                  </p>
                </div>

                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 font-bold text-xs text-muted-foreground">
                    <Users className="size-4" />
                    <span>Viewer / Customer</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Standard account permissions with read access restricted according to Firestore security rules.
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

              {/* Create Administrator Login Modal */}
              {isAddAdminModalOpen && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                  onClick={() => {
                    if (!isCreatingAdmin) {
                      setIsAddAdminModalOpen(false);
                      setAdminCreatedInfo(null);
                    }
                  }}
                >
                  <div
                    className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {!adminCreatedInfo ? (
                      <form onSubmit={handleCreateAdminSubmit} className="space-y-4">
                        <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                              <UserPlus className="size-5" />
                            </div>
                            <div>
                              <h3 className="font-display text-base font-bold text-foreground">
                                Add Executive Administrator
                              </h3>
                              <p className="text-xs text-muted-foreground">
                                Provision a login account with full administrative privileges.
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAddAdminModalOpen(false)}
                            className="text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            <X className="size-5" />
                          </button>
                        </div>

                        {adminModalError && (
                          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
                            <AlertTriangle className="size-4 shrink-0 mt-0.5" />
                            <span>{adminModalError}</span>
                          </div>
                        )}

                        <div className="space-y-3 text-xs">
                          {/* Administrator Email Address */}
                          <div>
                            <label className="block font-semibold text-foreground mb-1">
                              Administrator Email Address <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                              <input
                                type="email"
                                required
                                placeholder="e.g. colleague@sriudharchi.com or colleague@gmail.com"
                                value={newAdminForm.email}
                                onChange={(e) =>
                                  setNewAdminForm((prev) => ({ ...prev, email: e.target.value }))
                                }
                                className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                              />
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              This email will have full executive portal access authorized.
                            </p>
                          </div>

                          {/* Full Name */}
                          <div>
                            <label className="block font-semibold text-foreground mb-1">
                              Full Name / Display Title
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. Ramesh Kumar (Lead Safety Engineer)"
                              value={newAdminForm.displayName}
                              onChange={(e) =>
                                setNewAdminForm((prev) => ({ ...prev, displayName: e.target.value }))
                              }
                              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                            />
                          </div>

                          {/* Initial Password */}
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <label className="font-semibold text-foreground">
                                Initial Password (Optional / Auto-provision)
                              </label>
                              <button
                                type="button"
                                onClick={generateSecurePassword}
                                className="text-[11px] font-semibold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Sparkles className="size-3" />
                                <span>Generate Password</span>
                              </button>
                            </div>
                            <div className="relative">
                              <Key className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                              <input
                                type={showAdminPassword ? "text" : "password"}
                                placeholder="Enter password or click 'Generate Password' (min 6 chars)"
                                value={newAdminForm.password}
                                onChange={(e) =>
                                  setNewAdminForm((prev) => ({ ...prev, password: e.target.value }))
                                }
                                className="w-full rounded-xl border border-input bg-background pl-9 pr-10 py-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowAdminPassword(!showAdminPassword)}
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                              >
                                {showAdminPassword ? (
                                  <EyeOff className="size-4" />
                                ) : (
                                  <Eye className="size-4" />
                                )}
                              </button>
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                              If provided, a Firebase Auth account is created automatically so they can sign in via email and password. They can also use "Continue with Google" if this is a Google email.
                            </p>
                          </div>

                          {/* Department / Operational Unit */}
                          <div>
                            <label className="block font-semibold text-foreground mb-1">
                              Department / Branch
                            </label>
                            <select
                              value={newAdminForm.department}
                              onChange={(e) =>
                                setNewAdminForm((prev) => ({ ...prev, department: e.target.value }))
                              }
                              className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                            >
                              <option value="Operations & Field Safety">Operations & Field Safety</option>
                              <option value="Fire Protection Engineering">Fire Protection Engineering</option>
                              <option value="Hydrant & Piping Systems">Hydrant & Piping Systems</option>
                              <option value="Safety Audits & Compliance">Safety Audits & Compliance</option>
                              <option value="Procurement & Depots">Procurement & Depots</option>
                              <option value="Executive Management">Executive Management</option>
                            </select>
                          </div>

                          {/* Contact Phone */}
                          <div>
                            <label className="block font-semibold text-foreground mb-1">
                              Phone / WhatsApp (Optional)
                            </label>
                            <div className="relative">
                              <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                              <input
                                type="tel"
                                placeholder="+91 98765 43210"
                                value={newAdminForm.phone}
                                onChange={(e) =>
                                  setNewAdminForm((prev) => ({ ...prev, phone: e.target.value }))
                                }
                                className="w-full rounded-xl border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-2 border-t border-border pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={isCreatingAdmin}
                            onClick={() => setIsAddAdminModalOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={isCreatingAdmin}
                            className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 gap-1.5 cursor-pointer"
                          >
                            {isCreatingAdmin ? (
                              <>
                                <RefreshCw className="size-3.5 animate-spin" />
                                <span>Authorizing Admin...</span>
                              </>
                            ) : (
                              <>
                                <ShieldCheck className="size-3.5" />
                                <span>Authorize & Create Admin</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </form>
                    ) : (
                      /* Success Credentials Display */
                      <div className="space-y-4">
                        <div className="text-center">
                          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-2">
                            <CheckCircle2 className="size-7" />
                          </div>
                          <h3 className="font-display text-base font-bold text-foreground">
                            Administrator Login Created!
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {adminCreatedInfo.displayName} has been granted executive portal access.
                          </p>
                        </div>

                        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3 text-xs">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              Admin Login Portal
                            </span>
                            <div className="flex items-center justify-between font-mono font-semibold text-foreground mt-0.5">
                              <span className="truncate">
                                {typeof window !== "undefined"
                                  ? `${window.location.origin}/admin/login`
                                  : "/admin/login"}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    typeof window !== "undefined"
                                      ? `${window.location.origin}/admin/login`
                                      : "/admin/login",
                                    "Portal URL",
                                  )
                                }
                                className="text-primary hover:underline ml-2 cursor-pointer shrink-0"
                              >
                                <Copy className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="border-t border-emerald-500/15 pt-2">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">
                              Email Address
                            </span>
                            <div className="flex items-center justify-between font-mono font-semibold text-foreground mt-0.5">
                              <span>{adminCreatedInfo.email}</span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(adminCreatedInfo.email, "Admin Email")}
                                className="text-primary hover:underline ml-2 cursor-pointer shrink-0"
                              >
                                <Copy className="size-3.5" />
                              </button>
                            </div>
                          </div>

                          {adminCreatedInfo.password && (
                            <div className="border-t border-emerald-500/15 pt-2">
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                Temporary Password
                              </span>
                              <div className="flex items-center justify-between font-mono font-bold text-primary mt-0.5">
                                <span>{adminCreatedInfo.password}</span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    copyToClipboard(adminCreatedInfo.password!, "Admin Password")
                                  }
                                  className="text-primary hover:underline ml-2 cursor-pointer shrink-0"
                                >
                                  <Copy className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        <Button
                          variant="outline"
                          onClick={() => {
                            const origin = typeof window !== "undefined" ? window.location.origin : "";
                            const message = `*Sri Udharchi Enterprises - Administrator Login*\nPortal URL: ${origin}/admin/login\nEmail: ${adminCreatedInfo.email}${adminCreatedInfo.password ? `\nTemporary Password: ${adminCreatedInfo.password}` : "\nSign-in: Continue with Google using this email"}`;
                            copyToClipboard(message, "All Login Credentials");
                          }}
                          className="w-full text-xs font-semibold gap-2 border-primary/30 text-primary hover:bg-primary/5 cursor-pointer"
                        >
                          <Copy className="size-3.5" />
                          <span>Copy Complete Credentials Message</span>
                        </Button>

                        <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setAdminCreatedInfo(null);
                              setIsAddAdminModalOpen(true);
                            }}
                          >
                            + Add Another Admin
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setAdminCreatedInfo(null);
                              setIsAddAdminModalOpen(false);
                            }}
                            className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
                          >
                            Done
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Revoke Administrator Confirmation Modal */}
              {adminToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                  <div className="w-full max-w-md rounded-2xl border border-destructive/40 bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-destructive/20 text-destructive shrink-0">
                        <AlertTriangle className="size-5" />
                      </div>
                      <div>
                        <h3 className="font-display text-base font-bold text-foreground">
                          Revoke Administrator Access?
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1">
                          Are you sure you want to revoke administrative privileges for{" "}
                          <strong className="text-foreground">{adminToDelete.email}</strong>? They will immediately lose access to this portal.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAdminToDelete(null)}
                      >
                        Keep Admin Access
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleConfirmDeleteAdmin}
                      >
                        Revoke Access
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: BUSINESS PROFILE & SETTINGS */}
          {/* ======================================================== */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Business Profile & Statutory Configuration
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Legal registration, GSTIN, dispatch hotlines, and wire settlement details for formal quotations.
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    copyToClipboard(
                      `Sri Udharchi Enterprises\nGSTIN: 37AAEFU1234F1Z5\nState: Andhra Pradesh (Code 37)\nBank: State Bank of India\nA/C No: 398582210012\nIFSC: SBIN0001234\nHotline: +91 8639858221`,
                      "All Billing Details",
                    );
                    showSuccessMessage("Copied enterprise billing credentials to clipboard!");
                  }}
                  className="gap-1.5 text-xs"
                >
                  <Copy className="size-3.5 text-primary" />
                  <span>
                    {copiedText === "All Billing Details" ? "Copied!" : "Copy Full Billing Pack"}
                  </span>
                </Button>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* 1. Corporate Identity & Legal Registration */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Building2 className="size-4 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Enterprise Legal Identity
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Registered Entity</span>
                      <span className="font-bold text-foreground">Sri Udharchi Enterprises</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Sector & Specialization</span>
                      <span className="font-semibold text-foreground">Turnkey Fire & Industrial Safety</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">State Jurisdiction</span>
                      <span className="font-semibold text-foreground">Andhra Pradesh, India</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Operating Code Standards</span>
                      <span className="font-mono font-bold text-primary">IS 15683 / NBC 2016 / PESO</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Primary Depot Hub</span>
                      <span className="font-semibold text-foreground">Visakhapatnam Central Depot</span>
                    </div>
                  </div>
                </div>

                {/* 2. Statutory Taxation & GSTIN Details */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <CreditCard className="size-4 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Statutory Taxation & Billing (GSTIN)
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">GSTIN (Andhra Pradesh)</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">37AAEFU1234F1Z5</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("37AAEFU1234F1Z5", "GSTIN")}
                          className="text-primary hover:opacity-80"
                          title="Copy GSTIN"
                        >
                          {copiedText === "GSTIN" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">State Code</span>
                      <span className="font-mono font-bold text-foreground">37 (Andhra Pradesh)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Safety Hardware Tax Slab</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">18% GST (CGST 9% + SGST 9%)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Permanent Account Number (PAN)</span>
                      <span className="font-mono text-foreground">AAEFU1234F</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Invoicing Format</span>
                      <span className="font-semibold text-foreground">B2B Tax Invoice with HSN Summary</span>
                    </div>
                  </div>
                </div>

                {/* 3. Dispatch Hotline & Technical Support Communication */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Phone className="size-4 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Official Communication & Dispatch Hotlines
                    </h3>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20">
                      <div>
                        <div className="font-bold text-foreground">Primary Dispatch Line</div>
                        <div className="text-[11px] text-muted-foreground">Order dispatches, AMC calls & site audits</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="tel:+918639858221"
                          className="font-mono font-bold text-primary hover:underline"
                        >
                          +91 8639858221
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("+918639858221", "Phone 1")}
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                        >
                          {copiedText === "Phone 1" ? <Check className="size-3" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20">
                      <div>
                        <div className="font-bold text-foreground">Secondary Technical Desk</div>
                        <div className="text-[11px] text-muted-foreground">Pump automation, hydrants & NOC support</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="tel:+919030609171"
                          className="font-mono font-bold text-primary hover:underline"
                        >
                          +91 9030609171
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("+919030609171", "Phone 2")}
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                        >
                          {copiedText === "Phone 2" ? <Check className="size-3" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20">
                      <div>
                        <div className="font-bold text-foreground">Official RFQ Mailbox</div>
                        <div className="text-[11px] text-muted-foreground">Formal quotations & commercial proposals</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href="mailto:info@udharchienterprises.com"
                          className="font-mono font-bold text-primary hover:underline text-[11px]"
                        >
                          info@udharchienterprises.com
                        </a>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("info@udharchienterprises.com", "Email")}
                          className="p-1 rounded text-muted-foreground hover:text-foreground"
                        >
                          {copiedText === "Email" ? <Check className="size-3" /> : <Copy className="size-3" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Banking & RTGS / NEFT Wire Settlement */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <IndianRupee className="size-4 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground">
                      B2B Settlement & Banking Credentials
                    </h3>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Account Holder</span>
                      <span className="font-bold text-foreground">Sri Udharchi Enterprises</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Bank Name</span>
                      <span className="font-semibold text-foreground">State Bank of India (SBI)</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Current Account No.</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground">398582210012</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("398582210012", "Account No")}
                          className="text-primary hover:opacity-80"
                        >
                          {copiedText === "Account No" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">IFSC Code</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary">SBIN0001234</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("SBIN0001234", "IFSC")}
                          className="text-primary hover:opacity-80"
                        >
                          {copiedText === "IFSC" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">UPI Virtual ID</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-foreground">8639858221@ybl</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard("8639858221@ybl", "UPI")}
                          className="text-primary hover:opacity-80"
                        >
                          {copiedText === "UPI" ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Regional Warehouses & Storage Depots */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4 md:col-span-2">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Truck className="size-4 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Authorized Regional Depots & Logistics Gateways (Andhra Pradesh)
                    </h3>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 text-xs">
                    <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <MapPin className="size-3.5 text-primary" />
                        <span>Visakhapatnam Central Depot</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Autonagar Industrial Estate, Gajuwaka Zone, Visakhapatnam, AP - 530012. Primary dispatch center for fire pumps, hydrant valves, and heavy equipment.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <MapPin className="size-3.5 text-primary" />
                        <span>Mangalagiri Hub (Amaravati)</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Express Logistics Corridor, Mangalagiri, Guntur/Vijayawada Corridor, AP - 522503. Rapid distribution of ISI fire extinguishers and PPE gear.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <MapPin className="size-3.5 text-primary" />
                        <span>Rayalaseema & Sri City Hub</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Renigunta Road Industrial Corridor, Tirupati, AP - 517506. Servicing automotive vendor parks, electronics manufacturing, and southern industrial corridors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 6: FIREBASE & SYSTEM OVERVIEW */}
          {/* ======================================================== */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Firebase Project & Cloud Infrastructure
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Live production connection to Google Cloud Firestore and Firebase services.
                  </p>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleTestLatency}
                  disabled={latencyTesting}
                  className="gap-1.5 text-xs"
                >
                  <Activity className={`size-3.5 ${latencyTesting ? "animate-spin" : "text-emerald-500"}`} />
                  <span>{latencyTesting ? "Pinging Firestore..." : "Test Database Latency"}</span>
                </Button>
              </div>

              {latencyResult && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>{latencyResult}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLatencyResult(null)}
                    className="opacity-70 hover:opacity-100"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              )}

              <div className="grid gap-6 md:grid-cols-2">
                {/* Credentials */}
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

                {/* Collections Live Document Monitor */}
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
                        col: "orders",
                        count: orders.length,
                        desc: "Customer equipment purchase orders & invoices",
                      },
                      {
                        col: "inquiries",
                        count: inquiries.length,
                        desc: "Customer leads & quotation requests",
                      },
                      {
                        col: "users",
                        count: usersList.length,
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
                              {c.count} document{c.count === 1 ? "" : "s"}
                            </span>
                          </div>
                          <div className="text-muted-foreground mt-0.5">{c.desc}</div>
                        </div>
                        <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-bold text-success flex items-center gap-1">
                          <span className="size-1 rounded-full bg-success animate-pulse" />
                          <span>Active Stream</span>
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
    </div>
  );
}
