import { createFileRoute } from "@tanstack/react-router";
import { InspectionServicePage } from "./services.inspection";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/inspection")({
  head: () =>
    seoHead({
      title: "Testing, Inspection & Certification | Sri Udharchi Enterprises",
      description:
        "Statutory fire safety audits, extinguisher hydrostatic pressure testing, hydrant pump performance checks, and Form B safety compliance certificates.",
      path: "/services/inspection", // Canonical points to primary service URL
    }),
  component: InspectionServicePage,
});
