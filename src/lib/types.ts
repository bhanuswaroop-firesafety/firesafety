export interface ProductItem {
  id?: string;
  name: string;
  category: string;
  description: string;
  image: string;
  specs: string[];
  inStock?: boolean;
  featured?: boolean;
  price?: string;
  unit?: string;
  sku?: string;
  minOrderQty?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserItem {
  id: string;
  email: string;
  displayName?: string;
  role: "admin" | "staff" | "customer";
  createdAt: string;
}

export interface InquiryItem {
  id?: string;
  name: string;
  phone: string;
  email: string;
  service?: string;
  facility?: string;
  message?: string;
  status: "new" | "contacted" | "closed";
  createdAt: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
}
