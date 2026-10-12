import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { AuthProvider } from "../lib/auth-context";
import { CartProvider } from "../lib/cart-context";
import { CartDrawer } from "../components/cart-drawer";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { logAppError } from "../lib/error-logger";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    logAppError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Sri Udharchi Enterprises | Certified Fire Safety Products & Systems" },
      {
        name: "description",
        content:
          "Leading distributor of certified fire safety products and turnkey fire protection engineering in Andhra Pradesh & India. Buy fire extinguishers, hydrants, fire pumps, and industrial PPE gear.",
      },
      {
        name: "keywords",
        content:
          "fire safety products, fire safety product, fire safety equipment, fire extinguishers, fire protection systems, industrial safety products, Sri Udharchi Enterprises",
      },
      { name: "theme-color", content: "#1e3a5f" },
      { name: "geo.region", content: "IN-AP" },
      { name: "geo.placename", content: "Palasamudram, Andhra Pradesh" },
      { name: "geo.position", content: "14.6519;77.6006" },
      { name: "ICBM", content: "14.6519, 77.6006" },
      { property: "og:site_name", content: "Sri Udharchi Enterprises" },
      { property: "og:title", content: "Sri Udharchi Enterprises | Fire & Industrial Safety" },
      {
        property: "og:description",
        content:
          "Turnkey fire fighting systems, statutory inspections, hydro-testing, AMC maintenance, and certified industrial safety supplies.",
      },
      { property: "og:image", content: "https://sriudharchi.com/sri-udharchi-enterprises-logo.png" },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "en_IN" },
      { name: "author", content: "Sri Udharchi Enterprises" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Sri Udharchi Enterprises | Fire & Safety" },
      {
        name: "twitter:description",
        content:
          "Turnkey fire fighting systems, statutory inspections, hydro-testing, and certified industrial safety equipment.",
      },
      { name: "twitter:image", content: "https://sriudharchi.com/sri-udharchi-enterprises-logo.png" },
    ],
    links: [
      { rel: "canonical", href: "https://sriudharchi.com/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@600;700;800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", href: "/sri-udharchi-enterprises-logo.png", type: "image/png" },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "WebSite",
              "@id": "https://sriudharchi.com/#website",
              url: "https://sriudharchi.com",
              name: "Sri Udharchi Enterprises",
              description:
                "Leading fire fighting engineering contractor and industrial safety distributor in Andhra Pradesh.",
              publisher: {
                "@id": "https://sriudharchi.com/#business",
              },
            },
            {
              "@type": "LocalBusiness",
              "@id": "https://sriudharchi.com/#business",
              name: "Sri Udharchi Enterprises",
              image: "https://sriudharchi.com/sri-udharchi-enterprises-logo.png",
              description:
                "Certified fire protection systems, industrial safety equipment, fire hydrants, gas suppression, and turnkey AMC maintenance in Andhra Pradesh and Pan-India.",
              telephone: "+918639858221",
              email: "sriudharchienterprises@gmail.com",
              url: "https://sriudharchi.com",
              address: {
                "@type": "PostalAddress",
                streetAddress: "H-7, Kubera Hills",
                addressLocality: "Palasamudram",
                addressRegion: "Andhra Pradesh",
                postalCode: "515241",
                addressCountry: "IN",
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 14.6519,
                longitude: 77.6006,
              },
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: [
                    "Monday",
                    "Tuesday",
                    "Wednesday",
                    "Thursday",
                    "Friday",
                    "Saturday",
                  ],
                  opens: "09:00",
                  closes: "19:00",
                },
              ],
              areaServed: ["Andhra Pradesh", "Telangana", "Odisha", "India"],
              priceRange: "$$",
            },
          ],
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
            <Outlet />
            <CartDrawer />
            <Toaster richColors position="top-right" />
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MotionConfig>
  );
}
