import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect, useMemo, type FormEvent } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/button";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  Flame,
  HelpCircle,
  MessageCircle,
  Package,
  Phone,
  RefreshCw,
  Send,
  Share2,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Star,
  Truck,
  Wrench,
  Zap,
  Lock,
  UserPlus,
} from "lucide-react";
import {
  findProductById,
  subscribeProductById,
  subscribeProducts,
  submitInquiry,
} from "@/lib/db-service";
import type { ProductItem } from "@/lib/types";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import { AuthRequiredModal } from "@/components/auth-required-modal";
import { NanoIcon, type NanoIconName } from "@/components/nano-icon";
import { seoHead, schemas } from "@/lib/seo";

export const Route = createFileRoute("/products_/$productId")({
  head: ({ params }) => {
    const product = findProductById(params.productId, []);
    const title = product
      ? `${product.name} | Certified ${product.category} - Sri Udharchi Enterprises`
      : "Fire Safety Equipment & Certified Gear | Sri Udharchi Enterprises";
    const description = product
      ? `${product.description} Buy certified ${product.name} online with ISI/BIS compliance, manufacturer test certificate, and India-wide fast dispatch.`
      : "Buy certified fire safety products and industrial protective equipment from Sri Udharchi Enterprises.";

    return seoHead({
      title,
      description,
      path: `/products/${params.productId}`,
      keywords: [
        product?.name || "fire safety product",
        product?.category || "safety equipment",
        "buy fire safety equipment online",
        "ISI certified safety products",
        "Sri Udharchi Enterprises",
      ],
      jsonLd: product
        ? [
            schemas.breadcrumbs([
              { name: "Home", path: "/" },
              { name: "Products", path: "/products" },
              { name: product.name, path: `/products/${params.productId}` },
            ]),
            schemas.singleProduct({
              name: product.name,
              description: product.description,
              image: product.image,
              price: typeof product.price === "number" ? product.price : 0,
              sku: product.sku,
              category: product.category,
              inStock: product.inStock,
              url: `/products/${params.productId}`,
            }),
          ]
        : [],
    });
  },
  component: ProductViewPage,
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

function ProductViewPage() {
  const { productId } = Route.useParams();
  const { user, loading: authLoading } = useAuth();
  const { addToCart, totalItems, totalAmount, setIsCartOpen } = useCart();

  const [product, setProduct] = useState<ProductItem | null>(() => findProductById(productId, []));
  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "specs" | "compliance" | "applications" | "maintenance"
  >("specs");

  // Prompt unauthenticated users with the required account modal when opening a product
  useEffect(() => {
    if (!authLoading && !user) {
      setShowAuthModal(true);
    }
  }, [authLoading, user]);

  // Quick Bulk Quote Form State
  const [quoteForm, setQuoteForm] = useState({
    name: "",
    phone: "",
    email: "",
    company: "",
    quantityReq: "10",
    message: "",
  });
  const [isSubmittingQuote, setIsSubmittingQuote] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState(false);

  // Subscribe to live Firestore product update
  useEffect(() => {
    const unsubProduct = subscribeProductById(productId, (found) => {
      if (found) setProduct(found);
    });
    const unsubAll = subscribeProducts((list) => {
      if (list && list.length > 0) setAllProducts(list);
    });

    return () => {
      unsubProduct();
      unsubAll();
    };
  }, [productId]);

  // Adjust default quantity if minOrderQty exists
  useEffect(() => {
    if (product?.minOrderQty) {
      const min = parseInt(product.minOrderQty, 10);
      if (!isNaN(min) && min > 1) {
        setQuantity(min);
      }
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!product) return;
    addToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!product) return;
    addToCart(product, quantity);
    window.location.href = "/checkout";
  };

  const handleQuoteSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!quoteForm.name || !quoteForm.phone) return;
    setIsSubmittingQuote(true);

    try {
      await submitInquiry({
        name: quoteForm.name,
        phone: quoteForm.phone,
        email: quoteForm.email,
        facility: quoteForm.company || "Enterprise Customer",
        service: `Product Quote: ${product?.name} (Qty: ${quoteForm.quantityReq})`,
        message:
          quoteForm.message ||
          `Requirement for ${quoteForm.quantityReq} units of ${product?.name} (SKU: ${product?.sku || "N/A"}).`,
      });
      setQuoteSuccess(true);
    } catch (err) {
      console.error("Quote submission error:", err);
    } finally {
      setIsSubmittingQuote(false);
    }
  };

  // Related products from same category or general catalog
  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const sameCat = allProducts.filter(
      (p) => p.category === product.category && p.name !== product.name,
    );
    if (sameCat.length >= 3) return sameCat.slice(0, 3);
    const others = allProducts.filter((p) => p.name !== product.name);
    return [...sameCat, ...others].slice(0, 3);
  }, [product, allProducts]);

  if (!product) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <SiteHeader />
        <div className="mx-auto max-w-3xl px-5 py-24 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold text-foreground sm:text-3xl">
            Product Not Found
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The fire safety product with identifier{" "}
            <span className="font-mono text-primary font-semibold">"{productId}"</span> could not be
            located in our active catalog.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="/products">
              <Button size="lg">
                <ArrowLeft className="size-4 mr-1.5" /> Back to Products Catalog
              </Button>
            </a>
            <a href="/contact">
              <Button variant="outline" size="lg">
                Request Custom Quotation
              </Button>
            </a>
          </div>
        </div>
        <SiteFooter />
      </main>
    );
  }

  const categoryIcon = getCategoryIcon(product.category);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="border-b border-border bg-muted/30 py-3 text-xs">
        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 sm:px-6 lg:px-8 text-muted-foreground overflow-x-auto whitespace-nowrap">
          <a href="/" className="hover:text-primary transition-colors">
            Home
          </a>
          <ChevronRight className="size-3.5 shrink-0" />
          <a href="/products" className="hover:text-primary transition-colors">
            Fire Safety Products
          </a>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="font-semibold text-foreground/80">{product.category}</span>
          <ChevronRight className="size-3.5 shrink-0" />
          <span className="truncate max-w-[200px] sm:max-w-md font-bold text-foreground">
            {product.name}
          </span>
        </div>
      </nav>

      {/* Main Product Showcase Section */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Guest Account Required Prompt Banner */}
          {!user && (
            <div className="mb-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Lock className="size-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold text-foreground">
                    You must have an account. Please signup
                  </p>
                  <p className="text-[11px] sm:text-xs text-muted-foreground">
                    Create a free account or sign in to order, view compliance certifications, and access instant quotations.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`/signup?redirect=${encodeURIComponent(`/products/${productId}`)}`}>
                  <Button size="sm" className="text-xs font-bold gap-1 shadow-xs">
                    <UserPlus className="size-3.5" /> Sign Up
                  </Button>
                </a>
                <a href={`/login?redirect=${encodeURIComponent(`/products/${productId}`)}`}>
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    Sign In
                  </Button>
                </a>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Left Column: Visual Media Gallery */}
            <div className="lg:col-span-6 space-y-4">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
                <img
                  src={product.image}
                  alt={`${product.name} - Certified Fire Safety Product | Sri Udharchi Enterprises`}
                  referrerPolicy="no-referrer"
                  className="size-full object-cover transition-transform duration-700 hover:scale-105"
                />

                {/* Badges on Visual */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-background/95 px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground shadow-sm backdrop-blur">
                    <NanoIcon name={categoryIcon} size="sm" />
                    {product.category}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-md bg-primary/95 text-primary-foreground px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur shadow-sm">
                    <ShieldCheck className="size-3.5" /> ISI / BIS Certified
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  {product.inStock !== false ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/95 text-white px-3 py-1 text-xs font-bold backdrop-blur shadow-md">
                      <span className="size-2 rounded-full bg-white animate-pulse" />
                      In Stock & Ready to Dispatch
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/95 text-white px-3 py-1 text-xs font-bold backdrop-blur shadow-md">
                      Made to Order / Inquire
                    </span>
                  )}
                </div>
              </div>

              {/* Quality & Compliance Assurance Row */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card p-2.5 sm:p-3 text-left">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ShieldCheck className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-foreground">NBC 2016</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Full Code Compliance
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card p-2.5 sm:p-3 text-left">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-foreground">Test Report</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Certificate Included
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-border/80 bg-card p-2.5 sm:p-3 text-left">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Truck className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-foreground">Pan-India</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      Rapid Secure Transit
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Product Details, Pricing, & Actions */}
            <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Header info */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    {product.sku && (
                      <span className="rounded-md border border-border bg-muted/60 px-2 py-0.5 font-mono text-[11px] font-bold text-muted-foreground">
                        SKU: {product.sku}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 text-xs font-semibold">
                      <Star className="size-3.5 fill-current" /> 4.9 (48+ Enterprise Projects)
                    </span>
                  </div>

                  <h1 className="font-display text-2xl font-black text-foreground sm:text-3xl lg:text-4xl leading-tight">
                    {product.name}
                  </h1>

                  <p className="mt-3 text-sm sm:text-base leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
                  <div className="flex flex-wrap items-baseline gap-2 sm:gap-3">
                    <span className="font-display text-3xl sm:text-4xl font-black text-primary">
                      {product.price
                        ? product.price.startsWith("₹")
                          ? product.price
                          : `₹${product.price}`
                        : "Quote on Request"}
                    </span>
                    {product.price && product.unit && (
                      <span className="text-sm font-semibold text-muted-foreground">
                        / {product.unit}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="size-3.5" /> GST Input Credit Invoice Available
                    </span>
                    <span>•</span>
                    <span>Excl. 18% GST (Calculated at checkout)</span>
                  </div>
                  {/* Task A: Shipping timing notice */}
                  <div className="mt-2.5 pt-2 border-t border-border/70 flex flex-wrap items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1.5 font-bold text-foreground bg-muted/60 px-2.5 py-1 rounded-md border border-border">
                      <Truck className="size-3.5 text-primary" />
                      <span>Standard Delivery: 5 to 7 days</span>
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">
                      <Zap className="size-3.5 fill-amber-500" />
                      <span>Priority Dispatch: 1 to 2 days</span>
                    </span>
                  </div>
                  {product.minOrderQty && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Minimum order quantity:{" "}
                      <strong className="text-foreground">
                        {product.minOrderQty} {product.unit || "units"}
                      </strong>
                    </div>
                  )}
                </div>

                {/* Key Technical Highlights */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Certified Technical Highlights
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.specs.map((spec) => (
                      <div
                        key={spec}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card/60 px-3 py-2 text-xs font-medium text-foreground"
                      >
                        <Check className="size-3.5 text-primary shrink-0" />
                        <span className="truncate">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quantity Selector & Interactive Actions */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-foreground">Select Quantity:</span>
                    <div className="flex items-center rounded-lg border border-border bg-card">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-1.5 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors rounded-l-lg"
                      >
                        -
                      </button>
                      <span className="w-12 text-center text-sm font-bold text-foreground">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => q + 1)}
                        className="px-3 py-1.5 text-sm font-bold text-muted-foreground hover:bg-muted hover:text-foreground transition-colors rounded-r-lg"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Primary CTA Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Button
                      size="lg"
                      variant="outline"
                      onClick={handleAddToCart}
                      className="w-full text-sm font-bold border-primary/40 hover:bg-primary/10 hover:border-primary transition-all relative overflow-hidden"
                    >
                      <ShoppingBag className="size-4 mr-2" />
                      {addedToast ? "Added to Cart!" : "Add to Cart"}
                    </Button>

                    <Button
                      size="lg"
                      onClick={handleBuyNow}
                      className="w-full text-sm font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      <Zap className="size-4 mr-2" />
                      Buy Now & Checkout
                    </Button>
                  </div>

                  {/* Secondary Quick Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
                    <a
                      href={`https://wa.me/918639858221?text=${encodeURIComponent(
                        `Hello Sri Udharchi Enterprises, I am inquiring about: ${product.name} (SKU: ${product.sku || "N/A"}). Please share availability and bulk pricing.`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      <MessageCircle className="size-4" /> Chat on WhatsApp for Quick Quote
                    </a>

                    <a
                      href="tel:+918639858221"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Phone className="size-3.5" /> Call Fire Safety Desk: +91 8639858221
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabbed In-Depth Specification & Documentation Section */}
          <div className="mt-14 sm:mt-20">
            <div className="border-b border-border">
              <nav
                className="flex space-x-4 sm:space-x-8 overflow-x-auto no-scrollbar"
                aria-label="Tabs"
              >
                <button
                  type="button"
                  onClick={() => setActiveTab("specs")}
                  className={`pb-4 px-1 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "specs"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  Technical Specifications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("compliance")}
                  className={`pb-4 px-1 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "compliance"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  Statutory Compliance & Standards
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("applications")}
                  className={`pb-4 px-1 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "applications"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  Industry Applications
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("maintenance")}
                  className={`pb-4 px-1 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                    activeTab === "maintenance"
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                  }`}
                >
                  Testing & AMC Advisory
                </button>
              </nav>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-xs">
              {activeTab === "specs" && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Complete Engineering Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="overflow-hidden rounded-xl border border-border">
                      <table className="w-full text-xs">
                        <tbody className="divide-y divide-border">
                          <tr className="bg-muted/40">
                            <td className="py-2.5 px-3 font-semibold text-muted-foreground w-1/3">
                              Product Name
                            </td>
                            <td className="py-2.5 px-3 font-bold text-foreground">
                              {product.name}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-muted-foreground">
                              Category
                            </td>
                            <td className="py-2.5 px-3 font-bold text-foreground">
                              {product.category}
                            </td>
                          </tr>
                          <tr className="bg-muted/40">
                            <td className="py-2.5 px-3 font-semibold text-muted-foreground">
                              Catalog SKU
                            </td>
                            <td className="py-2.5 px-3 font-mono font-bold text-foreground">
                              {product.sku || "SUE-GEN-01"}
                            </td>
                          </tr>
                          <tr>
                            <td className="py-2.5 px-3 font-semibold text-muted-foreground">
                              Unit of Supply
                            </td>
                            <td className="py-2.5 px-3 font-bold text-foreground">
                              {product.unit || "per piece"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Verified Technical Benchmarks
                      </h4>
                      <div className="space-y-1.5">
                        {product.specs.map((s, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-xs text-foreground">
                            <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "compliance" && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    National & International Safety Standard Approvals
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Sri Udharchi Enterprises supplies only genuine, certified industrial safety
                    equipment adhering to Indian statutory norms and global safety councils.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <div className="rounded-xl border border-border p-4 bg-muted/20">
                      <span className="font-display text-sm font-bold text-primary block">
                        BIS / ISI Certification
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Adheres to relevant IS codes (e.g., IS 15683, IS 5290, IS 2925) with
                        physical certification stamps.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border p-4 bg-muted/20">
                      <span className="font-display text-sm font-bold text-primary block">
                        NBC 2016 Compliant
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Meets National Building Code of India requirements for occupancy life safety
                        and building fire protection.
                      </p>
                    </div>
                    <div className="rounded-xl border border-border p-4 bg-muted/20">
                      <span className="font-display text-sm font-bold text-primary block">
                        NFPA & CE Quality
                      </span>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Manufactured using fire-retardant, high-tensile alloys and certified
                        components aligned with global benchmarks.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "applications" && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Recommended Workplace & Industrial Applications
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="rounded-lg border border-border p-3 text-center bg-card">
                      <p className="font-bold text-xs text-foreground">Manufacturing Plants</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Automotive, Pharma, Steel
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center bg-card">
                      <p className="font-bold text-xs text-foreground">Warehouses & Logistics</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        High-Rack Storage Hubs
                      </p>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center bg-card">
                      <p className="font-bold text-xs text-foreground">Commercial High-Rises</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">IT Parks & Hotels</p>
                    </div>
                    <div className="rounded-lg border border-border p-3 text-center bg-card">
                      <p className="font-bold text-xs text-foreground">Hospitals & Labs</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Critical Life Safety
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "maintenance" && (
                <div className="space-y-4">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Hydrostatic Testing, Refilling & AMC Service
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    Sri Udharchi Enterprises provides comprehensive post-installation support including
                    annual maintenance contracts (AMC), on-site hydro-testing, pressure gauge
                    recalibration, and statutory fire NOC renewal audits.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <a href="/maintenance">
                      <Button size="sm">
                        <Wrench className="size-3.5 mr-1" /> View Maintenance & AMC Services
                      </Button>
                    </a>
                    <a href="/inspection">
                      <Button variant="outline" size="sm">
                        Schedule Testing & Inspection
                      </Button>
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instant Enterprise Quote / Custom Requirement Form */}
          <section className="mt-16 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-card to-card p-6 sm:p-10 shadow-lg">
            <div className="max-w-3xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                <Package className="size-3.5" /> Direct Enterprise Supply
              </span>
              <h2 className="mt-3 font-display text-2xl font-black text-foreground sm:text-3xl">
                Need Bulk Pricing or Custom Technical Specifications?
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-muted-foreground">
                Get an official wholesale quotation directly from our technical sales engineering
                team for <strong className="text-foreground">{product.name}</strong>.
              </p>

              {quoteSuccess ? (
                <div className="mt-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-600 dark:text-emerald-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="size-5" />
                    <strong className="text-sm">Inquiry Received Successfully!</strong>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Our fire safety engineer will review your requirement for{" "}
                    <strong className="text-foreground">{product.name}</strong> and contact you at{" "}
                    {quoteForm.phone} with formal pricing.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleQuoteSubmit}
                  className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2"
                >
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={quoteForm.name}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={quoteForm.phone}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, phone: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="procurement@company.com"
                      value={quoteForm.email}
                      onChange={(e) => setQuoteForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Company / Facility Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Hyderabad Logistics Hub"
                      value={quoteForm.company}
                      onChange={(e) =>
                        setQuoteForm((prev) => ({ ...prev, company: e.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Estimated Units Required & Notes
                    </label>
                    <textarea
                      rows={2}
                      placeholder={`Quantity required, site location, or custom mounting requirements for ${product.name}...`}
                      value={quoteForm.message}
                      onChange={(e) =>
                        setQuoteForm((prev) => ({ ...prev, message: e.target.value }))
                      }
                      className="w-full rounded-lg border border-input bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <Button type="submit" disabled={isSubmittingQuote} className="w-full sm:w-auto">
                      {isSubmittingQuote ? (
                        <>
                          <RefreshCw className="size-3.5 mr-1.5 animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="size-3.5 mr-1.5" /> Submit Wholesale Inquiry
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </section>

          {/* Related / Recommended Equipment */}
          <div className="mt-16 sm:mt-24">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl sm:text-2xl font-bold text-foreground">
                  Complementary Safety Equipment
                </h2>
                <p className="text-xs text-muted-foreground">
                  Commonly paired with {product.name} for complete industrial life safety
                  compliance.
                </p>
              </div>
              <a
                href="/products"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
              >
                View All <ArrowRight className="size-3.5" />
              </a>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.id || rel.name}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <a
                    href={`/products/${rel.id || rel.sku}`}
                    className="relative aspect-[16/10] overflow-hidden bg-muted"
                  >
                    <img
                      src={rel.image}
                      alt={rel.name}
                      referrerPolicy="no-referrer"
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute left-2.5 top-2.5 rounded-md bg-background/90 px-2 py-0.5 text-[10px] font-bold">
                      {rel.category}
                    </span>
                  </a>

                  <div className="flex flex-1 flex-col p-4">
                    <a
                      href={`/products/${rel.id || rel.sku}`}
                      className="font-display text-sm font-bold text-foreground hover:text-primary transition-colors line-clamp-1"
                    >
                      {rel.name}
                    </a>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                      {rel.description}
                    </p>

                    <div className="mt-3 flex items-baseline justify-between border-t border-border pt-2.5">
                      <span className="font-display text-base font-black text-primary">
                        {rel.price
                          ? rel.price.startsWith("₹")
                            ? rel.price
                            : `₹${rel.price}`
                          : "Quote"}
                      </span>
                      <a
                        href={`/products/${rel.id || rel.sku}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                      >
                        View Details <ArrowRight className="size-3" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Floating Cart Trigger */}
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

      {/* Account Required Auth Modal */}
      <AuthRequiredModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        productName={product.name}
        redirectUrl={`/products/${productId}`}
        allowDismiss={true}
      />

      <SiteFooter />
    </main>
  );
}
