import { createFileRoute } from "@tanstack/react-router";
import { InspectionServicePage } from "./services.inspection";

export const Route = createFileRoute("/inspection")({
  head: () => ({
    meta: [
      { title: "Testing, Inspection & Certification | Sri Udharchi Enterprises" },
      {
        name: "description",
        content:
          "Statutory fire safety audits, extinguisher hydrostatic pressure testing, hydrant pump performance checks, and Form B safety compliance certificates.",
      },
    ],
  }),
  component: InspectionServicePage,
});
