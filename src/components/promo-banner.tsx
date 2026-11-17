import { useState, useEffect } from "react";
import { ArrowRight, Sparkles, X, Tag, ShieldCheck, Flame } from "lucide-react";
import {
  subscribeBanners,
  subscribeBusinessSettings,
  DEFAULT_BUSINESS_SETTINGS,
} from "@/lib/db-service";
import type { BannerItem, BusinessProfileSettings } from "@/lib/types";
import { Button } from "@/components/button";

/**
 * Top Announcement Bar shown above the navigation header
 */
export function TopAnnouncementBanner() {
  const [bizSettings, setBizSettings] = useState<BusinessProfileSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const unsubBanners = subscribeBanners((list) => {
      setBanners(list);
    });
    const unsubBiz = subscribeBusinessSettings((settings) => {
      setBizSettings(settings);
    });
    return () => {
      unsubBanners();
      unsubBiz();
    };
  }, []);

  // If banners are disabled globally by admin or dismissed, hide banner
  if (bizSettings.bannersEnabled === false || isDismissed) return null;

  const activeBanner = banners.find((b) => b.isActive);
  if (!activeBanner) return null;

  return (
    <aside
      aria-label="Promotional announcement"
      className="relative z-40 bg-gradient-to-r from-red-700 via-rose-600 to-amber-600 text-white px-4 py-2 sm:py-2.5 text-xs font-medium shadow-sm transition-all"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex flex-1 items-center justify-center gap-2 sm:gap-3 text-center sm:text-left flex-wrap">
          {activeBanner.badge && (
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-sm border border-white/25">
              <Sparkles className="size-3 text-amber-200 animate-pulse" />
              <span>{activeBanner.badge}</span>
            </span>
          )}

          <span className="font-semibold text-white tracking-wide">
            {activeBanner.title}
          </span>

          {activeBanner.ctaText && (
            <a
              href={activeBanner.ctaLink || "/products"}
              className="inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:text-amber-200 transition-colors ml-1 text-white"
            >
              <span>{activeBanner.ctaText}</span>
              <ArrowRight className="size-3" />
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsDismissed(true)}
          className="rounded-md p-1 text-white/80 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          aria-label="Dismiss announcement"
        >
          <X className="size-3.5" />
        </button>
      </div>
    </aside>
  );
}

/**
 * Rich Promotional Offer Showcase Card for Homepage & Products page
 */
export function PromotionalOfferSection({ className = "" }: { className?: string }) {
  const [bizSettings, setBizSettings] = useState<BusinessProfileSettings>(DEFAULT_BUSINESS_SETTINGS);
  const [banners, setBanners] = useState<BannerItem[]>([]);

  useEffect(() => {
    const unsubBanners = subscribeBanners((list) => {
      setBanners(list);
    });
    const unsubBiz = subscribeBusinessSettings((settings) => {
      setBizSettings(settings);
    });
    return () => {
      unsubBanners();
      unsubBiz();
    };
  }, []);

  // If banners are disabled globally by admin or no active banners, do not render
  if (bizSettings.bannersEnabled === false) return null;

  const activeBanners = banners.filter((b) => b.isActive);
  if (activeBanners.length === 0) return null;

  const current = activeBanners[0];
  if (!current || !current.isActive) return null;

  return (
    <section className={`relative overflow-hidden ${className}`}>
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-br from-slate-950 via-red-950/70 to-slate-900 text-white shadow-2xl">
          {/* Subtle background glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 size-80 rounded-full bg-rose-600/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 size-80 rounded-full bg-amber-500/20 blur-3xl" />

          <div className="grid items-center gap-8 p-6 sm:p-10 lg:grid-cols-[1.2fr_0.8fr] lg:p-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-600/30 px-3 py-1 text-xs font-bold uppercase tracking-wider text-rose-300 border border-rose-500/40 backdrop-blur-md">
                  <Flame className="size-3.5 text-amber-400" />
                  <span>{current.badge || "SPECIAL OFFER"}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-white/70">
                  <ShieldCheck className="size-3.5 text-emerald-400" />
                  <span>Certified Industrial Fire Safety</span>
                </span>
              </div>

              <h2 className="font-display text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight">
                {current.title}
              </h2>

              {current.description && (
                <p className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-xl">
                  {current.description}
                </p>
              )}

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <a href={current.ctaLink || "/products"}>
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold shadow-lg shadow-red-900/40 border border-rose-400/30 gap-2"
                  >
                    <Tag className="size-4" />
                    <span>{current.ctaText || "Claim This Offer"}</span>
                    <ArrowRight className="size-4" />
                  </Button>
                </a>
                <a href="/contact">
                  <Button
                    variant="outline"
                    size="lg"
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm"
                  >
                    Request Bulk Quote
                  </Button>
                </a>
              </div>
            </div>

            {/* Right: Promotional Visual */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900/60 shadow-xl aspect-[16/10] relative group">
                <img
                  src={current.imageUrl || "/udharchi-hero.jpg"}
                  alt={current.title}
                  className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white/90 bg-black/40 backdrop-blur-md rounded-xl p-2.5 border border-white/10">
                  <span className="font-semibold truncate">Direct Dispatch from Palasamudram Central Depot</span>
                  <span className="font-mono text-amber-300 font-bold shrink-0">100% BIS Certified</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
