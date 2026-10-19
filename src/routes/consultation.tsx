import { createFileRoute } from "@tanstack/react-router";
import { ConsultationServicePage } from "./services.consultation";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/consultation")({
  head: () =>
    seoHead({
      title: "Fire Safety Consultation & Audits | Sri Udharchi Enterprises",
      description:
        "Professional fire safety risk assessment, NBC 2016 compliance consultation, fire department NOC approvals, and emergency evacuation plans.",
      path: "/services/consultation", // Canonical points to primary service URL
    }),
  component: ConsultationServicePage,
});
