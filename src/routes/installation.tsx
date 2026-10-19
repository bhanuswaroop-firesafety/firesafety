import { createFileRoute } from "@tanstack/react-router";
import { InstallationServicePage } from "./services.installation";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/installation")({
  head: () =>
    seoHead({
      title: "Fire Safety System Installation | Sri Udharchi Enterprises",
      description:
        "Complete installation of fire hydrant systems, automatic sprinkler networks, fire alarm panels, gas suppression systems, and industrial CCTV.",
      path: "/services/installation", // Canonical points to primary service URL
    }),
  component: InstallationServicePage,
});
