import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import { useCart } from "@/lib/cart-context";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Tag,
  FileText,
  PhoneCall,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import extinguisherImg from "@/assets/fire-extinguisher.jpg";
import hydrantValveImg from "@/assets/hydrant-valve.jpg";
import helmetImg from "@/assets/safety-helmet.jpg";

import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () =>
    seoHead({
      title: "Shopping Cart & Order Review | Sri Udharchi Enterprises",
      description:
        "Review your safety equipment order, calculate 18% GST and freight, apply promotional discounts, and proceed to checkout with Sri Udharchi Enterprises.",
      path: "/cart",
      noIndex: true,
    }),
  component: CartPage,
});

const QUICK_ADD_ITEMS = [
  {
    id: "def-extinguisher",
    name: "Commercial ABC Dry Chemical Fire Extinguisher (6kg)",
    category: "Fire Safety",
    price: 2450,
    priceDisplay: "₹2,450",
    unit: "unit",
    image: extinguisherImg,
    specs: ["IS 15683 Certified", "4-A : 60-B:C Rating"],
  },
  {
    id: "def-hydrant-valve",
    name: "Industrial Landing Valve & Instantaneous Coupling",
    category: "Fire Hydrant",
    price: 3800,
    priceDisplay: "₹3,800",
    unit: "piece",
    image: hydrantValveImg,
    specs: ["IS 5290 / BS 5041 Type A", "65mm Flanged Inlet"],
  },
  {
    id: "def-safety-helmet",
    name: "High-Visibility Industrial Safety Hard Hat",
    category: "PPE",
    price: 380,
    priceDisplay: "₹380",
    unit: "piece",
    image: helmetImg,
    specs: ["IS 2925 Certified", "4-Point Ratchet Suspension"],
  },
];

function CartPage() {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    gstAmount,
    shippingFee,
    couponCode,
    couponInfo,
    discountAmount,
    applyCoupon,
    removeCoupon,
    totalAmount,
    totalItems,
    addToCart,
    isHydrated,
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState("");
  const [couponError, setCouponError] = useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    if (!inputCoupon.trim()) return;
    const res = applyCoupon(inputCoupon);
    if (!res.success) {
      setCouponError(res.message);
    } else {
      setInputCoupon("");
    }
  };

  const freeShippingThreshold = 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Breadcrumb & Header */}
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
            <span className="font-semibold text-foreground">Cart ({totalItems})</span>
          </nav>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl font-black text-foreground sm:text-4xl">
                Equipment Cart & Quotation
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Review certified fire protection gear, statutory GST billing, and dispatch
                schedules.
              </p>
            </div>

            {cartItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive border-destructive/20"
              >
                <Trash2 className="size-3.5" /> Clear Cart
              </Button>
            )}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {!isHydrated ? (
            <div className="py-20 text-center max-w-sm mx-auto">
              <div className="size-10 animate-spin rounded-full border-3 border-primary border-t-transparent mx-auto mb-4" />
              <p className="text-xs text-muted-foreground font-semibold">
                Loading your safety cart...
              </p>
            </div>
          ) : cartItems.length === 0 ? (
            /* Empty Cart View */
            <div className="py-12 text-center max-w-2xl mx-auto">
              <div className="flex size-24 items-center justify-center rounded-3xl bg-primary/10 text-primary mx-auto mb-6 shadow-inner">
                <ShoppingBag className="size-12 stroke-[1.5]" />
              </div>

              <h2 className="font-display text-2xl font-bold text-foreground">
                Your shopping cart is currently empty
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Looking for industrial fire extinguishers, heavy-duty pumps, hydrants, or certified
                PPE? Add certified equipment to your cart or request an official project
                quotation.
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a href="/products">
                  <Button size="lg">
                    Browse Equipment Catalog <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="/contact">
                  <Button variant="outline" size="lg">
                    Request Project Proposal
                  </Button>
                </a>
              </div>

              {/* Quick Add Suggestions */}
              <div className="mt-16 text-left border-t border-border pt-10">
                <div className="flex items-center gap-2 mb-6">
                  <ShieldCheck className="size-4 text-primary" />
                  <h3 className="font-display text-base font-bold text-foreground">
                    Commonly Requested Safety Essentials
                  </h3>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
                  {QUICK_ADD_ITEMS.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border bg-card p-3 sm:p-4 flex flex-col justify-between hover:border-primary/40 transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-center mb-2.5 sm:mb-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="size-12 sm:size-16 rounded-lg object-cover border border-border bg-muted shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase text-primary block truncate">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-bold text-foreground truncate">
                            {item.name}
                          </h4>
                          <span className="font-display text-xs sm:text-sm font-black text-foreground">
                            {item.priceDisplay}
                          </span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 sm:h-8 px-1 text-[10px] sm:text-xs hover:bg-primary hover:text-primary-foreground font-bold"
                        onClick={() => addToCart(item, 1)}
                      >
                        <Plus className="size-3 mr-1" /> Add
                        <span className="hidden sm:inline">&nbsp;to Cart</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Filled Cart View */
            <div className="grid gap-10 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
              {/* Left Column: Cart Items List */}
              <div className="space-y-6">
                {/* Free Shipping Notification */}
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-foreground">
                      <Truck className="size-4 text-primary" />
                      {amountNeeded === 0
                        ? "🎉 Free Express Industrial Cargo Unlocked!"
                        : `Add ₹${amountNeeded.toLocaleString("en-IN")} more to get FREE Industrial Cargo Delivery!`}
                    </span>
                    <span className="font-bold text-primary">{progressPercent}%</span>
                  </div>
                  <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-border">
                    <div
                      className="h-full bg-primary transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Items Card */}
                <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
                  <div className="hidden border-b border-border bg-muted/30 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-muted-foreground sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] sm:gap-4">
                    <span>Product Details</span>
                    <span className="text-center">Unit Price</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-right">Total</span>
                  </div>

                  <div className="divide-y divide-border">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="p-5 sm:px-6 sm:py-5 flex flex-col sm:grid sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-center sm:gap-4 gap-4"
                      >
                        {/* Product Info */}
                        <div className="flex gap-4 items-center">
                          <a href={`/products/${item.id}`} className="shrink-0">
                            <img
                              src={item.image}
                              alt={item.name}
                              referrerPolicy="no-referrer"
                              className="size-20 shrink-0 rounded-xl object-cover border border-border bg-muted hover:opacity-90 transition-opacity"
                            />
                          </a>
                          <div className="min-w-0">
                            <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-bold text-primary">
                              {item.category}
                            </span>
                            <a
                              href={`/products/${item.id}`}
                              className="hover:text-primary transition-colors block"
                            >
                              <h3 className="mt-1 font-display text-sm font-bold text-foreground leading-snug">
                                {item.name}
                              </h3>
                            </a>
                            {item.specs && item.specs.length > 0 && (
                              <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                {item.specs[0]}
                              </p>
                            )}
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="size-3" /> Remove
                            </button>
                          </div>
                        </div>

                        {/* Unit Price */}
                        <div className="text-left sm:text-center">
                          <span className="text-xs text-muted-foreground sm:hidden">Price: </span>
                          <span className="text-sm font-semibold text-foreground">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                          {item.unit && (
                            <span className="block text-[11px] text-muted-foreground">
                              /{item.unit}
                            </span>
                          )}
                        </div>

                        {/* Stepper */}
                        <div className="flex items-center sm:justify-center">
                          <span className="text-xs text-muted-foreground sm:hidden mr-3">
                            Qty:{" "}
                          </span>
                          <div className="inline-flex items-center rounded-lg border border-border bg-background shadow-xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-foreground">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, 1)}
                              className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="text-right">
                          <span className="text-xs text-muted-foreground sm:hidden">Total: </span>
                          <span className="font-display text-base font-black text-foreground">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Back to Shopping & B2B GST Info */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                  <a
                    href="/products"
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:underline"
                  >
                    <ArrowLeft className="size-3.5" /> Continue Adding Equipment
                  </a>

                  <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3.5 py-2 text-xs text-muted-foreground">
                    <FileText className="size-4 text-primary" />
                    <span>Input Tax Credit (ITC) available with GSTIN invoice</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Order Summary */}
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                  <h2 className="font-display text-lg font-bold text-foreground">
                    Quotation & Order Summary
                  </h2>

                  {/* Pricing Breakdown */}
                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal ({totalItems} items)</span>
                      <span className="font-semibold text-foreground">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span className="flex items-center gap-1">
                          <Tag className="size-3.5" /> Discount ({couponCode})
                        </span>
                        <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        Statutory GST (18%)
                        <span
                          className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-bold text-primary"
                          title="Central 9% + State 9%"
                        >
                          CGST + SGST
                        </span>
                      </span>
                      <span className="font-semibold text-foreground">
                        ₹{gstAmount.toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="flex justify-between text-muted-foreground">
                      <span>Industrial Cargo / Freight</span>
                      <span>
                        {shippingFee === 0 ? (
                          <span className="font-bold text-emerald-600">FREE</span>
                        ) : (
                          `₹${shippingFee}`
                        )}
                      </span>
                    </div>

                    <div className="border-t border-border pt-4">
                      <div className="flex justify-between items-baseline">
                        <div>
                          <span className="font-display text-base font-bold text-foreground">
                            Total Payable
                          </span>
                          <span className="block text-[11px] text-muted-foreground">
                            Includes all statutory taxes & freight
                          </span>
                        </div>
                        <span className="font-display text-2xl font-black text-primary">
                          ₹{totalAmount.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Promo Code Input */}
                  <div className="mt-6 border-t border-border pt-5">
                    {couponInfo ? (
                      <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs">
                        <div className="flex items-center gap-2">
                          <Tag className="size-4 text-emerald-600" />
                          <div>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400">
                              {couponInfo.code}
                            </span>
                            <p className="text-[11px] text-muted-foreground">
                              {couponInfo.description}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="font-bold text-destructive hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCoupon} className="space-y-2">
                        <label
                          htmlFor="coupon-code"
                          className="text-xs font-bold text-foreground flex items-center gap-1.5"
                        >
                          <Tag className="size-3.5 text-primary" /> Apply Promotional Code
                        </label>
                        <div className="flex gap-2">
                          <input
                            id="coupon-code"
                            type="text"
                            placeholder="e.g. UDHARCHI10"
                            value={inputCoupon}
                            onChange={(e) => setInputCoupon(e.target.value)}
                            className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-xs uppercase placeholder:normal-case placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                          />
                          <Button type="submit" size="sm" variant="outline">
                            Apply
                          </Button>
                        </div>
                        {couponError && (
                          <p className="text-[11px] text-destructive">{couponError}</p>
                        )}
                        <p className="text-[11px] text-muted-foreground">
                          Try code:{" "}
                          <button
                            type="button"
                            onClick={() => applyCoupon("UDHARCHI10")}
                            className="font-bold text-primary hover:underline"
                          >
                            UDHARCHI10
                          </button>{" "}
                          (10% off) or{" "}
                          <button
                            type="button"
                            onClick={() => applyCoupon("SAFETY500")}
                            className="font-bold text-primary hover:underline"
                          >
                            SAFETY500
                          </button>
                        </p>
                      </form>
                    )}
                  </div>

                  {/* Proceed to Checkout CTA */}
                  <div className="mt-6 space-y-2.5">
                    <a href="/checkout" className="block w-full">
                      <Button size="lg" className="w-full justify-center">
                        Proceed to Checkout <ArrowRight className="size-4" />
                      </Button>
                    </a>

                    <a href="tel:+918639858221" className="block w-full">
                      <Button variant="outline" className="w-full justify-center text-xs">
                        <PhoneCall className="size-3.5" /> Order via Phone: 8639858221
                      </Button>
                    </a>
                  </div>

                  {/* Trust Seals */}
                  <div className="mt-6 border-t border-border pt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-4 text-primary shrink-0" />
                      <span>IS 15683 / BIS Certified Equipment Guaranteed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                      <span>GST Tax Invoicing with Input Tax Credit (ITC)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Truck className="size-4 text-primary shrink-0" />
                      <span>Pan-India Safe Cargo (Standard 5 to 7 days | Priority 1 to 2 days)</span>
                    </div>
                  </div>
                </div>

                {/* B2B Purchase Order Notice */}
                <div className="rounded-xl border border-dashed border-border bg-muted/30 p-4 text-xs text-muted-foreground">
                  <strong className="block font-bold text-foreground mb-1">
                    Corporate & Government Procurement
                  </strong>
                  Need a formal Proforma Invoice or Purchase Order (PO) approval before
                  disbursement? Proceed to checkout and select{" "}
                  <span className="font-semibold text-foreground">
                    "Corporate Purchase Order / Proforma Invoice"
                  </span>{" "}
                  as your payment method.
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
