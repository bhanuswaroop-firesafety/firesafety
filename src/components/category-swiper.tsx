import * as React from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { NanoIcon, type NanoIconName } from "@/components/nano-icon";
import { Button } from "@/components/button";

export interface CategorySlideItem {
  name: string;
  desc: string;
  image: string;
  nanoIcon?: NanoIconName;
}

interface CategorySwiperProps {
  categories: CategorySlideItem[];
}

export function CategorySwiper({ categories }: CategorySwiperProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    duration: 35, // Slow, gentle transition duration
    skipSnaps: false,
    dragFree: false,
  });

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [scrollSnaps, setScrollSnaps] = React.useState<number[]>([]);
  const [isPaused, setIsPaused] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  // Update selected index & snaps
  const onSelect = React.useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("pointerDown", () => setIsDragging(true));
    emblaApi.on("pointerUp", () => setIsDragging(false));

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Slow Auto-Swiper effect (ticks every 3.2s)
  React.useEffect(() => {
    if (!emblaApi || isPaused || isDragging) return;

    const timer = setInterval(() => {
      emblaApi.scrollNext();
    }, 3200);

    return () => clearInterval(timer);
  }, [emblaApi, isPaused, isDragging]);

  const scrollPrev = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = React.useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = React.useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  return (
    <div
      className="relative mt-8 sm:mt-10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Header controls (Arrows & Auto-swipe indicator) */}
      <div className="mb-4 flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-[11px] sm:text-xs font-semibold text-muted-foreground">
          <span
            className={`inline-block size-2 rounded-full transition-colors ${
              isPaused || isDragging ? "bg-amber-400" : "bg-emerald-500 animate-pulse"
            }`}
          />
          <span className="hidden sm:inline">
            {isPaused || isDragging ? "Auto-swipe paused (User exploring)" : "Auto-swiping smoothly"}
          </span>
          <span className="sm:hidden">
            {isPaused || isDragging ? "Paused" : "Auto-swiping"}
          </span>
        </div>

        {/* Navigation Arrows for touch or click */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={scrollPrev}
            aria-label="Previous category"
            className="flex size-8 sm:size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="size-4 sm:size-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            aria-label="Next category"
            className="flex size-8 sm:size-9 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-xs transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground active:scale-95 cursor-pointer"
          >
            <ChevronRight className="size-4 sm:size-5" />
          </button>
        </div>
      </div>

      {/* Embla Viewport */}
      <div
        ref={emblaRef}
        className="overflow-hidden select-none cursor-grab active:cursor-grabbing rounded-2xl"
      >
        <div className="flex -ml-3 sm:-ml-4">
          {categories.map((cat, index) => (
            <div
              key={cat.name}
              className="min-w-0 shrink-0 grow-0 basis-[72%] sm:basis-[46%] md:basis-[31%] lg:basis-[22%] pl-3 sm:pl-4"
            >
              <a
                href="/products"
                className="group flex flex-col h-full overflow-hidden rounded-xl sm:rounded-2xl border border-border bg-card shadow-xs transition-all duration-300 hover:border-primary/50 hover:shadow-xl hover:-translate-y-1 block"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    loading="lazy"
                    draggable={false}
                    className="size-full object-cover transition-transform duration-700 group-hover:scale-108 pointer-events-none"
                  />
                  {cat.nanoIcon && (
                    <div className="absolute top-2.5 right-2.5 flex size-8 items-center justify-center rounded-xl bg-background/90 text-foreground shadow-sm backdrop-blur-md">
                      <NanoIcon name={cat.nanoIcon} size="sm" />
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col justify-between p-3.5 sm:p-4">
                  <div>
                    <h3 className="font-display text-xs sm:text-sm font-bold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 min-h-[2.2rem] sm:min-h-0">
                      {cat.name}
                    </h3>
                    <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <div className="mt-3.5 flex items-center justify-between border-t border-border/60 pt-2 text-[10px] sm:text-xs font-bold text-primary group-hover:translate-x-0.5 transition-transform">
                    <span>Explore Products</span>
                    <ArrowRight className="size-3.5" />
                  </div>
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Dots Indicator */}
      <div className="mt-5 sm:mt-6 flex items-center justify-center gap-1.5">
        {scrollSnaps.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => scrollTo(idx)}
            aria-label={`Jump to category slide ${idx + 1}`}
            className={`transition-all rounded-full cursor-pointer ${
              idx === selectedIndex
                ? "w-6 h-2 bg-primary"
                : "w-2 h-2 bg-border hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
