import { createFileRoute } from "@tanstack/react-router";
import { EquipmentSupplyServicePage } from "./services.equipment-supply";

export const Route = createFileRoute("/equipment-supply")({
  head: () => ({
    meta: [
      { title: "Certified Safety Equipment Supply | Sri Udharchi Enterprises" },
      {
        name: "description",
        content:
          "Wholesale supply of BIS/ISI certified fire extinguishers, fire hoses, landing valves, fire pumps, personal protective equipment (PPE), and safety signage.",
      },
    ],
  }),
  component: EquipmentSupplyServicePage,
});
