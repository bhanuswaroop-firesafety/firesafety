"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/* ── the curved row ──────────────────────────────────────────────
 * Scroll Tilted Grid turned on its side, with the tilt drawn as a curve.
 * One row of images streams from right to left around the inside of a
 * cylinder. The centre faces you flat, the ends bend toward you so each
 * end image curves along its length, and the ends fade into the page.
 *
 * Each tile is sliced into SLICES vertical strips along the cylinder's arc.
 * ─────────────────────────────────────────────────────────────── */

const SLICES = 8;
const CAMERA = 1.6;

function arc(bend: number) {
  return (CAMERA - 1 + Math.cos(bend)) / (2 * CAMERA * Math.sin(bend));
}

const MAX_WIDTH = 55;

function measure(
  width: number,
  height: number,
  tile: number,
  aspect: number,
  gap: number,
  bend: number,
) {
  const safeW = Math.max(width, 320);
  const safeH = Math.max(height, 360);
  const h = Math.min((tile / 100) * safeH, ((MAX_WIDTH / 100) * safeW) / aspect);
  const radius = safeW * arc(bend);
  if (!(h > 0) || !(radius > 0))
    return { columns: 4, sweep: 30, unit: 5, limit: 30, tileH: 160, radius: 600 };
  const deg = (rad: number) => (rad * 180) / Math.PI;
  const unit = deg(h / radius);
  const pitch = (aspect + gap / 100) * unit;
  const limit = deg(bend) + (aspect * unit) / 2;
  const columns = Math.min(60, Math.max(2, Math.ceil((2 * limit) / Math.max(pitch, 0.1))));
  const round = (n: number) => +n.toFixed(4);
  const sweep = round((columns * pitch) / 2);
  return {
    columns,
    sweep,
    unit: round(unit),
    limit: round(Math.min(sweep, limit)),
    tileH: round(h),
    radius: round(radius),
  };
}

export type TiltedGridImage = {
  src: string;
  alt?: string;
};

export type TiltedGridHeroProps = {
  images: TiltedGridImage[];
  speed?: number;
  tileHeight?: number;
  aspectRatio?: number;
  gap?: number;
  axis?: number;
  curve?: number;
  fade?: number;
  children?: React.ReactNode;
  className?: string;
};

export function TiltedGridHero({
  images,
  speed = 4,
  tileHeight = 28,
  aspectRatio = 16 / 9,
  gap = 6,
  axis = 56,
  curve = 80,
  fade = 12,
  children,
  className,
  style,
  ...props
}: React.ComponentProps<"div"> & TiltedGridHeroProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const id = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const orbit = `tgh-o-${id}`;
  const tile = `tgh-t-${id}`;
  const bend = (Math.min(85, Math.max(5, curve)) * Math.PI) / 180;

  const [dimensions, setDimensions] = React.useState({ width: 1200, height: 560 });
  const [mounted, setMounted] = React.useState(false);
  const [isInView, setIsInView] = React.useState(false);
  const [shown, setShown] = React.useState<Record<number, number>>({});

  React.useEffect(() => {
    setMounted(true);
    const el = ref.current;
    if (!el || typeof window === "undefined") return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      const w = rect.width || el.offsetWidth || window.innerWidth;
      const h = rect.height || el.offsetHeight || 560;
      setDimensions({ width: Math.max(w, 320), height: Math.max(h, 400) });
    };

    updateSize();

    let roCleanup: (() => void) | undefined;
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const w = entry.contentRect.width || el.offsetWidth || window.innerWidth;
        const h = entry.contentRect.height || el.offsetHeight || 560;
        setDimensions({ width: Math.max(w, 320), height: Math.max(h, 400) });
      });
      ro.observe(el);
      roCleanup = () => ro.disconnect();
    } else {
      window.addEventListener("resize", updateSize);
      roCleanup = () => window.removeEventListener("resize", updateSize);
    }

    // Viewport visibility observer to avoid GPU churn when offscreen
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry) {
            setIsInView(entry.isIntersecting);
          }
        },
        { rootMargin: "200px" },
      );
      observer.observe(el);
      io = observer;
    } else {
      setIsInView(true);
    }

    return () => {
      if (roCleanup) roCleanup();
      if (io) io.disconnect();
    };
  }, []);

  const { columns, sweep, unit, limit, tileH, radius } = measure(
    dimensions.width,
    dimensions.height,
    tileHeight,
    aspectRatio,
    gap,
    bend,
  );

  const turn = (deg: number) =>
    `translateZ(${radius}px) rotateY(${+deg.toFixed(4)}deg) translateZ(-${radius}px)`;

  const hide = +(((sweep - limit) / (2 * sweep || 1)) * 100).toFixed(4);
  const css =
    `@keyframes ${orbit}{` +
    `from{transform:${turn(-sweep)}}to{transform:${turn(sweep)}}` +
    `0%,${hide}%,${100 - hide}%,100%{visibility:hidden}` +
    `${hide + 0.001}%,${100 - hide - 0.001}%{visibility:visible}}` +
    `@media(prefers-reduced-motion:reduce){.${tile}{animation-play-state:paused}}`;

  const share = aspectRatio / SLICES;
  const duration = Math.max(columns * speed, 8);
  const mask = `linear-gradient(90deg,transparent,#000 ${fade}%,#000 ${100 - fade}%,transparent)`;

  const tileW = tileH * aspectRatio;
  const sliceW = share * tileH;
  const perspectiveVal = +(radius * CAMERA).toFixed(2);

  return (
    <div
      ref={ref}
      className={cn("relative overflow-hidden", className)}
      style={{
        ...style,
      }}
      {...props}
    >
      <style>{css}</style>

      {/* 3D Curved Cylindrical Carousel Track */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: mounted ? 1 : 0.85,
          perspective: `${perspectiveVal}px`,
          perspectiveOrigin: `50% ${axis}%`,
          maskImage: mask,
          WebkitMaskImage: mask,
        }}
      >
        {Array.from({ length: columns }, (_, t) => {
          const first =
            (((columns - 1 - t) % Math.max(images.length, 1)) + Math.max(images.length, 1)) %
            Math.max(images.length, 1);
          const currentIdx = shown[t] ?? first;
          const safeIdx =
            ((currentIdx % Math.max(images.length, 1)) + Math.max(images.length, 1)) %
            Math.max(images.length, 1);
          const img = images[safeIdx];

          return (
            <div
              key={t}
              className={cn(tile, "absolute")}
              style={{
                left: `calc(50% - ${+(tileW / 2).toFixed(2)}px)`,
                top: `calc(${axis}% - ${+(tileH / 2).toFixed(2)}px)`,
                width: `${+tileW.toFixed(2)}px`,
                height: `${+tileH.toFixed(2)}px`,
                transformStyle: "preserve-3d",
                animation: `${orbit} ${duration}s linear ${-t * speed}s infinite`,
                animationPlayState: isInView ? "running" : "paused",
              }}
              onAnimationIteration={(e) => {
                const lap = Math.round(e.elapsedTime / duration);
                setShown((prev) => {
                  const next = lap * columns + first;
                  return prev[t] === next ? prev : { ...prev, [t]: next };
                });
              }}
            >
              {Array.from({ length: SLICES }, (_, k) => (
                <div
                  key={k}
                  className={cn(
                    "absolute top-0 overflow-hidden bg-slate-200/50 shadow-sm",
                    k === 0 && "rounded-l-xl",
                    k === SLICES - 1 && "rounded-r-xl",
                  )}
                  style={{
                    left: `${+(((aspectRatio - share) / 2) * tileH).toFixed(2)}px`,
                    width: `${+(k === SLICES - 1 ? sliceW : sliceW + 1.2).toFixed(2)}px`,
                    height: `${+tileH.toFixed(2)}px`,
                    transform: turn((aspectRatio / 2 - (k + 0.5) * share) * unit),
                  }}
                >
                  {img?.src ? (
                    <img
                      src={img.src}
                      alt={k === 0 ? (img.alt ?? "Project Infrastructure") : ""}
                      draggable={false}
                      loading="lazy"
                      decoding="async"
                      className="absolute top-0 max-w-none object-cover pointer-events-none select-none"
                      style={{
                        left: `${+(-k * sliceW).toFixed(2)}px`,
                        width: `${+tileW.toFixed(2)}px`,
                        height: `${+tileH.toFixed(2)}px`,
                      }}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {children}
    </div>
  );
}

export default TiltedGridHero;
