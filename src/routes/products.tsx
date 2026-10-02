import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/button";
import { ArrowRight, Check, Phone, ShieldCheck } from "lucide-react";
import { subscribeProducts, CATEGORIES } from "@/lib/db-service";
import type { ProductItem } from "@/lib/types";

export const Route = createFileRoute("/products")({
  head: () => ({
    meta: [
      { title: "Products Catalog | Sri Udharchi Enterprises - Fire Protection & Safety Gear" },
      {
        name: "description",
        content:
          "Explore certified fire extinguishers, fire hydrant systems, diesel & electric fire pumps, industrial PPE gear, CCTV surveillance, and fire-rated cable management.",
      },
      { property: "og:title", content: "Fire & Safety Products | Sri Udharchi Enterprises" },
    ],
  }),
  component: ProductsPage,
});

const categories = ["All", ...CATEGORIES];

function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [productsList, setProductsList] = useState<ProductItem[]>([]);

  useEffect(() => {
    const unsub = subscribeProducts((data) => {
      setProductsList(data);
    });
    return () => unsub();
  }, []);

  const filteredProducts =
    selectedCategory === "All"
      ? productsList
      : productsList.filter((p) => p.category === selectedCategory);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/10 via-background to-background py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-5 text-center lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" /> Certified Equipment
          </span>
          <h1 className="mt-4 font-display text-4xl font-black text-foreground sm:text-5xl lg:text-6xl">
            Fire Protection Systems & <span className="text-primary">Safety Hardware</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Every product supplied by Sri Udharchi Enterprises undergoes rigorous testing and meets
            strict national (BIS/ISI/NBC) and international (NFPA/CE) compliance benchmarks.
          </p>

          {/* Categories Pill Navigation */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-5 py-2 text-xs font-bold transition-all sm:text-sm ${
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
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id || prod.name}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-xl"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  <img
                    src={prod.image}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-md bg-background/90 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-foreground backdrop-blur">
                    {prod.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3 className="font-display text-xl font-bold text-foreground">{prod.name}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {prod.description}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-border pt-4">
                    {prod.specs.map((spec) => (
                      <div
                        key={spec}
                        className="flex items-center gap-2 text-xs text-muted-foreground"
                      >
                        <Check className="size-3.5 text-primary" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                    <div>
                      {prod.price ? (
                        <div className="flex items-baseline gap-1 text-primary">
                          <span className="font-display text-lg font-black">
                            {prod.price.startsWith("₹") ? prod.price : `₹${prod.price}`}
                          </span>
                          {prod.unit && (
                            <span className="text-xs text-muted-foreground">/ {prod.unit}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-muted-foreground">
                          Price on Request
                        </span>
                      )}
                    </div>
                    {prod.inStock === false ? (
                      <span className="rounded bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive">
                        Out of Stock
                      </span>
                    ) : (
                      <span className="rounded bg-success/10 px-2 py-0.5 text-[11px] font-bold text-success">
                        In Stock
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <a
                      href={`/contact?product=${encodeURIComponent(prod.name)}`}
                      className="w-full"
                    >
                      <Button variant="outline" className="w-full justify-between">
                        <span>{prod.price ? "Order / Inquire Now" : "Request Pricing"}</span>
                        <ArrowRight className="size-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

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
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
