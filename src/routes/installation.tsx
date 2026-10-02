import { createFileRoute } from "@tanstack/react-router";
import { InstallationServicePage } from "./services.installation";

export const Route = createFileRoute("/installation")({
  head: () => ({
    meta: [
      { title: "Fire Safety System Installation | Sri Udharchi Enterprises" },
      {
        name: "description",
        content:
          "Turnkey installation of fire hydrant systems, automatic sprinkler networks, fire alarm panels, gas suppression systems, and industrial CCTV.",
      },
    ],
  }),
  component: InstallationServicePage,
});
