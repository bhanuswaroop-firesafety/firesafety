export interface ProductItem {
  id?: string | undefined;
  name: string;
  category: string;
  description: string;
  image: string; // Primary / cover photo for backwards compatibility
  images?: string[] | undefined; // Multiple gallery pictures
  specs: string[];
  inStock?: boolean | undefined;
  featured?: boolean | undefined;
  price?: string | undefined;
  unit?: string | undefined;
  sku?: string | undefined;
  minOrderQty?: string | undefined;
  renewalMonths?: 3 | 6 | 9 | 12 | undefined; // Task E: Refill / Renewal months
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
  ordersCount?: number | undefined;
  totalSpent?: number | undefined;
  profileCompleted?: boolean | undefined;
  profileSkippedAt?: string | undefined;
}

export interface LeadItem {
  id: string; // matches user uid
  uid: string;
  name: string;
  phone: string;
  email: string;
  company?: string | undefined;
  registeredAt: string;
  lastActiveAt: string;
  hasOrdered: boolean;
  orderId?: string | undefined;
  source: string; // e.g. "otp_auth", "web_portal"
  updatedAt?: string | undefined;
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

export type OrderStatus = "placed" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderStatusHistoryItem {
  status: OrderStatus | "pending" | "dispatched";
  timestamp: string; // ISO string in Asia/Kolkata
  note?: string;
  updatedBy?: string;
}

export interface OrderItem {
  id?: string | undefined;
  orderId?: string | undefined;
  orderNumber: string;
  customerId?: string | undefined;
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
    productId?: string | undefined;
    renewalMonths?: 3 | 6 | 9 | 12 | undefined;
  }>;
  subtotal: number;
  discount: number;
  gst: number;
  shipping: number;
  total: number;
  // Statuses: placed -> confirmed -> shipped -> delivered (+ cancelled).
  // Includes 'pending' and 'dispatched' for backward compatibility.
  status: OrderStatus | "pending" | "dispatched";
  createdAt: string;
  updatedAt?: string | undefined;
  estimatedDelivery?: string | undefined;

  // Task A: Shipping and dispatch timing
  shippingType?: "standard" | "priority" | undefined;
  expectedDeliveryFrom?: string | undefined;
  expectedDeliveryTo?: string | undefined;
  shippingCharge?: number | undefined;

  // Task C: Status audit history
  statusHistory?: OrderStatusHistoryItem[] | undefined;

  // Task D: Delivered timestamp and customer feedback flag
  deliveredAt?: string | undefined;
  feedbackGiven?: boolean | undefined;

  // Task E: Commissioning / installation date for renewal cycle
  installDate?: string | undefined;
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

// Task A: Shipping Settings in Firestore (settings/shipping)
export interface ShippingSettings {
  standardDaysMin: number; // default: 5
  standardDaysMax: number; // default: 7
  priorityDaysMin: number; // default: 2
  priorityDaysMax: number; // default: 4
  priorityCharge: number; // default: 400
  standardCharge?: number; // default: 250
  updatedAt?: string | undefined;

  // Backward-compatible aliases
  standardDeliveryDaysMin?: number | undefined;
  standardDeliveryDaysMax?: number | undefined;
  priorityDeliveryDaysMin?: number | undefined;
  priorityDeliveryDaysMax?: number | undefined;
}

// Task F: Social Settings in Firestore (settings/social)
export interface SocialSettings {
  instagramUrl: string; // default: "[PASTE YOUR INSTAGRAM URL HERE]"
  updatedAt?: string | undefined;
}

// Task D: Order Feedback in Firestore (feedback/{feedbackId})
export interface FeedbackItem {
  id?: string | undefined;
  feedbackId?: string | undefined;
  orderId: string;
  userId: string;
  userName?: string | undefined;
  userPhone?: string | undefined;
  userEmail?: string | undefined;
  productIds: string[];
  productNames?: string[] | undefined;
  rating: number; // 1 to 5
  comment?: string | undefined;
  createdAt: string;
}

// Task E: Equipment Refill / Renewal Reminders in Firestore (reminders/{reminderId})
export interface ReminderItem {
  id?: string | undefined;
  reminderId?: string | undefined;
  orderId: string;
  userId: string;
  customerName?: string | undefined;
  customerPhone?: string | undefined;
  customerEmail?: string | undefined;
  productId: string;
  productName: string;
  renewalMonths: 3 | 6 | 9 | 12;
  installDate: string; // YYYY-MM-DD in Asia/Kolkata
  renewalDate: string; // YYYY-MM-DD in Asia/Kolkata (installDate + renewalMonths)
  alertDate: string; // YYYY-MM-DD in Asia/Kolkata (renewalDate - 7 days)
  status: "pending" | "sent" | "completed" | "snoozed";
  cycle?: number | undefined;
  createdAt: string;
  updatedAt?: string | undefined;
  completedAt?: string | undefined;
  lastAlertSentAt?: string | undefined;
}

// In-app Notifications (notifications/{notificationId})
export interface NotificationItem {
  id?: string | undefined;
  userId: string; // customer UID or "admin"
  title: string;
  message: string;
  type: "renewal" | "order" | "feedback" | "system";
  orderId?: string | undefined;
  reminderId?: string | undefined;
  read: boolean;
  createdAt: string;
}

// Regional Depot Item
export interface RegionalDepot {
  id: string;
  name: string;
  address: string;
  description: string;
}

// Business Profile & Depot Settings in Firestore (settings/business)
export interface BusinessProfileSettings {
  entityName: string;
  specialization: string;
  jurisdiction: string;
  standards: string;
  primaryDepotName: string;
  primaryDepotAddress: string;
  gstin: string;
  stateCode: string;
  pan: string;
  taxSlab: string;
  accountHolder: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  depots: RegionalDepot[];
  updatedAt?: string | undefined;
}

// Contact & Support Settings in Firestore (settings/contact)
export interface ContactSettings {
  supportPhone: string;
  secondaryPhone?: string | undefined;
  supportEmail: string;
  adminEmail: string;
  address?: string | undefined;
  updatedAt?: string | undefined;
}

// Server-backed Cart document in Firestore (carts/{uid})
export interface CartDoc {
  items: Array<{
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
    renewalMonths?: 3 | 6 | 9 | 12 | undefined;
  }>;
  couponCode?: string | undefined;
  updatedAt: string;
}

// Server-backed Checkout Draft document in Firestore (drafts/{uid})
export interface CheckoutDraftDoc {
  uid: string;
  fullName?: string | undefined;
  phone?: string | undefined;
  email?: string | undefined;
  address?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  pincode?: string | undefined;
  isB2B?: boolean | undefined;
  companyName?: string | undefined;
  gstin?: string | undefined;
  deliverySpeed?: "standard" | "priority" | undefined;
  paymentMethod?: string | undefined;
  notes?: string | undefined;
  updatedAt: string;
}

