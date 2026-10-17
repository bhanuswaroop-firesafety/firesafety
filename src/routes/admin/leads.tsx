import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/auth-context";
import {
  subscribeLeads,
  subscribeOrders,
  type LeadItem,
  type OrderItem,
} from "@/lib/db-service";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/button";
import {
  Users,
  Search,
  Filter,
  Download,
  Phone,
  Mail,
  Building2,
  Calendar,
  Clock,
  ShoppingBag,
  ArrowLeft,
  RefreshCw,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageSquare,
  FileSpreadsheet,
  Check,
  Copy,
} from "lucide-react";
import { formatIndianMobileDisplay } from "@/lib/phone-utils";

export const Route = createFileRoute("/admin/leads")({
  head: () => ({
    meta: [
      { title: "Registered Customers & Leads | Admin Portal" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLeadsPage,
});

export function AdminLeadsPage() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [orderFilter, setOrderFilter] = useState<"all" | "ordered" | "not_ordered">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Real-time data subscriptions
  useEffect(() => {
    let unsubLeads: () => void = () => {};
    let unsubOrders: () => void = () => {};

    if (isAdmin) {
      unsubLeads = subscribeLeads((data) => {
        setLeads(data);
        setLoadingData(false);
      });

      unsubOrders = subscribeOrders((data) => {
        setOrders(data);
      });
    }

    return () => {
      unsubLeads();
      unsubOrders();
    };
  }, [isAdmin]);

  // Compute filtered leads list
  const filteredLeads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return leads.filter((lead) => {
      // Order status filter
      if (orderFilter === "ordered" && !lead.hasOrdered) return false;
      if (orderFilter === "not_ordered" && lead.hasOrdered) return false;

      // Search query filter (matches name, phone, email, company, orderId, or uid)
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
  }, [leads, searchQuery, orderFilter]);

  // KPI Metrics
  const totalLeadsCount = leads.length;
  const orderedCount = leads.filter((l) => l.hasOrdered).length;
  const notOrderedCount = leads.filter((l) => !l.hasOrdered).length;
  const conversionRate =
    totalLeadsCount > 0 ? ((orderedCount / totalLeadsCount) * 100).toFixed(1) : "0.0";

  // CSV Export Function
  const handleExportCSV = () => {
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
      `sri_udharchi_registered_customers_${orderFilter}_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // If auth is loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="size-8 animate-spin text-primary" />
          <p className="text-xs font-semibold text-muted-foreground">
            Verifying Administrator Credentials...
          </p>
        </div>
      </div>
    );
  }

  // Admin access guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-destructive/30 bg-card p-6 sm:p-8 text-center space-y-4 shadow-xl">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <ShieldAlert className="size-6" />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              Administrator Access Required
            </h1>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
              This CRM database contains proprietary lead records and customer data. You must be
              logged in with an authorized executive administrator account.
            </p>
          </div>
          <div className="pt-2 flex flex-col gap-2">
            <Button
              onClick={() => navigate({ to: "/admin/login" })}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10"
            >
              Sign In as Administrator
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: "/" })}
              className="w-full text-xs"
            >
              Return to Homepage
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur-md px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate({ to: "/admin" })}
            className="text-xs h-8 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" />
            <span>Admin Portal</span>
          </Button>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="size-4" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-foreground">
                Registered Customers / Leads
              </h1>
              <p className="text-[10px] text-muted-foreground">
                CRM Lead Tracking &amp; Customer Acquisition (Task 3)
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={handleExportCSV}
            disabled={filteredLeads.length === 0}
            className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold h-8 gap-1.5 shadow-xs"
          >
            <Download className="size-3.5" />
            <span>Export CSV ({filteredLeads.length})</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Total Captured</span>
              <Users className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-black text-foreground">{totalLeadsCount}</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              All registered users &amp; OTP leads
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Zero-Order Leads</span>
              <AlertCircle className="size-4 text-amber-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
              {notOrderedCount}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Registered but never ordered
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Converted Buyers</span>
              <ShoppingBag className="size-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {orderedCount}
            </div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Placed at least 1 order
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between text-muted-foreground text-xs font-semibold">
              <span>Lead Conversion</span>
              <CheckCircle2 className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-black text-primary">{conversionRate}%</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              Registration-to-order rate
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search leads by customer name, phone number, email, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Filter Toggle Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto p-0.5 bg-muted/40 rounded-lg border border-border/60">
              <button
                type="button"
                onClick={() => setOrderFilter("all")}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all ${
                  orderFilter === "all"
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                All ({leads.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter("not_ordered")}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  orderFilter === "not_ordered"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="size-1.5 rounded-full bg-amber-400" />
                <span>Zero Orders ({notOrderedCount})</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter("ordered")}
                className={`rounded-md px-3 py-1.5 text-xs font-bold transition-all flex items-center gap-1.5 ${
                  orderFilter === "ordered"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="size-1.5 rounded-full bg-emerald-400" />
                <span>Ordered ({orderedCount})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Leads Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-5 py-3">Customer / Lead</th>
                  <th className="px-5 py-3">Phone &amp; Contact</th>
                  <th className="px-5 py-3">Email Address</th>
                  <th className="px-5 py-3">Order Status</th>
                  <th className="px-5 py-3">Registered / Active</th>
                  <th className="px-5 py-3 text-right">Quick Follow-Up</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center text-muted-foreground">
                      <div className="mx-auto max-w-sm">
                        <Users className="size-10 text-muted-foreground/40 mx-auto mb-3" />
                        <div className="font-bold text-foreground text-sm">
                          {leads.length === 0
                            ? "No Registered Leads Captured Yet"
                            : "No Leads Match Current Filter"}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                          {leads.length === 0
                            ? "As customers log in via Mobile OTP or register their profile, their details will automatically appear here even if they never place an order."
                            : "Try clearing your search query or switching filters to 'All'."}
                        </p>
                      </div>
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
                        {/* 1. Customer Name & Company */}
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

                        {/* 2. Phone Contact */}
                        <td className="px-5 py-4 text-xs">
                          {lead.phone ? (
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-semibold text-foreground">
                                {formatIndianMobileDisplay(lead.phone)}
                              </span>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(lead.phone, `p-${lead.uid}`)}
                                title="Copy phone number"
                                className="text-muted-foreground hover:text-foreground transition-colors"
                              >
                                {copiedId === `p-${lead.uid}` ? (
                                  <Check className="size-3 text-emerald-500" />
                                ) : (
                                  <Copy className="size-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/60 italic text-[11px]">
                              No phone
                            </span>
                          )}
                        </td>

                        {/* 3. Email Address */}
                        <td className="px-5 py-4 text-xs">
                          {lead.email && !lead.email.includes("@mobile.udharchi.in") ? (
                            <a
                              href={`mailto:${lead.email}`}
                              className="text-foreground hover:text-primary transition-colors hover:underline"
                            >
                              {lead.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground/60 italic text-[11px]">
                              Email pending
                            </span>
                          )}
                        </td>

                        {/* 4. Order Status (Ordered vs Zero Orders) */}
                        <td className="px-5 py-4">
                          {lead.hasOrdered ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                <span className="size-1.5 rounded-full bg-emerald-500" />
                                <span>Ordered (Buyer)</span>
                              </span>
                              {lead.orderId && (
                                <p className="font-mono text-[10px] text-muted-foreground">
                                  Ref: {lead.orderId}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <span className="size-1.5 rounded-full bg-amber-500" />
                              <span>Zero Orders (Lead)</span>
                            </span>
                          )}
                        </td>

                        {/* 5. Registered / Last Active */}
                        <td className="px-5 py-4 text-xs">
                          <div className="text-foreground font-medium text-[11px]">
                            {lead.registeredAt
                              ? new Date(lead.registeredAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Recent"}
                          </div>
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Clock className="size-2.5 text-muted-foreground" />
                            <span>
                              Active:{" "}
                              {lead.lastActiveAt
                                ? new Date(lead.lastActiveAt).toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                  })
                                : "Recent"}
                            </span>
                          </div>
                        </td>

                        {/* 6. Quick Follow-Up Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {whatsappUrl && (
                              <a
                                href={whatsappUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 text-xs font-bold transition-colors border border-emerald-500/20"
                                title="Send WhatsApp Message"
                              >
                                <MessageSquare className="size-3" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            {lead.phone && (
                              <a
                                href={`tel:${lead.phone}`}
                                className="inline-flex items-center gap-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary px-2.5 py-1 text-xs font-bold transition-colors border border-primary/20"
                                title="Call Mobile Number"
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
      </main>
    </div>
  );
}
