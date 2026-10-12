import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceServicePage } from "./services.maintenance";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/maintenance")({
  head: () =>
    seoHead({
      title: "AMC & Preventive Maintenance | Sri Udharchi Enterprises",
      description:
        "Annual Maintenance Contracts (AMC), periodic extinguisher refilling, diesel fire pump service, and 24/7 on-call emergency response across India.",
      path: "/services/maintenance", // Canonical points to primary service URL
    }),
  component: MaintenanceServicePage,
});
