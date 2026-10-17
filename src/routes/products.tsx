import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
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
} from "lucide-react";
import { subscribeProducts, CATEGORIES } from "@/lib/db-service";
import type { ProductItem } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { NanoIcon, type NanoIconName } from "@/components/nano-icon";
import { seoHead, schemas } from "@/lib/seo";

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

const getCategoryIcon = (category: string): NanoIconName => {
  switch (category) {
    case "Fire Safety":
      return "fire";
    case "Fire Hydrant":
      return "hydrant";
    case "Fire Pumps":
      return "pump";
    case "PPE":
      return "helmet";
    case "CCTV":
      return "cctv";
    case "Cable Management":
      return "cable";
    case "Road Safety":
      return "road";
    case "Medical Safety":
      return "medical";
    default:
      return "shield";
  }
};

const categories = ["All", ...CATEGORIES];

function ProductsPage() {
  const { addToCart, totalItems, totalAmount, setIsCartOpen } = useCart();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeProducts((data) => {
      setProductsList(data);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const activeProducts = productsList;

  const filteredProducts = useMemo(() => {
    return activeProducts.filter((p) => {
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
    });
  }, [activeProducts, selectedCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" /> ISI & BIS Certified Fire Safety Products
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl lg:text-6xl">
            Certified Fire Safety Products & <span className="text-primary">Safety Equipment</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Buy certified fire safety products and industrial protective equipment. Every safety
            product supplied by Sri Udharchi Enterprises meets strict national (BIS/ISI/NBC) and
            international (NFPA/CE) compliance benchmarks.
          </p>

          {/* Search bar & Categories Pill Navigation */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products by name, standard, or specs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-border bg-card pl-10 pr-9 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all sm:px-5 sm:py-2 sm:text-sm ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "border border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="animate-pulse overflow-hidden rounded-xl border border-border bg-card p-4 space-y-3"
                >
                  <div className="aspect-[4/3] rounded-lg bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              ))}
            </div>
          ) : productsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center max-w-2xl mx-auto">
              <Package className="mx-auto size-12 text-muted-foreground/60" />
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                No Products Available in Catalog
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                There are currently no products published in the live database. Products added or
                synced through the Administrator Panel will appear here automatically.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <a href="/contact">
                  <Button size="sm">Request Equipment Quote</Button>
                </a>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center">
              <Package className="mx-auto size-12 text-muted-foreground/60" />
              <h3 className="mt-4 font-display text-lg font-bold text-foreground">
                No matching products found
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                No safety items match "{searchQuery}" in category "{selectedCategory}".
              </p>
              <div className="mt-6 flex justify-center gap-3">
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
                <a href="/contact">
                  <Button size="sm">Request Custom Product</Button>
                </a>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id || prod.name}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-xl"
                >
                  <a
                    href={`/products/${prod.id || prod.sku || prod.name}`}
                    className="relative aspect-[4/3] sm:aspect-[16/10] overflow-hidden bg-muted block cursor-pointer"
                  >
                    <img
                      src={prod.image}
                      alt={`${prod.name} - Certified Fire Safety Product | Sri Udharchi Enterprises`}
                      referrerPolicy="no-referrer"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-2 top-2 sm:left-3 sm:top-3 rounded-md bg-background/90 px-1.5 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[11px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
                      {prod.category}
                    </span>
                  </a>

                  <div className="flex flex-1 flex-col p-3 sm:p-6">
                    <a
                      href={`/products/${prod.id || prod.sku || prod.name}`}
                      className="group-hover:text-primary transition-colors"
                    >
                      <h3 className="font-display text-xs sm:text-xl font-bold text-foreground leading-snug line-clamp-2 min-h-[2rem] sm:min-h-0">
                        {prod.name}
                      </h3>
                    </a>
                    <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground line-clamp-2 hidden sm:block">
                      {prod.description}
                    </p>

                    <div className="mt-2 sm:mt-4 space-y-1 sm:space-y-1.5 border-t border-border pt-2 sm:pt-4">
                      {prod.specs.slice(0, 2).map((spec) => (
                        <div
                          key={spec}
                          className="flex items-center gap-1.5 text-[10px] sm:text-xs text-muted-foreground"
                        >
                          <Check className="size-3 text-primary shrink-0" />
                          <span className="truncate">{spec}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-2.5 sm:mt-4 flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-t border-border pt-2 sm:pt-3 gap-1">
                      <div>
                        {prod.price ? (
                          <div className="flex items-baseline gap-1 text-primary">
                            <span className="font-display text-sm sm:text-lg font-black">
                              {prod.price.startsWith("₹") ? prod.price : `₹${prod.price}`}
                            </span>
                            {prod.unit && (
                              <span className="text-[10px] sm:text-xs text-muted-foreground">
                                / {prod.unit}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[10px] sm:text-xs font-semibold text-muted-foreground">
                            Price on Request
                          </span>
                        )}
                      </div>
                      {prod.inStock === false ? (
                        <span className="self-start sm:self-auto rounded bg-destructive/10 px-1.5 py-0.5 text-[9px] sm:text-[11px] font-bold text-destructive">
                          Out of Stock
                        </span>
                      ) : (
                        <span className="self-start sm:self-auto rounded bg-success/10 px-1.5 py-0.5 text-[9px] sm:text-[11px] font-bold text-success">
                          In Stock
                        </span>
                      )}
                    </div>

                    <div className="mt-2.5 sm:mt-4 flex flex-col gap-1.5 sm:gap-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addToCart(prod, 1)}
                          className="h-8 sm:h-9 w-full justify-center px-1.5 text-[10px] sm:text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all"
                        >
                          <ShoppingBag className="size-3 sm:size-3.5 mr-1" /> Add
                          <span className="hidden sm:inline">&nbsp;to Cart</span>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            addToCart(prod, 1);
                            window.location.href = "/checkout";
                          }}
                          className="h-8 sm:h-9 w-full justify-center px-1.5 text-[10px] sm:text-xs font-bold"
                        >
                          <Zap className="size-3 sm:size-3.5 mr-1" /> Buy Now
                        </Button>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[11px]">
                        <a
                          href={`/products/${prod.id || prod.sku || prod.name}`}
                          className="inline-flex items-center gap-1 font-bold text-primary hover:underline py-0.5"
                        >
                          <Eye className="size-3.5" /> View Details
                        </a>
                        <a
                          href={`/contact?product=${encodeURIComponent(prod.name)}`}
                          className="hidden sm:inline-block text-[11px] text-muted-foreground hover:text-primary transition-colors py-0.5"
                        >
                          Bulk Specs
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

      {/* Bulk Supply Banner */}
      <section className="border-t border-border bg-muted/40 py-16">
        <div className="mx-auto max-w-5xl px-5 text-center lg:px-8">
          <h2 className="font-display text-3xl font-black text-foreground sm:text-4xl">
            Need Bulk Equipment Supply for an Industrial Project?
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            We provide wholesale distributor pricing, certified test certificates, on-site delivery,
            and complete installation assistance across India.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <a href="/contact">
              <Button size="lg">Request Wholesale Quote</Button>
            </a>
            <a href="tel:+918639858221">
              <Button variant="outline" size="lg">
                <Phone className="size-4" /> Call +91 8639858221
              </Button>
            </a>
            <a href="tel:+919030609171">
              <Button variant="outline" size="lg">
                <Phone className="size-4" /> Call +91 9030609171
              </Button>
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
