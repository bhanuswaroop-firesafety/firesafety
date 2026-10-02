import { createFileRoute } from "@tanstack/react-router";
import { ConsultationServicePage } from "./services.consultation";

export const Route = createFileRoute("/consultation")({
  head: () => ({
    meta: [
      { title: "Fire Safety Consultation & Audits | Sri Udharchi Enterprises" },
      {
        name: "description",
        content:
          "Professional fire safety risk assessment, NBC 2016 compliance consultation, fire department NOC approvals, and emergency evacuation plans.",
      },
    ],
  }),
  component: ConsultationServicePage,
});
