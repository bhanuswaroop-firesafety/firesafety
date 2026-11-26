import { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  Truck,
  Package,
  QrCode,
  Smartphone,
  Mail,
  Send,
  Bell,
  Settings,
  Users,
  ShieldCheck,
  FileText,
  Printer,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Layers,
  Phone,
  MessageSquare,
  Key,
  Database,
  Building2,
  Calendar,
  IndianRupee,
  HelpCircle,
  Clock,
  ArrowRight,
  BadgeAlert,
} from "lucide-react";
import { Button } from "@/components/button";

interface AdminManualProps {
  onNavigateTab?: (tab: string) => void;
}

interface SectionItem {
  id: string;
  title: string;
  category: "orders" | "catalog" | "leads" | "settings" | "storefront" | "overview";
  icon: any;
  summary: string;
  badge?: string;
  content: React.ReactNode;
}

export function AdminManual({ onNavigateTab }: AdminManualProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedSection, setExpandedSection] = useState<string>("overview");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  const manualSections: SectionItem[] = [
    {
      id: "overview",
      title: "1. Executive Command Center Overview",
      category: "overview",
      icon: ShieldCheck,
      summary: "Understanding the real-time dashboard, KPIs, Firestore live streams, and role-based permissions.",
      badge: "Core Basics",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            Welcome to the <strong>Sri Udharchi Enterprises Admin Portal</strong>. This command center is connected directly to Google Cloud Firestore via real-time listeners. Any update made by customers (orders, inquiries, ratings) or administrators (status updates, product changes, banners) syncs live within milliseconds without needing page refreshes.
          </p>

          <div className="grid gap-3 sm:grid-cols-3 pt-2">
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Live Connection</span>
              <div className="font-bold text-foreground text-sm flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Cloud Firestore Active</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                All data syncs instantly across all connected admin screens.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Security & Roles</span>
              <div className="font-bold text-foreground text-sm">Role-Based Access (RBAC)</div>
              <p className="text-[11px] text-muted-foreground">
                Only verified administrator accounts in <code>authorized_admins</code> can access this portal.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Legal Compliance</span>
              <div className="font-bold text-foreground text-sm">NBC 2016 & IS 15683</div>
              <p className="text-[11px] text-muted-foreground">
                Every order generates official GST-compliant documentation and safety audit logs.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span>Main Navigation Shortcuts</span>
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 text-xs">
              <div>
                <strong>• Orders & Dispatches:</strong> Process payments, enter tracking IDs, trigger customer emails & WhatsApp updates.
              </div>
              <div>
                <strong>• Products Catalog:</strong> Add or edit certified safety equipment, pricing, 18% GST calculation, and stock.
              </div>
              <div>
                <strong>• Customer Leads & RFQs:</strong> View quotation inquiries submitted via the public website.
              </div>
              <div>
                <strong>• Settings:</strong> Configure Gmail App Password (SMTP), official PhonePe UPI VPA, and add team admins.
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "orders-workflow",
      title: "2. Order Fulfillment, Shipping & Customer Alerts (Step-by-Step)",
      category: "orders",
      icon: Truck,
      summary: "Complete guide on receiving orders, verifying PhonePe/COD, entering AWB tracking, and sending emails & WhatsApp.",
      badge: "Crucial Workflow",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            Managing orders is the central daily operational task. Here is the standard operating procedure (SOP) for dispatching certified safety gear:
          </p>

          {/* Workflow Stepper */}
          <div className="space-y-3 pt-1">
            {/* Step 1 */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">1</span>
                <span className="text-foreground text-sm">Receive New Order & Verify Payment</span>
              </div>
              <p className="text-xs">
                When a customer completes checkout, the order appears immediately under the <strong>Orders & Dispatches</strong> tab with status <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 font-bold text-[11px]">Placed</span>.
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-2">
                <li>
                  <strong>PhonePe UPI Orders:</strong> Check the customer's 13-digit Transaction ID or bank UTR (e.g. <code>T2611...</code>) shown under payment details. Match it with your PhonePe Merchant App / SMS. Click <strong>Verify Payment</strong> to mark payment as Paid.
                </li>
                <li>
                  <strong>Cash on Delivery (COD):</strong> Customer pays upon delivery. Payment status remains pending until certified delivery.
                </li>
              </ul>
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">2</span>
                <span className="text-foreground text-sm">Confirm Order & Pack Equipment</span>
              </div>
              <p className="text-xs">
                In the order row status dropdown, change status from <strong>Placed</strong> to <strong>Confirmed</strong>. This notifies the customer their order has been verified and sent to the Palasamudram Logistics Depot for testing and packaging.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">3</span>
                <span className="text-foreground text-sm">Dispatch with Courier & Enter Tracking Info</span>
              </div>
              <p className="text-xs">
                Select <strong>Shipped</strong> in the status dropdown. A dedicated shipping modal will open asking for:
              </p>
              <div className="grid gap-2 sm:grid-cols-3 text-xs bg-muted/40 p-3 rounded-lg border border-border/60">
                <div>
                  <strong>Courier Partner:</strong> e.g. Blue Dart, Delhivery, VRL Logistics, DTDC, Gati.
                </div>
                <div>
                  <strong>AWB / Tracking ID:</strong> e.g. <code>BLD893719234</code>.
                </div>
                <div>
                  <strong>Live Tracking URL:</strong> (Optional) Direct courier tracking link.
                </div>
              </div>
              <p className="text-xs font-semibold text-foreground pt-1">
                👉 What happens automatically when you click "Confirm & Mark as Shipped":
              </p>
              <div className="grid gap-2 sm:grid-cols-2 text-xs">
                <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Mail className="size-3.5" />
                    <span>Automated Dispatch Email</span>
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    An official HTML dispatch notification with AWB tracking link, equipment list, and invoice totals is sent to the customer's email.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg border border-purple-500/30 bg-purple-500/5 space-y-1">
                  <span className="font-bold text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                    <Smartphone className="size-3.5" />
                    <span>Real-Time Device Push (FCM)</span>
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    A live popup notification is sent to the customer's phone or computer screen (even with the site closed).
                  </p>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">4</span>
                <span className="text-foreground text-sm">1-Click WhatsApp Customer Tracking</span>
              </div>
              <p className="text-xs">
                Next to each shipped order row, click the green <strong>WhatsApp Tracking</strong> button. This instantly opens WhatsApp addressed to the customer's phone with a ready-made tracking message:
              </p>
              <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono relative">
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      "Hello Valued Customer, your industrial fire safety order from Sri Udharchi Enterprises has been DISPATCHED via Blue Dart (AWB: BLD893719234). Live tracking: https://sriudharchienterprises.com/orders?tab=tracking",
                      "wa-sample",
                    )
                  }
                  className="absolute right-2.5 top-2.5 px-2 py-0.5 rounded bg-white/20 text-[10px] hover:bg-white/30 flex items-center gap-1"
                >
                  {copiedCode === "wa-sample" ? <Check className="size-3" /> : <Copy className="size-3" />}
                  <span>{copiedCode === "wa-sample" ? "Copied" : "Copy Template"}</span>
                </button>
                <p>
                  "Hello [Customer Name], your safety equipment order #[OrderNumber] from Sri Udharchi Enterprises has been DISPATCHED via [Courier] (AWB: [AWB]). Track live: [TrackingLink]"
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-primary font-bold">
                <span className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">5</span>
                <span className="text-foreground text-sm">Delivery & Safety Certification</span>
              </div>
              <p className="text-xs">
                When the courier confirms delivery or your technician completes on-site commissioning, change status to <strong>Delivered</strong>. This closes the order, records the statutory delivery timestamp, and automatically schedules the next annual equipment refill inspection reminder.
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            {onNavigateTab && (
              <Button size="sm" onClick={() => onNavigateTab("orders")} className="gap-1.5 text-xs font-bold">
                <Truck className="size-3.5" />
                <span>Go to Orders Tab Now</span>
              </Button>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "invoices-tax",
      title: "3. Official GST Tax Invoices & Proforma Billing",
      category: "orders",
      icon: FileText,
      summary: "How to view, print, and export GST-compliant Tax Invoices with HSN codes and QR codes.",
      badge: "Invoicing",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            Every order in the system automatically generates a legally compliant <strong>GST Tax Invoice / Proforma Invoice</strong> formatted strictly in accordance with Indian Central GST Act requirements.
          </p>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="font-bold text-foreground flex items-center gap-2">
              <Printer className="size-4 text-primary" />
              <span>How to Print or Download Invoices:</span>
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-xs">
              <li>
                In the <strong>Orders & Dispatches</strong> tab, find the target order.
              </li>
              <li>
                Click the <strong>Invoice</strong> / <strong>View Tax Invoice</strong> button in the action column.
              </li>
              <li>
                The full invoice modal opens with:
                <ul className="list-disc list-inside pl-4 pt-1 space-y-0.5 text-muted-foreground">
                  <li>Seller GSTIN, PAN, and Palasamudram Logistics Depot address.</li>
                  <li>Customer Billing & Delivery Address.</li>
                  <li>Itemized breakdown with HSN/SAC codes (e.g. <code>8424</code> for Fire Extinguishers).</li>
                  <li>CGST 9% + SGST 9% (or IGST 18% for inter-state deliveries).</li>
                  <li>Official QR Verification code.</li>
                </ul>
              </li>
              <li>
                Click <strong>Print / Save as PDF</strong> to generate the print-ready invoice to pack with physical consignments.
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "products-inventory",
      title: "4. Products Catalog, Pricing & Stock Management",
      category: "catalog",
      icon: Package,
      summary: "Adding new fire protection equipment, setting 18% GST rates, BIS/IS compliance, and inventory status.",
      badge: "Catalog",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            The product manager allows complete control over the public certified equipment store. All items listed appear live at <code>/products</code>.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <span className="font-bold text-foreground text-xs block">Adding a New Product</span>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                <li>Click <strong>+ Add New Product</strong> in the Products tab.</li>
                <li>Enter Product Name, Category, and short model code.</li>
                <li>Enter Base Price & MRP (GST is computed automatically).</li>
                <li>Specify Stock Level (e.g. In Stock, Low Stock, or Made-to-Order).</li>
                <li>Select Indian Standard Certification (e.g. IS 15683, IS 2190).</li>
              </ul>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5 space-y-2">
              <span className="font-bold text-foreground text-xs block">Categories & Industry Tags</span>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                <li>Fire Extinguishers (ABC, CO2, Foam, Water, Clean Agent).</li>
                <li>Fire Hydrant Valves, Hose Reels & Landing Valves.</li>
                <li>Automatic Sprinkler Systems & Gas Flooding.</li>
                <li>Industrial PPE, Fire Suits, Helmets & Boots.</li>
                <li>Explosion-Proof CCTV & Safety Surveillance.</li>
              </ul>
            </div>
          </div>

          <div className="pt-1">
            {onNavigateTab && (
              <Button size="sm" onClick={() => onNavigateTab("products")} className="gap-1.5 text-xs font-bold">
                <Package className="size-3.5" />
                <span>Open Product Catalog</span>
              </Button>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "leads-rfq",
      title: "5. Customer Leads, Quotation Requests & Inquiries",
      category: "leads",
      icon: MessageSquare,
      summary: "Managing inbound commercial safety inquiries, industrial site inspections, and consultation RFQs.",
      badge: "Sales Pipeline",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            When enterprise clients, factory managers, or commercial builders submit quote requests or site audit inquiries on the website, they are captured in real-time under <strong>Customer Leads & RFQs</strong>.
          </p>

          <div className="rounded-xl border border-border bg-card p-4 space-y-3">
            <h4 className="font-bold text-foreground text-xs">Managing Lead Stages:</h4>
            <div className="grid gap-2 sm:grid-cols-4 text-xs">
              <div className="p-2.5 rounded-lg border border-blue-500/30 bg-blue-500/5">
                <strong className="text-blue-600 block">1. New</strong>
                <span className="text-[11px] text-muted-foreground">Fresh customer inquiry awaiting initial response.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-500/5">
                <strong className="text-amber-600 block">2. Contacted</strong>
                <span className="text-[11px] text-muted-foreground">Technician or sales team reached out via phone/WhatsApp.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-purple-500/30 bg-purple-500/5">
                <strong className="text-purple-600 block">3. In Progress</strong>
                <span className="text-[11px] text-muted-foreground">Commercial estimate or site visit in progress.</span>
              </div>
              <div className="p-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5">
                <strong className="text-emerald-600 block">4. Closed / Won</strong>
                <span className="text-[11px] text-muted-foreground">Contract signed, equipment dispatched, or AMC finalized.</span>
              </div>
            </div>

            <p className="text-xs pt-1">
              <strong>Quick Actions:</strong> Each lead card includes 1-click <code>Call Lead</code> (dials directly) and <code>WhatsApp Chat</code> (opens WhatsApp with a pre-formatted safety consultation greeting).
            </p>
          </div>

          <div className="pt-1">
            {onNavigateTab && (
              <Button size="sm" onClick={() => onNavigateTab("inquiries")} className="gap-1.5 text-xs font-bold">
                <MessageSquare className="size-3.5" />
                <span>View Leads & Inquiries</span>
              </Button>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "refills-amc",
      title: "6. Refills, Hydro-Testing & AMC Maintenance Cycles",
      category: "orders",
      icon: RotateCcw,
      summary: "Statutory inspection reminders under IS 2190, hydro-test logging, and customer renewal alerts.",
      badge: "Compliance",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            Under Indian Standard <strong>IS 2190:2010</strong>, fire protection equipment requires mandatory scheduled servicing and hydraulic pressure testing.
          </p>

          <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
            <h4 className="font-bold text-foreground text-sm">Automated Refill Logging:</h4>
            <ul className="list-disc list-inside space-y-1.5 text-muted-foreground">
              <li>
                Whenever you mark an order as <strong>Delivered</strong>, the system inspects the equipment purchased (e.g. ABC Powder Extinguisher, CO2 Cylinder, Modular Suppression System) and automatically creates a service reminder with:
                <ul className="list-circle list-inside pl-4 pt-1 space-y-0.5">
                  <li><strong>Next Chemical Refill Due:</strong> 12 Months (1 Year) from delivery.</li>
                  <li><strong>Next Hydro-Pressure Test:</strong> 36 Months (3 Years) from delivery.</li>
                </ul>
              </li>
              <li>
                In the <strong>Refills & Renewals (AMC)</strong> tab, you can view upcoming due dates, filter overdue equipment, and trigger instant notification emails to clients reminding them of statutory compliance deadlines.
              </li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: "settings-setup",
      title: "7. Email (SMTP), PhonePe UPI & Staff Account Setup",
      category: "settings",
      icon: Settings,
      summary: "How to configure Gmail App Passwords, PhonePe Merchant VPA, and add/revoke team administrator privileges.",
      badge: "Configuration",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            The <strong>Business Profile & Settings</strong> tab controls your legal identity, automated notification channels, and payment gateway VPAs:
          </p>

          {/* Setup Subsections */}
          <div className="space-y-3">
            {/* SMTP Guide */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                <Mail className="size-4 text-primary" />
                <span>How to Setup Automated Customer Dispatch Emails (Gmail SMTP)</span>
              </div>
              <p className="text-xs">
                To enable automated shipping confirmation emails to customers, you must generate a 16-character <strong>Google App Password</strong>:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground pl-2">
                <li>Go to <a href="https://myaccount.google.com/security" target="_blank" rel="noreferrer" className="text-primary underline">Google Account Security</a> for your business email (<code>sriudharchienterprises@gmail.com</code>).</li>
                <li>Ensure <strong>2-Step Verification</strong> is ON.</li>
                <li>Search for <strong>"App passwords"</strong> in the top search bar.</li>
                <li>Create an app named <code>Firesafety Portal</code> and copy the 16-character password (e.g. <code>abcd efgh ijkl mnop</code>).</li>
                <li>Open the <strong>Settings &rarr; Communication</strong> tab, paste the 16-character password in <strong>Gmail App Password (SMTP)</strong>, and click <strong>Save Settings</strong>.</li>
              </ol>
            </div>

            {/* PhonePe VPA */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                <QrCode className="size-4 text-[#5f259f]" />
                <span>PhonePe Merchant UPI VPA Configuration</span>
              </div>
              <p className="text-xs">
                In <strong>Settings &rarr; Contact & Communication</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground pl-2">
                <li><strong>Merchant UPI ID (VPA):</strong> <code>sriudharchienterprises@okhdfcbank</code></li>
                <li><strong>PhonePe Registered Mobile:</strong> <code>8639858221</code></li>
                <li><strong>Proprietor Name:</strong> <code>Dabbara Bhanu Swaroop</code></li>
              </ul>
              <p className="text-[11px] text-muted-foreground pt-1">
                Updating these fields automatically regenerates the live QR codes and deep-links on customer checkout screens.
              </p>
            </div>

            {/* Staff Accounts */}
            <div className="rounded-xl border border-border bg-card p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-foreground text-sm">
                <Users className="size-4 text-primary" />
                <span>Managing Team Staff & Authorized Admins</span>
              </div>
              <p className="text-xs">
                In the <strong>Users & Staff (RBAC)</strong> tab, you can view all registered members. To grant administrative permissions to a staff member:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground pl-2">
                <li>Type their verified email in the <strong>Add Authorized Administrator</strong> field.</li>
                <li>Click <strong>Authorize Admin</strong>.</li>
                <li>The staff member can now sign in at <code>/admin/login</code> using Google Sign-In or Mobile OTP and access all operational features.</li>
              </ol>
            </div>
          </div>

          <div className="pt-1">
            {onNavigateTab && (
              <Button size="sm" onClick={() => onNavigateTab("settings")} className="gap-1.5 text-xs font-bold">
                <Settings className="size-3.5" />
                <span>Open Business Settings</span>
              </Button>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "storefront-customer",
      title: "8. Customer Storefront & Tracking Experience",
      category: "storefront",
      icon: ExternalLink,
      summary: "How customers browse products, sign in with OTP, place orders, track consignments, and receive push notifications.",
      badge: "Customer Journey",
      content: (
        <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-muted-foreground">
          <p>
            Understanding the customer's journey ensures you can support clients effectively over the phone or WhatsApp:
          </p>

          <div className="grid gap-3 sm:grid-cols-2 text-xs">
            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
              <span className="font-bold text-foreground block">1. Instant Mobile OTP Login</span>
              <p className="text-muted-foreground">
                Customers do not need complicated passwords. They enter their 10-digit mobile number, receive a 6-digit SMS OTP, and are logged in instantly.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
              <span className="font-bold text-foreground block">2. High-Value PhonePe Checkout</span>
              <p className="text-muted-foreground">
                For orders above ₹2,000, NPCI restricts auto-filled dynamic QRs. Our checkout provides both an <strong>Auto-Fill QR</strong> and a <strong>High-Value QR</strong> with clear guidance on manual amount entry up to ₹1,00,000.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
              <span className="font-bold text-foreground block">3. Live Order Tracking at /orders</span>
              <p className="text-muted-foreground">
                Customers can open <code>/orders</code> anytime to view their 5-stage live dispatch progress, courier tracking link, and download proforma invoices.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-card p-3.5 space-y-1.5">
              <span className="font-bold text-foreground block">4. Browser Push Notifications</span>
              <p className="text-muted-foreground">
                Customers can click <strong>Enable Push Alerts</strong> in their account notifications tab to receive real-time popup alerts whenever their consignment is dispatched or delivered.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  // Filtering
  const filteredSections = useMemo(() => {
    return manualSections.filter((sec) => {
      const matchesCategory = selectedCategory === "all" || sec.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [manualSections, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-primary/30 bg-gradient-to-r from-primary/10 via-card to-primary/5 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
              <BookOpen className="size-3.5" />
              <span>Sri Udharchi Enterprises Operations Handbook</span>
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-black text-foreground">
              User &amp; Operations Manual
            </h2>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
              Complete operational guide for dispatch administrators, technical engineers, and customer service staff. Learn how to manage orders, dispatch shipments, verify payments, update products, and manage system settings.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a href="/" target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs font-semibold">
                <span>Open Storefront</span>
                <ExternalLink className="size-3" />
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="size-4 absolute left-3.5 top-3 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics (e.g. shipping, dispatch email, PhonePe UTR, invoice, SMTP, products)..."
            className="w-full rounded-xl border border-border bg-card pl-10 pr-4 py-2 text-xs sm:text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: "all", label: "All Topics" },
            { id: "orders", label: "Orders & Shipping" },
            { id: "catalog", label: "Products" },
            { id: "leads", label: "Leads & RFQs" },
            { id: "settings", label: "Settings & Setup" },
            { id: "storefront", label: "Storefront" },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-primary text-primary-foreground font-bold shadow-xs"
                  : "bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Manual Content Sections */}
      <div className="space-y-4">
        {filteredSections.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-12 text-center space-y-3">
            <HelpCircle className="size-10 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-foreground text-sm">No operational guide found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No topics matched "{searchQuery}". Try searching for "shipping", "invoice", "PhonePe", "email", or "stock".
            </p>
            <Button size="sm" variant="outline" onClick={() => setSearchQuery("")} className="text-xs">
              Reset Search
            </Button>
          </div>
        ) : (
          filteredSections.map((section) => {
            const isExpanded = expandedSection === section.id;
            const Icon = section.icon;

            return (
              <div
                key={section.id}
                className={`rounded-2xl border transition-all ${
                  isExpanded
                    ? "border-primary/40 bg-card shadow-sm"
                    : "border-border bg-card hover:border-primary/20"
                }`}
              >
                {/* Section Accordion Header */}
                <button
                  type="button"
                  onClick={() => setExpandedSection(isExpanded ? "" : section.id)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 text-left gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isExpanded
                          ? "bg-primary text-primary-foreground"
                          : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-foreground">
                          {section.title}
                        </h3>
                        {section.badge && (
                          <span className="rounded-full bg-primary/10 text-primary border border-primary/20 px-2 py-0.5 text-[10px] font-bold">
                            {section.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {section.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
                      {isExpanded ? "Collapse" : "Read Guide"}
                    </span>
                    <ChevronRight
                      className={`size-4 text-muted-foreground transition-transform ${
                        isExpanded ? "rotate-90 text-primary" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Expanded Content Body */}
                {isExpanded && (
                  <div className="border-t border-border/70 p-4 sm:p-6 bg-muted/10 rounded-b-2xl">
                    {section.content}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Support & Logistics Depot Contact Card */}
      <div className="rounded-2xl border border-border bg-muted/20 p-5 space-y-3 text-xs">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Building2 className="size-4 text-primary" />
          <span>Central Logistics &amp; Technical Support Desk</span>
        </div>
        <p className="text-muted-foreground leading-relaxed">
          For technical issues, database maintenance, or emergency order dispatch queries:
        </p>
        <div className="grid gap-2 sm:grid-cols-3 text-xs text-muted-foreground">
          <div>
            <strong>Proprietor:</strong> Dabbara Bhanu Swaroop
          </div>
          <div>
            <strong>Direct Phone:</strong> +91 8639858221
          </div>
          <div>
            <strong>Support Email:</strong> sriudharchienterprises@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
}
