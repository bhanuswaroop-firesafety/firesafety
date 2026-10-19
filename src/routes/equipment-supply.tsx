import { createFileRoute } from "@tanstack/react-router";
import { EquipmentSupplyServicePage } from "./services.equipment-supply";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/equipment-supply")({
  head: () =>
    seoHead({
      title: "Certified Safety Equipment Supply | Sri Udharchi Enterprises",
      description:
        "Wholesale supply of BIS/ISI certified fire extinguishers, fire hoses, landing valves, fire pumps, personal protective equipment (PPE), and safety signage.",
      path: "/services/equipment-supply", // Canonical points to primary service URL
    }),
  component: EquipmentSupplyServicePage,
});
