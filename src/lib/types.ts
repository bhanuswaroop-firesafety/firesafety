export interface ProductItem {
  id?: string | undefined;
  name: string;
  category: string;
  description: string;
  image: string;
  specs: string[];
  inStock?: boolean | undefined;
  featured?: boolean | undefined;
  price?: string | undefined;
  unit?: string | undefined;
  sku?: string | undefined;
  minOrderQty?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
}

export interface UserItem {
  id: string;
  email: string;
  displayName?: string | undefined;
  role: "admin" | "staff" | "customer";
  createdAt: string;
  updatedAt?: string | undefined;
  phone?: string | undefined;
  company?: string | undefined;
  lastLoginAt?: string | undefined;
}

export interface InquiryItem {
  id?: string | undefined;
  name: string;
  phone: string;
  email: string;
  service?: string | undefined;
  facility?: string | undefined;
  message?: string | undefined;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string | undefined;
}

export interface OrderItem {
  id?: string | undefined;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  companyName?: string | undefined;
  gstin?: string | undefined;
  paymentMethod: "upi" | "card" | "netbanking" | "po" | "cod";
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
  status: "pending" | "confirmed" | "dispatched" | "delivered" | "cancelled";
  createdAt: string;
  estimatedDelivery?: string | undefined;
}

export interface AuthorizedAdminItem {
  id: string; // Lowercase email or document id
  email: string;
  displayName?: string | undefined;
  role: "admin";
  department?: string | undefined;
  phone?: string | undefined;
  addedBy?: string | undefined;
  createdAt: string;
  updatedAt?: string | undefined;
  initialPassword?: string | undefined;
}

