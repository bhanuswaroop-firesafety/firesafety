import { useState, useMemo, type ChangeEvent, type FormEvent } from "react";
import {
  addProduct,
  updateProduct,
  deleteProduct,
  seedDefaultProducts,
  addCategory,
  deleteCategory,
} from "@/lib/db-service";
import type { ProductItem, CategoryItem } from "@/lib/types";
import { Button } from "@/components/button";
import {
  AlertCircle,
  Check,
  ChevronDown,
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
  // Filters & State
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock" | "featured">(
    "all",
  );
  const [sortBy, setSortBy] = useState<"name" | "price-asc" | "price-desc" | "newest">("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  // Product Modals
  const [isModalOpen, setIsModalOpen] = useState(initialCreateOpen);
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
    category: categories[0]?.name || "Fire Safety",
    price: "",
    unit: "per piece",
    sku: "",
    minOrderQty: "1",
    description: "",
    specs: [],
    image: extinguisherImg,
    inStock: true,
    featured: false,
  });

  const [currentSpec, setCurrentSpec] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Escape key handler for dismissing open modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isDeleting) setIsDeleting(null);
        else if (previewProduct) setPreviewProduct(null);
        else if (isCategoryModalOpen) setIsCategoryModalOpen(false);
        else if (isModalOpen) setIsModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDeleting, previewProduct, isCategoryModalOpen, isModalOpen]);

  // Available category names
  const categoryNames = useMemo(() => {
    return Array.from(new Set(categories.map((c) => c.name)));
  }, [categories]);

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

        return matchesCategory && matchesSearch && matchesStock;
      })
      .sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name);
        if (sortBy === "newest") {
          const tA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return tB - tA;
        }
        const numA = Number(a.price?.replace(/[^0-9.]/g, "") || 0);
        const numB = Number(b.price?.replace(/[^0-9.]/g, "") || 0);
        if (sortBy === "price-asc") return numA - numB;
        if (sortBy === "price-desc") return numB - numA;
        return 0;
      });
  }, [products, selectedCategory, searchTerm, stockFilter, sortBy]);

  // Statistics
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter((p) => p.inStock !== false).length;
    const featured = products.filter((p) => p.featured).length;
    const totalCategories = categoryNames.length;
    return { total, inStock, featured, totalCategories };
  }, [products, categoryNames]);

  // Open Create Modal
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormError("");
    setFormData({
      name: "",
      category: categories[0]?.name || "Fire Safety",
      price: "",
      unit: "per piece",
      sku: `SUE-${Math.floor(1000 + Math.random() * 9000)}`,
      minOrderQty: "1",
      description: "",
      specs: ["IS / BIS Certified", "High Industrial Grade"],
      image: extinguisherImg,
      inStock: true,
      featured: false,
    });
    setCurrentSpec("");
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const openEditModal = (product: ProductItem) => {
    setEditingProduct(product);
    setFormError("");
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
    });
    setCurrentSpec("");
    setIsModalOpen(true);
  };

  // Handle Form Image File Upload
  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Please upload a valid image file (PNG, JPG, WebP).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string") {
        setFormData((prev) => ({ ...prev, image: event.target?.result as string }));
      }
    };
    reader.readAsDataURL(file);
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
  const handleSubmitProduct = async (e: FormEvent) => {
    e.preventDefault();
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
      };

      if (editingProduct?.id) {
        await updateProduct(editingProduct.id, payload);
        onNotify(`Updated product "${payload.name}" in Firestore.`);
      } else {
        await addProduct(payload);
        onNotify(`Added new product "${payload.name}" to Firestore.`);
      }
      setIsModalOpen(false);
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

  // Seed default products
  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      const count = await seedDefaultProducts();
      onNotify(`Seeded ${count} industrial products with pricing into Firestore.`);
    } catch (err: unknown) {
      onNotify("Error seeding products: " + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsSeeding(false);
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
            <Sparkles className="size-4 text-accent" />
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

            <Button
              variant="outline"
              size="sm"
              disabled={isSeeding}
              onClick={handleSeed}
              title="Populate default industrial equipment catalog into Firestore"
            >
              <RefreshCw className={`size-3.5 ${isSeeding ? "animate-spin" : ""}`} />
              <span>Seed Catalog</span>
            </Button>

            <Button size="sm" onClick={openCreateModal}>
              <Plus className="size-4" />
              <span>Add Product</span>
            </Button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid gap-3 pt-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12">
          {/* Search */}
          <div className="relative sm:col-span-2 md:col-span-2 lg:col-span-4">
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
          <div className="sm:col-span-1 md:col-span-1 lg:col-span-3">
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

          {/* Sort By */}
          <div className="sm:col-span-1 md:col-span-1 lg:col-span-2">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "name" | "price-asc" | "price-desc" | "newest")
              }
              className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="newest">Sort: Newest Added</option>
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
            {searchTerm || selectedCategory !== "All"
              ? "No products match your active search filters. Try resetting the filters."
              : "Your Firestore products collection is currently empty."}
          </p>
          <div className="mt-6 flex gap-3">
            {searchTerm || selectedCategory !== "All" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("All");
                  setStockFilter("all");
                }}
              >
                Clear Filters
              </Button>
            ) : (
              <Button size="sm" onClick={handleSeed}>
                <RefreshCw className="size-3.5" />
                <span>Seed Default Industrial Products</span>
              </Button>
            )}
            <Button size="sm" onClick={openCreateModal}>
              <Plus className="size-3.5" />
              <span>Add First Product</span>
            </Button>
          </div>
        </div>
      ) : viewMode === "table" ? (
        /* TABLE VIEW */
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

                    {/* Action buttons */}
                    <td className="py-3 pl-3 pr-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setPreviewProduct(prod)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                          title="Preview Product"
                        >
                          <Eye className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(prod)}
                          className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-primary"
                          title="Edit Product"
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
        /* GRID VIEW */
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
                    <button
                      type="button"
                      onClick={() => openEditModal(prod)}
                      className="rounded-lg border border-border p-1.5 text-muted-foreground hover:border-primary hover:text-primary"
                      title="Edit"
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

      {/* CREATE / EDIT PRODUCT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="my-8 w-full max-w-2xl rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-border pb-4">
              <div>
                <h3 className="font-display text-lg font-bold text-foreground">
                  {editingProduct ? "Edit Product Details" : "Upload New Product"}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {editingProduct
                    ? `Update Firestore document for "${editingProduct.name}"`
                    : "Fill in product specifications, category, and pricing details."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitProduct} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive flex items-center gap-2">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Product Name */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-foreground">Product Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 50kg ABC Stored Pressure Fire Extinguisher"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground">Category *</label>
                    <button
                      type="button"
                      onClick={() => setIsCategoryModalOpen(true)}
                      className="text-[11px] text-primary hover:underline"
                    >
                      + Add Category
                    </button>
                  </div>
                  <select
                    required
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    {categoryNames.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SKU */}
                <div>
                  <label className="text-xs font-semibold text-foreground">
                    SKU / Model Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SUE-FE-ABC50"
                    value={formData.sku || ""}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                </div>

                {/* Price (INR) */}
                <div>
                  <label className="text-xs font-semibold text-foreground">Price in ₹ (INR)</label>
                  <div className="relative mt-1">
                    <input
                      type="text"
                      placeholder="e.g. 18,500 (or leave empty for Quote on Request)"
                      value={formData.price || ""}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full rounded-lg border border-input bg-background pl-8 pr-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                    />
                    <IndianRupee className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
                  </div>
                </div>

                {/* Pricing Unit */}
                <div>
                  <label className="text-xs font-semibold text-foreground">Pricing Unit</label>
                  <select
                    value={formData.unit || "per piece"}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
                  >
                    {PRICING_UNITS.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Selection / Upload */}
              <div className="space-y-2 border-t border-border pt-4">
                <label className="text-xs font-semibold text-foreground">Product Image</label>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted">
                    <img
                      src={formData.image}
                      alt="Product preview"
                      className="size-full object-cover"
                    />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex flex-wrap gap-2">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted">
                        <Upload className="size-3.5" />
                        <span>Upload File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </label>

                      <input
                        type="url"
                        placeholder="Or enter image URL..."
                        value={formData.image?.startsWith("data:") ? "" : formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                      />
                    </div>

                    {/* Presets quick picker */}
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                      <span className="text-[10px] text-muted-foreground shrink-0">Presets:</span>
                      {PRESET_IMAGES.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, image: preset.src })}
                          className={`size-7 shrink-0 rounded overflow-hidden border ${
                            formData.image === preset.src
                              ? "border-primary ring-2 ring-primary/40"
                              : "border-border"
                          }`}
                          title={preset.name}
                        >
                          <img
                            src={preset.src}
                            alt={preset.name}
                            className="size-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="border-t border-border pt-3">
                <label className="text-xs font-semibold text-foreground">Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Comprehensive description of product specifications, certifications, and industrial applications..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-input bg-background p-3 text-xs text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Technical Specifications */}
              <div className="border-t border-border pt-3">
                <label className="text-xs font-semibold text-foreground">
                  Technical Specifications & Compliance Tags
                </label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. BIS / IS 15683 Certified"
                    value={currentSpec}
                    onChange={(e) => setCurrentSpec(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddSpec();
                      }
                    }}
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleAddSpec}>
                    <Plus className="size-3.5" />
                    <span>Add Tag</span>
                  </Button>
                </div>

                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(formData.specs || []).map((spec, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-[11px] text-foreground"
                    >
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="size-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Flags: In Stock & Featured */}
              <div className="flex flex-wrap items-center gap-6 border-t border-border pt-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.inStock ?? true}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="size-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-semibold text-foreground">In Stock</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured ?? false}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="size-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Featured on Homepage
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <RefreshCw className="size-3.5 animate-spin" />
                  ) : (
                    <span>{editingProduct ? "Save Changes" : "Create Product"}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
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
              {categories.map((cat) => (
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
                  {cat.id.startsWith("cat_") ? (
                    <span className="rounded bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                      Default
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id, cat.name)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
                      title="Delete Category"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
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
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const p = previewProduct;
                  setPreviewProduct(null);
                  openEditModal(p);
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
