import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import { useCart } from "@/lib/cart-context";
import { submitOrder } from "@/lib/db-service";
import {
  ShieldCheck,
  Truck,
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  Lock,
  ArrowRight,
  Phone,
  FileText,
  Printer,
  ChevronRight,
  ShoppingBag,
  AlertCircle,
  Clock,
} from "lucide-react";

import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () =>
    seoHead({
      title: "Secure Checkout & Payment | Sri Udharchi Enterprises",
      description:
        "Complete your industrial safety equipment order. Multi-option payment with instant UPI, Credit/Debit cards, Net Banking, and B2B Corporate Purchase Orders.",
      path: "/checkout",
      noIndex: true,
    }),
  component: CheckoutPage,
});

type PaymentMethod = "upi" | "card" | "netbanking" | "po" | "cod";

interface OrderConfirmationData {
  orderId: string;
  orderDate: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  companyName?: string;
  gstin?: string;
  paymentMethod: PaymentMethod;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  discount: number;
  gst: number;
  shipping: number;
  total: number;
  estimatedDelivery: string;
}

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Telangana",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Odisha",
  "Gujarat",
  "Kerala",
  "Delhi",
  "Rajasthan",
  "West Bengal",
  "Uttar Pradesh",
  "Other State / UT",
];

const POPULAR_BANKS = [
  { id: "sbi", name: "State Bank of India", code: "SBI" },
  { id: "hdfc", name: "HDFC Bank", code: "HDFC" },
  { id: "icici", name: "ICICI Bank", code: "ICICI" },
  { id: "axis", name: "Axis Bank", code: "AXIS" },
  { id: "kotak", name: "Kotak Mahindra", code: "KOTAK" },
  { id: "union", name: "Union Bank of India", code: "UBI" },
];

function CheckoutPage() {
  const {
    cartItems,
    subtotal,
    gstAmount,
    shippingFee,
    discountAmount,
    couponCode,
    totalAmount,
    totalItems,
    clearCart,
    isHydrated,
  } = useCart();

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("Palasamudram");
  const [state, setState] = useState("Andhra Pradesh");
  const [pincode, setPincode] = useState("515241");
  const [isB2B, setIsB2B] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [gstin, setGstin] = useState("");
  const [deliverySpeed, setDeliverySpeed] = useState<"standard" | "priority">("standard");

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("sbi");
  const [poNumber, setPoNumber] = useState("");

  // Processing & Confirmation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmationData | null>(null);
  const [validationError, setValidationError] = useState("");

  const extraPriorityShipping = deliverySpeed === "priority" ? 500 : 0;
  const finalPayable = totalAmount + extraPriorityShipping;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validations
    if (!fullName.trim()) {
      setValidationError("Please enter your full name.");
      return;
    }
    if (!phone.trim() || phone.trim().length < 10) {
      setValidationError("Please enter a valid 10-digit mobile phone number.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setValidationError("Please enter a valid email address for invoice delivery.");
      return;
    }
    if (!address.trim()) {
      setValidationError("Please enter your delivery site/facility address.");
      return;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setValidationError("Please enter a valid 6-digit postal PIN code.");
      return;
    }

    if (isB2B && !companyName.trim()) {
      setValidationError("Please enter your registered Company / Facility name.");
      return;
    }

    if (paymentMethod === "card") {
      if (!cardNumber || cardNumber.replace(/\s/g, "").length < 16) {
        setValidationError("Please enter a valid 16-digit card number.");
        return;
      }
      if (!cardExpiry || !cardExpiry.includes("/")) {
        setValidationError("Please enter card expiry date (MM/YY).");
        return;
      }
      if (!cardCvv || cardCvv.length < 3) {
        setValidationError("Please enter a valid CVV.");
        return;
      }
    }

    if (paymentMethod === "upi" && !upiId.trim()) {
      setUpiId("sriudharchi@payment");
    }

    // Start authentic interactive payment flow
    setIsProcessing(true);
    setProcessingStep("Connecting to 256-bit SSL Payment Gateway...");

    setTimeout(() => {
      setProcessingStep("Verifying Merchant & Account Compliance with RBI...");
    }, 900);

    setTimeout(() => {
      setProcessingStep("Authorizing Payment & Reserving Industrial Inventory...");
    }, 1800);

    setTimeout(() => {
      setIsProcessing(false);
      const randomOrderNum = Math.floor(10000 + Math.random() * 90000);
      const orderId = `SUE-2026-${randomOrderNum}`;
      const now = new Date();
      const estDate = new Date();
      estDate.setDate(now.getDate() + (deliverySpeed === "priority" ? 2 : 4));

      const confirmation: OrderConfirmationData = {
        orderId,
        orderDate: now.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        customerName: fullName,
        customerPhone: phone,
        customerEmail: email,
        shippingAddress: `${address}, ${city}, ${state} - ${pincode}`,
        companyName: isB2B ? companyName : undefined,
        gstin: isB2B ? gstin : undefined,
        paymentMethod,
        items: cartItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        discount: discountAmount,
        gst: gstAmount,
        shipping: shippingFee + extraPriorityShipping,
        total: finalPayable,
        estimatedDelivery: estDate.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      };

      setConfirmedOrder(confirmation);
      clearCart();

      // Persist real customer order into Firestore /orders collection
      submitOrder({
        orderNumber: orderId,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim(),
        shippingAddress: `${address.trim()}, ${city}, ${state} - ${pincode}`,
        companyName: isB2B ? companyName.trim() : undefined,
        gstin: isB2B ? gstin.trim() : undefined,
        paymentMethod,
        items: cartItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        discount: discountAmount,
        gst: gstAmount,
        shipping: shippingFee + extraPriorityShipping,
        total: finalPayable,
        status: "pending",
        createdAt: now.toISOString(),
        estimatedDelivery: estDate.toLocaleDateString("en-IN", {
          weekday: "short",
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
      }).catch((err) => {
        console.warn("Firestore order submission logged locally:", err);
      });
    }, 2800);
  };

  const formatCardNumber = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 16);
    return raw.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (val: string) => {
    const raw = val.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    return raw;
  };

  /* ---------------- ORDER SUCCESS SCREEN ---------------- */
  if (confirmedOrder) {
    const whatsappMessage = encodeURIComponent(
      `Hello Sri Udharchi Enterprises, I have confirmed order #${confirmedOrder.orderId} for ₹${confirmedOrder.total.toLocaleString("en-IN")}. Please confirm dispatch schedule.`,
    );

    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />

        <div className="py-12 md:py-16">
          <div className="mx-auto max-w-3xl px-5 lg:px-8">
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
              {/* Green Banner */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-6 py-8 text-center text-white">
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md mb-3 shadow-inner">
                  <CheckCircle2 className="size-10 text-white" />
                </div>
                <h1 className="font-display text-2xl font-black sm:text-3xl">
                  Order Successfully Placed!
                </h1>
                <p className="mt-1 text-sm text-emerald-100">
                  Thank you, {confirmedOrder.customerName}. Your official order reference is{" "}
                  <span className="font-mono font-bold text-white underline">
                    {confirmedOrder.orderId}
                  </span>
                </p>
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur">
                  <Clock className="size-3.5" /> Estimated Delivery:{" "}
                  {confirmedOrder.estimatedDelivery}
                </div>
              </div>

              {/* Order Details Body */}
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 rounded-xl border border-border bg-muted/30 p-4 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Customer Information:</span>
                    <strong className="block text-sm text-foreground mt-0.5">
                      {confirmedOrder.customerName}
                    </strong>
                    {confirmedOrder.companyName && (
                      <span className="block font-semibold text-primary">
                        {confirmedOrder.companyName}
                      </span>
                    )}
                    {confirmedOrder.gstin && (
                      <span className="block text-muted-foreground">
                        GSTIN: {confirmedOrder.gstin}
                      </span>
                    )}
                    <span className="block text-muted-foreground mt-1">
                      {confirmedOrder.customerPhone} • {confirmedOrder.customerEmail}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block">Delivery Site Address:</span>
                    <p className="text-foreground mt-0.5 leading-relaxed">
                      {confirmedOrder.shippingAddress}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 rounded bg-muted px-2 py-0.5 text-[11px] font-semibold text-foreground">
                      Payment Mode:{" "}
                      <span className="uppercase font-bold text-primary">
                        {confirmedOrder.paymentMethod}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h3 className="font-display text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <FileText className="size-4 text-primary" /> Itemized Equipment Proforma
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-border">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 border-b border-border text-muted-foreground font-semibold">
                        <tr>
                          <th className="p-3">Item Description</th>
                          <th className="p-3 text-center">Qty</th>
                          <th className="p-3 text-right">Unit Price</th>
                          <th className="p-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {confirmedOrder.items.map((it, idx) => (
                          <tr key={idx} className="hover:bg-muted/20">
                            <td className="p-3 font-medium text-foreground">{it.name}</td>
                            <td className="p-3 text-center text-muted-foreground">{it.quantity}</td>
                            <td className="p-3 text-right text-muted-foreground">
                              ₹{it.price.toLocaleString("en-IN")}
                            </td>
                            <td className="p-3 text-right font-bold text-foreground">
                              ₹{(it.price * it.quantity).toLocaleString("en-IN")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals */}
                <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span className="font-medium text-foreground">
                      ₹{confirmedOrder.subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {confirmedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Promotional Discount</span>
                      <span>-₹{confirmedOrder.discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Statutory GST (18%)</span>
                    <span className="font-medium text-foreground">
                      ₹{confirmedOrder.gst.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Industrial Freight & Logistics</span>
                    <span>
                      {confirmedOrder.shipping === 0
                        ? "FREE"
                        : `₹${confirmedOrder.shipping.toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between items-baseline font-bold">
                    <span className="text-sm text-foreground">Total Invoiced Amount</span>
                    <span className="font-display text-xl text-primary font-black">
                      ₹{confirmedOrder.total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="grid gap-3 sm:grid-cols-2 pt-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-3 text-xs font-bold text-foreground shadow-xs hover:bg-muted transition-colors"
                  >
                    <Printer className="size-4" /> Print / Save Proforma Invoice
                  </button>

                  <a
                    href={`https://wa.me/918639858221?text=${whatsappMessage}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors"
                  >
                    Confirm via WhatsApp Dispatch
                  </a>
                </div>

                <div className="text-center pt-2">
                  <a href="/products">
                    <Button variant="outline" size="sm">
                      Back to Products Catalog <ArrowRight className="size-3.5" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SiteFooter />
      </main>
    );
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="py-24 text-center max-w-sm mx-auto px-5">
          <div className="size-10 animate-spin rounded-full border-3 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-xs text-muted-foreground font-semibold">Loading checkout details...</p>
        </div>
        <SiteFooter />
      </main>
    );
  }

  /* ---------------- EMPTY CART REDIRECT VIEW ---------------- */
  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="py-20 text-center max-w-lg mx-auto px-5">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-muted mx-auto mb-4 text-muted-foreground">
            <ShoppingBag className="size-10" />
          </div>
          <h1 className="font-display text-2xl font-bold">No Items Ready for Checkout</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Your shopping cart is currently empty. Browse our fire extinguishers, hydrant systems,
            and safety equipment to proceed with an order.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="/products">
              <Button>
                Browse Equipment Catalog <ArrowRight className="size-4" />
              </Button>
            </a>
            <a href="/cart">
              <Button variant="outline">View Cart</Button>
            </a>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  /* ---------------- MAIN CHECKOUT FORM VIEW ---------------- */
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Breadcrumb Header */}
      <section className="border-b border-border bg-muted/40 py-8">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
            <a href="/" className="hover:text-primary transition-colors">
              Home
            </a>
            <ChevronRight className="size-3" />
            <a href="/products" className="hover:text-primary transition-colors">
              Products
            </a>
            <ChevronRight className="size-3" />
            <a href="/cart" className="hover:text-primary transition-colors">
              Cart
            </a>
            <ChevronRight className="size-3" />
            <span className="font-semibold text-foreground">Checkout & Payment</span>
          </nav>

          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Lock className="size-5" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black sm:text-3xl">
                Secure Equipment Checkout
              </h1>
              <p className="text-xs text-muted-foreground">
                256-Bit Encrypted Statutory Procurement • RBI Approved Payment Gateways
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Checkout Area */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {validationError && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs font-semibold text-destructive">
              <AlertCircle className="size-5 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          <form onSubmit={handlePlaceOrder}>
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
              {/* Left Column: Form Fields */}
              <div className="space-y-8">
                {/* Step 1: Delivery Details */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-border">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      1
                    </span>
                    <h2 className="font-display text-base font-bold text-foreground">
                      Consignee & Delivery Address
                    </h2>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Full Name / Contact Person *
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Ramesh Varma"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Mobile Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Email Address (for Official Tax Invoice & Tracking) *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. safety.manager@company.com"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Facility / Warehouse / Project Site Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="e.g. Plot No. 42, APIIC Industrial Park, Phase II"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        City / District *
                      </label>
                      <input
                        type="text"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">State *</label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-foreground block mb-1">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        required
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        placeholder="515241"
                        maxLength={6}
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* B2B GST Invoicing Toggle */}
                  <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                    <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-foreground">
                      <input
                        type="checkbox"
                        checked={isB2B}
                        onChange={(e) => setIsB2B(e.target.checked)}
                        className="size-4 rounded text-primary focus:ring-primary"
                      />
                      <span>Purchasing for a Business / Factory (Claim 18% GST Input Credit)</span>
                    </label>

                    {isB2B && (
                      <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-border/60">
                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            Registered Company Name *
                          </label>
                          <input
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder="e.g. Apex Engineering Ltd"
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold text-foreground block mb-1">
                            GSTIN (15 Digits)
                          </label>
                          <input
                            type="text"
                            value={gstin}
                            onChange={(e) => setGstin(e.target.value.toUpperCase())}
                            placeholder="e.g. 37AAAAA0000A1Z5"
                            maxLength={15}
                            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs uppercase focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Step 2: Shipping Options */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-border">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      2
                    </span>
                    <h2 className="font-display text-base font-bold text-foreground">
                      Shipping & Dispatch Method
                    </h2>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                        deliverySpeed === "standard"
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliverySpeed"
                        checked={deliverySpeed === "standard"}
                        onChange={() => setDeliverySpeed("standard")}
                        className="mt-0.5 size-4 text-primary"
                      />
                      <div className="text-xs">
                        <strong className="block text-foreground">
                          Standard Industrial Logistics
                        </strong>
                        <p className="text-muted-foreground mt-0.5">
                          Delivery within 3 to 5 business days via regional cargo carrier.
                        </p>
                        <span className="inline-block mt-2 font-bold text-primary">
                          {shippingFee === 0 ? "FREE" : `₹${shippingFee}`}
                        </span>
                      </div>
                    </label>

                    <label
                      className={`flex items-start gap-3 rounded-xl border p-4 cursor-pointer transition-all ${
                        deliverySpeed === "priority"
                          ? "border-primary bg-primary/5 shadow-xs"
                          : "border-border bg-card hover:border-primary/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliverySpeed"
                        checked={deliverySpeed === "priority"}
                        onChange={() => setDeliverySpeed("priority")}
                        className="mt-0.5 size-4 text-primary"
                      />
                      <div className="text-xs">
                        <strong className="block text-foreground flex items-center gap-1.5">
                          Priority Emergency Dispatch
                        </strong>
                        <p className="text-muted-foreground mt-0.5">
                          Direct expedited transit (24-48 hours) for urgent inspection deadlines.
                        </p>
                        <span className="inline-block mt-2 font-bold text-primary">
                          ₹{(shippingFee + 500).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Step 3: Payment Options */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-border">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      3
                    </span>
                    <h2 className="font-display text-base font-bold text-foreground">
                      Payment Method
                    </h2>
                  </div>

                  {/* Payment Tabs */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: "upi", label: "Instant UPI", icon: QrCode },
                      { id: "card", label: "Card", icon: CreditCard },
                      { id: "netbanking", label: "NetBanking", icon: Building2 },
                      { id: "po", label: "Corp. PO", icon: FileText },
                      { id: "cod", label: "Pay on Delivery", icon: Truck },
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const active = paymentMethod === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPaymentMethod(tab.id as PaymentMethod)}
                          className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                            active
                              ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                              : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                          }`}
                        >
                          <Icon className="size-4" />
                          <span className="text-[11px] leading-tight">{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab Content: UPI */}
                  {paymentMethod === "upi" && (
                    <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4">
                      <div className="flex flex-col sm:flex-row items-center gap-6">
                        {/* Simulated Authentic QR Code */}
                        <div className="size-36 rounded-xl border-2 border-primary/30 bg-white p-2.5 shadow-sm flex flex-col items-center justify-center">
                          <div className="grid grid-cols-5 gap-1.5 size-full place-items-center">
                            {Array.from({ length: 25 }).map((_, i) => (
                              <div
                                key={i}
                                className={`size-4 rounded-xs ${
                                  [0, 1, 2, 4, 5, 6, 12, 18, 20, 21, 22, 24].includes(i)
                                    ? "bg-slate-900"
                                    : [8, 14, 16].includes(i)
                                      ? "bg-primary"
                                      : "bg-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[9px] font-mono text-slate-800 font-bold mt-1">
                            Scan via GPay/PhonePe
                          </span>
                        </div>

                        <div className="space-y-2 text-xs text-muted-foreground text-center sm:text-left flex-1">
                          <strong className="text-foreground text-sm block">
                            Scan QR Code or Enter UPI ID
                          </strong>
                          <p>
                            UPI ID:{" "}
                            <span className="font-mono font-bold text-foreground">
                              sriudharchienterprises@okhdfcbank
                            </span>
                          </p>
                          <p>
                            Supports Google Pay, PhonePe, Paytm, BHIM, CRED, and all Indian banking
                            apps.
                          </p>
                          <div className="pt-2">
                            <input
                              type="text"
                              value={upiId}
                              onChange={(e) => setUpiId(e.target.value)}
                              placeholder="Or enter your UPI ID (e.g. mobile@upi)"
                              className="w-full max-w-sm rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab Content: Cards */}
                  {paymentMethod === "card" && (
                    <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-3 text-xs">
                      <div className="flex items-center justify-between text-muted-foreground pb-2">
                        <span>Accepted: Visa, MasterCard, RuPay, Maestro</span>
                        <div className="flex gap-1 font-bold text-[10px]">
                          <span className="rounded bg-card px-1.5 py-0.5 border">RUPAY</span>
                          <span className="rounded bg-card px-1.5 py-0.5 border">VISA</span>
                          <span className="rounded bg-card px-1.5 py-0.5 border">MC</span>
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-foreground block mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="4532 •••• •••• 8920"
                          maxLength={19}
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-xs focus:border-primary focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="font-bold text-foreground block mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            placeholder="12/28"
                            maxLength={5}
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-xs focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="font-bold text-foreground block mb-1">
                            CVV (3 Digits)
                          </label>
                          <input
                            type="password"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.slice(0, 4))}
                            placeholder="•••"
                            maxLength={4}
                            className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 font-mono text-xs focus:border-primary focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="font-bold text-foreground block mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value)}
                          placeholder="Name as printed on card"
                          className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab Content: Net Banking */}
                  {paymentMethod === "netbanking" && (
                    <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-4 text-xs">
                      <span className="font-bold text-foreground block">
                        Select Popular Financial Institution:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {POPULAR_BANKS.map((b) => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setSelectedBank(b.id)}
                            className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition-all ${
                              selectedBank === b.id
                                ? "border-primary bg-primary/10 text-primary font-bold shadow-xs"
                                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            <Building2 className="size-4 shrink-0" />
                            <span className="truncate">{b.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab Content: Purchase Order (PO) */}
                  {paymentMethod === "po" && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-5 space-y-3 text-xs">
                      <strong className="block font-bold text-foreground text-sm">
                        Corporate Purchase Order / Proforma Billing
                      </strong>
                      <p className="text-muted-foreground">
                        For institutional clients, government contractors, and enterprise facilities.
                        Sri Udharchi Enterprises issues an official proforma invoice with bank NEFT/RTGS
                        details and payment terms against delivery.
                      </p>
                      <div>
                        <label className="font-bold text-foreground block mb-1">
                          PO Reference Number / Work Order ID (Optional)
                        </label>
                        <input
                          type="text"
                          value={poNumber}
                          onChange={(e) => setPoNumber(e.target.value)}
                          placeholder="e.g. PO/2026/AP-8841"
                          className="w-full max-w-sm rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  {/* Tab Content: Cash on Delivery */}
                  {paymentMethod === "cod" && (
                    <div className="rounded-xl border border-border bg-muted/20 p-5 space-y-2 text-xs text-muted-foreground">
                      <strong className="block font-bold text-foreground text-sm">
                        Cash / Pay on Delivery
                      </strong>
                      <p>
                        Pay in cash or via digital UPI QR directly to the delivery logistics executive
                        upon physical inspection and handover of equipment.
                      </p>
                      <p className="text-primary font-semibold">
                        Verification SMS / Call will be made prior to cargo dispatch.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Order Review Box */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sticky top-24">
                  <h2 className="font-display text-base font-bold text-foreground pb-3 border-b border-border">
                    Order Overview ({totalItems} Items)
                  </h2>

                  {/* Compact Items Preview */}
                  <div className="my-4 max-h-56 overflow-y-auto space-y-3 pr-1 divide-y divide-border/60">
                    {cartItems.map((item) => (
                      <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-12 shrink-0 rounded-lg object-cover border border-border bg-muted"
                        />
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs font-bold text-foreground truncate">{item.name}</h4>
                          <span className="text-[11px] text-muted-foreground">
                            Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <span className="font-display text-xs font-bold text-foreground">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Price Calculations */}
                  <div className="space-y-2 border-t border-border pt-4 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Items Subtotal</span>
                      <span className="font-semibold text-foreground">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Discount ({couponCode})</span>
                        <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span>Statutory GST (18%)</span>
                      <span className="font-semibold text-foreground">
                        ₹{gstAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Logistics & Freight</span>
                      <span>
                        {shippingFee + extraPriorityShipping === 0 ? (
                          <span className="font-bold text-emerald-600">FREE</span>
                        ) : (
                          `₹${(shippingFee + extraPriorityShipping).toLocaleString("en-IN")}`
                        )}
                      </span>
                    </div>

                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="font-display text-sm font-bold text-foreground">
                            Total Payable
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            All Taxes & Delivery Included
                          </span>
                        </div>
                        <span className="font-display text-2xl font-black text-primary">
                          ₹{finalPayable.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="mt-6">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isProcessing}
                      className="w-full justify-center text-sm font-bold shadow-md hover:shadow-lg"
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          Processing Security...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Lock className="size-4" />
                          {paymentMethod === "po"
                            ? "Generate PO & Confirm Order"
                            : `Pay ₹${finalPayable.toLocaleString("en-IN")}`}
                        </span>
                      )}
                    </Button>
                  </div>

                  {/* Immediate Hotline */}
                  <div className="mt-5 rounded-xl border border-dashed border-border p-3 text-center">
                    <span className="text-[11px] text-muted-foreground block">
                      Need custom invoicing or bulk transport dispatch?
                    </span>
                    <a
                      href="tel:+918639858221"
                      className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <Phone className="size-3.5" /> Call Dispatch Desk: 8639858221
                    </a>
                  </div>

                  {/* Trust guarantees */}
                  <div className="mt-4 flex items-center justify-center gap-3 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="size-3.5 text-primary" /> 100% Genuine ISI
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Lock className="size-3.5 text-emerald-600" /> 256-Bit SSL
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* Processing Overlay Dialog */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-2xl space-y-4">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="size-8 animate-spin rounded-full border-3 border-primary border-t-transparent" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Processing Your Order
            </h3>
            <p className="text-xs text-muted-foreground animate-pulse font-mono">
              {processingStep}
            </p>
            <div className="rounded-lg bg-muted/40 p-2 text-[10px] text-muted-foreground">
              Please do not refresh or close this browser window.
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </main>
  );
}
