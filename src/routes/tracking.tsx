import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "./login";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/tracking")({
  head: () =>
    seoHead({
      title: "Live Order & Courier Tracking | Sri Udharchi Enterprises",
      description:
        "Track your fire safety equipment dispatch in real time with Blue Dart, Delhivery, DTDC, and direct carrier airway bill (AWB) tracking.",
      path: "/tracking",
      noIndex: false,
    }),
  component: TrackingPageRoute,
});

export function TrackingPageRoute() {
  return <LoginPage initialTab="tracking" />;
}

export default TrackingPageRoute;
