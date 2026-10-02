import { createFileRoute } from "@tanstack/react-router";
import { MaintenanceServicePage } from "./services.maintenance";

export const Route = createFileRoute("/maintenance")({
  head: () => ({
    meta: [
      { title: "AMC & Preventive Maintenance | Sri Udharchi Enterprises" },
      {
        name: "description",
        content:
          "Annual Maintenance Contracts (AMC), periodic extinguisher refilling, diesel fire pump service, and 24/7 on-call emergency response across India.",
      },
    ],
  }),
  component: MaintenanceServicePage,
});
