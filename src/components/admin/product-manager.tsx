import { useState, useMemo, useEffect, type ChangeEvent, type FormEvent } from "react";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  deleteCategory,
  seedOfficialCatalog,
} from "@/lib/db-service";
import type { ProductItem, CategoryItem } from "@/lib/types";
import { uploadProductImage, MAX_IMAGE_SIZE_MB } from "@/lib/image-upload";
import { Button } from "@/components/button";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Edit2,
  ExternalLink,
  Eye,
  Filter,
  Grid,
  Image as ImageIcon,
  IndianRupee,
  Layers,
  List,
  Package,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import extinguisherImg from "@/assets/fire-extinguisher.jpg";
import hydrantImg from "@/assets/fire-hydrant-system.jpg";
import valveImg from "@/assets/hydrant-valve.jpg";
import pumpImg from "@/assets/fire-pump.jpg";
import helmetImg from "@/assets/safety-helmet.jpg";
import glovesImg from "@/assets/safety-gloves.jpg";
import safetyProductsImg from "@/assets/safety-products.jpg";
import cctvImg from "@/assets/cctv-camera.jpg";
import cableImg from "@/assets/cable-management.jpg";

const PRESET_IMAGES = [
  { name: "Fire Extinguisher", src: extinguisherImg },
  { name: "Hydrant System", src: hydrantImg },
  { name: "Hydrant Valve", src: valveImg },
  { name: "Fire Pump Skid", src: pumpImg },
  { name: "Safety Helmet", src: helmetImg },
  { name: "Safety Gloves", src: glovesImg },
  { name: "Safety Signage & Gear", src: safetyProductsImg },
  { name: "CCTV Camera", src: cctvImg },
  { name: "Cable Management", src: cableImg },
];

const PRICING_UNITS = [
  "per piece",
  "per cylinder",
  "per set",
  "per assembly",
  "per meter",
  "per pair",
  "per kit",
  "per skid setup",
  "custom quote",
];

/**
 * Format relative time (e.g. "Just now", "5m ago", "2h ago", "Yesterday", "3d ago")
 */
function formatRelativeTime(dateStr?: string): string {
  if (!dateStr) return "Catalog item";
  try {
    const now = Date.now();
    const target = new Date(dateStr).getTime();
    if (isNaN(target)) return "Catalog item";
    const diffSec = Math.floor((now - target) / 1000);
    if (diffSec < 60) return "Just now";
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return "Catalog item";
  }
}

/**
 * Format exact human-readable date and time in IST (Asia/Kolkata)
 * Example: "18 Oct 2026, 04:30 AM"
 */
function formatExactDateTime(dateStr?: string): string {
  if (!dateStr) return "Official Catalog Entry";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return dateStr;
  }
}

interface ProductManagerProps {
  products: ProductItem[];
  categories: CategoryItem[];
  onNotify: (msg: string) => void;
  initialCreateOpen?: boolean;
}

export function ProductManager({
  products,
  categories,
  onNotify,
  initialCreateOpen = false,
}: ProductManagerProps) {
  // Navigation View: "catalog" (list/grid view) or "editor" (separate full-width page)
  const [currentView, setCurrentView] = useState<"catalog" | "editor">(
    initialCreateOpen ? "editor" : "catalog",
  );

  // Filters & Sorting State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock" | "featured">(
    "all",
  );
  const [dateFilter, setDateFilter] = useState<"all" | "7days" | "30days">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "price-asc" | "price-desc">(
    "newest",
  );
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Active Editing Product & Deletion Modals
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<ProductItem | null>(null);
  const [previewProduct, setPreviewProduct] = useState<ProductItem | null>(null);

  // Category Manager Modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  const [formError, setFormError] = useState("");
  const [categoryError, setCategoryError] = useState("");

  // Product Form State
  const [formData, setFormData] = useState<Partial<ProductItem>>({
    name: "",
    category: categories[0]?.name || "",
    price: "",
    unit: "per piece",
    sku: "",
    minOrderQty: "1",
    description: "",
    specs: [],
    image: extinguisherImg,
    inStock: true,
    featured: false,
    renewalMonths: undefined,
  });

  const [currentSpec, setCurrentSpec] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Product Image State
  const [imageMode, setImageMode] = useState<"upload" | "url" | "presets">("upload");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadStats, setUploadStats] = useState<{
    originalKB: number;
    compressedKB: number;
    name: string;
    isStorage: boolean;
  } | null>(null);
  const [urlInput, setUrlInput] = useState("");

  // Trigger editor view if initialCreateOpen changes
  useEffect(() => {
    if (initialCreateOpen) {
      openCreateEditor();
    }
  }, [initialCreateOpen]);

  // Escape key handler for dismissing open dialogs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDeleting) setIsDeleting(null);
        else if (previewProduct) setPreviewProduct(null);
        else if (isCategoryModalOpen) setIsCategoryModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, previewProduct, isCategoryModalOpen]);

  // Available category names
  const categoryNames = useMemo(() => {
    return Array.from(new Set(categories.map((c) => c.name)));
  }, [categories]);

  // Recently Added Products (Top 4 latest items by createdAt)
  const recentlyAddedProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => {
        const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tB - tA;
      })
      .slice(0, 4);
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const matchesSearch =
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase());

        let matchesStock = true;
        if (stockFilter === "inStock") matchesStock = p.inStock !== false;
        if (stockFilter === "outOfStock") matchesStock = p.inStock === false;
        if (stockFilter === "featured") matchesStock = !!p.featured;

        let matchesDate = true;
        if (dateFilter === "7days") {
          if (!p.createdAt) matchesDate = false;
          else {
            const diffDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            matchesDate = diffDays <= 7;
          }
        } else if (dateFilter === "30days") {
          if (!p.createdAt) matchesDate = false;
          else {
            const diffDays = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24);
            matchesDate = diffDays <= 30;
          }
        }

        return matchesCategory && matchesSearch && matchesStock && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "newest") {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        }
        if (sortBy === "oldest") {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tA - tB;
        }
        const numA = Number(a.price?.replace(/[^0-9.]/g, "") || 0);
        const numB = Number(b.price?.replace(/[^0-9.]/g, "") || 0);
        if (sortBy === "price-asc") return numA - numB;
        if (sortBy === "price-desc") return numB - numA;
        return 0;
      });
  }, [products, selectedCategory, searchTerm, stockFilter, dateFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock !== false).length;
    const featured = products.filter((p) => p.featured).length;
    const totalCategories = categoryNames.length;
    return { total, inStock, featured, totalCategories };
  }, [products, categoryNames]);

  // Open Full-Page Create Editor
  const openCreateEditor = () => {
    setEditingProduct(null);
    setFormError("");
    setUploadStats(null);
    setImageMode("upload");
    setUrlInput("");
    setFormData({
      name: "",
      category: categories[0]?.name || "",
      price: "",
      unit: "per piece",
      sku: "",
      minOrderQty: "1",
      description: "",
      specs: [],
      image: extinguisherImg,
      inStock: true,
      featured: false,
      renewalMonths: undefined,
    });
    setCurrentSpec("");
    setCurrentView("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Open Full-Page Edit Editor
  const openEditEditor = (product: ProductItem) => {
    setEditingProduct(product);
    setFormError("");
    setUploadStats(null);
    const isUrl = !!(
      product.image &&
      (product.image.startsWith("http://") || product.image.startsWith("https://"))
    );
    setImageMode(isUrl ? "url" : "upload");
    setUrlInput(isUrl ? product.image : "");
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price || "",
      unit: product.unit || "per piece",
      sku: product.sku || "",
      minOrderQty: product.minOrderQty || "1",
      description: product.description,
      specs: [...(product.specs || [])],
      image: product.image,
      inStock: product.inStock !== false,
      featured: !!product.featured,
      renewalMonths: product.renewalMonths,
    });
    setCurrentSpec("");
    setCurrentView("editor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Form Image File Upload (supports up to 10 MB with auto-compression)
  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please upload a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      setFormError(
        `Image size (${(file.size / (1024 * 1024)).toFixed(1)} MB) exceeds the maximum allowed limit of ${MAX_IMAGE_SIZE_MB} MB. Please upload an image under ${MAX_IMAGE_SIZE_MB} MB.`,
      );
      return;
    }

    setIsUploadingImage(true);
    setFormError("");

    try {
      const result = await uploadProductImage(file);
      setFormData((prev) => ({ ...prev, image: result.url }));
      setUploadStats({
        originalKB: result.originalSizeKB,
        compressedKB: result.compressedSizeKB,
        name: file.name,
        isStorage: result.isStorageUrl,
      });
      onNotify(
        result.isStorageUrl
          ? `Uploaded to cloud storage (${result.compressedSizeKB} KB)`
          : `Image compressed & ready (${result.compressedSizeKB} KB)`,
      );
    } catch (err: unknown) {
      setFormError("Error processing image: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Handle URL change
  const handleUrlApply = (url: string) => {
    setUrlInput(url);
    const cleanUrl = url.trim();
    if (cleanUrl) {
      setFormData((prev) => ({ ...prev, image: cleanUrl }));
      setUploadStats(null);
    }
  };

  // Add Spec Tag
  const handleAddSpec = () => {
    if (!currentSpec.trim()) return;
    setFormData((prev) => ({
      ...prev,
      specs: [...(prev.specs || []), currentSpec.trim()],
    }));
    setCurrentSpec("");
  };

  // Remove Spec Tag
  const handleRemoveSpec = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specs: (prev.specs || []).filter((_, i) => i !== index),
    }));
  };

  // Submit Product Form (Create or Update)
  const handleSubmitProduct = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setFormError("");
    if (!formData.name?.trim() || !formData.category?.trim()) {
      setFormError("Product name and category are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Omit<ProductItem, "id"> = {
        name: formData.name.trim(),
        category: formData.category,
        price: formData.price?.trim() || "",
        unit: formData.unit || "per piece",
        sku: formData.sku?.trim() || "",
        minOrderQty: formData.minOrderQty?.trim() || "1",
        description: formData.description?.trim() || "",
        specs: formData.specs || [],
        image: formData.image || extinguisherImg,
        inStock: formData.inStock ?? true,
        featured: formData.featured ?? false,
        renewalMonths: formData.renewalMonths || undefined,
      };

      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, payload);
        onNotify(`Updated product "${payload.name}" in Firestore.`);
      } else {
        await addProduct(payload);
        onNotify(`Added new product "${payload.name}" to Firestore.`);
      }
      setCurrentView("catalog");
      setEditingProduct(null);
    } catch (err: unknown) {
      setFormError("Error saving product: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick In-Stock Toggle
  const handleToggleStock = async (product: ProductItem) => {
    if (!product.id) return;
    try {
      const nextStock = !(product.inStock !== false);
      await updateProduct(product.id, { inStock: nextStock });
      onNotify(`Marked "${product.name}" as ${nextStock ? "In Stock" : "Out of Stock"}.`);
    } catch (err) {
      console.error("Error toggling stock:", err);
    }
  };

  // Quick Featured Toggle
  const handleToggleFeatured = async (product: ProductItem) => {
    if (!product.id) return;
    try {
      const nextFeatured = !product.featured;
      await updateProduct(product.id, { featured: nextFeatured });
      onNotify(`"${product.name}" is now ${nextFeatured ? "Featured" : "Unfeatured"}.`);
    } catch (err) {
      console.error("Error toggling featured:", err);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!isDeleting?.id) return;
    try {
      await deleteProduct(isDeleting.id);
      onNotify(`Deleted product "${isDeleting.name}" from Firestore.`);
      setIsDeleting(null);
    } catch (err: unknown) {
      onNotify("Failed to delete product: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Add Category Handler
  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault();
    setCategoryError("");
    if (!newCategoryName.trim()) return;
    try {
      await addCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
      });
      onNotify(`Added category "${newCategoryName}" to Firestore.`);
      setNewCategoryName("");
      setNewCategoryDesc("");
    } catch (err: unknown) {
      setCategoryError(
        "Error adding category: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  };

  // Delete Category Handler
  const handleDeleteCategory = async (id: string, name: string) => {
    try {
      await deleteCategory(id);
      onNotify(`Deleted category "${name}".`);
    } catch (err: unknown) {
      onNotify("Error deleting category: " + (err instanceof Error ? err.message : String(err)));
    }
  };

  // Seed / Sync Verified Sri Udharchi Catalog to Firestore
  const [isSeeding, setIsSeeding] = useState(false);
  const handleSeedCatalog = async () => {
    setIsSeeding(true);
    try {
      const added = await seedOfficialCatalog();
      onNotify(`Successfully synced ${added} official Sri Udharchi catalog products to Firestore.`);
    } catch (err: unknown) {
      onNotify("Error syncing catalog: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSeeding(false);
    }
  };

  // =========================================================================
  // VIEW: DEDICATED FULL-PAGE PRODUCT EDITOR (REPLACES THE CRAMPED POPUP MODAL)
  // =========================================================================
  if (currentView === "editor") {
    return (
      <div className="w-full space-y-6 animate-in fade-in-50 duration-200">
        {/* Top Sticky/Header Bar */}
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentView("catalog");
                  setEditingProduct(null);
                }}
                className="gap-2 shrink-0 border-border hover:bg-muted"
              >
                <ArrowLeft className="size-4" />
                <span>Back to Products</span>
              </Button>
              <div className="h-6 w-px bg-border hidden sm:block" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                    {editingProduct ? <Edit2 className="size-3" /> : <Plus className="size-3" />}
                    {editingProduct ? "Product Editor" : "New Product Creation"}
                  </span>
                  {editingProduct?.createdAt && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1.5 hidden md:flex">
                      <Clock className="size-3 text-muted-foreground" />
                      Added: {formatExactDateTime(editingProduct.createdAt)} (
                      {formatRelativeTime(editingProduct.createdAt)})
                    </span>
                  )}
                </div>
                <h1 className="mt-1 font-display text-xl sm:text-2xl font-bold text-foreground">
                  {editingProduct
                    ? `Editing: ${formData.name || editingProduct.name}`
                    : "Add New Product to Catalog"}
                </h1>
                <p className="text-xs text-muted-foreground">
                  Full-page dedicated editor. Fill in specifications, images up to 10 MB, and pricing.
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2.5 self-end sm:self-auto">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setCurrentView("catalog");
                  setEditingProduct(null);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => handleSubmitProduct()}
                disabled={isSubmitting}
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>{editingProduct ? "Save Changes" : "Publish to Catalog"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {formError && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-xs text-destructive flex items-center gap-2.5 shadow-sm">
            <AlertCircle className="size-5 shrink-0" />
            <span className="font-semibold">{formError}</span>
          </div>
        )}

        {/* Responsive 2-Column Full Width Grid */}
        <form onSubmit={handleSubmitProduct} className="grid gap-6 lg:grid-cols-12">
          {/* LEFT COLUMN: Main Product Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Basic Information Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Package className="size-4 text-primary" />
                  <span>General Information</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Specify the product title, category segmentation, and SKU code.
                </p>
              </div>

              <div className="space-y-4">
                {/* Product Name */}
                <div>
                  <label className="text-xs font-bold text-foreground">
                    Product Name / Title <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50kg ABC Stored Pressure Fire Extinguisher (IS 15683)"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-input bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                  />
                </div>

                {/* Category & SKU in 2 columns */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-foreground">
                        Category <span className="text-destructive">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        + Manage Categories
                      </button>
                    </div>
                    {categoryNames.length === 0 ? (
                      <input
                        type="text"
                        required
                        placeholder="Enter category name"
                        value={formData.category || ""}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    ) : (
                      <select
                        required
                        value={formData.category || ""}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      >
                        <option value="">Select a category</option>
                        {categoryNames.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground">
                      SKU / Model Number
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SUE-FE-ABC50"
                      value={formData.sku || ""}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs font-mono text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>

                {/* Price, Pricing Unit, and Min Order Qty in 3 columns */}
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="text-xs font-bold text-foreground">Price in ₹ (INR)</label>
                    <div className="relative mt-1.5">
                      <input
                        type="text"
                        placeholder="e.g. 18,500 (or leave empty)"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full rounded-xl border border-input bg-background pl-8 pr-3.5 py-2.5 text-xs font-semibold text-foreground focus:border-primary focus:outline-none"
                      />
                      <IndianRupee className="absolute left-2.5 top-3 size-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-1 block">
                      Empty = Quote on Request
                    </span>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground">Pricing Unit</label>
                    <select
                      value={formData.unit || "per piece"}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    >
                      {PRICING_UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-foreground">Minimum Order Qty</label>
                    <input
                      type="text"
                      placeholder="1"
                      value={formData.minOrderQty || "1"}
                      onChange={(e) => setFormData({ ...formData, minOrderQty: e.target.value })}
                      className="mt-1.5 w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Product Description Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="border-b border-border pb-3">
                <h3 className="font-display text-base font-bold text-foreground">
                  Product Description & Technical Narrative <span className="text-destructive">*</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Detailed product description, industrial compliance, certifications, and target applications.
                </p>
              </div>

              <textarea
                required
                rows={5}
                placeholder="Comprehensive description of product specifications, fire ratings (Class A, B, C), BIS/PESO certifications, operating temperatures, and installation requirements..."
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full rounded-xl border border-input bg-background p-4 text-xs text-foreground leading-relaxed focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
              />
            </div>

            {/* 3. Technical Specifications & Compliance Tags Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="border-b border-border pb-3">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-success" />
                  <span>Technical Specifications & Compliance Tags</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Press enter or click "Add Tag" to add bullet points and compliance certifications.
                </p>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. BIS / IS 15683 Certified or Hydro-Tested to 35 bar"
                  value={currentSpec}
                  onChange={(e) => setCurrentSpec(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSpec();
                    }
                  }}
                  className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddSpec} className="px-4">
                  <Plus className="size-3.5" />
                  <span>Add Tag</span>
                </Button>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {(formData.specs || []).length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">
                    No specifications added yet. Add key ratings (e.g. "IS:15683 Certified", "Discharge Range 6m").
                  </span>
                ) : (
                  formData.specs?.map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-secondary/80 px-3 py-1 text-xs font-medium text-foreground shadow-xs"
                    >
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3.5" />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 4. Refill / Maintenance AMC Alert Cycle */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="border-b border-border pb-3">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <Clock className="size-4 text-accent" />
                  <span>Refill & Maintenance Renewal Cycle (AMC Alert)</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Configures automated inspection and refill reminder alerts for customer orders.
                </p>
              </div>

              <select
                value={formData.renewalMonths ?? ""}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    renewalMonths: val ? (Number(val) as 3 | 6 | 9 | 12) : undefined,
                  });
                }}
                className="w-full rounded-xl border border-input bg-background px-4 py-2.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">No reminder (One-time equipment or consumable)</option>
                <option value="3">Every 3 Months (Quarterly inspection alert)</option>
                <option value="6">Every 6 Months (Semi-annual recharge & check)</option>
                <option value="9">Every 9 Months (Periodic maintenance schedule)</option>
                <option value="12">Every 12 Months (Annual hydro-test & certificate renewal)</option>
              </select>
            </div>
          </div>

          {/* RIGHT COLUMN: Media, Live Card Preview & Settings (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Product Image & Media Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                  <ImageIcon className="size-4 text-primary" />
                  <span>Product Image & Media</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Upload photos up to <strong>{MAX_IMAGE_SIZE_MB} MB</strong> or paste any image URL.
                </p>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-muted/50 p-1 text-xs">
                <button
                  type="button"
                  onClick={() => setImageMode("upload")}
                  className={`rounded-lg py-1.5 font-bold transition-all ${
                    imageMode === "upload"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("url")}
                  className={`rounded-lg py-1.5 font-bold transition-all ${
                    imageMode === "url"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Image URL
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode("presets")}
                  className={`rounded-lg py-1.5 font-bold transition-all ${
                    imageMode === "presets"
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Presets
                </button>
              </div>

              {/* Live Preview Display */}
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border bg-muted/60 shadow-xs flex items-center justify-center">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Product preview"
                    className="size-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = extinguisherImg;
                    }}
                  />
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="mx-auto size-8 text-muted-foreground/40" />
                    <span className="text-xs text-muted-foreground mt-1 block">No image selected</span>
                  </div>
                )}
                {isUploadingImage && (
                  <div className="absolute inset-0 bg-background/85 backdrop-blur-xs flex flex-col items-center justify-center gap-1.5 text-xs font-bold text-primary">
                    <RefreshCw className="size-5 animate-spin" />
                    <span>Compressing image...</span>
                  </div>
                )}
              </div>

              {/* Mode Controls */}
              {imageMode === "upload" && (
                <div className="space-y-2">
                  <label className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border hover:border-primary/60 bg-muted/20 hover:bg-muted/40 p-5 cursor-pointer transition-all">
                    <Upload className="size-6 text-primary" />
                    <div className="text-center">
                      <span className="text-xs font-bold text-foreground block">
                        {isUploadingImage ? "Processing..." : "Select File or Drag & Drop"}
                      </span>
                      <span className="text-[11px] text-muted-foreground mt-1 block">
                        Accepts JPG, PNG, WebP up to <strong>{MAX_IMAGE_SIZE_MB} MB</strong>. Auto-compressed
                        to ~50–150 KB for blazing fast loads.
                      </span>
                    </div>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploadingImage}
                    />
                  </label>

                  {uploadStats && (
                    <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 p-2.5 text-xs text-emerald-800 dark:text-emerald-300">
                      <div className="flex items-center gap-2 truncate">
                        <Check className="size-4 text-emerald-600 shrink-0" />
                        <span className="font-semibold truncate">{uploadStats.name}</span>
                      </div>
                      <span className="shrink-0 text-[11px] font-mono ml-2">
                        {uploadStats.originalKB} KB →{" "}
                        <strong className="text-emerald-600 dark:text-emerald-400">
                          {uploadStats.compressedKB} KB
                        </strong>
                      </span>
                    </div>
                  )}
                </div>
              )}

              {imageMode === "url" && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      inputMode="url"
                      placeholder="https://images.unsplash.com/... or cloud storage URL"
                      value={urlInput}
                      onChange={(e) => handleUrlApply(e.target.value)}
                      className="flex-1 rounded-xl border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                    {urlInput && (
                      <button
                        type="button"
                        onClick={() => handleUrlApply("")}
                        className="rounded-xl border border-border px-3 text-xs text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Direct public links from CDNs, Unsplash, suppliers, or Cloud Storage.
                  </p>
                </div>
              )}

              {imageMode === "presets" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_IMAGES.map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, image: preset.src }));
                          setUploadStats(null);
                        }}
                        className={`group relative aspect-square rounded-xl overflow-hidden border p-1 transition-all ${
                          formData.image === preset.src
                            ? "border-primary ring-2 ring-primary/40 bg-primary/10"
                            : "border-border hover:border-muted-foreground/50 bg-muted/40"
                        }`}
                        title={preset.name}
                      >
                        <img
                          src={preset.src}
                          alt={preset.name}
                          className="size-full object-cover rounded-lg"
                        />
                        <span className="absolute inset-x-0 bottom-0 bg-black/70 py-0.5 text-[9px] text-white text-center truncate">
                          {preset.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Select from official Sri Udharchi catalog equipment photographs.
                  </p>
                </div>
              )}
            </div>

            {/* 2. Inventory & Visibility Card */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="border-b border-border pb-3">
                <h3 className="font-display text-base font-bold text-foreground">
                  Inventory & Storefront Visibility
                </h3>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Stock Availability</span>
                    <span className="text-[11px] text-muted-foreground">
                      {formData.inStock ?? true ? "Currently Available for Instant Order" : "Marked Out of Stock"}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.inStock ?? true}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="size-5 rounded border-input text-primary focus:ring-primary"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                  <div>
                    <span className="text-xs font-bold text-foreground block flex items-center gap-1.5">
                      <Star className="size-3.5 text-accent fill-accent" />
                      <span>Featured Product</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      Show in homepage spotlight carousel
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="size-5 rounded border-input text-primary focus:ring-primary"
                  />
                </label>
              </div>
            </div>

            {/* 3. Live Customer Storefront Card Preview */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3">
              <div className="border-b border-border pb-2 flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Eye className="size-3.5 text-primary" />
                  <span>Live Storefront Preview</span>
                </h4>
                <span className="text-[10px] text-success font-semibold">Real-time render</span>
              </div>

              <div className="rounded-xl border border-border bg-background p-3 shadow-xs space-y-2.5">
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <img
                    src={formData.image || extinguisherImg}
                    alt="Preview"
                    className="size-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded bg-background/90 px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {formData.category || "Fire Safety"}
                  </span>
                  {formData.featured && (
                    <span className="absolute right-2 top-2 rounded bg-accent px-1.5 py-0.5 text-[9px] font-bold text-accent-foreground flex items-center gap-0.5">
                      <Star className="size-2.5 fill-current" /> Featured
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="font-display text-xs font-bold text-foreground line-clamp-1">
                    {formData.name || "Product Name Display"}
                  </h4>
                  {formData.sku && (
                    <span className="font-mono text-[10px] text-muted-foreground">SKU: {formData.sku}</span>
                  )}
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2">
                    {formData.description || "Product description preview will appear here."}
                  </p>
                </div>

                <div className="flex items-baseline justify-between border-t border-border pt-2 text-xs">
                  <span className="font-display font-black text-primary text-sm">
                    {formData.price
                      ? formData.price.startsWith("₹")
                        ? formData.price
                        : `₹${formData.price}`
                      : "Quote on Request"}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {formData.unit ? `/ ${formData.unit}` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* 4. Action Buttons */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-2.5">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90 py-3 shadow-md text-sm font-bold"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    <span>Saving to Firestore...</span>
                  </>
                ) : (
                  <>
                    <Check className="size-4" />
                    <span>{editingProduct ? "Save Changes" : "Publish to Catalog"}</span>
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setCurrentView("catalog");
                  setEditingProduct(null);
                }}
                className="w-full text-xs"
              >
                Discard & Return
              </Button>
            </div>
          </div>
        </form>

        {/* CATEGORIES MANAGEMENT MODAL (Inside editor as well) */}
        {isCategoryModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <h3 className="font-display text-base font-bold text-foreground">Product Categories</h3>
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="mt-4 space-y-3">
                {categoryError && (
                  <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0" />
                    <span>{categoryError}</span>
                  </div>
                )}

                <div className="grid gap-2 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    placeholder="Category Name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Short Description"
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="flex justify-end">
                  <Button type="submit" size="sm">
                    <Plus className="size-3.5" />
                    <span>Add Category</span>
                  </Button>
                </div>
              </form>

              <div className="mt-4 max-h-60 overflow-y-auto space-y-2 border-t border-border pt-4">
                <span className="text-[11px] font-bold uppercase text-muted-foreground">
                  Existing Categories
                </span>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-2.5 text-xs"
                  >
                    <span className="font-semibold text-foreground">{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // VIEW: MAIN PRODUCTS CATALOG LIST & RECENTLY ADDED DASHBOARD
  // =========================================================================
  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Total Products
            </span>
            <Package className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-foreground">{stats.total}</span>
            <span className="text-xs text-muted-foreground">items in Firestore</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              In Stock
            </span>
            <Check className="size-4 text-success" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-success">{stats.inStock}</span>
            <span className="text-xs text-muted-foreground">available for order</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Featured
            </span>
            <Star className="size-4 text-accent" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-accent">{stats.featured}</span>
            <span className="text-xs text-muted-foreground">highlighted on homepage</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </span>
            <Layers className="size-4 text-info" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-info">
              {stats.totalCategories}
            </span>
            <span className="text-xs text-muted-foreground">product segments</span>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION: RECENTLY ADDED PRODUCTS SHELF (WHAT & WHEN ADDED)           */}
      {/* =================================================================== */}
      {recentlyAddedProducts.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3.5">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                <Clock className="size-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-bold text-foreground flex items-center gap-1.5">
                  <span>Recently Added Products</span>
                  <span className="rounded-full bg-primary/15 px-2 py-0.2 text-[10px] font-bold text-primary">
                    Live Feed
                  </span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Latest products added to your catalog with exact creation timestamps.
                </p>
              </div>
            </div>

            <Button
              size="sm"
              onClick={openCreateEditor}
              className="gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs shadow-xs self-start sm:self-auto"
            >
              <Plus className="size-3.5" />
              <span>Add Another Product</span>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {recentlyAddedProducts.map((prod) => (
              <div
                key={prod.id || prod.name}
                className="group relative flex flex-col rounded-xl border border-border bg-background/60 p-3 hover:border-primary/50 hover:bg-background transition-all shadow-2xs"
              >
                <div className="flex items-start gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = extinguisherImg;
                      }}
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] font-semibold text-white text-center py-0.5 truncate">
                      {prod.category}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-xs text-foreground truncate group-hover:text-primary transition-colors">
                      {prod.name}
                    </h4>
                    <span className="block font-display font-bold text-xs text-primary mt-0.5">
                      {prod.price
                        ? prod.price.startsWith("₹")
                          ? prod.price
                          : `₹${prod.price}`
                        : "Quote on Request"}
                    </span>

                    {/* Prominent Timestamp Badge */}
                    <div className="mt-1.5 flex items-center gap-1 rounded bg-muted/70 px-1.5 py-0.5 text-[10px] text-muted-foreground w-fit">
                      <Clock className="size-3 text-primary shrink-0" />
                      <span className="font-semibold text-foreground">
                        {formatRelativeTime(prod.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="truncate" title={formatExactDateTime(prod.createdAt)}>
                    {formatExactDateTime(prod.createdAt)}
                  </span>
                  <button
                    type="button"
                    onClick={() => openEditEditor(prod)}
                    className="font-semibold text-primary hover:underline flex items-center gap-1"
                  >
                    <Edit2 className="size-2.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Action Bar */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">
              Products & Pricing Catalog
            </h2>
            <p className="text-xs text-muted-foreground">
              Manage product listings, pricing in INR, specifications, and category assignments
              stored in Firestore.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsCategoryModalOpen(true)}>
              <Tag className="size-3.5" />
              <span>Categories</span>
            </Button>

            <Button size="sm" onClick={openCreateEditor} className="gap-1.5">
              <Plus className="size-4" />
              <span>Add Product</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid gap-3 pt-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12">
          {/* Search */}
          <div className="relative sm:col-span-2 md:col-span-2 lg:col-span-3">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, SKU, or specs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-input bg-background pl-9 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="All">All Categories ({products.length})</option>
              {categoryNames.map((cat) => (
                <option key={cat} value={cat}>
                  {cat} ({products.filter((p) => p.category === cat).length})
                </option>
              ))}
            </select>
          </div>

          {/* Stock Filter */}
          <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) =>
                setStockFilter(e.target.value as "all" | "inStock" | "outOfStock" | "featured")
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="inStock">In Stock Only</option>
              <option value="outOfStock">Out of Stock</option>
              <option value="featured">Featured Only</option>
            </select>
          </div>

          {/* Date Filter: All vs Recently Added (7/30 days) */}
          <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as "all" | "7days" | "30days")}
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="all">All Dates</option>
              <option value="7days">Added in Last 7 Days</option>
              <option value="30days">Added in Last 30 Days</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "newest" | "oldest" | "name" | "price-asc" | "price-desc",
                )
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="newest">Sort: Recently Added</option>
              <option value="oldest">Sort: Oldest Added</option>
              <option value="name">Sort: Name (A-Z)</option>
              <option value="price-asc">Sort: Price (Low to High)</option>
              <option value="price-desc">Sort: Price (High to Low)</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center justify-end gap-1 sm:col-span-1 md:col-span-1 lg:col-span-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`rounded p-1.5 transition-colors ${
                viewMode === "table"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              title="Table View"
            >
              <List className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`rounded p-1.5 transition-colors ${
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              }`}
              title="Grid View"
            >
              <Grid className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Package className="size-12 text-muted-foreground" />
          <h3 className="mt-4 font-display text-base font-bold text-foreground">
            No Products Found
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-sm">
            {searchTerm || selectedCategory !== "All" || dateFilter !== "all"
              ? "No products match your active search filters. Try resetting the filters."
              : "Your Firestore products collection is currently empty."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {searchTerm || selectedCategory !== "All" || dateFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setStockFilter("all");
                  setDateFilter("all");
                }}
              >
                Clear Filters
              </Button>
            ) : null}
            <Button size="sm" onClick={openCreateEditor}>
              <Plus className="size-3.5" />
              <span>Add Product</span>
            </Button>
            {products.length === 0 && (
              <Button
                size="sm"
                variant="outline"
                disabled={isSeeding}
                onClick={handleSeedCatalog}
                className="gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
              >
                <RefreshCw className={`size-3.5 ${isSeeding ? "animate-spin" : ""}`} />
                <span>
                  {isSeeding
                    ? "Syncing Official Catalog..."
                    : "Initialize Official Sri Udharchi Catalog (9 Certified Items)"}
                </span>
              </Button>
            )}
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW WITH DATE ADDED COLUMN */
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/60 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="py-3 pl-4 pr-3">Product</th>
                  <th className="px-3 py-3">Category</th>
                  <th className="px-3 py-3">SKU</th>
                  <th className="px-3 py-3">Pricing (INR)</th>
                  <th className="px-3 py-3 text-center">Stock</th>
                  <th className="px-3 py-3 text-center">Featured</th>
                  <th className="px-3 py-3">Date Added</th>
                  <th className="py-3 pl-3 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id || prod.name} className="transition-colors hover:bg-muted/40">
                    {/* Product Name & Image */}
                    <td className="py-3 pl-4 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="size-11 shrink-0 rounded-lg object-cover border border-border"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = extinguisherImg;
                          }}
                        />
                        <div className="min-w-0 max-w-xs">
                          <strong className="block truncate font-semibold text-foreground">
                            {prod.name}
                          </strong>
                          <span className="block truncate text-[11px] text-muted-foreground">
                            {prod.description}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center rounded-md border border-border bg-secondary/50 px-2 py-0.5 text-[11px] font-semibold text-foreground">
                        {prod.category}
                      </span>
                    </td>

                    {/* SKU */}
                    <td className="px-3 py-3 whitespace-nowrap font-mono text-[11px] text-muted-foreground">
                      {prod.sku || "—"}
                    </td>

                    {/* Pricing */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      {prod.price ? (
                        <div>
                          <span className="font-display font-bold text-foreground text-sm">
                            {prod.price.startsWith("₹") ? prod.price : `₹${prod.price}`}
                          </span>
                          {prod.unit && (
                            <span className="block text-[10px] text-muted-foreground">
                              {prod.unit}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                          Quote on Request
                        </span>
                      )}
                    </td>

                    {/* Stock status toggle */}
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(prod)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-all ${
                          prod.inStock !== false
                            ? "border border-success/30 bg-success/15 text-success hover:bg-success/25"
                            : "border border-destructive/30 bg-destructive/15 text-destructive hover:bg-destructive/25"
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            prod.inStock !== false ? "bg-success" : "bg-destructive"
                          }`}
                        />
                        <span>{prod.inStock !== false ? "In Stock" : "Out of Stock"}</span>
                      </button>
                    </td>

                    {/* Featured toggle */}
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(prod)}
                        className={`inline-flex size-7 items-center justify-center rounded-md transition-colors ${
                          prod.featured
                            ? "bg-accent/20 text-accent hover:bg-accent/30"
                            : "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted"
                        }`}
                        title={
                          prod.featured ? "Featured on Home (Click to toggle)" : "Not featured"
                        }
                      >
                        <Star className={`size-4 ${prod.featured ? "fill-current" : ""}`} />
                      </button>
                    </td>

                    {/* Date Added (What was added & When it was added) */}
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground text-[11px] flex items-center gap-1">
                          <Clock className="size-3 text-primary shrink-0" />
                          {formatRelativeTime(prod.createdAt)}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatExactDateTime(prod.createdAt)}
                        </span>
                        {prod.updatedAt && prod.updatedAt !== prod.createdAt && (
                          <span className="text-[9px] text-muted-foreground/75 italic">
                            Edited {formatRelativeTime(prod.updatedAt)}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/products/${prod.id || prod.sku}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                          title="View Live Product Page"
                        >
                          <ExternalLink className="size-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => setPreviewProduct(prod)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Quick Preview"
                        >
                          <Eye className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditEditor(prod)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                          title="Edit Product (Opens dedicated editor)"
                        >
                          <Edit2 className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsDeleting(prod)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          title="Delete Product"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW WITH DATE ADDED BADGE */
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((prod) => (
            <div
              key={prod.id || prod.name}
              className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = extinguisherImg;
                  }}
                />
                <span className="absolute left-2.5 top-2.5 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-bold text-foreground backdrop-blur">
                  {prod.category}
                </span>

                <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleToggleFeatured(prod)}
                    className={`rounded-md p-1.5 backdrop-blur transition-colors ${
                      prod.featured
                        ? "bg-accent text-accent-foreground"
                        : "bg-background/80 text-muted-foreground"
                    }`}
                  >
                    <Star className={`size-3.5 ${prod.featured ? "fill-current" : ""}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleStock(prod)}
                    className={`rounded-md px-2 py-1 text-[10px] font-bold backdrop-blur ${
                      prod.inStock !== false
                        ? "bg-success/90 text-success-foreground"
                        : "bg-destructive/90 text-destructive-foreground"
                    }`}
                  >
                    {prod.inStock !== false ? "In Stock" : "Out of Stock"}
                  </button>
                </div>

                {/* Date Added pill */}
                <div className="absolute bottom-2 left-2 rounded bg-black/75 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur flex items-center gap-1">
                  <Clock className="size-2.5 text-primary" />
                  <span>Added {formatRelativeTime(prod.createdAt)}</span>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display font-bold text-foreground text-sm leading-snug line-clamp-1">
                    {prod.name}
                  </h3>
                  {prod.sku && (
                    <span className="font-mono text-[10px] text-muted-foreground">{prod.sku}</span>
                  )}
                </div>

                <p className="mt-1.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>

                {/* Pricing Banner */}
                <div className="mt-3 flex items-baseline justify-between border-t border-border pt-3">
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                      Price
                    </span>
                    <div className="flex items-baseline gap-1 text-primary">
                      <span className="font-display font-black text-base">
                        {prod.price
                          ? prod.price.startsWith("₹")
                            ? prod.price
                            : `₹${prod.price}`
                          : "Custom Quote"}
                      </span>
                      {prod.price && prod.unit && (
                        <span className="text-[10px] text-muted-foreground">/ {prod.unit}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <a
                      href={`/products/${prod.id || prod.sku}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-primary"
                      title="View Live Product Page"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => openEditEditor(prod)}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-primary"
                      title="Edit Product"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsDeleting(prod)}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-destructive hover:text-destructive"
                      title="Delete"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CATEGORIES MANAGEMENT MODAL */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <h3 className="font-display text-base font-bold text-foreground">
                  Product Categories
                </h3>
                <p className="text-xs text-muted-foreground">
                  Manage categories in your Firestore collection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Create Category Form */}
            <form onSubmit={handleCreateCategory} className="mt-4 space-y-3">
              {categoryError && (
                <div className="rounded-lg bg-destructive/10 p-2.5 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{categoryError}</span>
                </div>
              )}

              <div className="grid gap-2 sm:grid-cols-2">
                <input
                  type="text"
                  required
                  placeholder="Category Name (e.g. Foam Systems)"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
                <input
                  type="text"
                  placeholder="Short Description (Optional)"
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  className="rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  <Plus className="size-3.5" />
                  <span>Add Category</span>
                </Button>
              </div>
            </form>

            {/* Existing Categories List */}
            <div className="mt-4 max-h-60 overflow-y-auto space-y-2 border-t border-border pt-4">
              <span className="text-[11px] font-bold uppercase text-muted-foreground">
                Existing Categories
              </span>
              {categories.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  No categories added yet. Create one using the form above.
                </div>
              ) : (
                categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-2.5 text-xs"
                  >
                    <div>
                      <strong className="text-foreground">{cat.name}</strong>
                      {cat.description && (
                        <span className="block text-[11px] text-muted-foreground">
                          {cat.description}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      title="Delete Category"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-destructive/30 bg-card p-6 shadow-2xl">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <h3 className="mt-3 text-center font-display text-base font-bold text-foreground">
              Delete Product?
            </h3>
            <p className="mt-1 text-center text-xs text-muted-foreground">
              Are you sure you want to permanently delete{" "}
              <strong className="text-foreground">"{isDeleting.name}"</strong> from your Firestore
              catalog?
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsDeleting(null)}>
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
                <Trash2 className="size-3.5" />
                <span>Delete Product</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK PREVIEW MODAL */}
      {previewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-base font-bold text-foreground">Product Preview</h3>
              <button
                type="button"
                onClick={() => setPreviewProduct(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-muted">
                <img
                  src={previewProduct.image}
                  alt={previewProduct.name}
                  className="size-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = extinguisherImg;
                  }}
                />
                <span className="absolute left-2.5 top-2.5 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-bold">
                  {previewProduct.category}
                </span>
              </div>

              <div>
                <h4 className="font-display text-base font-bold text-foreground">
                  {previewProduct.name}
                </h4>
                {previewProduct.sku && (
                  <span className="font-mono text-xs text-muted-foreground">
                    SKU: {previewProduct.sku}
                  </span>
                )}
              </div>

              <div className="flex items-baseline gap-2">
                <span className="font-display text-xl font-black text-primary">
                  {previewProduct.price
                    ? previewProduct.price.startsWith("₹")
                      ? previewProduct.price
                      : `₹${previewProduct.price}`
                    : "Quote on Request"}
                </span>
                {previewProduct.price && previewProduct.unit && (
                  <span className="text-xs text-muted-foreground">/ {previewProduct.unit}</span>
                )}
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                {previewProduct.description}
              </p>

              <div className="space-y-1">
                <span className="text-[11px] font-bold text-foreground">Specifications:</span>
                <div className="flex flex-wrap gap-1">
                  {(previewProduct.specs || []).map((s, idx) => (
                    <span
                      key={idx}
                      className="rounded bg-secondary px-2 py-0.5 text-[10px] text-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Timestamp in preview */}
              <div className="border-t border-border pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3 text-primary" />
                <span>
                  Added on {formatExactDateTime(previewProduct.createdAt)} (
                  {formatRelativeTime(previewProduct.createdAt)})
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-2">
              <a
                href={`/products/${previewProduct.id || previewProduct.sku}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
              >
                <ExternalLink className="size-3.5" />
                <span>View Live Product Page</span>
              </a>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const p = previewProduct;
                  setPreviewProduct(null);
                  openEditEditor(p);
                }}
              >
                <Edit2 className="size-3.5" />
                <span>Edit This Product</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
