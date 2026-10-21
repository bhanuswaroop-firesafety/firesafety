import React, { createContext, useContext, useEffect, useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import type { ProductItem } from "./types";
import { useAuth } from "./auth-context";
import { subscribeCart, saveCart, clearServerCart } from "./db-service";

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  priceDisplay: string;
  unit?: string | undefined;
  image: string;
  quantity: number;
  specs?: string[] | string | undefined;
  sku?: string | undefined;
}

interface CouponInfo {
  code: string;
  description: string;
  discountType: "percent" | "flat";
  value: number;
  minOrder?: number;
}

const VALID_COUPONS: Record<string, CouponInfo> = {
  UDHARCHI10: {
    code: "UDHARCHI10",
    description: "10% off on all safety equipment",
    discountType: "percent",
    value: 10,
  },
  SAFETY500: {
    code: "SAFETY500",
    description: "₹500 flat off on orders above ₹2,500",
    discountType: "flat",
    value: 500,
    minOrder: 2500,
  },
  BULKSAVE: {
    code: "BULKSAVE",
    description: "15% off on bulk orders above ₹10,000",
    discountType: "percent",
    value: 15,
    minOrder: 10000,
  },
};

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (
    item:
      | {
          id?: string | undefined;
          name: string;
          category?: string | undefined;
          price?: string | number | undefined;
          unit?: string | undefined;
          image?: string | undefined;
          specs?: string[] | string | undefined;
          sku?: string | undefined;
        }
      | ProductItem,
    quantity?: number,
  ) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  subtotal: number;
  gstAmount: number;
  shippingFee: number;
  couponCode: string | null;
  couponInfo: CouponInfo | null;
  discountAmount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  totalAmount: number;
  totalItems: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isHydrated: boolean;
  isCartLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function parsePriceToNumber(rawPrice?: string | number): number {
  if (typeof rawPrice === "number") return rawPrice;
  if (!rawPrice) return 0;
  const cleaned = rawPrice.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);

  // Sync with Firestore carts/{uid} when user logs in or out
  useEffect(() => {
    if (!user) {
      // Guest visitor: in-memory state only (resets on reload or logout)
      setCartItems([]);
      setCouponCode(null);
      setIsHydrated(true);
      setIsCartLoading(false);
      return;
    }

    setIsCartLoading(true);

    const unsubscribe = subscribeCart(
      user.uid,
      (cartDoc) => {
        if (cartDoc && Array.isArray(cartDoc.items)) {
          setCartItems(cartDoc.items);
          setCouponCode(cartDoc.couponCode || null);
        } else {
          setCartItems([]);
          setCouponCode(null);
        }
        setIsHydrated(true);
        setIsCartLoading(false);
      },
      (err) => {
        console.error("Firestore cart load error:", err);
        toast.error("Could not sync your cart with the server. Please check your network.");
        setIsHydrated(true);
        setIsCartLoading(false);
      },
    );

    return () => {
      unsubscribe();
    };
  }, [user]);

  // Persist cart changes to Firestore
  const syncToServer = async (items: CartItem[], coupon: string | null) => {
    if (!user) return;
    try {
      await saveCart(user.uid, items, coupon);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error("Failed to save cart to server. " + msg);
    }
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  }, [cartItems]);

  const totalItems = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  const couponInfo = couponCode ? VALID_COUPONS[couponCode.toUpperCase()] || null : null;

  const discountAmount = useMemo(() => {
    if (!couponInfo || subtotal <= 0) return 0;
    if (couponInfo.minOrder && subtotal < couponInfo.minOrder) return 0;
    if (couponInfo.discountType === "percent") {
      return Math.round((subtotal * couponInfo.value) / 100);
    }
    return Math.min(couponInfo.value, subtotal);
  }, [couponInfo, subtotal]);

  // 18% standard GST for safety & firefighting equipment
  const gstAmount = useMemo(() => {
    const discountedBase = Math.max(0, subtotal - discountAmount);
    return Math.round(discountedBase * 0.18);
  }, [subtotal, discountAmount]);

  // Free shipping above ₹5,000, otherwise flat ₹250 industrial cargo
  const shippingFee = useMemo(() => {
    if (subtotal === 0) return 0;
    return subtotal >= 5000 ? 0 : 250;
  }, [subtotal]);

  const totalAmount = useMemo(() => {
    if (subtotal === 0) return 0;
    return Math.max(0, subtotal - discountAmount) + gstAmount + shippingFee;
  }, [subtotal, discountAmount, gstAmount, shippingFee]);

  const performAddToCart = (
    item: Parameters<CartContextType["addToCart"]>[0],
    quantity: number,
  ) => {
    const numericPrice = parsePriceToNumber(item.price);
    const id = item.id || `item-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const priceDisplay =
      typeof item.price === "string" && item.price.startsWith("₹")
        ? item.price
        : `₹${numericPrice.toLocaleString("en-IN")}`;

    setCartItems((prev) => {
      let updated: CartItem[];
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        toast.success(`Updated quantity for ${item.name}`, {
          description: `Total quantity: ${existing.quantity + quantity}`,
        });
        updated = prev.map((i) => (i.id === id ? { ...i, quantity: i.quantity + quantity } : i));
      } else {
        toast.success(`Added ${item.name} to cart`, {
          description: `${priceDisplay} ${item.unit ? `per ${item.unit}` : ""}`,
        });
        updated = [
          ...prev,
          {
            id,
            name: item.name,
            category: item.category || "Safety Equipment",
            price: numericPrice,
            priceDisplay,
            unit: item.unit,
            image: item.image || "/sri-udharchi-enterprises-logo.png",
            quantity,
            specs: item.specs,
            sku: item.sku,
          },
        ];
      }

      syncToServer(updated, couponCode);
      return updated;
    });

    setIsCartOpen(true);
  };

  const addToCart: CartContextType["addToCart"] = (item, quantity = 1) => {
    performAddToCart(item, quantity);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => {
      const removedItem = prev.find((i) => i.id === id);
      if (removedItem) {
        toast.info(`Removed ${removedItem.name} from cart`);
      }
      const updated = prev.filter((i) => i.id !== id);
      syncToServer(updated, couponCode);
      return updated;
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) => {
      const updated = prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];

      syncToServer(updated, couponCode);
      return updated;
    });
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode(null);
    if (user) {
      clearServerCart(user.uid).catch((err) => {
        console.warn("Could not clear server cart:", err);
      });
    }
  };

  const applyCoupon = (code: string) => {
    const normalized = code.trim().toUpperCase();
    const found = VALID_COUPONS[normalized];
    if (!found) {
      toast.error("Invalid coupon code", {
        description: "Please check the code and try again.",
      });
      return { success: false, message: "Invalid coupon code" };
    }

    if (found.minOrder && subtotal < found.minOrder) {
      toast.warning(`Minimum order ₹${found.minOrder.toLocaleString("en-IN")} required`, {
        description: `Add ₹${(found.minOrder - subtotal).toLocaleString("en-IN")} more to use this code.`,
      });
      return {
        success: false,
        message: `Requires minimum order of ₹${found.minOrder.toLocaleString("en-IN")}`,
      };
    }

    setCouponCode(normalized);
    syncToServer(cartItems, normalized);

    toast.success(`Coupon ${normalized} applied!`, {
      description: found.description,
    });
    return { success: true, message: `Coupon ${normalized} applied successfully!` };
  };

  const removeCoupon = () => {
    setCouponCode(null);
    syncToServer(cartItems, null);
    toast.info("Coupon removed");
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
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
        isCartOpen,
        setIsCartOpen,
        isHydrated,
        isCartLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    return {
      cartItems: [],
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      clearCart: () => {},
      subtotal: 0,
      gstAmount: 0,
      shippingFee: 0,
      couponCode: null,
      couponInfo: null,
      discountAmount: 0,
      applyCoupon: () => ({ success: false, message: "Cart not initialized" }),
      removeCoupon: () => {},
      totalAmount: 0,
      totalItems: 0,
      isCartOpen: false,
      setIsCartOpen: () => {},
      isHydrated: true,
      isCartLoading: false,
    };
  }
  return context;
}
