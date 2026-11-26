import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import { useCart, parsePriceToNumber } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import QRCode from "qrcode";
import {
  submitOrder,
  subscribeShippingSettings,
  DEFAULT_SHIPPING_SETTINGS,
  generateOrderNumber,
  getCheckoutDraft,
  saveCheckoutDraft,
  deleteCheckoutDraft,
  generatePhonePeUpiUrls,
  subscribeBusinessSettings,
  DEFAULT_BUSINESS_SETTINGS,
  getCachedProducts,
} from "@/lib/db-service";
import type { ShippingSettings, BusinessProfileSettings } from "@/lib/types";
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
  User,
  RotateCcw,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  HelpCircle,
  Sparkles,
  X,
} from "lucide-react";

import { seoHead } from "@/lib/seo";

interface CheckoutSearch {
  productId?: string;
  qty?: number;
}

export const Route = createFileRoute("/checkout")({
  validateSearch: (search: Record<string, unknown>): CheckoutSearch => ({
    productId: typeof search.productId === "string" ? search.productId : undefined,
    qty:
      typeof search.qty === "number"
        ? search.qty
        : typeof search.qty === "string"
        ? parseInt(search.qty, 10) || undefined
        : undefined,
  }),
  head: () =>
    seoHead({
      title: "Secure Checkout | Sri Udharchi Enterprises",
      description:
        "Complete your industrial safety equipment order. Direct PhonePe UPI QR payment with instant dynamic pricing and real-time order verification.",
      path: "/checkout",
      noIndex: true,
    }),
  component: CheckoutPage,
});

type PaymentMethod = "phonepe" | "cod" | "upi" | "razorpay" | string;

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
  paymentId?: string | undefined;
  transactionId?: string | undefined;
  paymentStatus?: "pending" | "paid" | "failed" | undefined;
  razorpayOrderId?: string | undefined;
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
  const search = Route.useSearch();
  const searchProductId = search?.productId;
  const searchQty = Math.max(1, search?.qty || 1);

  const {
    cartItems,
    subtotal: contextSubtotal,
    gstAmount: contextGstAmount,
    shippingFee: contextShippingFee,
    discountAmount,
    couponCode,
    totalAmount: contextTotalAmount,
    totalItems: contextTotalItems,
    clearCart,
    addToCart,
    isHydrated,
  } = useCart();
  const { user, userProfile } = useAuth();

  // Instant product resolution based on productId query param
  const urlProduct = useMemo(() => {
    if (!searchProductId) return null;
    const all = getCachedProducts();
    return (
      all.find(
        (p) =>
          p.id === searchProductId ||
          p.sku === searchProductId ||
          p.name.toLowerCase() === searchProductId.toLowerCase(),
      ) || null
    );
  }, [searchProductId]);

  // Synchronize URL product into global cart context (without opening drawer)
  useEffect(() => {
    if (urlProduct && !cartItems.some((i) => i.id === urlProduct.id)) {
      addToCart(urlProduct, searchQty, false);
    }
  }, [urlProduct, searchQty, cartItems, addToCart]);

  // If cart is momentarily hydrating from storage or empty, resolve immediately on frame 0
  const activeItems = useMemo(() => {
    if (cartItems.length > 0) return cartItems;
    if (urlProduct) {
      const numericPrice = parsePriceToNumber(urlProduct.price);
      return [
        {
          id: urlProduct.id,
          name: urlProduct.name,
          category: urlProduct.category || "Safety Equipment",
          price: numericPrice,
          priceDisplay:
            typeof urlProduct.price === "string"
              ? urlProduct.price
              : `₹${numericPrice.toLocaleString("en-IN")}`,
          unit: urlProduct.unit || "unit",
          image: urlProduct.image || "/sri-udharchi-enterprises-logo.png",
          quantity: searchQty,
          specs: urlProduct.specs,
          sku: urlProduct.sku,
        },
      ];
    }
    return [];
  }, [cartItems, urlProduct, searchQty]);

  // Dynamic calculations reflecting activeItems
  const subtotal = useMemo(() => {
    return activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [activeItems]);

  const totalItems = useMemo(() => {
    return activeItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [activeItems]);

  const gstAmount = useMemo(() => {
    const discountedBase = Math.max(0, subtotal - discountAmount);
    return Math.round(discountedBase * 0.18);
  }, [subtotal, discountAmount]);

  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 5000 ? 0 : 250;
  }, [subtotal]);

  // Dynamic Shipping & Business Profile Settings from Firestore
  const [shippingSettings, setShippingSettings] =
    useState<ShippingSettings>(DEFAULT_SHIPPING_SETTINGS);
  const [businessSettings, setBusinessSettings] =
    useState<BusinessProfileSettings>(DEFAULT_BUSINESS_SETTINGS);

  useEffect(() => {
    const unsubShip = subscribeShippingSettings(setShippingSettings);
    const unsubBiz = subscribeBusinessSettings(setBusinessSettings);
    return () => {
      unsubShip();
      unsubBiz();
    };
  }, []);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("Andhra Pradesh");
  const [pincode, setPincode] = useState("");
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

  // Payment states: PhonePe Direct UPI (primary & recommended) & COD
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("phonepe");
  const [phonePeTransactionId, setPhonePeTransactionId] = useState("");
  const [showPhonePeModal, setShowPhonePeModal] = useState(false);
  const [activeQrTab, setActiveQrTab] = useState<"dynamic" | "flexible" | "card">("dynamic");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [flexibleQrDataUrl, setFlexibleQrDataUrl] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [previewOrderId] = useState(() => generateOrderNumber());
  const [paymentError, setPaymentError] = useState<{
    code: string;
    message: string;
    details?: string | undefined;
  } | null>(null);

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

  // Priority dispatch vs Standard shipping fee
  // Standard is flat ₹250 (free above ₹5,000 threshold), Priority is flat ₹400 (or custom from shippingSettings)
  const standardFee = shippingFee;
  const priorityFee = shippingSettings.priorityCharge || 400;
  const selectedShippingFee = deliverySpeed === "priority" ? priorityFee : standardFee;
  const extraPriorityShipping = deliverySpeed === "priority" ? Math.max(0, priorityFee - shippingFee) : 0;
  const finalPayable =
    Math.max(0, subtotal - discountAmount) + gstAmount + selectedShippingFee;

  // Generate PhonePe UPI Links dynamically based on calculated price
  const activeUpiId = businessSettings.upiId || "sriudharchienterprises@okhdfcbank";
  const activePhonePeNumber = businessSettings.phonePeNumber || "8639858221";
  const activePayeeName =
    businessSettings.phonePeMerchantName ||
    businessSettings.entityName ||
    "Sri Udharchi Enterprises";
  const upiDetails = generatePhonePeUpiUrls(
    finalPayable,
    previewOrderId,
    activePayeeName,
    activeUpiId,
  );

  // Generate dynamic scannable QR Code & High-Value Flexible QR Code (no ₹2,000 NPCI limit)
  useEffect(() => {
    if (finalPayable <= 0) return;
    if (finalPayable > 2000) {
      setActiveQrTab("flexible");
    }

    QRCode.toDataURL(upiDetails.upiUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1e3a5f",
        light: "#ffffff",
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.warn("Failed generating QR Code:", err));

    QRCode.toDataURL(upiDetails.flexibleUpiUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: "#1e3a5f",
        light: "#ffffff",
      },
    })
      .then((url) => setFlexibleQrDataUrl(url))
      .catch((err) => console.warn("Failed generating Flexible QR Code:", err));
  }, [finalPayable, previewOrderId, activeUpiId, activePayeeName]);

  const copyToClipboard = (text: string, fieldName: string) => {
    try {
      navigator.clipboard?.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2500);
    } catch (e) {
      console.warn("Clipboard copy notice:", e);
    }
  };

  const validateDeliveryDetails = () => {
    // Validations: Full name
    if (!fullName.trim()) {
      setValidationError("Please enter your full name / contact person name.");
      return false;
    }

    // Mobile phone number strictly required (at least 10 digits)
    const cleanPhoneDigits = phone.trim().replace(/\D/g, "");
    if (!cleanPhoneDigits || cleanPhoneDigits.length < 10) {
      setValidationError("Please enter a valid 10-digit mobile number required to book your order.");
      return false;
    }

    // Valid email format strictly required
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setValidationError("Please enter a valid Gmail or corporate email address (e.g. yourname@gmail.com) for official GST billing.");
      return false;
    }

    if (!address.trim()) {
      setValidationError("Please enter your delivery site/facility address.");
      return false;
    }
    if (!pincode.trim() || pincode.trim().length < 6) {
      setValidationError("Please enter a valid 6-digit postal PIN code.");
      return false;
    }

    if (isB2B && !companyName.trim()) {
      setValidationError("Please enter your registered Company / Facility name.");
      return false;
    }

    return true;
  };

  const handlePhonePeSubmit = async (txnIdToSubmit: string) => {
    const cleanTxnId = txnIdToSubmit.trim();
    if (!cleanTxnId || cleanTxnId.length < 8) {
      setValidationError(
        "Please enter your valid 12 or 13-digit PhonePe Transaction ID (starts with T) or bank UTR from your payment confirmation screen.",
      );
      return;
    }

    if (!validateDeliveryDetails()) {
      setShowPhonePeModal(false);
      return;
    }

    const orderId = previewOrderId || generateOrderNumber();
    const windowInfo = calculateDeliveryWindow(deliverySpeed, shippingSettings);
    const fullShippingAddress = `${address.trim()}, ${city}, ${state} - ${pincode}`;
    const customerUid =
      user?.uid ||
      userProfile?.id ||
      `cust-${email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;

    setIsProcessing(true);
    setProcessingStep("Submitting PhonePe payment details for verification...");

    const confirmation: OrderConfirmationData = {
      orderId,
      orderDate: formatKolkataDisplay(new Date(), true),
      customerName: fullName.trim(),
      customerPhone: phone.trim(),
      customerEmail: email.trim().toLowerCase(),
      shippingAddress: fullShippingAddress,
      companyName: isB2B ? companyName.trim() : undefined,
      gstin: isB2B ? gstin.trim() : undefined,
      paymentMethod: "phonepe",
      paymentId: cleanTxnId,
      transactionId: cleanTxnId,
      paymentStatus: "pending",
      items: activeItems.map((i) => ({
        name: i.name,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal,
      discount: discountAmount,
      gst: gstAmount,
      shipping: selectedShippingFee,
      total: finalPayable,
      estimatedDelivery: `${windowInfo.fromDisplay} - ${windowInfo.toDisplay}`,
      shippingType: deliverySpeed,
      expectedDeliveryFrom: windowInfo.fromISO,
      expectedDeliveryTo: windowInfo.toISO,
    };

    try {
      await submitOrder({
        orderId,
        orderNumber: orderId,
        customerId: customerUid,
        userId: customerUid,
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim().toLowerCase(),
        shippingAddress: fullShippingAddress,
        companyName: isB2B && companyName ? companyName.trim() : "",
        gstin: isB2B && gstin ? gstin.trim() : "",
        paymentMethod: "phonepe",
        paymentStatus: "pending",
        paymentId: cleanTxnId,
        paymentDetails: {
          gateway: "phonepe",
          transactionId: cleanTxnId,
          utr: cleanTxnId,
          upiId: activeUpiId,
          amount: finalPayable,
          submittedAt: new Date().toISOString(),
        },
        items: activeItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
          productId: i.id,
          renewalMonths: (i as any).renewalMonths,
        })),
        subtotal,
        discount: discountAmount,
        gst: gstAmount,
        shipping: selectedShippingFee,
        total: finalPayable,
        status: "placed",
        shippingType: deliverySpeed,
        expectedDeliveryFrom: windowInfo.fromISO,
        expectedDeliveryTo: windowInfo.toISO,
        shippingCharge: selectedShippingFee,
        estimatedDelivery: `${windowInfo.fromDisplay} - ${windowInfo.toDisplay}`,
      });

      if (user) {
        await deleteCheckoutDraft(user.uid).catch(() => {});
      }
      clearCart();
      setShowPhonePeModal(false);
      setIsProcessing(false);
      setConfirmedOrder(confirmation);
    } catch (err: unknown) {
      setIsProcessing(false);
      const msg = err instanceof Error ? err.message : String(err);
      setValidationError(`Order submission failed: ${msg}. Please check your connection and retry.`);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    if (!validateDeliveryDetails()) {
      return;
    }

    // Persist booking draft to Firestore
    if (user) {
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
      }).catch(() => {});
    }

    const orderId = previewOrderId || generateOrderNumber();
    const windowInfo = calculateDeliveryWindow(deliverySpeed, shippingSettings);
    const fullShippingAddress = `${address.trim()}, ${city}, ${state} - ${pincode}`;
    const customerUid =
      user?.uid ||
      userProfile?.id ||
      `cust-${email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "").slice(0, 10)}`;

    // === OPTION 1: PHONEPE DIRECT UPI & QR PAYMENT ===
    if (paymentMethod === "phonepe" || paymentMethod === "upi") {
      const cleanTxnId = phonePeTransactionId.trim();
      // If customer has NOT yet entered transaction ID, open the dedicated PhonePe gateway screen
      if (!cleanTxnId) {
        setShowPhonePeModal(true);
        // On mobile devices, attempt to trigger PhonePe app deep link immediately
        try {
          if (typeof window !== "undefined") {
            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
            if (isMobile) {
              window.location.href = upiDetails.phonePeUrl;
            }
          }
        } catch (e) {
          console.warn("Could not auto-redirect to PhonePe deep link:", e);
        }
        return;
      }

      // If user already entered transaction ID, submit order
      await handlePhonePeSubmit(cleanTxnId);
      return;
    }

    // === OPTION 2: CASH ON DELIVERY (COD) ===
    setIsProcessing(true);
    setProcessingStep("Verifying order details & reserving inventory...");

    setTimeout(() => {
      setProcessingStep("Registering Cash on Delivery shipment...");
    }, 900);

    setTimeout(() => {
      setProcessingStep("Finalizing your order confirmation...");
    }, 1800);

    setTimeout(async () => {
      const confirmation: OrderConfirmationData = {
        orderId,
        orderDate: formatKolkataDisplay(new Date(), true),
        customerName: fullName.trim(),
        customerPhone: phone.trim(),
        customerEmail: email.trim().toLowerCase(),
        shippingAddress: fullShippingAddress,
        companyName: isB2B ? companyName.trim() : undefined,
        gstin: isB2B ? gstin.trim() : undefined,
        paymentMethod: "cod",
        items: activeItems.map((i) => ({
          name: i.name,
          quantity: i.quantity,
          price: i.price,
        })),
        subtotal,
        discount: discountAmount,
        gst: gstAmount,
        shipping: selectedShippingFee,
        total: finalPayable,
        estimatedDelivery: `${windowInfo.fromDisplay} - ${windowInfo.toDisplay}`,
        shippingType: deliverySpeed,
        expectedDeliveryFrom: windowInfo.fromISO,
        expectedDeliveryTo: windowInfo.toISO,
      };

      try {
        await submitOrder({
          orderId,
          orderNumber: orderId,
          customerId: customerUid,
          userId: customerUid,
          customerName: fullName.trim(),
          customerPhone: phone.trim(),
          customerEmail: email.trim().toLowerCase(),
          shippingAddress: fullShippingAddress,
          companyName: isB2B && companyName ? companyName.trim() : "",
          gstin: isB2B && gstin ? gstin.trim() : "",
          paymentMethod: "cod",
          paymentStatus: "pending",
          items: activeItems.map((i) => ({
            name: i.name,
            quantity: i.quantity,
            price: i.price,
            productId: i.id,
            renewalMonths: (i as any).renewalMonths,
          })),
          subtotal,
          discount: discountAmount,
          gst: gstAmount,
          shipping: selectedShippingFee,
          total: finalPayable,
          status: "placed",
          shippingType: deliverySpeed,
          expectedDeliveryFrom: windowInfo.fromISO,
          expectedDeliveryTo: windowInfo.toISO,
          shippingCharge: selectedShippingFee,
          estimatedDelivery: `${windowInfo.fromDisplay} - ${windowInfo.toDisplay}`,
        });

        if (user) {
          await deleteCheckoutDraft(user.uid).catch(() => {});
        }
        clearCart();
        setIsProcessing(false);
        setConfirmedOrder(confirmation);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setValidationError(`Order submission failed: ${msg}. Please check your connection and retry.`);
        setIsProcessing(false);
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
              {/* Green / Purple Banner */}
              <div
                className={`px-6 py-8 text-center text-white ${
                  confirmedOrder.paymentMethod === "phonepe"
                    ? "bg-gradient-to-r from-purple-800 via-indigo-800 to-slate-900"
                    : "bg-gradient-to-r from-emerald-600 to-teal-700"
                }`}
              >
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-md mb-3 shadow-inner">
                  {confirmedOrder.paymentMethod === "phonepe" ? (
                    <Clock className="size-10 text-white animate-pulse" />
                  ) : (
                    <CheckCircle2 className="size-10 text-white" />
                  )}
                </div>
                <h1 className="font-display text-2xl font-black sm:text-3xl">
                  {confirmedOrder.paymentMethod === "phonepe"
                    ? "Order Submitted & Payment Recorded!"
                    : "Order Successfully Placed!"}
                </h1>
                <p className="mt-1 text-sm text-purple-100 sm:text-emerald-100">
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
                      ? `Priority / Emergency Dispatch (${shippingSettings.priorityDaysMin}-${shippingSettings.priorityDaysMax} days)`
                      : `Standard Logistics (${shippingSettings.standardDaysMin}-${shippingSettings.standardDaysMax} days)`}
                  </div>
                </div>
              </div>

              {/* Order Details Body */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* PhonePe Customer Verification Alert */}
                {confirmedOrder.paymentMethod === "phonepe" && (
                  <div className="rounded-2xl border-2 border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent p-5 space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/20 text-amber-600 shrink-0 mt-0.5">
                        <Clock className="size-5" />
                      </div>
                      <div className="space-y-1.5">
                        <h4 className="font-display text-sm sm:text-base font-bold text-foreground">
                          Hope you have made the payment. We will check and get back to you. This is pending, okay.
                        </h4>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          Your submitted PhonePe 13-digit Transaction ID / UTR reference is:{" "}
                          <strong className="font-mono font-bold text-foreground bg-muted px-2 py-0.5 rounded border border-border select-all">
                            {confirmedOrder.transactionId || confirmedOrder.paymentId}
                          </strong>
                          . Our team will verify this with our PhonePe transaction statement and update your order to <strong className="text-emerald-600">CONFIRMED</strong>. You will also receive an update in your account notifications.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Statutory Supplier / Billed By Header */}
                <div className="rounded-xl border border-border bg-muted/20 p-4 text-xs space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border/80 pb-2.5 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                        Supplier / Invoiced By
                      </span>
                      <h3 className="text-sm font-bold text-foreground mt-0.5">
                        Sri Udharchi Enterprises
                        <span className="text-muted-foreground font-medium text-xs block sm:inline sm:ml-2">
                          (Proprietor: <strong>Dabbara Bhanu Swaroop</strong>)
                        </span>
                      </h3>
                    </div>
                    <div className="text-right sm:self-auto self-start">
                      <span className="text-[10px] font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                        GSTIN: 37AAEFU1234F1Z5
                      </span>
                    </div>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    <div>
                      <strong className="text-foreground block text-[10px] uppercase tracking-wider">
                        Office &amp; Logistics Depot:
                      </strong>
                      <span className="leading-relaxed block mt-0.5">
                        H-7, Kubera Hills, Palasamudram, Sri Sathya Sai District, AP - 515241
                      </span>
                    </div>
                  </div>
                </div>

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
                            <Zap className="size-3" /> Priority Emergency Dispatch ({shippingSettings.priorityDaysMin} to {shippingSettings.priorityDaysMax} days)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-primary font-bold">
                            <Truck className="size-3" /> Standard Delivery ({shippingSettings.standardDaysMin} to {shippingSettings.standardDaysMax} days)
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
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-foreground flex-wrap">
                      <span>Payment Status:</span>
                      {confirmedOrder.paymentMethod === "phonepe" ? (
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 flex-wrap">
                          <Clock className="size-3.5 text-amber-600 animate-pulse" />
                          <span>PhonePe Verification Pending</span>
                          {(confirmedOrder.transactionId || confirmedOrder.paymentId) && (
                            <span className="font-mono text-[11px] bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-300">
                              UTR: {confirmedOrder.transactionId || confirmedOrder.paymentId}
                            </span>
                          )}
                        </span>
                      ) : confirmedOrder.paymentMethod === "cod" ? (
                        <span className="font-bold text-primary">
                          Cash on Delivery (Pay at Site)
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-600 flex items-center gap-1.5 flex-wrap">
                          <CheckCircle2 className="size-3.5 text-emerald-600" />
                          <span>PAID ONLINE</span>
                        </span>
                      )}
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

  if (!isHydrated && activeItems.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground animate-in fade-in duration-150">
        <SiteHeader />

        {/* Breadcrumb Header Skeleton */}
        <section className="border-b border-border bg-muted/40 py-8">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-3.5 w-12 rounded bg-muted animate-pulse" />
              <ChevronRight className="size-3 text-muted-foreground/30" />
              <div className="h-3.5 w-16 rounded bg-muted animate-pulse" />
              <ChevronRight className="size-3 text-muted-foreground/30" />
              <div className="h-3.5 w-12 rounded bg-muted animate-pulse" />
              <ChevronRight className="size-3 text-muted-foreground/30" />
              <div className="h-3.5 w-28 rounded bg-muted animate-pulse" />
            </div>

            <div className="flex items-center gap-3">
              <div className="size-10 rounded-xl bg-muted animate-pulse" />
              <div className="space-y-1.5">
                <div className="h-7 w-64 sm:w-80 rounded-lg bg-muted animate-pulse" />
                <div className="h-3.5 w-48 rounded bg-muted/60 animate-pulse" />
              </div>
            </div>
          </div>
        </section>

        {/* Main Checkout Area Skeleton */}
        <section className="py-12">
          <div className="mx-auto max-w-7xl px-5 lg:px-8">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12 items-start">
              {/* Left Column (7 cols): Details Form Skeleton */}
              <div className="lg:col-span-7 space-y-8">
                {/* Delivery Information Card Skeleton */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-6">
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <div className="size-8 rounded-lg bg-muted animate-pulse" />
                    <div className="h-6 w-48 rounded bg-muted animate-pulse" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-4 w-20 rounded bg-muted/60 animate-pulse" />
                      <div className="h-10 w-full rounded-xl bg-muted/40 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 w-24 rounded bg-muted/60 animate-pulse" />
                      <div className="h-10 w-full rounded-xl bg-muted/40 animate-pulse" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-28 rounded bg-muted/60 animate-pulse" />
                    <div className="h-10 w-full rounded-xl bg-muted/40 animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-muted/60 animate-pulse" />
                    <div className="h-20 w-full rounded-xl bg-muted/40 animate-pulse" />
                  </div>
                </div>

                {/* Delivery Speed Options Skeleton */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
                  <div className="h-6 w-44 rounded bg-muted animate-pulse" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="h-24 rounded-xl border border-border bg-muted/30 animate-pulse" />
                    <div className="h-24 rounded-xl border border-border bg-muted/30 animate-pulse" />
                  </div>
                </div>

                {/* Payment Selection Skeleton */}
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 space-y-4">
                  <div className="h-6 w-40 rounded bg-muted animate-pulse" />
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="h-20 rounded-xl border border-border bg-muted/30 animate-pulse" />
                    <div className="h-20 rounded-xl border border-border bg-muted/30 animate-pulse" />
                    <div className="h-20 rounded-xl border border-border bg-muted/30 animate-pulse" />
                    <div className="h-20 rounded-xl border border-border bg-muted/30 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Right Column (5 cols): Order Summary Skeleton */}
              <div className="lg:col-span-5 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-6 shadow-xs">
                  <div className="flex items-center justify-between border-b border-border pb-4">
                    <div className="h-6 w-36 rounded bg-muted animate-pulse" />
                    <div className="h-5 w-16 rounded-full bg-muted/60 animate-pulse" />
                  </div>

                  {/* Items list skeleton */}
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3.5 pb-3 border-b border-border/50">
                        <div className="size-16 rounded-xl bg-muted animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
                          <div className="h-3 w-1/3 rounded bg-muted/60 animate-pulse" />
                        </div>
                        <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                      </div>
                    ))}
                  </div>

                  {/* Pricing Breakdown Skeleton */}
                  <div className="space-y-3 pt-2 text-xs">
                    <div className="flex justify-between">
                      <div className="h-3.5 w-16 rounded bg-muted animate-pulse" />
                      <div className="h-3.5 w-20 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="flex justify-between">
                      <div className="h-3.5 w-24 rounded bg-muted animate-pulse" />
                      <div className="h-3.5 w-14 rounded bg-muted animate-pulse" />
                    </div>
                    <div className="flex justify-between border-t border-border pt-3">
                      <div className="h-5 w-24 rounded bg-muted animate-pulse" />
                      <div className="h-6 w-28 rounded bg-primary/20 animate-pulse" />
                    </div>
                  </div>

                  {/* Place Order CTA Skeleton */}
                  <div className="h-12 w-full rounded-xl bg-primary/30 animate-pulse" />

                  {/* Trust guarantees */}
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="h-10 rounded-lg bg-muted/30 animate-pulse" />
                    <div className="h-10 rounded-lg bg-muted/30 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    );
  }

  /* ---------------- EMPTY CART REDIRECT VIEW ---------------- */
  if (activeItems.length === 0 && !searchProductId) {
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
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
                Verified Order Booking • Cash on Delivery (COD) Available
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
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
              {/* Left Column: Form Fields */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-8">
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
                        placeholder="Enter full name"
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
                            placeholder="e.g. Sri Udharchi Enterprises"
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
                          {standardFee === 0 ? "FREE" : `₹${standardFee}`}
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
                          ₹{priorityFee.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Step 3: Payment Options (PhonePe Instant UPI QR & Cash on Delivery) */}
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-border">
                    <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      3
                    </span>
                    <h2 className="font-display text-base font-bold text-foreground">
                      Select Payment Method
                    </h2>
                  </div>

                  <div className="space-y-3">
                    {/* Option 1: PhonePe Direct UPI & Dynamic QR Payment */}
                    <div
                      onClick={() => {
                        setPaymentMethod("phonepe");
                        setPaymentError(null);
                      }}
                      className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                        paymentMethod === "phonepe" || paymentMethod === "upi"
                          ? "border-[#5f259f] bg-purple-500/5 shadow-md ring-2 ring-[#5f259f]/20"
                          : "border-border bg-card hover:border-[#5f259f]/40 hover:bg-muted/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="flex size-11 sm:size-12 items-center justify-center rounded-2xl bg-[#5f259f] text-white shadow-md shrink-0">
                            <Smartphone className="size-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                                <span>PhonePe Direct UPI &amp; Instant QR</span>
                                <span className="inline-flex items-center rounded-md bg-[#5f259f]/15 px-2 py-0.5 text-[10px] font-black uppercase text-[#5f259f] dark:text-purple-300 border border-[#5f259f]/30">
                                  Direct App
                                </span>
                              </h3>
                              <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/30">
                                Recommended
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              Open PhonePe app directly with pre-filled amount or scan the dynamic UPI QR code. No extra gateway fees.
                            </p>
                            <div className="mt-2.5 flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground font-medium">
                              <span className="rounded-md bg-purple-600/10 px-2 py-0.5 font-bold text-[#5f259f] dark:text-purple-300 border border-purple-500/20">
                                PhonePe App
                              </span>
                              <span className="rounded-md bg-muted px-2 py-0.5 font-semibold text-foreground border border-border/60">
                                Dynamic UPI QR
                              </span>
                              <span className="rounded-md bg-muted px-2 py-0.5 font-semibold text-foreground border border-border/60">
                                Google Pay
                              </span>
                              <span className="rounded-md bg-muted px-2 py-0.5 font-semibold text-foreground border border-border/60">
                                Paytm / BHIM
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                            paymentMethod === "phonepe" || paymentMethod === "upi"
                              ? "border-[#5f259f] bg-[#5f259f] text-white shadow-xs"
                              : "border-border bg-background"
                          }`}
                        >
                          {(paymentMethod === "phonepe" || paymentMethod === "upi") && (
                            <CheckCircle2 className="size-4" />
                          )}
                        </div>
                      </div>

                      {/* Interactive PhonePe Payment Box */}
                      {(paymentMethod === "phonepe" || paymentMethod === "upi") && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-5 pt-4 border-t border-purple-500/20 space-y-4 bg-background/80 rounded-2xl p-4 sm:p-5 border border-purple-500/10"
                        >
                          {/* Live Payable Badge */}
                          <div className="flex items-center justify-between bg-gradient-to-r from-[#5f259f]/10 to-transparent p-3 rounded-xl border border-[#5f259f]/20">
                            <div>
                              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                Invoiced Amount to Pay
                              </span>
                              <span className="font-display text-2xl font-black text-[#5f259f] dark:text-purple-300">
                                ₹{finalPayable.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/30">
                                <ShieldCheck className="size-3.5" />
                                <span>Direct Payee</span>
                              </span>
                            </div>
                          </div>

                          {/* High-Value NPCI 2K Cap Advisory Banner */}
                          {finalPayable > 2000 && (
                            <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                              <div className="flex items-center gap-2 font-bold">
                                <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                                <span>High-Value Payment Mode (Orders Above ₹2,000)</span>
                              </div>
                              <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                                NPCI dynamic QR rules restrict pre-filled auto-amount QR codes to ₹2,000. To pay <strong>₹{finalPayable.toLocaleString("en-IN")}</strong> smoothly, use the <strong>High-Value QR</strong> or <strong>Merchant Card</strong> below and enter ₹{finalPayable.toLocaleString("en-IN")} manually in PhonePe/GPay/Paytm. Transactions up to ₹1,00,000 are fully supported without any limit!
                              </p>
                            </div>
                          )}

                          <div className="grid gap-6 md:grid-cols-[auto_1fr] items-center">
                            {/* Left: Dynamic / Flexible QR Code with Tab Switcher */}
                            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-border/80 shadow-md">
                              {/* QR Mode Switcher */}
                              <div className="mb-2 flex items-center rounded-lg bg-slate-100 p-0.5 text-[10px] font-bold">
                                <button
                                  type="button"
                                  onClick={() => setActiveQrTab("flexible")}
                                  className={`px-2 py-0.5 rounded transition-all flex items-center gap-1 ${
                                    activeQrTab === "flexible"
                                      ? "bg-[#5f259f] text-white shadow-xs"
                                      : "text-slate-600 hover:text-slate-900"
                                  }`}
                                >
                                  <span>High-Value QR</span>
                                  {finalPayable > 2000 && (
                                    <span className="rounded bg-amber-400 px-1 py-0.2 text-[9px] font-black text-slate-900">
                                      &gt;₹2K
                                    </span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveQrTab("dynamic")}
                                  className={`px-2 py-0.5 rounded transition-all ${
                                    activeQrTab === "dynamic"
                                      ? "bg-white text-slate-900 shadow-xs"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                >
                                  Auto-Fill QR
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveQrTab("card")}
                                  className={`px-2 py-0.5 rounded transition-all ${
                                    activeQrTab === "card"
                                      ? "bg-white text-slate-900 shadow-xs"
                                      : "text-slate-500 hover:text-slate-800"
                                  }`}
                                >
                                  Merchant Card
                                </button>
                              </div>

                              {activeQrTab === "flexible" ? (
                                flexibleQrDataUrl ? (
                                  <img
                                    src={flexibleQrDataUrl}
                                    alt="PhonePe High-Value QR Code"
                                    className="size-44 sm:size-48 object-contain rounded-lg"
                                  />
                                ) : (
                                  <div className="size-44 sm:size-48 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                    Generating QR...
                                  </div>
                                )
                              ) : activeQrTab === "dynamic" ? (
                                qrDataUrl ? (
                                  <img
                                    src={qrDataUrl}
                                    alt="PhonePe UPI QR Code"
                                    className="size-44 sm:size-48 object-contain rounded-lg"
                                  />
                                ) : (
                                  <div className="size-44 sm:size-48 rounded-lg bg-muted flex items-center justify-center text-xs text-muted-foreground">
                                    Generating QR...
                                  </div>
                                )
                              ) : (
                                <img
                                  src="/phonepe-upi-card.png"
                                  alt="Sri Udharchi Official Merchant Card"
                                  className="h-44 sm:h-48 w-auto object-contain rounded-lg"
                                />
                              )}
                              <div className="mt-2 text-center">
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-800">
                                  <QrCode className="size-3.5 text-[#5f259f]" />
                                  <span>
                                    {activeQrTab === "flexible"
                                      ? `Scan & Enter ₹${finalPayable.toLocaleString("en-IN")} in App`
                                      : activeQrTab === "dynamic"
                                        ? `Scan to Pay ₹${finalPayable.toLocaleString("en-IN")}`
                                        : "Official Merchant UPI QR"}
                                  </span>
                                </span>
                              </div>
                            </div>

                            {/* Right: Direct App Launch & Copy Links */}
                            <div className="space-y-3">
                              {/* Direct Open in PhonePe App button */}
                              <div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (validateDeliveryDetails()) {
                                      setShowPhonePeModal(true);
                                      try {
                                        if (typeof window !== "undefined") {
                                          window.location.href = upiDetails.phonePeUrl;
                                        }
                                      } catch (e) {}
                                    }
                                  }}
                                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#5f259f] hover:bg-[#521e8d] text-white px-5 py-3 text-sm font-bold shadow-md shadow-purple-900/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                >
                                  <Smartphone className="size-4" />
                                  <span>Open PhonePe &amp; Pay ₹{finalPayable.toLocaleString("en-IN")}</span>
                                  <ExternalLink className="size-3.5 ml-1" />
                                </button>
                                {finalPayable > 2000 && (
                                  <a
                                    href={upiDetails.phonePeFlexibleUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="mt-1.5 w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 text-[#5f259f] dark:text-purple-300 py-1.5 text-xs font-bold transition-colors"
                                  >
                                    <span>High-Value Open PhonePe (Manual ₹{finalPayable.toLocaleString("en-IN")} Entry)</span>
                                  </a>
                                )}
                                <p className="text-[11px] text-muted-foreground mt-1 text-center">
                                  {finalPayable > 2000
                                    ? "For >₹2K, enter amount manually in PhonePe if dynamic limit appears."
                                    : "Launches PhonePe directly with payee & exact amount pre-filled."}
                                </p>
                              </div>

                              {/* Alternative UPI Apps Row */}
                              <div className="flex items-center gap-2 pt-1">
                                <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Other Apps:</span>
                                <a
                                  href={finalPayable > 2000 ? upiDetails.gpayFlexibleUrl : upiDetails.gpayUrl}
                                  className="flex-1 text-center rounded-lg border border-border bg-muted/40 hover:bg-muted px-2.5 py-1.5 text-xs font-bold text-foreground transition-colors"
                                >
                                  Google Pay
                                </a>
                                <a
                                  href={finalPayable > 2000 ? upiDetails.paytmFlexibleUrl : upiDetails.paytmUrl}
                                  className="flex-1 text-center rounded-lg border border-border bg-muted/40 hover:bg-muted px-2.5 py-1.5 text-xs font-bold text-foreground transition-colors"
                                >
                                  Paytm
                                </a>
                                <a
                                  href={finalPayable > 2000 ? upiDetails.flexibleUpiUrl : upiDetails.upiUrl}
                                  className="flex-1 text-center rounded-lg border border-border bg-muted/40 hover:bg-muted px-2.5 py-1.5 text-xs font-bold text-foreground transition-colors"
                                >
                                  Any UPI
                                </a>
                              </div>

                              {/* UPI ID, Amount & Payee Copy Details */}
                              <div className="rounded-xl border border-border/80 bg-muted/30 p-2.5 space-y-1.5 text-xs">
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Invoiced Payable:</span>
                                  <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                                    <span className="select-all">₹{finalPayable.toLocaleString("en-IN")}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(String(finalPayable), "invoicedAmount")}
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20"
                                      title="Copy Exact Amount"
                                    >
                                      {copiedField === "invoicedAmount" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                                      <span>{copiedField === "invoicedAmount" ? "Copied" : "Copy Amount"}</span>
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Payee UPI ID:</span>
                                  <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                                    <span className="select-all">{activeUpiId}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(activeUpiId, "upiId")}
                                      className="p-1 rounded hover:bg-muted text-primary"
                                      title="Copy UPI ID"
                                    >
                                      {copiedField === "upiId" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">PhonePe Registered No:</span>
                                  <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                                    <span className="select-all">{activePhonePeNumber}</span>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(activePhonePeNumber, "phonepeNum")}
                                      className="p-1 rounded hover:bg-muted text-primary"
                                      title="Copy PhonePe Number"
                                    >
                                      {copiedField === "phonepeNum" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="text-muted-foreground">Beneficiary Name:</span>
                                  <span className="font-semibold text-foreground truncate max-w-[200px]">
                                    {activePayeeName}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* 13-Digit PhonePe Transaction ID Input */}
                          <div className="pt-3 border-t border-border/70 space-y-2">
                            <label className="block text-xs font-bold text-foreground">
                              Enter PhonePe 13-Digit Transaction ID / UTR (if already paid)
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={phonePeTransactionId}
                                onChange={(e) => setPhonePeTransactionId(e.target.value.trim())}
                                placeholder="e.g. T261108152345 or 12/13-digit UTR"
                                maxLength={35}
                                className="w-full rounded-xl border border-purple-500/40 bg-background px-4 py-2.5 text-sm font-mono text-foreground focus:border-[#5f259f] focus:ring-2 focus:ring-[#5f259f]/20 focus:outline-none"
                              />
                              {phonePeTransactionId.length >= 8 && (
                                <span className="absolute right-3 top-3 text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                  <CheckCircle2 className="size-4" />
                                  <span>Ready</span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
                              <HelpCircle className="size-3.5 text-primary shrink-0 mt-0.5" />
                              <span>
                                Complete payment on PhonePe, then paste the 13-digit <strong>Transaction ID</strong> (starts with T) or bank <strong>UTR</strong> to confirm your order.
                              </span>
                            </div>

                            {phonePeTransactionId.trim() && (
                              <button
                                type="button"
                                disabled={isProcessing}
                                onClick={() => handlePhonePeSubmit(phonePeTransactionId)}
                                className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white px-4 py-3 text-xs font-bold shadow-md transition-all cursor-pointer active:scale-[0.99]"
                              >
                                {isProcessing ? (
                                  <>
                                    <span className="size-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    <span>Verifying &amp; Submitting...</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="size-4" />
                                    <span>Submit Transaction ID &amp; Confirm Order</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Option 2: Cash on Delivery (COD) */}
                    <div
                      onClick={() => {
                        setPaymentMethod("cod");
                        setPaymentError(null);
                      }}
                      className={`rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                        paymentMethod === "cod"
                          ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                          : "border-border bg-card hover:border-primary/40 hover:bg-muted/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <div className="flex size-11 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm shrink-0">
                            <Truck className="size-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-bold text-foreground">
                                Cash / Pay on Delivery (COD)
                              </h3>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Inspect your equipment physically upon delivery and pay via cash or UPI to the delivery executive
                            </p>
                          </div>
                        </div>
                        <div
                          className={`flex size-6 shrink-0 items-center justify-center rounded-full border transition-all ${
                            paymentMethod === "cod"
                              ? "border-primary bg-primary text-primary-foreground shadow-xs"
                              : "border-border bg-background"
                          }`}
                        >
                          {paymentMethod === "cod" && <CheckCircle2 className="size-4" />}
                        </div>
                      </div>

                      {paymentMethod === "cod" && (
                        <div className="mt-4 pt-3 border-t border-border/60 text-xs text-muted-foreground space-y-1 bg-background/60 rounded-xl p-3">
                          <div className="flex items-center gap-2 font-medium text-foreground">
                            <Phone className="size-3.5 text-primary shrink-0" />
                            <span>Phone Verification Required</span>
                          </div>
                          <p className="text-[11px] leading-relaxed">
                            Our dispatch desk will verify your order on your registered mobile number prior to cargo shipment.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Review Box */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sticky top-24">
                  <h2 className="font-display text-base font-bold text-foreground pb-3 border-b border-border">
                    Order Overview ({totalItems} Items)
                  </h2>

                  {/* Compact Items Preview */}
                  <div className="my-4 max-h-56 overflow-y-auto space-y-3 pr-1 divide-y divide-border/60">
                    {activeItems.map((item) => (
                      <div key={item.id} className="pt-2 first:pt-0 flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          decoding="async"
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
                        {selectedShippingFee === 0 ? (
                          <span className="font-bold text-emerald-600">FREE</span>
                        ) : (
                          `₹${selectedShippingFee.toLocaleString("en-IN")}`
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

                  {/* Payment Failure Noted Banner */}
                  {paymentError && (
                    <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3.5 text-xs text-red-900 dark:text-red-200 space-y-2">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="size-4 text-red-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h4 className="font-bold text-red-700 dark:text-red-300">
                            Payment Not Completed
                          </h4>
                          <p className="mt-0.5 leading-relaxed text-[11px] text-red-800 dark:text-red-200">
                            {paymentError.message}
                          </p>
                          {paymentError.details && (
                            <p className="mt-1 font-mono text-[10px] text-red-600 dark:text-red-400">
                              {paymentError.details}
                            </p>
                          )}
                          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={handlePlaceOrder}
                              className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 transition-all flex items-center gap-1 shadow-xs"
                            >
                              <RotateCcw className="size-3" /> Retry Payment
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentMethod("cod");
                                setPaymentError(null);
                              }}
                              className="rounded-lg border border-red-500/40 bg-background/80 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:text-red-300 hover:bg-red-500/15 transition-all"
                            >
                              Switch to Cash on Delivery (COD)
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPaymentError(null)}
                          className="text-red-500 hover:text-red-700 text-sm font-bold leading-none"
                          title="Dismiss"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="mt-6">
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isProcessing}
                      className={`w-full justify-center text-sm font-bold shadow-md hover:shadow-lg transition-all ${
                        paymentMethod === "phonepe"
                          ? "bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-600 hover:from-purple-800 hover:to-indigo-700 text-white shadow-purple-900/25"
                          : paymentMethod === "razorpay"
                          ? "bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white"
                          : ""
                      }`}
                    >
                      {isProcessing ? (
                        <span className="flex items-center gap-2">
                          <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          <span>{processingStep || "Processing..."}</span>
                        </span>
                      ) : paymentMethod === "phonepe" ? (
                        <span className="flex items-center gap-2">
                          <Smartphone className="size-4" />
                          <span>
                            {phonePeTransactionId.trim()
                              ? `Confirm Order & Submit Payment • ₹${finalPayable.toLocaleString("en-IN")}`
                              : `Pay ₹${finalPayable.toLocaleString("en-IN")} via PhonePe / UPI`}
                          </span>
                          <ArrowRight className="size-4" />
                        </span>
                      ) : paymentMethod === "razorpay" ? (
                        <span className="flex items-center gap-2">
                          <Lock className="size-4" />
                          <span>Pay ₹{finalPayable.toLocaleString("en-IN")} via Razorpay</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Truck className="size-4" />
                          <span>Confirm Order (Cash on Delivery) • ₹{finalPayable.toLocaleString("en-IN")}</span>
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
                      href={`tel:+91${activePhonePeNumber.replace(/\D/g, "")}`}
                      className="mt-1 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
                    >
                      <Phone className="size-3.5" /> Call Dispatch Desk: {activePhonePeNumber}
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

      {/* =========================================================================
          PHONEPE DEDICATED PAYMENT SCREEN / MODAL (HIGH-CONVERTING GATEWAY UI)
          ========================================================================= */}
      {showPhonePeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-5 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl max-h-[92vh] overflow-y-auto rounded-3xl border border-purple-500/30 bg-card text-foreground shadow-2xl animate-in fade-in zoom-in-95 duration-200 my-auto">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-purple-500/20 bg-gradient-to-r from-[#5f259f] via-purple-900 to-indigo-950 px-5 py-4 text-white shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-white text-[#5f259f] shadow-inner font-black">
                  <Smartphone className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display text-base sm:text-lg font-black tracking-tight leading-tight">
                      PhonePe UPI Payment
                    </h3>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-400/30">
                      <ShieldCheck className="size-3" /> Direct Gateway
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-200">
                    Order Ref: <span className="font-mono font-bold text-white">#{previewOrderId}</span> • Sri Udharchi Enterprises
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPhonePeModal(false)}
                className="rounded-full bg-white/10 p-2 text-purple-200 hover:bg-white/20 hover:text-white transition-colors"
                title="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              {/* Live Amount Banner */}
              <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-purple-500/10 via-[#5f259f]/5 to-transparent p-4 border border-purple-500/20">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                    Total Invoiced Amount
                  </span>
                  <div className="font-display text-2xl sm:text-3xl font-black text-[#5f259f] dark:text-purple-300">
                    ₹{finalPayable.toLocaleString("en-IN")}
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    Inclusive of 18% GST &amp; Shipping • Zero Convenience Fees
                  </span>
                </div>
                <div className="text-right">
                  <div className="inline-flex flex-col items-end">
                    <span className="text-[10px] font-semibold text-muted-foreground">Beneficiary Name</span>
                    <span className="text-xs font-bold text-foreground max-w-[170px] truncate">
                      {activePayeeName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step 1: Open PhonePe App (One-click trigger on Mobile) */}
              <div className="space-y-2">
                <a
                  href={upiDetails.phonePeUrl}
                  className="w-full inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#5f259f] to-[#4c1d80] hover:from-[#521e8d] hover:to-[#3e1769] text-white px-5 py-3.5 text-sm sm:text-base font-bold shadow-lg shadow-purple-900/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  <Smartphone className="size-5" />
                  <span>Open in PhonePe App (Pay ₹{finalPayable.toLocaleString("en-IN")})</span>
                  <ExternalLink className="size-4 ml-0.5" />
                </a>

                {finalPayable > 2000 && (
                  <a
                    href={upiDetails.phonePeFlexibleUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-[#5f259f] dark:text-purple-300 py-2 text-xs font-bold transition-colors"
                  >
                    <span>High-Value Open PhonePe (Manual ₹{finalPayable.toLocaleString("en-IN")} Entry)</span>
                  </a>
                )}

                {/* Other UPI Apps row */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-semibold text-muted-foreground shrink-0">Other UPI:</span>
                  <a
                    href={finalPayable > 2000 ? upiDetails.gpayFlexibleUrl : upiDetails.gpayUrl}
                    className="flex-1 text-center rounded-xl border border-border bg-muted/40 hover:bg-muted py-2 text-xs font-bold text-foreground transition-colors"
                  >
                    Google Pay
                  </a>
                  <a
                    href={finalPayable > 2000 ? upiDetails.paytmFlexibleUrl : upiDetails.paytmUrl}
                    className="flex-1 text-center rounded-xl border border-border bg-muted/40 hover:bg-muted py-2 text-xs font-bold text-foreground transition-colors"
                  >
                    Paytm
                  </a>
                  <a
                    href={finalPayable > 2000 ? upiDetails.flexibleUpiUrl : upiDetails.upiUrl}
                    className="flex-1 text-center rounded-xl border border-border bg-muted/40 hover:bg-muted py-2 text-xs font-bold text-foreground transition-colors"
                  >
                    Any UPI App
                  </a>
                </div>
              </div>

              {/* High-Value NPCI 2K Cap Advisory Banner */}
              {finalPayable > 2000 && (
                <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-xs text-amber-900 dark:text-amber-200 space-y-1.5">
                  <div className="flex items-center gap-2 font-bold">
                    <AlertCircle className="size-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>NPCI ₹2,000 QR Limit Notification</span>
                  </div>
                  <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
                    If PhonePe notifies that payments above ₹2,000 are not allowed on this QR code, please select the <strong>High-Value QR</strong> or <strong>Merchant Card</strong> tab below. Scan it, enter <strong>₹{finalPayable.toLocaleString("en-IN")}</strong> manually, and authorize with UPI PIN. Payments up to ₹1,00,000 will process instantly!
                  </p>
                </div>
              )}

              {/* QR Code Section with Tabs */}
              <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-border/70 flex-wrap gap-2">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <QrCode className="size-4 text-[#5f259f]" />
                    <span>Scan to Pay (Desktop / Another Device)</span>
                  </span>
                  {/* Tab Selector */}
                  <div className="inline-flex rounded-lg bg-muted p-1 text-[11px] font-semibold">
                    <button
                      type="button"
                      onClick={() => setActiveQrTab("flexible")}
                      className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                        activeQrTab === "flexible"
                          ? "bg-[#5f259f] text-white font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span>High-Value QR</span>
                      {finalPayable > 2000 && (
                        <span className="rounded bg-amber-400 px-1 py-0.2 text-[9px] font-black text-slate-900">
                          &gt;₹2K
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQrTab("dynamic")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        activeQrTab === "dynamic"
                          ? "bg-card text-foreground font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Dynamic Bill QR
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveQrTab("card")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        activeQrTab === "card"
                          ? "bg-card text-foreground font-bold shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Official Merchant Card
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-2">
                  {activeQrTab === "flexible" ? (
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-border/80 shadow-md">
                      {flexibleQrDataUrl ? (
                        <img
                          src={flexibleQrDataUrl}
                          alt="High-Value PhonePe UPI QR"
                          className="size-44 sm:size-48 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="size-44 sm:size-48 flex items-center justify-center text-xs text-muted-foreground">
                          Generating QR...
                        </div>
                      )}
                      <span className="mt-2 text-[11px] font-bold text-slate-800">
                        Scan &amp; Enter ₹{finalPayable.toLocaleString("en-IN")} in App
                      </span>
                    </div>
                  ) : activeQrTab === "dynamic" ? (
                    <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-border/80 shadow-md">
                      {qrDataUrl ? (
                        <img
                          src={qrDataUrl}
                          alt="Dynamic PhonePe UPI QR"
                          className="size-44 sm:size-48 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="size-44 sm:size-48 flex items-center justify-center text-xs text-muted-foreground">
                          Generating QR...
                        </div>
                      )}
                      <span className="mt-2 text-[11px] font-bold text-slate-800">
                        Scan to Pay ₹{finalPayable.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-border/80 shadow-md">
                      <img
                        src="/phonepe-upi-card.png"
                        alt="Sri Udharchi Official Merchant Card"
                        className="h-48 sm:h-52 w-auto object-contain rounded-xl"
                      />
                    </div>
                  )}

                  {/* Merchant Details & Copy buttons */}
                  <div className="space-y-2.5 text-xs flex-1 w-full">
                    <div className="rounded-xl border border-border/70 bg-card p-3 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Invoiced Amount:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                          <span className="select-all">₹{finalPayable.toLocaleString("en-IN")}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(String(finalPayable), "modalInvoicedAmount")}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px] font-bold hover:bg-primary/20"
                            title="Copy Exact Amount"
                          >
                            {copiedField === "modalInvoicedAmount" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                            <span>{copiedField === "modalInvoicedAmount" ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">Payee UPI ID:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                          <span className="select-all text-[11px] sm:text-xs">{activeUpiId}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(activeUpiId, "upiId")}
                            className="p-1 rounded hover:bg-muted text-primary"
                            title="Copy UPI ID"
                          >
                            {copiedField === "upiId" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground">PhonePe Registered No:</span>
                        <div className="flex items-center gap-1.5 font-mono font-bold text-foreground">
                          <span className="select-all">{activePhonePeNumber}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(activePhonePeNumber, "phonepeNum")}
                            className="p-1 rounded hover:bg-muted text-primary"
                            title="Copy PhonePe Number"
                          >
                            {copiedField === "phonepeNum" ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between gap-2 pt-1 border-t border-border/50 text-[11px]">
                        <span className="text-muted-foreground">Proprietor:</span>
                        <span className="font-semibold text-foreground">Dabbara Bhanu Swaroop</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Scan with PhonePe, Google Pay, Paytm, BHIM, or any UPI banking app.
                    </p>
                  </div>
                </div>
              </div>

              {/* STEP 2: "HAVE YOU MADE THE PAYMENT?" VERIFICATION SECTION */}
              <div className="rounded-2xl border-2 border-[#5f259f]/40 bg-gradient-to-br from-[#5f259f]/10 via-purple-500/5 to-transparent p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-9 items-center justify-center rounded-xl bg-[#5f259f] text-white shrink-0 mt-0.5">
                    <CheckCircle2 className="size-5" />
                  </div>
                  <div>
                    <h4 className="font-display text-sm sm:text-base font-bold text-foreground">
                      Have you made the payment?
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Once you finish the transfer in PhonePe, enter your 12 or 13-digit Transaction ID / UTR below to confirm your order.
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1.5">
                      Enter PhonePe 13-Digit Transaction ID / UTR <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={phonePeTransactionId}
                        onChange={(e) => setPhonePeTransactionId(e.target.value.trim())}
                        placeholder="e.g. T261108152345 or 12/13-digit UTR"
                        maxLength={35}
                        className="w-full rounded-xl border border-purple-500/40 bg-background px-4 py-3 text-sm font-mono text-foreground focus:border-[#5f259f] focus:ring-2 focus:ring-[#5f259f]/20 focus:outline-none placeholder:text-muted-foreground/60"
                      />
                      {phonePeTransactionId.length >= 8 && (
                        <span className="absolute right-3.5 top-3.5 text-xs font-bold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="size-4" />
                          <span>Ready</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-start gap-2 rounded-xl bg-background/80 border border-border p-3 text-[11px] text-muted-foreground leading-relaxed">
                    <HelpCircle className="size-4 text-[#5f259f] shrink-0 mt-0.5" />
                    <span>
                      <strong>Where to find it:</strong> In PhonePe, open <em>History</em> &gt; tap the payment to <em>Sri Udharchi Enterprises</em> &gt; copy the 13-digit <strong>Transaction ID</strong> (starts with &apos;T&apos;) or bank <strong>UTR</strong>.
                    </span>
                  </div>

                  {validationError && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-xs text-red-600 flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>{validationError}</span>
                    </div>
                  )}

                  <div className="pt-1 flex flex-col sm:flex-row gap-2.5">
                    <button
                      type="button"
                      disabled={isProcessing || !phonePeTransactionId.trim()}
                      onClick={() => handlePhonePeSubmit(phonePeTransactionId)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-3.5 text-sm font-bold shadow-md transition-all hover:scale-[1.01] active:scale-[0.99]"
                    >
                      {isProcessing ? (
                        <>
                          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Verifying &amp; Submitting...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="size-4" />
                          <span>Submit Transaction ID &amp; Confirm Order</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPhonePeModal(false)}
                      className="px-4 py-3 rounded-xl border border-border bg-background hover:bg-muted text-xs font-semibold text-muted-foreground transition-colors"
                    >
                      Return to Checkout
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
