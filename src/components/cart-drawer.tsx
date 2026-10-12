import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "./button";

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    gstAmount,
    shippingFee,
    discountAmount,
    totalAmount,
    totalItems,
  } = useCart();

  useEffect(() => {
    if (!isCartOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsCartOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isCartOpen, setIsCartOpen]);

  const freeShippingThreshold = 5000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm"
          />

          {/* Slide-over Panel */}
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 360, damping: 34 }}
            className="relative z-10 flex h-dvh w-full max-w-md flex-col bg-background shadow-2xl border-l border-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4 bg-card/60 backdrop-blur">
              <div className="flex items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <ShoppingBag className="size-5" />
                </div>
                <div>
                  <h2 className="font-display text-base font-bold text-foreground">
                    Your Safety Cart
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {totalItems} {totalItems === 1 ? "item" : "items"} selected
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Close cart"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Free Shipping Progress */}
            <div className="border-b border-border bg-primary/5 px-5 py-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-semibold text-foreground">
                  <Truck className="size-4 text-primary" />
                  {amountNeeded === 0
                    ? "Free Express Shipping Unlocked!"
                    : `Add ₹${amountNeeded.toLocaleString("en-IN")} for Free Delivery`}
                </span>
                <span className="font-bold text-primary">{progressPercent}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.4 }}
                  className="h-full bg-primary rounded-full"
                />
              </div>
            </div>

            {/* Cart Body */}
            {cartItems.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
                <div className="flex size-20 items-center justify-center rounded-full bg-muted/80 text-muted-foreground mb-4">
                  <ShoppingBag className="size-10 stroke-[1.5]" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  Your cart is empty
                </h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-xs">
                  Equip your facility with certified fire extinguishers, hydrants, pumps, and PPE
                  gear.
                </p>
                <div className="mt-6 w-full space-y-2">
                  <a
                    href="/products"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full"
                  >
                    <Button className="w-full justify-center">
                      Browse Equipment Catalog <ArrowRight className="size-4" />
                    </Button>
                  </a>
                  <a
                    href="/contact"
                    onClick={() => setIsCartOpen(false)}
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full justify-center">
                      Request Custom Quotation
                    </Button>
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-border/60">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      referrerPolicy="no-referrer"
                      className="size-20 shrink-0 rounded-lg object-cover border border-border bg-muted"
                    />

                    <div className="flex flex-1 flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-foreground line-clamp-2 leading-tight">
                            {item.name}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-destructive p-1 -mr-1 transition-colors"
                            title="Remove item"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                        <span className="inline-block mt-0.5 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                          {item.category}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between">
                        {/* Stepper */}
                        <div className="flex items-center rounded-lg border border-border bg-card">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="flex size-7 items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                          >
                            <Plus className="size-3" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <span className="font-display text-sm font-black text-foreground">
                            ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                          </span>
                          {item.unit && (
                            <span className="block text-[10px] text-muted-foreground">
                              ₹{item.price.toLocaleString("en-IN")} / {item.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Footer Summary */}
            {cartItems.length > 0 && (
              <div className="border-t border-border bg-card/80 p-5 backdrop-blur space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-foreground">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-semibold">
                      <span>Discount Applied</span>
                      <span>-₹{discountAmount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted-foreground">
                    <span className="flex items-center gap-1">
                      GST (18% Statutory Tax)
                      <span className="text-[10px] text-primary" title="ITC eligible">
                        (ITC)
                      </span>
                    </span>
                    <span className="font-semibold text-foreground">
                      ₹{gstAmount.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted-foreground">
                    <span>Industrial Logistics</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="font-bold text-emerald-600">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>

                  <div className="border-t border-border/80 pt-2 flex justify-between items-baseline">
                    <div>
                      <span className="font-display text-sm font-bold text-foreground">
                        Total Amount
                      </span>
                      <span className="block text-[10px] text-muted-foreground">
                        Includes 18% GST & Freight
                      </span>
                    </div>
                    <span className="font-display text-xl font-black text-primary">
                      ₹{totalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="/cart"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full"
                  >
                    <Button variant="outline" className="w-full justify-center text-xs">
                      View Cart
                    </Button>
                  </a>

                  <a
                    href="/checkout"
                    onClick={() => setIsCartOpen(false)}
                    className="w-full"
                  >
                    <Button className="w-full justify-center text-xs">
                      Checkout <ArrowRight className="size-3.5" />
                    </Button>
                  </a>
                </div>

                <div className="flex items-center justify-center gap-3 pt-1 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-primary" /> BIS / ISI Certified
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-emerald-600" /> GST Tax Invoice
                  </span>
                </div>
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
