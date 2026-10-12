import { useMemo, useState } from "react";
import type { ProductItem, InquiryItem, UserItem, CategoryItem, OrderItem } from "@/lib/types";
import { Button } from "@/components/button";
import {
  BarChart3,
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Flame,
  Layers,
  Mail,
  PieChart,
  Plus,
  ShieldCheck,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

interface AdminAnalyticsProps {
  products: ProductItem[];
  inquiries: InquiryItem[];
  usersList: UserItem[];
  categories: CategoryItem[];
  orders?: OrderItem[];
  onNavigateTab: (tab: "products" | "inquiries" | "users" | "analytics" | "orders" | "system") => void;
  onOpenAddProduct?: () => void;
}

export function AdminAnalytics({
  products,
  inquiries,
  usersList,
  categories,
  orders = [],
  onNavigateTab,
  onOpenAddProduct,
}: AdminAnalyticsProps) {
  const [timeRange, setTimeRange] = useState<"all" | "month" | "week">("all");

  // Filter inquiries based on timeRange
  const filteredInquiries = useMemo(() => {
    if (timeRange === "all") return inquiries;

    const now = new Date().getTime();
    const days = timeRange === "week" ? 7 : 30;
    const cutoff = now - days * 24 * 60 * 60 * 1000;

    return inquiries.filter((inq) => {
      const created = inq.createdAt ? new Date(inq.createdAt).getTime() : 0;
      return created >= cutoff;
    });
  }, [inquiries, timeRange]);

  // Inquiries breakdown by status
  const inquiryStats = useMemo(() => {
    const list = filteredInquiries;
    const total = list.length;
    const newCount = list.filter((i) => i.status === "new").length;
    const contactedCount = list.filter((i) => i.status === "contacted").length;
    const closedCount = list.filter((i) => i.status === "closed").length;

    const conversionRate = total > 0 ? Math.round((closedCount / total) * 100) : 0;
    const responseRate = total > 0 ? Math.round(((contactedCount + closedCount) / total) * 100) : 0;

    return { total, newCount, contactedCount, closedCount, conversionRate, responseRate };
  }, [filteredInquiries]);

  // Customer Orders Stats from Firestore
  const orderStats = useMemo(() => {
    const list = orders || [];
    const total = list.length;
    const pending = list.filter((o) => o.status === "pending").length;
    const confirmed = list.filter(
      (o) => o.status === "confirmed" || o.status === "dispatched" || o.status === "delivered",
    ).length;
    const revenue = list.reduce((sum, o) => sum + (o.total || 0), 0);
    return { total, pending, confirmed, revenue };
  }, [orders]);

  // Lead Activity Trend (Last 7 Days)
  const activityTrend = useMemo(() => {
    const daysMap: Record<string, number> = {};
    const dayItems: { label: string; dateKey: string }[] = [];

    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      const label = d.toLocaleDateString(undefined, { weekday: "short" });
      daysMap[dateKey] = 0;
      dayItems.push({ label, dateKey });
    }

    inquiries.forEach((inq) => {
      if (!inq.createdAt) return;
      const d = new Date(inq.createdAt);
      const dateKey = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (dateKey in daysMap) {
        daysMap[dateKey] = (daysMap[dateKey] || 0) + 1;
      }
    });

    const maxVal = Math.max(...Object.values(daysMap), 1);
    return {
      bars: dayItems.map(({ label, dateKey }) => ({ label, count: daysMap[dateKey] || 0 })),
      maxVal,
    };
  }, [inquiries]);

  // Product categories breakdown
  const categoryStats = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach((p) => {
      const cat = p.category || "Uncategorized";
      map[cat] = (map[cat] || 0) + 1;
    });

    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const maxVal = Math.max(...Object.values(map), 1);

    return { entries, maxVal };
  }, [products]);

  // Services demand breakdown from filtered inquiries
  const serviceDemand = useMemo(() => {
    const map: Record<string, number> = {};
    const list = filteredInquiries;
    list.forEach((inq) => {
      const srv = inq.service || "General Inquiry";
      map[srv] = (map[srv] || 0) + 1;
    });

    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const maxVal = Math.max(...Object.values(map), 1);

    return { entries, maxVal };
  }, [filteredInquiries]);

  // Facility / Sector demand breakdown from inquiries
  const facilityDemand = useMemo(() => {
    const map: Record<string, number> = {};
    const list = filteredInquiries;
    list.forEach((inq) => {
      let fac = inq.facility || "Standard";
      if (fac.includes(" (")) fac = fac.split(" (")[0] ?? fac;
      if (fac.includes(" -")) fac = fac.split(" -")[0] ?? fac;
      map[fac] = (map[fac] || 0) + 1;
    });

    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    const maxVal = Math.max(...Object.values(map), 1);

    return { entries, maxVal };
  }, [filteredInquiries]);

  // Stock health
  const stockHealth = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock !== false).length;
    const outOfStock = total - inStock;
    const featured = products.filter((p) => p.featured === true).length;
    const inStockPct = total > 0 ? Math.round((inStock / total) * 100) : 0;

    return { total, inStock, outOfStock, featured, inStockPct };
  }, [products]);

  // Donut SVG calculations
  const donutData = useMemo(() => {
    const total = inquiryStats.total;
    if (total === 0) {
      return {
        newPct: 0,
        contactedPct: 0,
        closedPct: 0,
      };
    }
    const newPct = (inquiryStats.newCount / total) * 100;
    const contactedPct = (inquiryStats.contactedCount / total) * 100;
    const closedPct = (inquiryStats.closedCount / total) * 100;

    return { newPct, contactedPct, closedPct };
  }, [inquiryStats]);

  return (
    <div className="space-y-8">
      {/* Top Controls / Overview Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="size-6 text-primary" />
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              Operations & Analytics Dashboard
            </h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Live business intelligence across catalog inventory, customer pipeline, and facility
            demands.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-card p-1 text-xs">
            <button
              type="button"
              onClick={() => setTimeRange("all")}
              className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                timeRange === "all"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Time ({inquiries.length})
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("month")}
              className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                timeRange === "month"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Past 30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange("week")}
              className={`rounded-md px-3 py-1 font-semibold transition-colors ${
                timeRange === "week"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Past 7 Days
            </button>
          </div>
        </div>
      </div>

      {/* KPI Highlight Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Inquiries Pipeline */}
        <div
          onClick={() => onNavigateTab("inquiries")}
          className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Total Inquiries
            </span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
              <Mail className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-foreground">
              {inquiryStats.total}
            </span>
            {inquiryStats.newCount > 0 && (
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                {inquiryStats.newCount} New
              </span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Response Rate:</span>
            <span className="font-bold text-foreground">{inquiryStats.responseRate}%</span>
          </div>
        </div>

        {/* KPI 2: Customer Orders & Invoiced Revenue */}
        <div
          onClick={() => onNavigateTab("orders")}
          className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-emerald-500/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Customer Orders
            </span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110">
              <ShoppingBag className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-foreground">
              {orderStats.total}
            </span>
            {orderStats.pending > 0 ? (
              <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-bold text-amber-500">
                {orderStats.pending} Pending
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">Orders</span>
            )}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Invoiced Volume:</span>
            <span className="font-bold text-foreground">
              ₹{orderStats.revenue.toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* KPI 3: Inventory Readiness */}
        <div
          onClick={() => onNavigateTab("products")}
          className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-amber-500/40 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Inventory Readiness
            </span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-110">
              <Boxes className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-foreground">
              {stockHealth.inStockPct}%
            </span>
            <span className="text-xs text-muted-foreground">In Stock</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{stockHealth.inStock} Available</span>
            <span>{stockHealth.outOfStock} Out of Stock</span>
          </div>
        </div>

        {/* KPI 4: Staff & Administration */}
        <div
          onClick={() => onNavigateTab("users")}
          className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-foreground/30 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Authorized Team
            </span>
            <div className="flex size-9 items-center justify-center rounded-lg bg-secondary/20 text-foreground transition-transform group-hover:scale-110">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-black text-foreground">
              {usersList.length}
            </span>
            <span className="text-xs text-muted-foreground">Members</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>RBAC Protected</span>
            <span className="font-bold text-primary">Active</span>
          </div>
        </div>
      </div>

      {/* Row 2: Pipeline Donut & Lead Activity Trend */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 1: Inquiry Pipeline Status (Donut Chart) */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <PieChart className="size-4 text-primary" />
              <h3 className="font-display text-base font-bold text-foreground">
                Inquiry Pipeline Status
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("inquiries")}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>View All Leads</span>
              <ExternalLink className="size-3" />
            </button>
          </div>

          <div className="mt-6 flex flex-col items-center justify-around gap-6 sm:flex-row">
            {/* Visual SVG Donut Chart */}
            <div className="relative size-44">
              <svg className="size-full -rotate-90" viewBox="0 0 36 36">
                {/* Background Ring */}
                <path
                  className="stroke-muted/40"
                  strokeWidth="3.8"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />

                {/* Segment 1: New (Primary) */}
                {donutData.newPct > 0 && (
                  <path
                    className="stroke-primary transition-all duration-700 ease-out"
                    strokeWidth="4.2"
                    strokeDasharray={`${donutData.newPct}, 100`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}

                {/* Segment 2: Contacted (Amber) */}
                {donutData.contactedPct > 0 && (
                  <path
                    className="stroke-amber-500 transition-all duration-700 ease-out"
                    strokeWidth="4.2"
                    strokeDasharray={`${donutData.contactedPct}, 100`}
                    strokeDashoffset={`-${donutData.newPct}`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}

                {/* Segment 3: Closed (Emerald) */}
                {donutData.closedPct > 0 && (
                  <path
                    className="stroke-emerald-500 transition-all duration-700 ease-out"
                    strokeWidth="4.2"
                    strokeDasharray={`${donutData.closedPct}, 100`}
                    strokeDashoffset={`-${donutData.newPct + donutData.contactedPct}`}
                    strokeLinecap="round"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                )}
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-display text-2xl font-black text-foreground">
                  {inquiryStats.total}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Leads
                </span>
              </div>
            </div>

            {/* Legend & Count Breakdown */}
            <div className="w-full max-w-xs space-y-2.5 text-xs">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-primary" />
                  <span className="font-medium text-foreground">New / Uncontacted</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{inquiryStats.newCount}</span>
                  <span className="text-[11px] text-muted-foreground">
                    (
                    {inquiryStats.total > 0
                      ? Math.round((inquiryStats.newCount / inquiryStats.total) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-amber-500" />
                  <span className="font-medium text-foreground">Contacted / In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{inquiryStats.contactedCount}</span>
                  <span className="text-[11px] text-muted-foreground">
                    (
                    {inquiryStats.total > 0
                      ? Math.round((inquiryStats.contactedCount / inquiryStats.total) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-2.5">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  <span className="font-medium text-foreground">Closed / Won Deals</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-foreground">{inquiryStats.closedCount}</span>
                  <span className="text-[11px] text-muted-foreground">
                    (
                    {inquiryStats.total > 0
                      ? Math.round((inquiryStats.closedCount / inquiryStats.total) * 100)
                      : 0}
                    %)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Lead Activity Trend Histogram */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              <h3 className="font-display text-base font-bold text-foreground">
                Inquiry Activity Trend (7 Days)
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">Daily incoming leads</span>
          </div>

          <div className="mt-6 flex h-48 items-end justify-between gap-2 pt-6">
            {activityTrend.bars.map((bar) => {
              const heightPct =
                bar.count > 0
                  ? Math.max(Math.round((bar.count / activityTrend.maxVal) * 100), 8)
                  : 0;
              return (
                <div
                  key={bar.label}
                  className="flex flex-1 flex-col items-center gap-2 group h-full justify-end"
                >
                  <span className="text-[11px] font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    {bar.count}
                  </span>
                  <div className="w-full max-w-[36px] bg-muted/40 rounded-t-lg overflow-hidden flex items-end h-32">
                    <div
                      className="w-full bg-gradient-to-t from-primary to-primary/70 rounded-t-lg transition-all duration-700 ease-out group-hover:brightness-110"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">
                    {bar.label}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
            <span>Recent weekly volume</span>
            <span className="font-semibold text-foreground">
              {inquiries.length} total recorded leads
            </span>
          </div>
        </div>
      </div>

      {/* Row 3: Catalog Categories Distribution & Service Demand */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Chart 3: Services Demand Breakdown */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="size-4 text-primary" />
              <h3 className="font-display text-base font-bold text-foreground">
                Customer Demand by Service
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {serviceDemand.entries.length} service types
            </span>
          </div>

          <div className="mt-5 space-y-3.5">
            {serviceDemand.entries.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No customer inquiries logged yet.
              </div>
            ) : (
              serviceDemand.entries.slice(0, 5).map(([service, count]) => {
                const pct = Math.round((count / serviceDemand.maxVal) * 100);
                return (
                  <div key={service} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground truncate max-w-[240px]">
                        {service}
                      </span>
                      <span className="font-bold text-primary">{count} leads</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chart 4: Products Distribution by Category */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              <h3 className="font-display text-base font-bold text-foreground">
                Products Catalog by Category
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab("products")}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              <span>Manage Products</span>
              <ExternalLink className="size-3" />
            </button>
          </div>

          <div className="mt-5 space-y-3.5">
            {categoryStats.entries.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                Catalog empty. Add products from the Products tab.
              </div>
            ) : (
              categoryStats.entries.map(([category, count]) => {
                const pct = Math.round((count / categoryStats.maxVal) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">{category}</span>
                      <span className="font-bold text-foreground">{count} items</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-amber-500 transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Client Demand by Facility & Industry Type */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-2">
              <Building2 className="size-4 text-primary" />
              <h3 className="font-display text-base font-bold text-foreground">
                Inquiries by Facility & Industry
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">Top Sectors</span>
          </div>

          <div className="mt-5 space-y-3.5">
            {facilityDemand.entries.length === 0 ? (
              <div className="py-12 text-center text-xs text-muted-foreground">
                No facility inquiries recorded yet.
              </div>
            ) : (
              facilityDemand.entries.slice(0, 5).map(([facility, count]) => {
                const pct = Math.round((count / facilityDemand.maxVal) * 100);
                return (
                  <div key={facility} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground truncate max-w-[240px]">
                        {facility}
                      </span>
                      <span className="font-bold text-primary">{count}</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all duration-700 ease-out"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Quick Action Shortcuts Banner */}
        <div className="flex flex-col justify-between rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-primary/5 p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2 font-display text-base font-bold text-foreground">
              <ShieldCheck className="size-5 text-primary" />
              <span>Catalog & Lead Management Quick Actions</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Manage your industrial inventory, update incoming quotation leads, export pipeline
              data, and configure administrator privileges.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Button size="sm" onClick={() => onNavigateTab("products")}>
              <Boxes className="size-3.5" />
              <span>Products Catalog</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigateTab("orders")}>
              <ShoppingBag className="size-3.5" />
              <span>Customer Orders</span>
            </Button>
            <Button size="sm" variant="outline" onClick={() => onNavigateTab("inquiries")}>
              <Mail className="size-3.5" />
              <span>Customer Inquiries</span>
            </Button>
            {onOpenAddProduct && (
              <Button size="sm" variant="secondary" onClick={onOpenAddProduct}>
                <Plus className="size-3.5" />
                <span>Add Product</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
