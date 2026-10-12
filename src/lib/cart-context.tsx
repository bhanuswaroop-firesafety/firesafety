import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import type { ProductItem } from "./types";

export interface CartItem {
  id: string;
  name: string;
  category: string;
  price: number;
  priceDisplay: string;
  unit?: string | undefined;
  image: string;
  quantity: number;
  specs?: string[] | undefined;
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
    item: {
      id?: string;
      name: string;
      category?: string;
      price?: string | number;
      unit?: string;
      image?: string;
      specs?: string[];
      sku?: string;
    },
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "udharchi_cart_items_v1";
const COUPON_STORAGE_KEY = "udharchi_cart_coupon_v1";

export function parsePriceToNumber(rawPrice?: string | number): number {
  if (typeof rawPrice === "number") return rawPrice;
  if (!rawPrice) return 0;
  const cleaned = rawPrice.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate from localStorage once on client mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setCartItems(parsed);
          }
        }
        const savedCoupon = localStorage.getItem(COUPON_STORAGE_KEY);
        if (savedCoupon) {
          setCouponCode(savedCoupon);
        }
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Save to localStorage only after hydration is complete
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [cartItems, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      if (couponCode) {
        localStorage.setItem(COUPON_STORAGE_KEY, couponCode);
      } else {
        localStorage.removeItem(COUPON_STORAGE_KEY);
      }
    } catch (e) {
      console.error("Failed to save coupon to localStorage", e);
    }
  }, [couponCode, isHydrated]);

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

  const addToCart: CartContextType["addToCart"] = (item, quantity = 1) => {
    const numericPrice = parsePriceToNumber(item.price);
    const id = item.id || `item-${item.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;
    const priceDisplay =
      typeof item.price === "string" && item.price.startsWith("₹")
        ? item.price
        : `₹${numericPrice.toLocaleString("en-IN")}`;

    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        toast.success(`Updated quantity for ${item.name}`, {
          description: `Total quantity: ${existing.quantity + quantity}`,
        });
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity + quantity } : i,
        );
      } else {
        toast.success(`Added ${item.name} to cart`, {
          description: `${priceDisplay} ${item.unit ? `per ${item.unit}` : ""}`,
        });
        return [
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
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCartItems((prev) => {
      const removedItem = prev.find((i) => i.id === id);
      if (removedItem) {
        toast.info(`Removed ${removedItem.name} from cart`);
      }
      return prev.filter((i) => i.id !== id);
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[],
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode(null);
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
    toast.success(`Coupon ${normalized} applied!`, {
      description: found.description,
    });
    return { success: true, message: `Coupon ${normalized} applied successfully!` };
  };

  const removeCoupon = () => {
    setCouponCode(null);
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
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
