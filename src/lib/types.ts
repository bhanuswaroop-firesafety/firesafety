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
