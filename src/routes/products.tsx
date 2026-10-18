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
} from "lucide-react";
import { subscribeProducts, CATEGORIES } from "@/lib/db-service";
import type { ProductItem } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { seoHead, schemas } from "@/lib/seo";
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

function ProductsPage() {
  const { addToCart, totalItems, totalAmount, setIsCartOpen } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"featured" | "price-asc" | "price-desc" | "name">("featured");
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeProducts((data) => {
      setProductsList(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  // Compute all available categories from default constants + active products
  const allCategories = useMemo(() => {
    const productCategories = Array.from(
      new Set(productsList.map((p) => p.category).filter(Boolean)),
    );
    return ["All", ...Array.from(new Set([...CATEGORIES, ...productCategories]))];
  }, [productsList]);

  // Filtered & Sorted products list
  const filteredProducts = useMemo(() => {
    return productsList
      .filter((p) => {
        const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) ||
          (p.sku && p.sku.toLowerCase().includes(q)) ||
          (p.specs && p.specs.some((s) => s.toLowerCase().includes(q)));
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
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
  }, [productsList, selectedCategory, searchQuery, sortBy]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* COMPACT PRODUCT-FIRST HEADER & FILTER TOOLBAR */}
      <section className="border-b border-border bg-card/80 backdrop-blur-md sticky top-[68px] sm:top-[76px] z-20 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
            {/* Title & Count Badge */}
            <div className="flex items-center gap-2.5">
              <h1 className="font-display text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
                <span>Products Catalog</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {filteredProducts.length} items
                </span>
              </h1>
            </div>

            {/* Search Input & Sort Selector */}
            <div className="flex items-center gap-2 flex-1 max-w-lg sm:justify-end">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search products by name, SKU, or specs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background pl-8 pr-7 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none shadow-2xs"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2 text-muted-foreground hover:text-foreground"
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
                className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none shrink-0"
              >
                <option value="featured">Featured First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills (Horizontal Scrollable) */}
          <div className="mt-2.5 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {allCategories.map((cat) => {
              const count =
                cat === "All"
                  ? productsList.length
                  : productsList.filter((p) => p.category === cat).length;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`whitespace-nowrap rounded-lg px-3 py-1 text-xs font-semibold transition-all shrink-0 ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "border border-border bg-background/80 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                  }`}
                >
                  {cat} {count > 0 && <span className="opacity-75">({count})</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* PRODUCTS GRID (IMMEDIATELY VISIBLE ON SCREEN) */}
      <section className="py-6 sm:py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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
          ) : productsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center max-w-md mx-auto my-8">
              <Package className="mx-auto size-12 text-muted-foreground/60" />
              <h3 className="mt-4 font-display text-base font-bold text-foreground">
                No Products Available
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Products added or synced through the Administrator Panel will appear here automatically.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <a href="/contact">
                  <Button size="sm">Request Equipment Quote</Button>
                </a>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center my-8 max-w-md mx-auto">
              <Package className="mx-auto size-10 text-muted-foreground/60" />
              <h3 className="mt-3 font-display text-sm font-bold text-foreground">
                No matching products found
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                No items match "{searchQuery}" in category "{selectedCategory}".
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id || prod.name}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  {/* Product Image */}
                  <a
                    href={`/products/${prod.id || prod.sku || prod.name}`}
                    className="relative aspect-[4/3] overflow-hidden bg-muted block cursor-pointer"
                  >
                    <img
                      src={prod.image}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = extinguisherImg;
                      }}
                    />
                    <span className="absolute left-2 top-2 rounded bg-background/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
                      {prod.category}
                    </span>
                    {prod.featured && (
                      <span className="absolute right-2 top-2 rounded bg-amber-500 text-white px-1.5 py-0.5 text-[9px] font-bold shadow-xs">
                        ★ Featured
                      </span>
                    )}
                  </a>

                  {/* Product Body */}
                  <div className="flex flex-1 flex-col p-3 sm:p-4">
                    <a
                      href={`/products/${prod.id || prod.sku || prod.name}`}
                      className="group-hover:text-primary transition-colors"
                    >
                      <h3 className="font-display text-xs sm:text-sm font-bold text-foreground leading-snug line-clamp-2 min-h-[2rem]">
                        {prod.name}
                      </h3>
                    </a>

                    <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2 hidden sm:block">
                      {prod.description}
                    </p>

                    {/* Quick Specs */}
                    {prod.specs && prod.specs.length > 0 && (
                      <div className="mt-2 space-y-1 border-t border-border/60 pt-2 hidden sm:block">
                        {prod.specs.slice(0, 1).map((spec) => (
                          <div
                            key={spec}
                            className="flex items-center gap-1.5 text-[10px] text-muted-foreground"
                          >
                            <Check className="size-3 text-primary shrink-0" />
                            <span className="truncate">{spec}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Price and Stock status */}
                    <div className="mt-2 flex items-baseline justify-between border-t border-border/60 pt-2 gap-1">
                      <div>
                        {prod.price ? (
                          <div className="flex items-baseline gap-1 text-primary">
                            <span className="font-display text-sm sm:text-base font-black">
                              {prod.price.startsWith("₹") ? prod.price : `₹${prod.price}`}
                            </span>
                            {prod.unit && (
                              <span className="text-[10px] text-muted-foreground">
                                / {prod.unit}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            Quote on Request
                          </span>
                        )}
                      </div>
                      {prod.inStock === false ? (
                        <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] font-bold text-destructive">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="rounded bg-success/10 px-1.5 py-0.5 text-[9px] font-bold text-success">
                          In Stock
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-3 flex flex-col gap-1.5">
                      <div className="grid grid-cols-2 gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToCart(prod, 1)}
                          className="h-7 sm:h-8 w-full justify-center px-1 text-[10px] sm:text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <ShoppingBag className="size-3 mr-1" /> Add
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            addToCart(prod, 1);
                            window.location.href = "/checkout";
                          }}
                          className="h-7 sm:h-8 w-full justify-center px-1 text-[10px] sm:text-xs font-bold"
                        >
                          <Zap className="size-3 mr-1" /> Buy Now
                        </Button>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-1.5 text-[10px]">
                        <a
                          href={`/products/${prod.id || prod.sku || prod.name}`}
                          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                        >
                          <Eye className="size-3" /> Details
                        </a>
                        <a
                          href={`/contact?product=${encodeURIComponent(prod.name)}`}
                          className="text-muted-foreground hover:text-primary transition-colors"
                        >
                          Inquire Bulk
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Floating Cart Trigger on Products Page */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="flex items-center gap-3 rounded-full bg-primary px-5 py-3 text-primary-foreground shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20"
          >
            <div className="relative">
              <ShoppingCart className="size-5" />
              <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-white text-[10px] font-black text-primary">
                {totalItems}
              </span>
            </div>
            <div className="text-left pr-1">
              <span className="block text-xs font-bold leading-tight">
                View Cart ({totalItems})
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

      <SiteFooter />
    </main>
  );
}
