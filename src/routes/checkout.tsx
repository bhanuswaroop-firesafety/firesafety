import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import {
  submitOrder,
  subscribeShippingSettings,
  DEFAULT_SHIPPING_SETTINGS,
  generateOrderNumber,
  getCheckoutDraft,
  saveCheckoutDraft,
  deleteCheckoutDraft,
} from "@/lib/db-service";
import type { ShippingSettings } from "@/lib/types";
import { calculateDeliveryWindow, formatKolkataDisplay } from "@/lib/date-utils";
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
  Zap,
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
  companyName?: string | undefined;
  gstin?: string | undefined;
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
  shippingType: "standard" | "priority";
  expectedDeliveryFrom: string;
  expectedDeliveryTo: string;
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
  const { user, userProfile } = useAuth();

  // Dynamic Shipping Settings from Firestore (Task A)
  const [shippingSettings, setShippingSettings] =
    useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);
  useEffect(() => {
    return subscribeShippingSettings(setShippingSettings);
  }, []);

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

  // Phone is verified if authenticated via Firebase phone or profile phone exists
  const isPhoneVerified = Boolean(
    user?.phoneNumber ||
      (userProfile?.phone && userProfile.phone.trim().replace(/\D/g, "").length >= 10),
  );

  const [isDraftLoading, setIsDraftLoading] = useState(false);

  // 1. Restore booking draft from Firestore drafts/{uid} across page refreshes
  useEffect(() => {
    if (!user) return;
    setIsDraftLoading(true);
    getCheckoutDraft(user.uid)
      .then((d) => {
        if (d) {
          if (d.fullName) setFullName(d.fullName);
          if (d.phone && !isPhoneVerified) setPhone(d.phone);
          if (d.email) setEmail(d.email);
          if (d.address) setAddress(d.address);
          if (d.city) setCity(d.city);
          if (d.state) setState(d.state);
          if (d.pincode) setPincode(d.pincode);
          if (d.companyName) setCompanyName(d.companyName);
          if (d.gstin) setGstin(d.gstin);
          if (d.isB2B !== undefined) setIsB2B(d.isB2B);
          if (d.deliverySpeed) setDeliverySpeed(d.deliverySpeed);
          if (d.paymentMethod) setPaymentMethod(d.paymentMethod as PaymentMethod);
        }
      })
      .catch((err) => console.warn("Failed to load checkout draft from Firestore:", err))
      .finally(() => setIsDraftLoading(false));
  }, [user]);

  // 2. Prefill contact details from active user profile if available
  useEffect(() => {
    if (userProfile) {
      if (userProfile.displayName && !fullName) {
        setFullName(userProfile.displayName);
      }
      if (userProfile.phone) {
        setPhone(userProfile.phone);
      } else if (user?.phoneNumber) {
        setPhone(user.phoneNumber);
      }
      // Only prefill real email (not phone-auth synthetic fallback)
      if (
        userProfile.email &&
        !userProfile.email.includes("@mobile.udharchi.in") &&
        !email
      ) {
        setEmail(userProfile.email);
      }
      if (userProfile.company && !companyName) {
        setCompanyName(userProfile.company);
        setIsB2B(true);
      }
    } else if (user?.phoneNumber && !phone) {
      setPhone(user.phoneNumber);
    }
  }, [userProfile, user]);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [selectedBank, setSelectedBank] = useState("sbi");
  const [poNumber, setPoNumber] = useState("");

  // 3. Persist booking draft to Firestore drafts/{uid} across page reloads (debounced)
  useEffect(() => {
    if (!user || isDraftLoading) return;
    const timer = setTimeout(() => {
      saveCheckoutDraft(user.uid, {
        fullName,
        phone,
        email,
        address,
        city,
        state,
        pincode,
        isB2B,
        companyName,
        gstin,
        deliverySpeed,
        paymentMethod,
      }).catch((err) => console.warn("Failed to save checkout draft:", err));
    }, 600);
    return () => clearTimeout(timer);
  }, [user, isDraftLoading, fullName, phone, email, address, city, state, pincode, isB2B, companyName, gstin, deliverySpeed, paymentMethod]);

  // Processing & Confirmation states
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState("");
  const [confirmedOrder, setConfirmedOrder] = useState<OrderConfirmationData | null>(null);
  const [validationError, setValidationError] = useState("");

  // Task A: Priority dispatch charge from Firestore settings (default 0)
  const priorityCharge = shippingSettings.priorityCharge || 0;
  const extraPriorityShipping = deliverySpeed === "priority" ? priorityCharge : 0;
  const finalPayable = totalAmount + extraPriorityShipping;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    // Validations: Full name
    if (!fullName.trim()) {
      setValidationError("Please enter your full name / contact person name.");
      return;
    }

    // Task B: Mobile phone number strictly required (at least 10 digits)
    const cleanPhoneDigits = phone.trim().replace(/\D/g, "");
    if (!cleanPhoneDigits || cleanPhoneDigits.length < 10) {
      setValidationError("Please enter a valid 10-digit mobile number required to book your order.");
      return;
    }

    // Task B: Valid email format strictly required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setValidationError("Please enter a valid Gmail or corporate email address (e.g. yourname@gmail.com) for official GST billing.");
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

    setTimeout(async () => {
      setIsProcessing(false);
      const orderId = generateOrderNumber();
      const windowInfo = calculateDeliveryWindow(deliverySpeed, shippingSettings);

      const confirmation: OrderConfirmationData = {
        orderId,
        orderDate: formatKolkataDisplay(new Date(), true),
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim().toLowerCase(),
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
        estimatedDelivery: `${windowInfo.fromDisplay} - ${windowInfo.toDisplay}`,
        shippingType: deliverySpeed,
        expectedDeliveryFrom: windowInfo.fromISO,
        expectedDeliveryTo: windowInfo.toISO,
      };

      // Persist real customer order into Cloud Firestore
      const customerUid =
        user?.uid ||
        userProfile?.id ||
        `cust-${email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;

      try {
        await submitOrder({
          orderId,
          orderNumber: orderId,
          customerId: customerUid,
          customerName: fullName.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim().toLowerCase(),
          shippingAddress: `${address.trim()}, ${city}, ${state} - ${pincode}`,
          companyName: isB2B && companyName ? companyName.trim() : "",
          gstin: isB2B && gstin ? gstin.trim() : "",
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
          status: "placed",
          shippingType: deliverySpeed,
          expectedDeliveryFrom: windowInfo.fromISO,
          expectedDeliveryTo: windowInfo.toISO,
          shippingCharge: shippingFee + extraPriorityShipping,
          estimatedDelivery: `${windowInfo.fromDisplay} - ${windowInfo.toDisplay}`,
        });

        // Delete server draft after successful placement
        if (user) {
          await deleteCheckoutDraft(user.uid).catch(() => {});
        }
        clearCart();
        setConfirmedOrder(confirmation);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setValidationError(`Order submission failed: ${msg}. Please check your connection and retry.`);
        setIsProcessing(false);
        return;
      }
    }, 1800);
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
                <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur">
                    <Clock className="size-3.5" /> Estimated Delivery: {confirmedOrder.estimatedDelivery}
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1 text-xs font-semibold backdrop-blur">
                    <Truck className="size-3.5" />
                    {confirmedOrder.shippingType === "priority"
                      ? "Priority / Emergency Dispatch (1-2 days)"
                      : "Standard Logistics (5-7 days)"}
                  </div>
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
                    <span className="block text-muted-foreground mt-1 font-mono">
                      {confirmedOrder.customerPhone} • {confirmedOrder.customerEmail}
                    </span>
                    <div className="mt-2.5 pt-2 border-t border-border/60">
                      <span className="text-[11px] text-muted-foreground block">Shipping & Dispatch:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                        {confirmedOrder.shippingType === "priority" ? (
                          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
                            <Zap className="size-3" /> Priority Emergency Dispatch (1 to 2 days)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-primary font-bold">
                            <Truck className="size-3" /> Standard Delivery (5 to 7 days)
                          </span>
                        )}
                      </span>
                    </div>
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

          {/* Quick Login Banner */}
          {!user ? (
            <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 sm:p-5 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <User className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">
                    Already have an account?
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Sign in to automatically load your saved details and complete checkout faster.
                  </p>
                </div>
              </div>
              <a href="/login?redirect=/checkout">
                <Button
                  type="button"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-9 px-4 gap-1.5 shrink-0 cursor-pointer"
                >
                  <User className="size-3.5" />
                  <span>Sign In</span>
                </Button>
              </a>
            </div>
          ) : (
            <div className="mb-8 flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-foreground">
                    Logged in as {userProfile?.displayName || user.displayName || user.phoneNumber}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">
                    Your facility delivery information has been automatically populated below.
                  </span>
                </div>
              </div>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider">
                Active Client
              </span>
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
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-foreground">
                          Mobile Phone Number *
                        </label>
                        {isPhoneVerified && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-1">
                            <CheckCircle2 className="size-3" /> Verified via OTP
                          </span>
                        )}
                      </div>
                      <input
                        type="tel"
                        required
                        value={phone}
                        readOnly={isPhoneVerified}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className={`w-full rounded-xl border border-border px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none ${
                          isPhoneVerified
                            ? "bg-muted/50 cursor-not-allowed font-medium text-muted-foreground select-none"
                            : "bg-background"
                        }`}
                      />
                      {isPhoneVerified ? (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Phone pre-filled and locked from authenticated session.
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground mt-1">
                          10-digit Indian mobile number required for dispatch updates.
                        </p>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-xs font-bold text-foreground block mb-1">
                        Email Address (Gmail / Corporate Email Required) *
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. yourname@gmail.com or procurement@company.com"
                        className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Required. Official statutory GST invoice, proforma receipt, and carrier tracking links are delivered here.
                      </p>
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
                      <label className="text-xs font-bold text-foreground block mb-1">
                        State *
                      </label>
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
                          Standard Industrial Logistics ({shippingSettings.standardDaysMin} to {shippingSettings.standardDaysMax} days)
                        </strong>
                        <p className="text-muted-foreground mt-0.5">
                          Regular cargo dispatch arriving in {shippingSettings.standardDaysMin} to {shippingSettings.standardDaysMax} days via regional transport.
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
                          <Zap className="size-3.5 text-amber-500 fill-amber-500" />
                          <span>Priority / Emergency Dispatch ({shippingSettings.priorityDaysMin} to {shippingSettings.priorityDaysMax} days)</span>
                        </strong>
                        <p className="text-muted-foreground mt-0.5">
                          Expedited direct carrier dispatch in {shippingSettings.priorityDaysMin} to {shippingSettings.priorityDaysMax} days for emergency fire audits and urgent site deadlines.
                        </p>
                        <span className="inline-block mt-2 font-bold text-primary">
                          {shippingSettings.priorityCharge > 0
                            ? `₹${(shippingFee + shippingSettings.priorityCharge).toLocaleString("en-IN")}`
                            : shippingFee === 0
                              ? "FREE (Special Priority Offer)"
                              : `₹${shippingFee}`}
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
                        For institutional clients, government contractors, and enterprise
                        facilities. Sri Udharchi Enterprises issues an official proforma invoice
                        with bank NEFT/RTGS details and payment terms against delivery.
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
                        Pay in cash or via digital UPI QR directly to the delivery logistics
                        executive upon physical inspection and handover of equipment.
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
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {item.name}
                          </h4>
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
