import { createFileRoute, Navigate } from "@tanstack/react-router";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/payment")({
  head: () =>
    seoHead({
      title: "Payment Redirect | Sri Udharchi Enterprises",
      description: "Redirecting to checkout.",
      path: "/checkout",
      noIndex: true,
    }),
  component: () => <Navigate to="/checkout" replace />,
});
