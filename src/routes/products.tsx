import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import {
  ArrowRight,
  Check,
  Eye,
  Phone,
  Search,
  ShieldCheck,
  X,
  Package,
  ShoppingBag,
  Zap,
  ShoppingCart,
  SlidersHorizontal,
  Layers,
  Filter,
  Info,
} from "lucide-react";
import { subscribeProducts, getCachedProducts, CATEGORIES } from "@/lib/db-service";
import type { ProductItem } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { AuthRequiredModal } from "@/components/auth-required-modal";
import { seoHead, schemas } from "@/lib/seo";
import { DEFAULT_PRODUCTS, resolveProductDisplayImage, getProductFallbackImage } from "@/lib/catalog-data";
import extinguisherImg from "@/assets/fire-extinguisher.jpg";

export const Route = createFileRoute("/products")({
  head: () =>
    seoHead({
      title:
        "Fire Safety Products & Equipment | Buy Certified Safety Gear - Sri Udharchi Enterprises",
      description:
        "Buy ISI/BIS certified fire safety products and industrial safety gear online. Explore ABC & CO2 fire extinguishers, fire hydrant systems, diesel fire pumps, PPE kits, CCTV, and emergency safety products at Sri Udharchi Enterprises.",
      path: "/products",
      keywords: [
        "fire safety products",
        "fire safety product",
        "buy fire safety equipment",
        "fire extinguishers online",
        "industrial safety products",
        "fire hydrant system equipment",
        "fire fighting equipment suppliers",
        "ISI certified safety gear",
        "fire protection systems",
        "safety helmet safety shoes PPE",
        "Andhra Pradesh fire safety supplier",
        "Sri Udharchi Enterprises",
      ],
      jsonLd: [
        schemas.breadcrumbs([
          { name: "Home", path: "/" },
          { name: "Fire Safety Products", path: "/products" },
        ]),
      ],
    }),
  component: ProductsPage,
});

export function ProductsPage() {
  const { user } = useAuth();
  const { addToCart, totalItems, totalAmount, setIsCartOpen } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [productsList, setProductsList] = useState<ProductItem[]>(() => {
    const cached = getCachedProducts();
    return cached.length > 0 ? cached : DEFAULT_PRODUCTS;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileCategoryOpen, setIsMobileCategoryOpen] = useState(false);
  const [authPromptProduct, setAuthPromptProduct] = useState<{
    name: string;
    url: string;
  } | null>(null);

  // Sync with URL (?category=, ?q=, ?search=)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCat = params.get("category");
      const urlQ = params.get("q") || params.get("search");
      if (urlCat) {
        setSelectedCategory(urlCat);
      }
      if (urlQ) {
        setSearchQuery(urlQ);
      }
    }
  }, []);

  // Synchronize URL parameters with live search and category state
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      let changed = false;

      if (searchQuery.trim()) {
        if (url.searchParams.get("q") !== searchQuery.trim()) {
          url.searchParams.set("q", searchQuery.trim());
          url.searchParams.delete("search");
          changed = true;
        }
      } else {
        if (url.searchParams.has("q") || url.searchParams.has("search")) {
          url.searchParams.delete("q");
          url.searchParams.delete("search");
          changed = true;
        }
      }

      if (selectedCategory && selectedCategory !== "All") {
        if (url.searchParams.get("category") !== selectedCategory) {
          url.searchParams.set("category", selectedCategory);
          changed = true;
        }
      } else {
        if (url.searchParams.has("category")) {
          url.searchParams.delete("category");
          changed = true;
        }
      }

      if (changed) {
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, [searchQuery, selectedCategory]);

  const handleProductAction = (
    e: React.MouseEvent | undefined,
    prod: ProductItem,
    action: "open" | "add" | "buy",
  ) => {
    // Allow users to freely open and view product details
    if (action === "open") {
      return;
    }

    if (!user) {
      if (e) e.preventDefault();
      setAuthPromptProduct({
        name: prod.name,
        url: `/products/${prod.id || prod.sku || prod.name}`,
      });
      return;
    }

    if (action === "add") {
      addToCart(prod, 1);
    } else if (action === "buy") {
      addToCart(prod, 1);
      window.location.href = "/checkout";
    }
  };

  useEffect(() => {
    const unsub = subscribeProducts((data) => {
      setProductsList(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Active products: prioritize live Firestore collection, fallback to default certified catalog
  const activeProducts = productsList.length > 0 ? productsList : DEFAULT_PRODUCTS;

  // Compute all available categories from requested categories list + any active products
  const allCategories = useMemo(() => {
    const productCategories = Array.from(
      new Set(activeProducts.map((p) => p.category).filter(Boolean)),
    );
    const combined = Array.from(new Set([...CATEGORIES, ...productCategories]));
    return ["All", ...combined];
  }, [activeProducts]);

  // Multi-token intelligent product search matcher
  const doesProductMatchSearch = (p: ProductItem, query: string): boolean => {
    if (!query) return true;
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    if (tokens.length === 0) return true;

    const searchableFields = [
      p.name || "",
      p.category || "",
      p.description || "",
      p.sku || "",
      ...(p.specs || []),
      p.price || "",
    ];
    const combined = searchableFields.join(" ").toLowerCase();
    const cleanCombined = combined.replace(/[^a-z0-9]/g, "");

    return tokens.every((token) => {
      // 1. Direct text substring match
      if (combined.includes(token)) return true;
      // 2. Alphanumeric match (handles "4kg" vs "4 kg", "co2" vs "co-2", "9ltr" vs "9 ltr")
      const cleanToken = token.replace(/[^a-z0-9]/g, "");
      if (cleanToken && cleanCombined.includes(cleanToken)) return true;
      return false;
    });
  };

  const trimmedQuery = searchQuery.trim();

  // All matches across the catalog for current query
  const allSearchMatches = useMemo(() => {
    if (!trimmedQuery) return activeProducts;
    return activeProducts.filter((p) => doesProductMatchSearch(p, trimmedQuery));
  }, [activeProducts, trimmedQuery]);

  // Matches within the specifically selected category
  const categoryMatches = useMemo(() => {
    if (selectedCategory === "All") return allSearchMatches;
    return allSearchMatches.filter((p) => p.category === selectedCategory);
  }, [allSearchMatches, selectedCategory]);

  // Auto-expand search across categories if current category returned 0 results but other categories have matches
  const isAutoExpandedAcrossCategories = Boolean(
    trimmedQuery &&
      selectedCategory !== "All" &&
      categoryMatches.length === 0 &&
      allSearchMatches.length > 0,
  );

  // Filtered & Sorted products list to display
  const filteredProducts = useMemo(() => {
    const list = isAutoExpandedAcrossCategories ? allSearchMatches : categoryMatches;
    return [...list].sort((a, b) => {
      if (sortBy === "featured") {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      }
      if (sortBy === "name") return a.name.localeCompare(b.name);
      const numA = Number(a.price?.replace(/[^0-9.]/g, "") || 0);
      const numB = Number(b.price?.replace(/[^0-9.]/g, "") || 0);
      if (sortBy === "price-asc") return numA - numB;
      if (sortBy === "price-desc") return numB - numA;
      return 0;
    });
  }, [isAutoExpandedAcrossCategories, allSearchMatches, categoryMatches, sortBy]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* COMPACT PRODUCT-FIRST HEADER & FILTER TOOLBAR */}
      <section className="border-b border-border bg-card/80 backdrop-blur-md sticky top-[68px] sm:top-[76px] z-20 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Title & Count Badge */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span>Products Catalog</span>
                <span className="rounded-full bg-red-600/10 px-2.5 py-0.5 text-xs font-bold text-red-600 dark:text-red-400 border border-red-500/20">
                  {selectedCategory === "All" ? "All" : selectedCategory} ({filteredProducts.length})
                </span>
              </h1>

              {/* Mobile Category Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsMobileCategoryOpen(true)}
                className="lg:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors cursor-pointer border border-zinc-700"
              >
                <SlidersHorizontal className="size-3 text-red-500" />
                <span>Categories</span>
              </button>
            </div>

            {/* Search Input & Sort Selector */}
            <div className="flex items-center gap-2 flex-1 max-w-lg sm:justify-end">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  aria-label="Search fire safety products"
                  placeholder="Search products by name, SKU, or specs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setSearchQuery("");
                    }
                  }}
                  className="w-full rounded-lg border border-border bg-background pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-red-600 focus:ring-1 focus:ring-red-600 focus:outline-none shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Clear search"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "featured" | "price-asc" | "price-desc" | "name",
                  )
                }
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-red-600 focus:outline-none shrink-0"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills (Horizontal Scrollable for Mobile & Quick Bar) */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none lg:hidden">
            {allCategories.map((cat) => {
              const count =
                cat === "All"
                  ? activeProducts.length
                  : activeProducts.filter((p) => p.category === cat).length;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? "bg-red-600 text-white shadow-xs"
                      : "border border-border bg-background/80 text-muted-foreground hover:border-red-500/50 hover:text-foreground"
                  }`}
                >
                  {cat} {count > 0 && <span className="opacity-80">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT: DESKTOP SIDEBAR + PRODUCTS GRID */}
      <section className="py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ======================================================== */}
            {/* LEFT SIDEBAR: DARK CONTAINER WITH RED ACTIVE SELECTION   */}
            {/* EXACT DESIGN MATCHING THE USER'S SCREENSHOT               */}
            {/* ======================================================== */}
            <aside className="hidden lg:block lg:col-span-3 sticky top-[138px]">
              <div className="rounded-xl border border-zinc-900 bg-[#000000] p-2 shadow-2xl text-white">
                <nav className="flex flex-col space-y-0.5">
                  {/* Optional All Products entry */}
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm transition-all cursor-pointer ${
                      selectedCategory === "All"
                        ? "bg-[#D32F2F] text-white font-bold shadow-md shadow-red-950"
                        : "text-zinc-200 hover:text-white hover:bg-zinc-900/70 font-medium"
                    }`}
                  >
                    <span>All Products</span>
                    <span
                      className={`text-xs font-mono ml-2 shrink-0 ${
                        selectedCategory === "All" ? "text-white/90 font-bold" : "text-zinc-400"
                      }`}
                    >
                      {activeProducts.length}
                    </span>
                  </button>

                  {/* 11 Requested Categories from User's Screenshot */}
                  {CATEGORIES.map((cat) => {
                    const count = activeProducts.filter((p) => p.category === cat).length;
                    const isActive = selectedCategory === cat;

                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-md text-sm transition-all cursor-pointer ${
                          isActive
                            ? "bg-[#D32F2F] text-white font-bold shadow-md shadow-red-950"
                            : "text-zinc-200 hover:text-white hover:bg-zinc-900/70 font-medium"
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        <span
                          className={`text-xs font-mono ml-2 shrink-0 ${
                            isActive ? "text-white/90 font-bold" : "text-zinc-400"
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </aside>

            {/* ======================================================== */}
            {/* RIGHT COLUMN: PRODUCTS CATALOG GRID                      */}
            {/* ======================================================== */}
            <div className="lg:col-span-9">
              {/* Category Search Auto-Expansion Notice */}
              {isAutoExpandedAcrossCategories && (
                <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs text-foreground flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Info className="size-4 shrink-0 text-amber-500" />
                    <span>
                      No products match <strong>"{searchQuery}"</strong> in <em>"{selectedCategory}"</em>. Showing <strong>{allSearchMatches.length}</strong> matching products from all categories.
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("All")}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 text-white font-bold text-[11px] hover:bg-amber-600 transition-colors cursor-pointer shadow-2xs"
                    >
                      Switch to All Categories
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="px-2.5 py-1 rounded-lg border border-border bg-card text-foreground font-semibold text-[11px] hover:bg-muted transition-colors cursor-pointer"
                    >
                      Clear Search
                    </button>
                  </div>
                </div>
              )}

              {trimmedQuery && !isAutoExpandedAcrossCategories && selectedCategory !== "All" && allSearchMatches.length > categoryMatches.length && (
                <div className="mb-4 flex items-center justify-between text-xs text-muted-foreground bg-muted/40 p-2.5 px-3 rounded-xl border border-border">
                  <span>
                    Showing {categoryMatches.length} matches in <strong>"{selectedCategory}"</strong>.
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("All")}
                    className="text-red-600 dark:text-red-400 font-bold hover:underline cursor-pointer"
                  >
                    Search across all categories ({allSearchMatches.length} total) &rarr;
                  </button>
                </div>
              )}

              {isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="animate-pulse overflow-hidden rounded-xl border border-border bg-card p-3 space-y-3"
                    >
                      <div className="aspect-[4/3] rounded-lg bg-muted" />
                      <div className="h-4 w-3/4 rounded bg-muted" />
                      <div className="h-3 w-1/2 rounded bg-muted" />
                    </div>
                  ))}
                </div>
              ) : activeProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center max-w-md mx-auto my-8">
                  <Package className="mx-auto size-12 text-muted-foreground/60" />
                  <h3 className="mt-4 font-display text-base font-bold text-foreground">
                    No Products Available
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Products added through the Administrator Panel will appear here automatically.
                  </p>
                  <div className="mt-5 flex justify-center gap-3">
                    <a href="/contact">
                      <Button size="sm">Request Equipment Quote</Button>
                    </a>
                  </div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-card/60 p-8 sm:p-12 text-center my-6 max-w-lg mx-auto space-y-4">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-red-600/10 text-red-600">
                    <Search className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-foreground">
                      No matching products found
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                      We couldn't find any certified fire safety equipment matching <strong>"{searchQuery}"</strong>
                      {selectedCategory !== "All" && ` in "${selectedCategory}"`}.
                    </p>
                  </div>

                  {/* Popular quick searches */}
                  <div className="pt-2">
                    <span className="text-[11px] font-semibold text-muted-foreground block mb-2">
                      Try searching for:
                    </span>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {[
                        "ABC Extinguisher",
                        "CO2 Extinguisher",
                        "Hydrant Valve",
                        "Smoke Detector",
                        "Safety Helmet",
                        "Fire Pump",
                        "Refilling",
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => {
                            setSearchQuery(chip);
                            setSelectedCategory("All");
                          }}
                          className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-semibold text-muted-foreground hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-border flex flex-wrap justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchQuery("");
                        setSelectedCategory("All");
                      }}
                    >
                      Clear Search &amp; View All Products
                    </Button>
                    <a href="/contact">
                      <Button size="sm">
                        Request Custom Equipment Quote
                      </Button>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id || prod.name}
                      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-red-500/50 hover:shadow-lg"
                    >
                      {/* Product Image */}
                      <a
                        href={`/products/${prod.id || prod.sku || prod.name}`}
                        className="relative aspect-[4/3] overflow-hidden bg-slate-50/60 dark:bg-card/40 flex items-center justify-center p-2.5 block cursor-pointer"
                      >
                        <img
                          src={resolveProductDisplayImage(prod)}
                          alt={prod.name}
                          loading="lazy"
                          decoding="async"
                          className="size-full object-contain transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            const target = e.currentTarget;
                            target.onerror = null;
                            target.src = getProductFallbackImage(prod.category, prod.name);
                          }}
                        />

                        {/* Category Badge */}
                        <span className="absolute left-2.5 top-2.5 rounded-md bg-background/90 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-foreground border border-border/80 shadow-2xs">
                          {prod.category}
                        </span>

                        {/* Stock Badge */}
                        {prod.inStock === false ? (
                          <span className="absolute right-2.5 top-2.5 rounded-md bg-destructive/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            Out of Stock
                          </span>
                        ) : prod.featured ? (
                          <span className="absolute right-2.5 top-2.5 rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
                            Featured
                          </span>
                        ) : null}
                      </a>

                      {/* Product Content */}
                      <div className="flex flex-1 flex-col p-3 sm:p-4">
                        <div className="flex-1">
                          {prod.sku && (
                            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider block mb-1">
                              {prod.sku}
                            </span>
                          )}

                          <a
                            href={`/products/${prod.id || prod.sku || prod.name}`}
                            className="font-display text-xs sm:text-sm font-bold text-foreground hover:text-red-600 transition-colors line-clamp-2 leading-snug"
                          >
                            {prod.name}
                          </a>

                          {/* Certified Specs Highlights */}
                          {prod.specs && prod.specs.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {prod.specs.slice(0, 2).map((sp, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 rounded bg-muted/70 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                >
                                  <ShieldCheck className="size-2.5 text-red-600 shrink-0" />
                                  <span className="truncate max-w-[130px]">{sp}</span>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Price & Action Row */}
                        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                              Unit Price
                            </span>
                            <span className="font-display text-sm sm:text-base font-black text-foreground">
                              {prod.price
                                ? prod.price.startsWith("₹")
                                  ? prod.price
                                  : `₹${prod.price}`
                                : "Quote Request"}
                            </span>
                            {prod.unit && (
                              <span className="text-[10px] text-muted-foreground ml-1">
                                /{prod.unit}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            <Button
                              size="sm"
                              disabled={prod.inStock === false}
                              onClick={(e) => handleProductAction(e, prod, "add")}
                              className="h-8 px-2.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold gap-1 cursor-pointer shadow-xs"
                              title="Add to quotation basket"
                            >
                              <ShoppingCart className="size-3.5" />
                              <span className="hidden sm:inline">Add</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE CATEGORY MODAL DRAWER */}
      {isMobileCategoryOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border border-zinc-800 bg-[#0c0c0d] p-4 text-white shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="size-4 text-red-500" />
                <h3 className="font-display text-base font-bold text-white">Select Category</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileCategoryOpen(false)}
                className="rounded-lg p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="overflow-y-auto py-3 space-y-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setIsMobileCategoryOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm transition-all ${
                  selectedCategory === "All"
                    ? "bg-[#D32F2F] text-white font-bold"
                    : "text-zinc-200 hover:bg-zinc-900 font-medium"
                }`}
              >
                <span>All Products</span>
                <span className="text-xs font-mono">{activeProducts.length}</span>
              </button>

              {CATEGORIES.map((cat) => {
                const count = activeProducts.filter((p) => p.category === cat).length;
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsMobileCategoryOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-md text-sm transition-all ${
                      isActive
                        ? "bg-[#D32F2F] text-white font-bold"
                        : "text-zinc-200 hover:bg-zinc-900 font-medium"
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-xs font-mono ${
                        isActive ? "text-white font-bold" : "text-zinc-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Drawer Trigger */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-bottom-5">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 rounded-full bg-red-600 px-5 py-3 text-white shadow-2xl hover:bg-red-700 transition-all hover:scale-105 active:scale-95 cursor-pointer font-bold border border-red-500/40"
          >
            <div className="relative">
              <ShoppingCart className="size-5" />
              <span className="absolute -right-2.5 -top-2.5 flex size-5 items-center justify-center rounded-full bg-white text-xs font-bold text-red-600">
                {totalItems}
              </span>
            </div>
            <div className="text-left">
              <span className="block text-xs font-extrabold uppercase tracking-wider">
                View Quotation
              </span>
              <span className="block text-[11px] font-semibold text-white/90">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      {/* Compact Bulk Supply Footer Strip */}
      <section className="border-t border-border bg-muted/30 py-10">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <h2 className="font-display text-lg sm:text-xl font-bold text-foreground">
            Need Bulk Industrial Equipment Supply?
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
            We provide wholesale distributor pricing, certified test certificates, on-site delivery,
            and complete installation assistance across India.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3">
            <a href="/contact">
              <Button size="sm">Request Wholesale Quote</Button>
            </a>
            <a href="tel:+918639858221">
              <Button variant="outline" size="sm">
                <Phone className="size-3.5" /> +91 8639858221
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Account Required Auth Modal when opening/adding a product */}
      <AuthRequiredModal
        isOpen={Boolean(authPromptProduct)}
        onClose={() => setAuthPromptProduct(null)}
        productName={authPromptProduct?.name}
        redirectUrl={authPromptProduct?.url || "/products"}
        allowDismiss={true}
      />

      <SiteFooter />
    </main>
  );
}

export default ProductsPage;
