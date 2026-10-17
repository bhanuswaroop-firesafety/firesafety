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
  subscribeLeads,
  subscribeFeedback,
  subscribeReminders,
  markReminderCompleted,
  processDueRemindersFallback,
  subscribeShippingSettings,
  updateShippingSettings,
  DEFAULT_SHIPPING_SETTINGS,
  subscribeSocialSettings,
  updateSocialSettings,
  DEFAULT_SOCIAL_SETTINGS,
  subscribeContactSettings,
  updateContactSettings,
  DEFAULT_CONTACT_SETTINGS,
} from "@/lib/db-service";
import type {
  ProductItem,
  InquiryItem,
  UserItem,
  LeadItem,
  CategoryItem,
  OrderItem,
  AuthorizedAdminItem,
  FeedbackItem,
  ReminderItem,
  ShippingSettings,
  SocialSettings,
  ContactSettings,
} from "@/lib/types";
import { formatKolkataDisplay, getKolkataDateString, getDaysDiff } from "@/lib/date-utils";
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
  Star,
  Trash2,
  Truck,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap,
  RotateCcw,
  MessageSquare,
  Instagram,
  Calendar,
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
    "analytics" | "products" | "orders" | "inquiries" | "leads" | "users" | "settings" | "system" | "feedback" | "renewals"
  >("analytics");

  // Mobile sidebar toggle
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);

  // Firestore Data State (Live Real-time Subscriptions)
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [inquiries, setInquiries] = useState<InquiryItem[]>([]);
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [leadsList, setLeadsList] = useState<LeadItem[]>([]);

  // Task D: Customer Feedback State
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [feedbackRatingFilter, setFeedbackRatingFilter] = useState<string>("all");
  const [feedbackProductFilter, setFeedbackProductFilter] = useState<string>("all");
  const [feedbackDateFilter, setFeedbackDateFilter] = useState<string>("all");
  const [feedbackSearch, setFeedbackSearch] = useState<string>("");

  // Task E: Refill / Renewal Reminders State
  const [remindersList, setRemindersList] = useState<ReminderItem[]>([]);
  const [renewalFilter, setRenewalFilter] = useState<"all" | "due" | "overdue" | "completed">("all");
  const [renewalSearch, setRenewalSearch] = useState<string>("");
  const [completingReminder, setCompletingReminder] = useState<ReminderItem | null>(null);
  const [completionDateInput, setCompletionDateInput] = useState<string>("");
  const [scheduleNextCycleInput, setScheduleNextCycleInput] = useState<boolean>(true);
  const [isCompletingReminder, setIsCompletingReminder] = useState<boolean>(false);

  // Task E & C: Order Delivery & Installation Prompt Modal
  const [deliveringOrder, setDeliveringOrder] = useState<OrderItem | null>(null);
  const [installDateInput, setInstallDateInput] = useState<string>("");
  const [deliveryNoteInput, setDeliveryNoteInput] = useState<string>("");
  const [isDeliveringOrder, setIsDeliveringOrder] = useState<boolean>(false);

  // Order Status History Modal
  const [viewHistoryOrder, setViewHistoryOrder] = useState<OrderItem | null>(null);

  // Task A: Shipping Settings State
  const [shippingSettings, setShippingSettings] = useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);
  const [isSavingShipping, setIsSavingShipping] = useState<boolean>(false);

  // Task F: Social Settings State
  const [socialSettings, setSocialSettings] = useState<SocialSettings>(DEFAULT_SOCIAL_SETTINGS);
  const [isSavingSocial, setIsSavingSocial] = useState<boolean>(false);

  // Contact & Support Settings State
  const [contactSettings, setContactSettings] = useState<ContactSettings>(DEFAULT_CONTACT_SETTINGS);
  const [isSavingContact, setIsSavingContact] = useState<boolean>(false);

  // Leads Filter & Search State (Task 3)
  const [leadSearch, setLeadSearch] = useState("");
  const [leadOrderFilter, setLeadOrderFilter] = useState<"all" | "ordered" | "not_ordered">("all");

  // Orders Table State
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<
    "all" | "placed" | "confirmed" | "shipped" | "delivered" | "cancelled"
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
  const [userRoleFilter, setUserRoleFilter] = useState<
    "all" | "with_orders" | "no_orders" | "admin" | "staff" | "customer"
  >("all");
  const [selfDemotionWarning, setSelfDemotionWarning] = useState<{
    targetRole: "admin" | "staff" | "customer";
  } | null>(null);
  const [inspectingUserOrders, setInspectingUserOrders] = useState<UserItem | null>(null);

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
    password?: string | undefined;
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
    const unsubLeads = subscribeLeads((data) => setLeadsList(data));
    const unsubFeedback = subscribeFeedback((data) => setFeedbackList(data));
    const unsubReminders = subscribeReminders((data) => setRemindersList(data));
    const unsubShipping = subscribeShippingSettings((data) => setShippingSettings(data));
    const unsubSocial = subscribeSocialSettings((data) => setSocialSettings(data));
    const unsubContact = subscribeContactSettings((data) => setContactSettings(data));

    // Non-Blaze Dashboard Fallback on Load (Task E)
    processDueRemindersFallback().catch(() => {});

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubInquiries();
      unsubUsers();
      unsubAuthorizedAdmins();
      unsubLeads();
      unsubFeedback();
      unsubReminders();
      unsubShipping();
      unsubSocial();
      unsubContact();
    };
  }, [user, isAdmin]);

  // Escape key handler to dismiss open modals for keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (inspectingUserOrders) setInspectingUserOrders(null);
        else if (orderToDelete) setOrderToDelete(null);
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
    inspectingUserOrders,
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

  // Leads Filtered computation (Task 3)
  const filteredLeads = useMemo(() => {
    const q = leadSearch.trim().toLowerCase();
    return leadsList.filter((lead) => {
      if (leadOrderFilter === "ordered" && !lead.hasOrdered) return false;
      if (leadOrderFilter === "not_ordered" && lead.hasOrdered) return false;

      if (q) {
        const matchName = lead.name?.toLowerCase().includes(q);
        const matchPhone = lead.phone?.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
        const matchEmail = lead.email?.toLowerCase().includes(q);
        const matchCompany = lead.company?.toLowerCase().includes(q);
        const matchOrderId = lead.orderId?.toLowerCase().includes(q);
        const matchUid = lead.uid?.toLowerCase().includes(q);
        return matchName || matchPhone || matchEmail || matchCompany || matchOrderId || matchUid;
      }
      return true;
    });
  }, [leadsList, leadSearch, leadOrderFilter]);

  const handleExportLeadsCSV = () => {
    if (filteredLeads.length === 0) return;
    const headers = [
      "Customer Name",
      "Phone Number",
      "Email Address",
      "Company / Facility",
      "Has Ordered",
      "Linked Order ID",
      "Registered Date",
      "Last Active Date",
      "Acquisition Source",
    ];

    const rows = filteredLeads.map((l) => [
      `"${(l.name || "Customer").replace(/"/g, '""')}"`,
      `"${(l.phone || "").replace(/"/g, '""')}"`,
      `"${(l.email || "").replace(/"/g, '""')}"`,
      `"${(l.company || "").replace(/"/g, '""')}"`,
      l.hasOrdered ? "Yes (Ordered)" : "No (Zero Orders)",
      `"${(l.orderId || "N/A").replace(/"/g, '""')}"`,
      l.registeredAt ? new Date(l.registeredAt).toLocaleString() : "N/A",
      l.lastActiveAt ? new Date(l.lastActiveAt).toLocaleString() : "N/A",
      `"${(l.source || "otp_auth").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `sri_udharchi_registered_leads_${leadOrderFilter}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showSuccessMessage(`Exported ${filteredLeads.length} customer lead records to CSV.`);
  };

  // Filtered Orders for the Orders View
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        const matchesStatus =
          orderStatusFilter === "all" ||
          o.status === orderStatusFilter ||
          (orderStatusFilter === "placed" && o.status === "pending") ||
          (orderStatusFilter === "shipped" && o.status === "dispatched");
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

  // User orders association helper
  const getUserOrders = (u: UserItem) => {
    return orders.filter((o) => {
      const matchCustomerId = o.customerId && o.customerId === u.id;
      const matchEmail =
        u.email &&
        o.customerEmail &&
        o.customerEmail.trim().toLowerCase() === u.email.trim().toLowerCase();
      return Boolean(matchCustomerId || matchEmail);
    });
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
      "Orders Count",
      "Total Spent (INR)",
      "Registered Date",
      "Last Login",
    ];

    const rows = filteredUsers.map((u) => {
      const uOrders = getUserOrders(u);
      const spend = uOrders.reduce((sum, o) => sum + (o.total || 0), 0);
      return [
        `"${u.id || ""}"`,
        `"${(u.displayName || "").replace(/"/g, '""')}"`,
        `"${u.email || ""}"`,
        `"${u.role || "customer"}"`,
        `"${(u.company || "").replace(/"/g, '""')}"`,
        `"${(u.phone || "").replace(/"/g, '""')}"`,
        uOrders.length,
        spend,
        `"${u.createdAt ? new Date(u.createdAt).toISOString() : ""}"`,
        `"${u.lastLoginAt ? new Date(u.lastLoginAt).toISOString() : ""}"`,
      ];
    });

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
      const uOrders = getUserOrders(u);
      const matchesRole =
        userRoleFilter === "all"
          ? true
          : userRoleFilter === "with_orders"
            ? uOrders.length > 0
            : userRoleFilter === "no_orders"
              ? uOrders.length === 0
              : u.role === userRoleFilter;

      const q = userSearch.toLowerCase();
      const matchesSearch =
        !userSearch ||
        u.email.toLowerCase().includes(q) ||
        (u.displayName && u.displayName.toLowerCase().includes(q)) ||
        (u.phone && u.phone.toLowerCase().includes(q)) ||
        (u.company && u.company.toLowerCase().includes(q)) ||
        uOrders.some(
          (o) =>
            (o.orderNumber && o.orderNumber.toLowerCase().includes(q)) ||
            (o.id && o.id.toLowerCase().includes(q)),
        );
      return matchesRole && matchesSearch;
    });
  }, [usersList, orders, userRoleFilter, userSearch]);

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
      const adminPayload: {
        email: string;
        displayName: string;
        password?: string;
        department?: string;
        phone?: string;
        addedBy?: string;
      } = {
        email,
        displayName: newAdminForm.displayName.trim() || (email.split("@")[0] ?? "Admin"),
        department: newAdminForm.department.trim() || "Operations",
        addedBy: user?.email || "Super Administrator",
      };
      if (newAdminForm.password.trim()) {
        adminPayload.password = newAdminForm.password.trim();
      }
      if (newAdminForm.phone.trim()) {
        adminPayload.phone = newAdminForm.phone.trim();
      }

      const res = await addAuthorizedAdmin(adminPayload);

      if (!res.success) {
        setAdminModalError(res.message || "Failed to authorize administrator.");
        return;
      }

      showSuccessMessage(res.message);
      setAdminCreatedInfo({
        email,
        password: newAdminForm.password.trim() || undefined,
        displayName: newAdminForm.displayName.trim() || email.split("@")[0] || "Admin",
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

  // Task A: Save Shipping Settings
  const handleSaveShippingSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingShipping(true);
    try {
      await updateShippingSettings(shippingSettings);
      showSuccessMessage("Fulfillment day ranges and priority shipping rates saved.");
    } catch (err: unknown) {
      showSuccessMessage(
        "Failed to save shipping settings: " + (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setIsSavingShipping(false);
    }
  };

  // Task F: Save Social Media Settings (Instagram)
  const handleSaveSocialSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSocial(true);
    try {
      await updateSocialSettings(socialSettings);
      showSuccessMessage("Official social media and Instagram link saved.");
    } catch (err: unknown) {
      showSuccessMessage(
        "Failed to save social settings: " + (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setIsSavingSocial(false);
    }
  };

  // Contact & Support Settings Save Handler
  const handleSaveContactSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingContact(true);
    try {
      await updateContactSettings(contactSettings);
      showSuccessMessage("Contact & Support settings successfully updated.");
    } catch (err: unknown) {
      showSuccessMessage(
        "Failed to save contact settings: " + (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setIsSavingContact(false);
    }
  };

  // Task E & C: Confirm Order Delivered & Record Installation Date
  const handleConfirmDeliverOrder = async () => {
    if (!deliveringOrder?.id) return;
    setIsDeliveringOrder(true);
    try {
      const installDate = installDateInput || getKolkataDateString();
      await updateOrderStatus(deliveringOrder.id, "delivered", {
        installDate,
        note: deliveryNoteInput || "Order certified delivered and installed on-site",
      });
      showSuccessMessage(
        `Order ${deliveringOrder.orderNumber || deliveringOrder.id} marked as Delivered! Renewal alerts scheduled.`,
      );
      setDeliveringOrder(null);
    } catch (err: unknown) {
      showSuccessMessage(
        "Failed to mark order delivered: " + (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setIsDeliveringOrder(false);
    }
  };

  // Task E: Confirm Reminder Completion & Optional Next Cycle
  const handleConfirmCompleteReminder = async () => {
    if (!completingReminder?.id) return;
    setIsCompletingReminder(true);
    try {
      const completionDate = completionDateInput || getKolkataDateString();
      await markReminderCompleted(
        completingReminder.id,
        completionDate,
        scheduleNextCycleInput,
      );
      showSuccessMessage(
        scheduleNextCycleInput
          ? "Maintenance cycle marked completed and next renewal alert scheduled."
          : "Maintenance cycle marked completed.",
      );
      setCompletingReminder(null);
    } catch (err: unknown) {
      showSuccessMessage(
        "Failed to complete reminder: " + (err instanceof Error ? err.message : String(err)),
      );
    } finally {
      setIsCompletingReminder(false);
    }
  };

  // Task D & E Computations
  const avgRating = useMemo(() => {
    if (!feedbackList || feedbackList.length === 0) return 0;
    const total = feedbackList.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    return total / feedbackList.length;
  }, [feedbackList]);

  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    for (const f of feedbackList) {
      if (f.rating >= 1 && f.rating <= 5) {
        counts[f.rating] = (counts[f.rating] || 0) + 1;
      }
    }
    return counts;
  }, [feedbackList]);

  const dueRemindersCount = useMemo(() => {
    const today = getKolkataDateString();
    return remindersList.filter((r) => r.status === "pending" && r.alertDate <= today).length;
  }, [remindersList]);

  const filteredReminders = useMemo(() => {
    const today = getKolkataDateString();
    return remindersList.filter((r) => {
      const daysDiff = getDaysDiff(today, r.renewalDate);
      const isOverdue = daysDiff < 0 && r.status !== "completed";
      const isDue = r.alertDate <= today && r.status === "pending";

      if (renewalFilter === "due" && !isDue) return false;
      if (renewalFilter === "overdue" && !isOverdue) return false;
      if (renewalFilter === "completed" && r.status !== "completed") return false;

      if (renewalSearch.trim()) {
        const q = renewalSearch.toLowerCase();
        const mProduct = r.productName?.toLowerCase().includes(q);
        const mCustomer = r.customerName?.toLowerCase().includes(q);
        const mPhone = r.customerPhone?.replace(/\D/g, "").includes(q.replace(/\D/g, ""));
        const mEmail = r.customerEmail?.toLowerCase().includes(q);
        const mOrder = r.orderId?.toLowerCase().includes(q);
        return mProduct || mCustomer || mPhone || mEmail || mOrder;
      }
      return true;
    });
  }, [remindersList, renewalFilter, renewalSearch]);

  const filteredFeedback = useMemo(() => {
    return feedbackList.filter((f) => {
      if (feedbackRatingFilter !== "all" && String(f.rating) !== feedbackRatingFilter) {
        return false;
      }
      if (feedbackProductFilter !== "all" && !f.productIds?.includes(feedbackProductFilter)) {
        return false;
      }
      if (feedbackDateFilter !== "all") {
        const createdMs = new Date(f.createdAt).getTime();
        const nowMs = Date.now();
        const days = feedbackDateFilter === "7d" ? 7 : feedbackDateFilter === "30d" ? 30 : 90;
        if (nowMs - createdMs > days * 24 * 60 * 60 * 1000) return false;
      }
      if (feedbackSearch.trim()) {
        const q = feedbackSearch.toLowerCase();
        const matchesComment = f.comment?.toLowerCase().includes(q);
        const matchesOrder = f.orderId?.toLowerCase().includes(q);
        return matchesComment || matchesOrder;
      }
      return true;
    });
  }, [feedbackList, feedbackRatingFilter, feedbackProductFilter, feedbackDateFilter, feedbackSearch]);

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
        orders.filter((o) => o.status === "pending" || o.status === "placed").length > 0
          ? `${orders.filter((o) => o.status === "pending" || o.status === "placed").length} New`
          : null,
    },
    {
      id: "renewals" as const,
      label: "Refills & Renewals (AMC)",
      icon: RotateCcw,
      badge: remindersList.length > 0 ? remindersList.length : null,
      urgentBadge: dueRemindersCount > 0 ? `${dueRemindersCount} Due` : null,
    },
    {
      id: "feedback" as const,
      label: "Customer Feedback & Ratings",
      icon: Star,
      badge: feedbackList.length > 0 ? `${avgRating.toFixed(1)} ★` : null,
      urgentBadge: null,
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
    {
      id: "leads" as const,
      label: "Registered Customers / Leads",
      icon: UserCheck,
      badge: leadsList.length > 0 ? leadsList.length : null,
      urgentBadge:
        leadsList.filter((l) => !l.hasOrdered).length > 0
          ? `${leadsList.filter((l) => !l.hasOrdered).length} Zero-Order`
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
          ? `${authorizedAdmins.length} Admins`
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
      label: "Delivered Projects Portfolio",
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
                      : activeTab === "renewals"
                        ? "Refills & Renewals (AMC)"
                        : activeTab === "feedback"
                          ? "Customer Feedback & Ratings"
                          : activeTab === "inquiries"
                            ? "Customer Leads & RFQs"
                            : activeTab === "leads"
                              ? "Registered Customers / Leads"
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
                ₹{orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString("en-IN")} total
                volume
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
                    Real-time customer transactions placed via checkout. Manage fulfillment, status,
                    and print proforma invoices.
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
                          id: "placed",
                          label: "Placed",
                          count: orders.filter((o) => o.status === "placed" || o.status === "pending").length,
                        },
                        {
                          id: "confirmed",
                          label: "Confirmed",
                          count: orders.filter((o) => o.status === "confirmed").length,
                        },
                        {
                          id: "shipped",
                          label: "Shipped",
                          count: orders.filter((o) => o.status === "shipped" || o.status === "dispatched").length,
                        },
                        {
                          id: "delivered",
                          label: "Delivered",
                          count: orders.filter((o) => o.status === "delivered").length,
                        },
                        {
                          id: "cancelled",
                          label: "Cancelled",
                          count: orders.filter((o) => o.status === "cancelled").length,
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
                              <div className="font-mono font-bold text-foreground flex items-center gap-1.5 flex-wrap">
                                <span>{ord.orderNumber || ord.id}</span>
                                {ord.shippingType === "priority" ? (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                    <Zap className="size-2.5 fill-current" />
                                    <span>Priority</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground border border-border">
                                    <Truck className="size-2.5" />
                                    <span>5-7d</span>
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="size-3" />
                                <span>
                                  {ord.createdAt
                                    ? new Date(ord.createdAt).toLocaleDateString()
                                    : "Recent"}
                                </span>
                              </div>
                              <div className="text-[10px] text-primary/80 mt-0.5">
                                {ord.expectedDeliveryFrom && ord.expectedDeliveryTo ? (
                                  <span>
                                    Exp: {formatKolkataDisplay(ord.expectedDeliveryFrom)} - {formatKolkataDisplay(ord.expectedDeliveryTo)}
                                  </span>
                                ) : (
                                  <span>{ord.estimatedDelivery || "5 to 7 business days"}</span>
                                )}
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
                                Payment:{" "}
                                <span className="text-primary font-bold">{ord.paymentMethod}</span>
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
                                value={ord.status || "placed"}
                                onChange={async (e) => {
                                  if (!ord.id) return;
                                  const nextStatus = e.target.value as OrderItem["status"];
                                  if (nextStatus === "delivered") {
                                    setDeliveringOrder(ord);
                                    setInstallDateInput(getKolkataDateString());
                                    setDeliveryNoteInput("Delivered and certified on site");
                                    return;
                                  }
                                  await updateOrderStatus(ord.id, nextStatus);
                                  showSuccessMessage(
                                    `Order updated to "${nextStatus.toUpperCase()}".`,
                                  );
                                }}
                                className={`rounded-md px-2.5 py-1 text-xs font-bold border ${
                                  ord.status === "pending" || ord.status === "placed"
                                    ? "bg-amber-500/10 border-amber-500 text-amber-600 dark:text-amber-400"
                                    : ord.status === "confirmed"
                                      ? "bg-purple-500/10 border-purple-500 text-purple-600 dark:text-purple-400"
                                      : ord.status === "shipped" || ord.status === "dispatched"
                                        ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400"
                                        : ord.status === "delivered"
                                          ? "bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                                          : "bg-destructive/10 border-destructive text-destructive"
                                }`}
                              >
                                <option value="placed">Placed</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
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
                                  onClick={() => setViewHistoryOrder(ord)}
                                  className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  title="View Status History Audit Trail"
                                  aria-label={`View audit trail for order ${ord.orderNumber}`}
                                >
                                  <Clock className="size-4" />
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
                            <div className="text-muted-foreground">
                              GSTIN: {selectedOrder.gstin}
                            </div>
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
          {/* TAB: REFILLS & RENEWAL REMINDERS (AMC) */}
          {/* ======================================================== */}
          {activeTab === "renewals" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Equipment Maintenance &amp; Refill Renewals (AMC)
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Automated life-cycle inspection tracking for industrial fire extinguishers, hydrants, and safety systems.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const count = await processDueRemindersFallback();
                      showSuccessMessage(
                        count > 0
                          ? `Processed and dispatched alerts for ${count} due equipment reminder(s).`
                          : "All renewal reminders are up to date. No pending alerts due today.",
                      );
                    }}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <RefreshCw className="size-3.5 text-primary" />
                    <span>Run Alerts Fallback</span>
                  </Button>
                </div>
              </div>

              {/* Status Metrics Cards */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                    <span>Total Tracked</span>
                    <RotateCcw className="size-4 text-primary" />
                  </div>
                  <div className="mt-2 font-display text-2xl font-black text-foreground">
                    {remindersList.length}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Active equipment cycles</div>
                </div>

                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
                    <span>Action Due (≤ Today)</span>
                    <AlertTriangle className="size-4 text-amber-500" />
                  </div>
                  <div className="mt-2 font-display text-2xl font-black text-amber-600 dark:text-amber-400">
                    {dueRemindersCount}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Alert window active (7-day notice)</div>
                </div>

                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-destructive font-medium">
                    <span>Overdue Renewals</span>
                    <Clock className="size-4 text-destructive" />
                  </div>
                  <div className="mt-2 font-display text-2xl font-black text-destructive">
                    {
                      remindersList.filter(
                        (r) =>
                          getDaysDiff(getKolkataDateString(), r.renewalDate) < 0 &&
                          r.status !== "completed",
                      ).length
                    }
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Past compliance deadline</div>
                </div>

                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 shadow-sm">
                  <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    <span>Completed Cycles</span>
                    <CheckCircle2 className="size-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 font-display text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {remindersList.filter((r) => r.status === "completed").length}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Successfully serviced &amp; renewed</div>
                </div>
              </div>

              {/* Filters & Search */}
              <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-sm">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(
                    [
                      { id: "all", label: "All Reminders", count: remindersList.length },
                      { id: "due", label: "Action Due", count: dueRemindersCount },
                      {
                        id: "overdue",
                        label: "Overdue",
                        count: remindersList.filter(
                          (r) =>
                            getDaysDiff(getKolkataDateString(), r.renewalDate) < 0 &&
                            r.status !== "completed",
                        ).length,
                      },
                      {
                        id: "completed",
                        label: "Completed",
                        count: remindersList.filter((r) => r.status === "completed").length,
                      },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setRenewalFilter(tab.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                        renewalFilter === tab.id
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {tab.label} ({tab.count})
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={renewalSearch}
                    onChange={(e) => setRenewalSearch(e.target.value)}
                    placeholder="Search product, customer, phone..."
                    className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                  {renewalSearch && (
                    <button
                      type="button"
                      onClick={() => setRenewalSearch("")}
                      className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Reminders Table */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Equipment / Product</th>
                        <th className="px-4 py-3">Customer &amp; Contact</th>
                        <th className="px-4 py-3">Install Date</th>
                        <th className="px-4 py-3">Alert Date (7-Day Notice)</th>
                        <th className="px-4 py-3">Renewal Target</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredReminders.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                            <RotateCcw className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                            <p className="font-semibold text-foreground">No renewal reminders found</p>
                            <p className="text-[11px] mt-1">
                              When an order with renewal period is marked "Delivered", automated reminders appear here.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredReminders.map((r) => {
                          const today = getKolkataDateString();
                          const daysDiff = getDaysDiff(today, r.renewalDate);
                          const isOverdue = daysDiff < 0 && r.status !== "completed";
                          const isDue = r.alertDate <= today && r.status === "pending";

                          return (
                            <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3 font-medium text-foreground">
                                <div className="font-bold">{r.productName || "Safety Equipment"}</div>
                                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                                  <span className="font-mono text-primary">#{r.orderId}</span>
                                  <span>•</span>
                                  <span className="rounded bg-muted px-1.5 py-0.2 font-semibold">
                                    Cycle #{r.cycle || 1} ({r.renewalMonths} Mos)
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3 text-muted-foreground">
                                <div className="font-semibold text-foreground">{r.customerName || "Customer"}</div>
                                <div className="text-[11px] font-mono text-primary">{r.customerPhone || "N/A"}</div>
                                {r.customerEmail && (
                                  <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                                    {r.customerEmail}
                                  </div>
                                )}
                              </td>

                              <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">
                                {r.installDate}
                              </td>

                              <td className="px-4 py-3 font-mono text-muted-foreground whitespace-nowrap">
                                <span className={isDue ? "text-amber-600 dark:text-amber-400 font-bold" : ""}>
                                  {r.alertDate}
                                </span>
                              </td>

                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-mono font-bold text-foreground">{r.renewalDate}</div>
                                <div className="text-[10px] mt-0.5">
                                  {r.status === "completed" ? (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                      Serviced &amp; Closed
                                    </span>
                                  ) : isOverdue ? (
                                    <span className="text-destructive font-bold">
                                      {Math.abs(daysDiff)} day(s) overdue
                                    </span>
                                  ) : daysDiff === 0 ? (
                                    <span className="text-amber-600 font-bold">Due today</span>
                                  ) : (
                                    <span className="text-muted-foreground">In {daysDiff} days</span>
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-3 whitespace-nowrap">
                                <span
                                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                    r.status === "completed"
                                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                      : isOverdue
                                        ? "bg-destructive/10 text-destructive border border-destructive/30"
                                        : isDue
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                          : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30"
                                  }`}
                                >
                                  {r.status === "completed"
                                    ? "Completed"
                                    : isOverdue
                                      ? "Overdue"
                                      : isDue
                                        ? "Alert Sent"
                                        : "Scheduled"}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right whitespace-nowrap">
                                {r.status !== "completed" ? (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setCompletingReminder(r);
                                      setCompletionDateInput(getKolkataDateString());
                                      setScheduleNextCycleInput(true);
                                    }}
                                    className="gap-1.5 text-xs font-semibold hover:border-emerald-500 hover:text-emerald-600"
                                  >
                                    <Check className="size-3.5 text-emerald-500" />
                                    <span>Mark Completed</span>
                                  </Button>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground font-semibold inline-flex items-center gap-1">
                                    <CheckCircle2 className="size-3.5 text-emerald-500" />
                                    <span>Cycle #{r.cycle || 1} Done</span>
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB: CUSTOMER FEEDBACK & RATINGS */}
          {/* ======================================================== */}
          {activeTab === "feedback" && (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground">
                    Customer Reviews &amp; Delivery Quality Ratings
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Verified post-delivery satisfaction ratings submitted by customers in compliance with fire safety standards.
                  </p>
                </div>
              </div>

              {/* Rating Scorecard Overview */}
              <div className="grid gap-6 md:grid-cols-3">
                {/* Average Rating Hero */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center">
                  <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Overall Satisfaction Rating
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-4xl font-black text-foreground">
                      {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                    </span>
                    <span className="text-sm text-muted-foreground font-semibold">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-1 my-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`size-5 ${
                          s <= Math.round(avgRating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-muted text-muted"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Based on <span className="font-bold text-foreground">{feedbackList.length}</span> verified customer review{feedbackList.length === 1 ? "" : "s"}
                  </div>
                </div>

                {/* Rating Distribution Breakdown */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:col-span-2 space-y-2.5">
                  <h3 className="font-display text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                    Rating Distribution Breakdown
                  </h3>
                  {[5, 4, 3, 2, 1].map((star) => {
                    const count = ratingCounts[star] || 0;
                    const pct = feedbackList.length > 0 ? Math.round((count / feedbackList.length) * 100) : 0;
                    return (
                      <div key={star} className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 w-14 font-semibold text-foreground shrink-0">
                          <span>{star}</span>
                          <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        </div>
                        <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-amber-400 rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <div className="w-16 text-right font-mono text-[11px] text-muted-foreground shrink-0">
                          {pct}% ({count})
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Filters & Search */}
              <div className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4 shadow-sm">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Rating Filter
                  </label>
                  <select
                    value={feedbackRatingFilter}
                    onChange={(e) => setFeedbackRatingFilter(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="all">All Ratings (1 - 5 Stars)</option>
                    <option value="5">5 Stars Only</option>
                    <option value="4">4 Stars Only</option>
                    <option value="3">3 Stars Only</option>
                    <option value="2">2 Stars Only</option>
                    <option value="1">1 Star Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Date Range
                  </label>
                  <select
                    value={feedbackDateFilter}
                    onChange={(e) => setFeedbackDateFilter(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="90d">Last 90 Days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Equipment / Product
                  </label>
                  <select
                    value={feedbackProductFilter}
                    onChange={(e) => setFeedbackProductFilter(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    <option value="all">All Products</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Search Feedback
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-2 size-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      value={feedbackSearch}
                      onChange={(e) => setFeedbackSearch(e.target.value)}
                      placeholder="Search comments or order..."
                      className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Feedback List Table */}
              <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted/40 border-b border-border text-muted-foreground font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="px-4 py-3">Order Number</th>
                        <th className="px-4 py-3">Rating</th>
                        <th className="px-4 py-3">Customer Comment &amp; Review</th>
                        <th className="px-4 py-3">Products Covered</th>
                        <th className="px-4 py-3 text-right">Submitted Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredFeedback.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                            <Star className="mx-auto size-8 text-muted-foreground/40 mb-2" />
                            <p className="font-semibold text-foreground">No customer feedback found</p>
                            <p className="text-[11px] mt-1">
                              When delivered orders receive ratings from customers, they will appear here live.
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredFeedback.map((f) => {
                          const matchedOrder = orders.find((o) => o.orderNumber === f.orderId || o.id === f.orderId);
                          return (
                            <tr key={f.id} className="hover:bg-muted/20 transition-colors">
                              <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono font-bold text-primary">#{f.orderId}</span>
                                  {matchedOrder && (
                                    <button
                                      type="button"
                                      onClick={() => setSelectedOrder(matchedOrder)}
                                      className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                      title="View Order Details"
                                    >
                                      <Eye className="size-3.5" />
                                    </button>
                                  )}
                                </div>
                                {matchedOrder?.customerName && (
                                  <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {matchedOrder.customerName}
                                  </div>
                                )}
                              </td>

                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((s) => (
                                    <Star
                                      key={s}
                                      className={`size-3.5 ${
                                        s <= f.rating
                                          ? "fill-amber-400 text-amber-400"
                                          : "fill-muted text-muted"
                                      }`}
                                    />
                                  ))}
                                  <span className="ml-1 font-bold text-foreground text-[11px]">
                                    {f.rating}.0
                                  </span>
                                </div>
                              </td>

                              <td className="px-4 py-3 max-w-md">
                                {f.comment ? (
                                  <p className="text-foreground leading-relaxed italic">
                                    "{f.comment}"
                                  </p>
                                ) : (
                                  <span className="text-muted-foreground italic text-[11px]">
                                    (No written comment provided by client)
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-3 text-muted-foreground">
                                {f.productIds && f.productIds.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {f.productIds.map((pid) => {
                                      const p = products.find((prod) => prod.id === pid);
                                      return (
                                        <span
                                          key={pid}
                                          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-foreground font-semibold"
                                        >
                                          {p?.name || pid}
                                        </span>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">Order Items</span>
                                )}
                              </td>

                              <td className="px-4 py-3 text-right whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                                {formatKolkataDisplay(f.createdAt)}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
                    Incoming leads captured directly from customer quote submissions on your
                    website.
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
                                  const nextStatus = e.target.value as
                                    "new" | "contacted" | "closed";
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
          {/* TAB: REGISTERED CUSTOMERS / LEADS (TASK 3) */}
          {/* ======================================================== */}
          {activeTab === "leads" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Header with Title and Link to standalone /admin/leads */}
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-xl font-bold text-foreground">
                      Registered Customers &amp; Leads Database
                    </h2>
                    <span className="rounded-full bg-primary/15 text-primary border border-primary/20 px-2.5 py-0.5 text-xs font-extrabold">
                      {leadsList.length} Total
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Customer acquisition records captured on Mobile OTP registration even if they never place an order.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a href="/admin/leads">
                    <Button variant="outline" size="sm" className="text-xs h-8 gap-1.5">
                      <span>Full-Screen Portal</span>
                      <ExternalLink className="size-3.5" />
                    </Button>
                  </a>
                  <Button
                    size="sm"
                    onClick={handleExportLeadsCSV}
                    disabled={filteredLeads.length === 0}
                    className="text-xs h-8 gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    <Download className="size-3.5" />
                    <span>Export CSV ({filteredLeads.length})</span>
                  </Button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                    <span>Captured Registrations</span>
                    <Users className="size-4 text-primary" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-foreground">{leadsList.length}</div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Across web &amp; mobile OTP</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                    <span>Zero-Order Leads</span>
                    <AlertTriangle className="size-4 text-amber-500" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
                    {leadsList.filter((l) => !l.hasOrdered).length}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Registered without purchase</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                    <span>Converted Buyers</span>
                    <ShoppingBag className="size-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {leadsList.filter((l) => l.hasOrdered).length}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Placed at least 1 order</div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-xs">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                    <span>Conversion Rate</span>
                    <CheckCircle2 className="size-4 text-primary" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-primary">
                    {leadsList.length > 0
                      ? ((leadsList.filter((l) => l.hasOrdered).length / leadsList.length) * 100).toFixed(1)
                      : "0.0"}%
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">Signups to orders</div>
                </div>
              </div>

              {/* Filter & Search Bar */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search leads by customer name, phone number, email, or company..."
                      value={leadSearch}
                      onChange={(e) => setLeadSearch(e.target.value)}
                      className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto p-0.5 bg-muted/40 rounded-lg border border-border/60">
                    <button
                      type="button"
                      onClick={() => setLeadOrderFilter("all")}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                        leadOrderFilter === "all"
                          ? "bg-primary text-primary-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      All ({leadsList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadOrderFilter("not_ordered")}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                        leadOrderFilter === "not_ordered"
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-amber-400" />
                      <span>Zero Orders ({leadsList.filter((l) => !l.hasOrdered).length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setLeadOrderFilter("ordered")}
                      className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                        leadOrderFilter === "ordered"
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span className="size-1.5 rounded-full bg-emerald-400" />
                      <span>Ordered ({leadsList.filter((l) => l.hasOrdered).length})</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3">Customer / Lead</th>
                        <th className="px-5 py-3">Phone &amp; Contact</th>
                        <th className="px-5 py-3">Email Address</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3">Registration Date</th>
                        <th className="px-5 py-3 text-right">Quick Follow-Up</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredLeads.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-12 text-center text-muted-foreground">
                            <Users className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                            <div className="font-bold text-foreground text-xs">
                              {leadsList.length === 0
                                ? "No Registered Leads Captured Yet"
                                : "No Leads Match Current Filter"}
                            </div>
                            <p className="mt-1 text-[11px] text-muted-foreground">
                              {leadsList.length === 0
                                ? "Every user who completes OTP login or email signup will be automatically captured here."
                                : "Try clearing your search query."}
                            </p>
                          </td>
                        </tr>
                      ) : (
                        filteredLeads.map((lead) => {
                          const cleanPhone = (lead.phone || "").replace(/\D/g, "");
                          const hasCleanPhone = cleanPhone.length >= 10;
                          const whatsappUrl = hasCleanPhone
                            ? `https://wa.me/${cleanPhone.startsWith("91") ? cleanPhone : "91" + cleanPhone.slice(-10)}?text=${encodeURIComponent(
                                `Hello ${lead.name || "Customer"}, thank you for visiting Sri Udharchi Enterprises. How can we assist your facility with certified fire safety equipment or industrial supplies?`,
                              )}`
                            : "";

                          return (
                            <tr key={lead.uid || lead.id} className="hover:bg-muted/30 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                                    {(lead.name || lead.email || "C").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-bold text-foreground text-xs truncate">
                                      {lead.name || "Customer"}
                                    </div>
                                    {lead.company && (
                                      <div className="text-[11px] font-semibold text-primary truncate flex items-center gap-1">
                                        <Building2 className="size-3" />
                                        <span>{lead.company}</span>
                                      </div>
                                    )}
                                    <div className="font-mono text-[10px] text-muted-foreground truncate">
                                      UID: {lead.uid}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 text-xs font-mono font-medium text-foreground">
                                {lead.phone ? (
                                  <span>{lead.phone}</span>
                                ) : (
                                  <span className="text-muted-foreground/60 italic font-sans text-[11px]">No phone</span>
                                )}
                              </td>

                              <td className="px-5 py-4 text-xs">
                                {lead.email && !lead.email.includes("@mobile.udharchi.in") ? (
                                  <a href={`mailto:${lead.email}`} className="text-foreground hover:text-primary hover:underline">
                                    {lead.email}
                                  </a>
                                ) : (
                                  <span className="text-muted-foreground/60 italic text-[11px]">Email pending</span>
                                )}
                              </td>

                              <td className="px-5 py-4">
                                {lead.hasOrdered ? (
                                  <div className="space-y-0.5">
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                      <span className="size-1.5 rounded-full bg-emerald-500" />
                                      <span>Ordered (Buyer)</span>
                                    </span>
                                    {lead.orderId && (
                                      <p className="font-mono text-[9px] text-muted-foreground">
                                        {lead.orderId}
                                      </p>
                                    )}
                                  </div>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                    <span className="size-1.5 rounded-full bg-amber-500" />
                                    <span>Zero Orders (Lead)</span>
                                  </span>
                                )}
                              </td>

                              <td className="px-5 py-4 text-xs">
                                <div className="text-foreground text-[11px]">
                                  {lead.registeredAt
                                    ? new Date(lead.registeredAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      })
                                    : "Recent"}
                                </div>
                                <div className="text-[10px] text-muted-foreground mt-0.5">
                                  Active: {lead.lastActiveAt ? new Date(lead.lastActiveAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recent"}
                                </div>
                              </td>

                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {whatsappUrl && (
                                    <a
                                      href={whatsappUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-1 text-xs font-bold transition-colors border border-emerald-500/20"
                                      title="WhatsApp"
                                    >
                                      <span>WhatsApp</span>
                                    </a>
                                  )}
                                  {lead.phone && (
                                    <a
                                      href={`tel:${lead.phone}`}
                                      className="inline-flex items-center gap-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 text-xs font-bold transition-colors border border-primary/20"
                                      title="Call"
                                    >
                                      <Phone className="size-3" />
                                      <span>Call</span>
                                    </a>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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
                    Create executive administrators, provision login accounts, and manage client and
                    staff permissions.
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
                          {authorizedAdmins.length} Active
                        </span>
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Personnel granted executive command over catalog, order dispatch, RFQs, and
                        access control.
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
                  {authorizedAdmins.map((admin) => (
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
                              <span className="font-mono text-muted-foreground">
                                {admin.phone}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-[10px]">
                            <span>Added by:</span>
                            <span className="truncate max-w-[120px] text-muted-foreground">
                              {admin.addedBy || "Admin"}
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

                {authorizedAdmins.length === 0 && (
                  <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20 p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      No additional administrators provisioned yet. Click{" "}
                      <span className="font-semibold text-foreground">"Create Admin Login"</span>{" "}
                      above to provision executive access.
                    </p>
                  </div>
                )}
              </div>

              {/* Users & Ordering Customers KPI Summary */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                    <span>Total Accounts</span>
                    <Users className="size-4 text-primary" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-foreground">
                    {usersList.length}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    Registered across portal
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                    <span>Active Buyers</span>
                    <ShoppingBag className="size-4 text-emerald-500" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {usersList.filter((u) => getUserOrders(u).length > 0).length}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    Users with placed orders
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                    <span>Total Orders</span>
                    <ShoppingCart className="size-4 text-primary" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-foreground">
                    {orders.length}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    All page checkouts
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
                    <span>Invoiced Revenue</span>
                    <IndianRupee className="size-4 text-primary" />
                  </div>
                  <div className="mt-2 text-2xl font-black text-primary">
                    ₹
                    {orders
                      .reduce((sum, o) => sum + (o.total || 0), 0)
                      .toLocaleString("en-IN")}
                  </div>
                  <div className="mt-0.5 text-[11px] text-muted-foreground">
                    Customer order volume
                  </div>
                </div>
              </div>

              {/* Users Filter Bar */}
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search by user email, name, company, phone, or order ID..."
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
                          { id: "with_orders", label: "With Orders" },
                          { id: "no_orders", label: "No Orders" },
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
                        <th className="px-5 py-3">Orders & What They Ordered</th>
                        <th className="px-5 py-3">Activity & Logins</th>
                        <th className="px-5 py-3 text-right">Change Role & Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                            <div className="mx-auto max-w-sm">
                              <Users className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                              <div className="font-bold text-foreground text-sm">
                                {usersList.length === 0
                                  ? "No Users Registered in System"
                                  : "No Users Match Current Filters"}
                              </div>
                              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                {usersList.length === 0
                                  ? "New user signups through the client login portal and customer checkouts will automatically register here."
                                  : "Try clearing the search query or selecting 'All Users'."}
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredUsers.map((u) => {
                          const isSelf = user?.uid === u.id || user?.email === u.email;
                          const uOrders = getUserOrders(u);
                          const totalSpend = uOrders.reduce((sum, o) => sum + (o.total || 0), 0);

                          return (
                            <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                              {/* 1. User Profile */}
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary shrink-0">
                                    {(u.displayName || u.email || "U").charAt(0).toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 font-bold text-foreground">
                                      <span className="truncate">
                                        {u.displayName ||
                                          (u.email ? u.email.split("@")[0] : "User")}
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

                              {/* 2. Email & Contact */}
                              <td className="px-5 py-4 text-xs">
                                <div className="font-medium text-foreground">{u.email}</div>
                                {u.phone ? (
                                  <div className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                    <Phone className="size-3 text-primary" />
                                    <span>{u.phone}</span>
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-muted-foreground/60 italic">
                                    No phone saved
                                  </div>
                                )}
                              </td>

                              {/* 3. Role */}
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

                              {/* 4. Orders & What They Ordered */}
                              <td className="px-5 py-4">
                                {uOrders.length > 0 ? (
                                  <div className="space-y-1.5">
                                    <div className="flex items-center gap-2">
                                      <span className="rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2 py-0.5 text-[11px] font-bold">
                                        {uOrders.length} {uOrders.length === 1 ? "Order" : "Orders"}
                                      </span>
                                      <span className="font-bold text-xs text-foreground">
                                        ₹{totalSpend.toLocaleString("en-IN")}
                                      </span>
                                    </div>

                                    {/* Preview of item names ordered */}
                                    <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[240px]">
                                      {uOrders
                                        .flatMap((o) => o.items || [])
                                        .map((it) => `${it.name} (x${it.quantity})`)
                                        .slice(0, 2)
                                        .join(", ")}
                                      {uOrders.flatMap((o) => o.items || []).length > 2 ? "..." : ""}
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => setInspectingUserOrders(u)}
                                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-primary hover:text-primary/80 transition-colors bg-primary/5 hover:bg-primary/10 rounded-md px-2 py-0.5 cursor-pointer"
                                    >
                                      <ShoppingBag className="size-3 text-primary" />
                                      <span>View What They Ordered ({uOrders.length})</span>
                                    </button>
                                  </div>
                                ) : (
                                  <div className="text-xs text-muted-foreground/60 italic">
                                    No orders placed yet
                                  </div>
                                )}
                              </td>

                              {/* 5. Activity & Logins */}
                              <td className="px-5 py-4 text-xs">
                                <div className="text-foreground">
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">
                                    Last Login:
                                  </span>
                                  {u.lastLoginAt
                                    ? new Date(u.lastLoginAt).toLocaleString()
                                    : "Recent"}
                                </div>
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                  <span className="text-[10px] uppercase font-bold text-muted-foreground mr-1">
                                    Created:
                                  </span>
                                  {u.createdAt
                                    ? new Date(u.createdAt).toLocaleDateString()
                                    : "Recent"}
                                </div>
                              </td>

                              {/* 6. Change Role & Actions */}
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  {uOrders.length > 0 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setInspectingUserOrders(u)}
                                      className="h-7 text-xs px-2 gap-1 border-primary/30 text-primary hover:bg-primary/10"
                                      title="View all orders placed by this customer"
                                    >
                                      <ShoppingBag className="size-3" />
                                      <span>Orders</span>
                                    </Button>
                                  )}

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
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dedicated User Order History Modal */}
              {inspectingUserOrders && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
                  <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-6">
                    {/* Modal Header */}
                    <div className="flex items-start justify-between border-b border-border pb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-lg">
                          {(
                            inspectingUserOrders.displayName ||
                            inspectingUserOrders.email ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-bold text-foreground">
                              {inspectingUserOrders.displayName || "Customer Purchase History"}
                            </h2>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                inspectingUserOrders.role === "admin"
                                  ? "bg-primary/15 text-primary border border-primary/20"
                                  : inspectingUserOrders.role === "staff"
                                    ? "bg-secondary/20 text-foreground border border-border"
                                    : "bg-muted text-muted-foreground border border-border"
                              }`}
                            >
                              {inspectingUserOrders.role.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Mail className="size-3 text-primary" />
                              {inspectingUserOrders.email}
                            </span>
                            {inspectingUserOrders.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="size-3 text-primary" />
                                {inspectingUserOrders.phone}
                              </span>
                            )}
                            {inspectingUserOrders.company && (
                              <span className="flex items-center gap-1">
                                <Building2 className="size-3 text-primary" />
                                {inspectingUserOrders.company}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setInspectingUserOrders(null)}
                        className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <X className="size-5" />
                      </button>
                    </div>

                    {/* Customer Spend Stats & Orders Details */}
                    {(() => {
                      const uOrders = getUserOrders(inspectingUserOrders);
                      const totalSpent = uOrders.reduce((sum, o) => sum + (o.total || 0), 0);
                      const totalUnits = uOrders.reduce(
                        (sum, o) =>
                          sum + (o.items || []).reduce((iSum, it) => iSum + (it.quantity || 1), 0),
                        0,
                      );

                      return (
                        <>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="rounded-xl border border-border bg-muted/30 p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Orders Placed
                              </span>
                              <div className="text-xl font-bold text-foreground mt-0.5">
                                {uOrders.length}
                              </div>
                            </div>

                            <div className="rounded-xl border border-border bg-muted/30 p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Total Spent
                              </span>
                              <div className="text-xl font-bold text-primary mt-0.5">
                                ₹{totalSpent.toLocaleString("en-IN")}
                              </div>
                            </div>

                            <div className="rounded-xl border border-border bg-muted/30 p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Equipment Units
                              </span>
                              <div className="text-xl font-bold text-foreground mt-0.5">
                                {totalUnits} units
                              </div>
                            </div>

                            <div className="rounded-xl border border-border bg-muted/30 p-3">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                Avg Order Value
                              </span>
                              <div className="text-xl font-bold text-foreground mt-0.5">
                                ₹
                                {uOrders.length > 0
                                  ? Math.round(totalSpent / uOrders.length).toLocaleString("en-IN")
                                  : "0"}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
                                <ShoppingBag className="size-4 text-primary" />
                                <span>What This User Ordered ({uOrders.length})</span>
                              </h3>
                              <span className="text-xs text-muted-foreground">
                                Full breakdown of equipment line items & shipping
                              </span>
                            </div>

                            {uOrders.length === 0 ? (
                              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
                                <ShoppingBag className="size-10 text-muted-foreground/40 mx-auto mb-2" />
                                <div className="font-semibold text-sm text-foreground">
                                  No Orders Placed Yet
                                </div>
                                <p className="text-xs text-muted-foreground mt-1 max-w-md mx-auto">
                                  This user has registered an account but has not completed an equipment purchase yet. Once they place an order, all products and order items will appear here automatically.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-4">
                                {uOrders.map((ord) => (
                                  <div
                                    key={ord.id || ord.orderNumber}
                                    className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/40 transition-colors space-y-3"
                                  >
                                    {/* Order Item Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                                      <div className="flex items-center gap-2.5">
                                        <span className="font-mono text-xs font-bold text-foreground bg-primary/10 text-primary px-2.5 py-1 rounded-lg">
                                          {ord.orderNumber || ord.id}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {ord.createdAt
                                            ? new Date(ord.createdAt).toLocaleString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                              })
                                            : "Recent Order"}
                                        </span>
                                      </div>

                                      <div className="flex items-center gap-2">
                                        <span
                                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                                            ord.status === "delivered"
                                              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                                              : ord.status === "shipped" || ord.status === "dispatched"
                                                ? "bg-blue-500/10 text-blue-600 border border-blue-500/20"
                                                : ord.status === "confirmed"
                                                  ? "bg-purple-500/10 text-purple-600 border border-purple-500/20"
                                                  : ord.status === "cancelled"
                                                    ? "bg-red-500/10 text-red-600 border border-red-500/20"
                                                    : "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                                          }`}
                                        >
                                          {ord.status ? ord.status.toUpperCase() : "PLACED"}
                                        </span>

                                        <select
                                          value={
                                            ord.status === "pending"
                                              ? "placed"
                                              : ord.status === "dispatched"
                                                ? "shipped"
                                                : ord.status || "placed"
                                          }
                                          onChange={async (e) => {
                                            const nextStatus = e.target.value as OrderItem["status"];
                                            const targetId = ord.id || ord.orderNumber;
                                            if (targetId) {
                                              await updateOrderStatus(targetId, nextStatus);
                                              showSuccessMessage(
                                                `Order status updated to "${nextStatus.toUpperCase()}".`,
                                              );
                                            }
                                          }}
                                          className="rounded-lg border border-input bg-background px-2 py-1 text-xs text-foreground focus:border-primary focus:outline-none"
                                        >
                                          <option value="placed">Placed</option>
                                          <option value="confirmed">Confirmed</option>
                                          <option value="shipped">Shipped</option>
                                          <option value="delivered">Delivered</option>
                                          <option value="cancelled">Cancelled</option>
                                        </select>
                                      </div>
                                    </div>

                                    {/* Items Table */}
                                    <div className="overflow-hidden rounded-lg border border-border/60">
                                      <table className="w-full text-left text-xs">
                                        <thead className="bg-muted/40 font-semibold text-muted-foreground border-b border-border/60">
                                          <tr>
                                            <th className="px-3 py-2">Equipment Item</th>
                                            <th className="px-3 py-2 text-center">Quantity</th>
                                            <th className="px-3 py-2 text-right">Unit Price</th>
                                            <th className="px-3 py-2 text-right">Line Total</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border/40">
                                          {(ord.items || []).map((item, idx) => (
                                            <tr key={idx} className="hover:bg-muted/20">
                                              <td className="px-3 py-2.5 font-medium text-foreground">
                                                {item.name}
                                              </td>
                                              <td className="px-3 py-2.5 text-center font-bold">
                                                {item.quantity}
                                              </td>
                                              <td className="px-3 py-2.5 text-right text-muted-foreground">
                                                ₹{(item.price || 0).toLocaleString("en-IN")}
                                              </td>
                                              <td className="px-3 py-2.5 text-right font-bold text-foreground">
                                                ₹{((item.quantity || 1) * (item.price || 0)).toLocaleString("en-IN")}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* Meta & Total */}
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1 text-xs">
                                      <div className="space-y-0.5 text-muted-foreground">
                                        {ord.shippingAddress && (
                                          <div>
                                            <span className="font-semibold text-foreground">
                                              Shipping To:{" "}
                                            </span>
                                            {ord.shippingAddress}
                                          </div>
                                        )}
                                        <div className="flex items-center gap-3 text-[11px]">
                                          <span>
                                            <span className="font-semibold text-foreground">
                                              Payment:{" "}
                                            </span>
                                            {ord.paymentMethod?.toUpperCase()}
                                          </span>
                                          {ord.gstin && (
                                            <span>
                                              <span className="font-semibold text-foreground">
                                                GSTIN:{" "}
                                              </span>
                                              {ord.gstin}
                                            </span>
                                          )}
                                          {ord.estimatedDelivery && (
                                            <span>
                                              <span className="font-semibold text-foreground">
                                                Est. Delivery:{" "}
                                              </span>
                                              {ord.estimatedDelivery}
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      <div className="text-right shrink-0">
                                        <div className="text-[11px] text-muted-foreground">
                                          Subtotal: ₹{(ord.subtotal || 0).toLocaleString("en-IN")} | GST: ₹{(ord.gst || 0).toLocaleString("en-IN")}
                                        </div>
                                        <div className="font-display text-base font-black text-primary">
                                          Total: ₹{(ord.total || 0).toLocaleString("en-IN")}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </>
                      );
                    })()}

                    <div className="flex justify-end pt-2 border-t border-border">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setInspectingUserOrders(null)}
                        className="text-xs"
                      >
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Role Explainer Card */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center gap-2 font-bold text-xs text-primary">
                    <ShieldCheck className="size-4" />
                    <span>Administrator</span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    Full control over Firestore products catalog, customer leads management, user
                    roles assignment, and portal operations.
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
                              Administrator Email Address{" "}
                              <span className="text-destructive">*</span>
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
                                setNewAdminForm((prev) => ({
                                  ...prev,
                                  displayName: e.target.value,
                                }))
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
                              If provided, a Firebase Auth account is created automatically so they
                              can sign in via email and password. They can also use "Continue with
                              Google" if this is a Google email.
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
                              <option value="Operations & Field Safety">
                                Operations & Field Safety
                              </option>
                              <option value="Fire Protection Engineering">
                                Fire Protection Engineering
                              </option>
                              <option value="Hydrant & Piping Systems">
                                Hydrant & Piping Systems
                              </option>
                              <option value="Safety Audits & Compliance">
                                Safety Audits & Compliance
                              </option>
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
                                onClick={() =>
                                  copyToClipboard(adminCreatedInfo.email, "Admin Email")
                                }
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
                            const origin =
                              typeof window !== "undefined" ? window.location.origin : "";
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
                          <strong className="text-foreground">{adminToDelete.email}</strong>? They
                          will immediately lose access to this portal.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => setAdminToDelete(null)}>
                        Keep Admin Access
                      </Button>
                      <Button variant="destructive" size="sm" onClick={handleConfirmDeleteAdmin}>
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
                    Legal registration, GSTIN, dispatch hotlines, and wire settlement details for
                    formal quotations.
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
                      <span className="font-semibold text-foreground">
                        Industrial Fire & Safety Engineering
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">State Jurisdiction</span>
                      <span className="font-semibold text-foreground">Andhra Pradesh, India</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Operating Code Standards</span>
                      <span className="font-mono font-bold text-primary">
                        IS 15683 / NBC 2016 / PESO
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Primary Depot Hub</span>
                      <span className="font-semibold text-foreground">
                        Visakhapatnam Central Depot
                      </span>
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
                          {copiedText === "GSTIN" ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">State Code</span>
                      <span className="font-mono font-bold text-foreground">
                        37 (Andhra Pradesh)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Safety Hardware Tax Slab</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        18% GST (CGST 9% + SGST 9%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-border/50">
                      <span className="text-muted-foreground">Permanent Account Number (PAN)</span>
                      <span className="font-mono text-foreground">AAEFU1234F</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-muted-foreground">Invoicing Format</span>
                      <span className="font-semibold text-foreground">
                        B2B Tax Invoice with HSN Summary
                      </span>
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
                        <div className="text-[11px] text-muted-foreground">
                          Order dispatches, AMC calls & site audits
                        </div>
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
                          {copiedText === "Phone 1" ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20">
                      <div>
                        <div className="font-bold text-foreground">Secondary Technical Desk</div>
                        <div className="text-[11px] text-muted-foreground">
                          Pump automation, hydrants & NOC support
                        </div>
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
                          {copiedText === "Phone 2" ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-muted/20">
                      <div>
                        <div className="font-bold text-foreground">Official RFQ Mailbox</div>
                        <div className="text-[11px] text-muted-foreground">
                          Formal quotations & commercial proposals
                        </div>
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
                          {copiedText === "Email" ? (
                            <Check className="size-3" />
                          ) : (
                            <Copy className="size-3" />
                          )}
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
                      <span className="font-semibold text-foreground">
                        State Bank of India (SBI)
                      </span>
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
                          {copiedText === "Account No" ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
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
                          {copiedText === "IFSC" ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
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
                          {copiedText === "UPI" ? (
                            <Check className="size-3.5" />
                          ) : (
                            <Copy className="size-3.5" />
                          )}
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
                        Autonagar Industrial Estate, Gajuwaka Zone, Visakhapatnam, AP - 530012.
                        Primary dispatch center for fire pumps, hydrant valves, and heavy equipment.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <MapPin className="size-3.5 text-primary" />
                        <span>Mangalagiri Hub (Amaravati)</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Express Logistics Corridor, Mangalagiri, Guntur/Vijayawada Corridor, AP -
                        522503. Rapid distribution of ISI fire extinguishers and PPE gear.
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-border bg-muted/20 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-foreground">
                        <MapPin className="size-3.5 text-primary" />
                        <span>Rayalaseema & Sri City Hub</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Renigunta Road Industrial Corridor, Tirupati, AP - 517506. Servicing
                        automotive vendor parks, electronics manufacturing, and southern industrial
                        corridors.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 6. TASK A: Shipping & Dispatch Delivery Timing Configuration */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Truck className="size-4 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Shipping &amp; Dispatch Timing Configuration
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Configure official fulfillment day ranges and priority emergency dispatch surcharges. Changes update dynamically across checkout and order documents.
                  </p>

                  <form onSubmit={handleSaveShippingSettings} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Standard Delivery Min Days
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={shippingSettings.standardDaysMin}
                          onChange={(e) =>
                            setShippingSettings({
                              ...shippingSettings,
                              standardDaysMin: Number(e.target.value) || 1,
                              standardDeliveryDaysMin: Number(e.target.value) || 1,
                            })
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Standard Delivery Max Days
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={shippingSettings.standardDaysMax}
                          onChange={(e) =>
                            setShippingSettings({
                              ...shippingSettings,
                              standardDaysMax: Number(e.target.value) || 1,
                              standardDeliveryDaysMax: Number(e.target.value) || 1,
                            })
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Priority Dispatch Min Days
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={shippingSettings.priorityDaysMin}
                          onChange={(e) =>
                            setShippingSettings({
                              ...shippingSettings,
                              priorityDaysMin: Number(e.target.value) || 1,
                              priorityDeliveryDaysMin: Number(e.target.value) || 1,
                            })
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Priority Dispatch Max Days
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={shippingSettings.priorityDaysMax}
                          onChange={(e) =>
                            setShippingSettings({
                              ...shippingSettings,
                              priorityDaysMax: Number(e.target.value) || 1,
                              priorityDeliveryDaysMax: Number(e.target.value) || 1,
                            })
                          }
                          className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold text-foreground mb-1">
                        Priority / Emergency Dispatch Fee in ₹ (INR)
                      </label>
                      <input
                        type="number"
                        min={0}
                        value={shippingSettings.priorityCharge}
                        onChange={(e) =>
                          setShippingSettings({
                            ...shippingSettings,
                            priorityCharge: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Default is ₹0 (Free priority emergency dispatch for industrial clients).
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSavingShipping}
                        className="text-xs font-semibold gap-1.5"
                      >
                        {isSavingShipping && <RefreshCw className="size-3 animate-spin" />}
                        <span>Save Shipping Settings</span>
                      </Button>
                    </div>
                  </form>
                </div>

                {/* 7. TASK F: Social & External Media Profiles */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Instagram className="size-4 text-pink-600" />
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Social &amp; Brand Profiles (Instagram)
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Update the official Sri Udharchi Enterprises Instagram profile URL. Stored dynamically in Firestore <code className="font-mono text-primary text-[11px]">settings/social</code>.
                  </p>

                  <form onSubmit={handleSaveSocialSettings} className="space-y-4">
                    <div className="text-xs">
                      <label className="block font-semibold text-foreground mb-1">
                        Instagram Profile URL
                      </label>
                      <div className="relative">
                        <Instagram className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={socialSettings.instagramUrl}
                          onChange={(e) =>
                            setSocialSettings({
                              ...socialSettings,
                              instagramUrl: e.target.value,
                            })
                          }
                          placeholder="https://instagram.com/sri_udharchi_enterprises"
                          className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Current default: <span className="font-mono text-foreground font-bold">{socialSettings.instagramUrl}</span>
                      </p>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSavingSocial}
                        className="text-xs font-semibold gap-1.5 bg-pink-600 hover:bg-pink-700 text-white"
                      >
                        {isSavingSocial && <RefreshCw className="size-3 animate-spin" />}
                        <span>Save Social Profiles</span>
                      </Button>
                    </div>
                  </form>
                </div>

                {/* Contact & Support Configuration */}
                <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2 border-b border-border pb-3">
                    <Phone className="size-4 text-primary" />
                    <h3 className="font-display text-sm font-bold text-foreground">
                      Contact, Emergency Hotline &amp; Support Configuration
                    </h3>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Update the official Sri Udharchi Enterprises customer support lines, secondary hotlines, notification emails, and physical headquarters address. Stored dynamically in Firestore <code className="font-mono text-primary text-[11px]">settings/contact</code>.
                  </p>

                  <form onSubmit={handleSaveContactSettings} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Primary Support Phone / 24/7 Hotline
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={contactSettings.supportPhone}
                            onChange={(e) =>
                              setContactSettings({
                                ...contactSettings,
                                supportPhone: e.target.value,
                              })
                            }
                            placeholder="+91 8639858221"
                            className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Secondary Emergency Phone
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                          <input
                            type="text"
                            value={contactSettings.secondaryPhone}
                            onChange={(e) =>
                              setContactSettings({
                                ...contactSettings,
                                secondaryPhone: e.target.value,
                              })
                            }
                            placeholder="+91 9030609171"
                            className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Customer Support Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={contactSettings.supportEmail}
                            onChange={(e) =>
                              setContactSettings({
                                ...contactSettings,
                                supportEmail: e.target.value,
                              })
                            }
                            placeholder="sriudharchienterprises@gmail.com"
                            className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold text-foreground mb-1">
                          Order Notification / Admin Email
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                          <input
                            type="email"
                            value={contactSettings.adminEmail}
                            onChange={(e) =>
                              setContactSettings({
                                ...contactSettings,
                                adminEmail: e.target.value,
                              })
                            }
                            placeholder="admin@udharchienterprises.com"
                            className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-xs">
                      <label className="block font-semibold text-foreground mb-1">
                        Physical Office &amp; Supply Hub Address
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                        <textarea
                          rows={2}
                          value={contactSettings.address}
                          onChange={(e) =>
                            setContactSettings({
                              ...contactSettings,
                              address: e.target.value,
                            })
                          }
                          placeholder="H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241"
                          className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      <Button
                        type="submit"
                        size="sm"
                        disabled={isSavingContact}
                        className="text-xs font-semibold gap-1.5"
                      >
                        {isSavingContact && <RefreshCw className="size-3 animate-spin" />}
                        <span>Save Contact Settings</span>
                      </Button>
                    </div>
                  </form>
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
                  <Activity
                    className={`size-3.5 ${latencyTesting ? "animate-spin" : "text-emerald-500"}`}
                  />
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

        {/* TASK E & C: ORDER DELIVERY & INSTALLATION MODAL */}
        {deliveringOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                    <Truck className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Mark Order as Delivered
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      #{deliveringOrder.orderNumber || deliveringOrder.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setDeliveringOrder(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-semibold text-foreground">
                      {deliveringOrder.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="font-mono text-primary">{deliveringOrder.customerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Destination:</span>
                    <span className="text-foreground text-right truncate max-w-[220px]">
                      {deliveringOrder.shippingAddress}
                    </span>
                  </div>
                </div>

                {/* Items & Refill detection */}
                <div>
                  <label className="block font-bold text-foreground mb-1.5">
                    Equipment In Order &amp; Refill Cycles
                  </label>
                  <div className="rounded-lg border border-border divide-y divide-border">
                    {deliveringOrder.items?.map((item, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-foreground">{item.name}</div>
                          <div className="text-[11px] text-muted-foreground">Qty: {item.quantity}</div>
                        </div>
                        <span className="rounded bg-primary/10 px-2 py-0.5 font-bold text-primary text-[10px]">
                          {item.renewalMonths
                            ? `${item.renewalMonths} Months AMC`
                            : "Standard Inspection"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Installation / Commissioning Date
                  </label>
                  <input
                    type="date"
                    value={installDateInput}
                    onChange={(e) => setInstallDateInput(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Defaults to today ({getKolkataDateString()}). Sets the baseline for recurring renewal and refill alerts.
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Delivery &amp; On-Site Certification Note
                  </label>
                  <input
                    type="text"
                    value={deliveryNoteInput}
                    onChange={(e) => setDeliveryNoteInput(e.target.value)}
                    placeholder="Delivered, tested, and certified on site"
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3 text-[11px] text-muted-foreground leading-relaxed">
                  💡 Marking this order as <strong className="text-foreground font-semibold">Delivered</strong> will record <code className="text-primary font-mono">deliveredAt</code>, enable customer rating/feedback in their account, and automatically schedule AMC maintenance reminders.
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeliveringOrder(null)}
                  disabled={isDeliveringOrder}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmDeliverOrder}
                  disabled={isDeliveringOrder}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  {isDeliveringOrder && <RefreshCw className="size-3.5 animate-spin" />}
                  <span>Confirm Delivery &amp; Schedule Alerts</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TASK E: COMPLETE RENEWAL REMINDER MODAL */}
        {completingReminder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Complete Maintenance Cycle
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      Cycle #{completingReminder.cycle || 1} • {completingReminder.productName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setCompletingReminder(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div className="rounded-xl border border-border bg-muted/20 p-3.5 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Customer:</span>
                    <span className="font-semibold text-foreground">
                      {completingReminder.customerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-mono text-primary">#{completingReminder.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Renewal Target:</span>
                    <span className="font-mono font-bold text-foreground">
                      {completingReminder.renewalDate}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">
                    Service / Refill Completion Date
                  </label>
                  <input
                    type="date"
                    value={completionDateInput}
                    onChange={(e) => setCompletionDateInput(e.target.value)}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                <div className="rounded-xl border border-border p-3 flex items-start gap-3 bg-card">
                  <input
                    type="checkbox"
                    id="scheduleNextCycle"
                    checked={scheduleNextCycleInput}
                    onChange={(e) => setScheduleNextCycleInput(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <label htmlFor="scheduleNextCycle" className="text-xs text-foreground select-none cursor-pointer">
                    <strong className="block font-semibold">Schedule Next Renewal Cycle Automatically</strong>
                    <span className="text-muted-foreground text-[11px] leading-relaxed block mt-0.5">
                      Rolls over to Cycle #{(completingReminder.cycle || 1) + 1} with a new renewal date {completingReminder.renewalMonths} months forward from the service date (with month-end clamping).
                    </span>
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCompletingReminder(null)}
                  disabled={isCompletingReminder}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleConfirmCompleteReminder}
                  disabled={isCompletingReminder}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  {isCompletingReminder && <RefreshCw className="size-3.5 animate-spin" />}
                  <span>Mark Cycle Completed</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* TASK C: ORDER STATUS HISTORY AUDIT MODAL */}
        {viewHistoryOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Clock className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      Status History &amp; Audit Trail
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono">
                      #{viewHistoryOrder.orderNumber || viewHistoryOrder.id}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewHistoryOrder(null)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                  aria-label="Close"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {(!viewHistoryOrder.statusHistory || viewHistoryOrder.statusHistory.length === 0) ? (
                  <div className="p-4 text-center text-xs text-muted-foreground">
                    No history log entries recorded for this legacy order.
                  </div>
                ) : (
                  <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {viewHistoryOrder.statusHistory.map((item, idx) => (
                      <div key={idx} className="relative text-xs space-y-1">
                        <div className="absolute -left-6 top-1 size-2 rounded-full bg-primary ring-4 ring-background" />
                        <div className="flex items-center justify-between">
                          <span
                            className={`rounded px-1.5 py-0.2 font-mono font-bold uppercase text-[10px] ${
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
                          <div className="text-foreground leading-relaxed text-[11px]">
                            {item.note}
                          </div>
                        )}
                        {item.updatedBy && (
                          <div className="text-[10px] text-muted-foreground">
                            By: <span className="font-medium text-foreground">{item.updatedBy}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewHistoryOrder(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
