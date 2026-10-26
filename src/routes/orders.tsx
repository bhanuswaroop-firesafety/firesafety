import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "./login";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/orders")({
  head: () =>
    seoHead({
      title: "My Orders & Tax Invoices | Sri Udharchi Enterprises",
      description:
        "View and manage your industrial fire protection orders, proforma invoices, delivery progress, and safety compliance certificates.",
      path: "/orders",
      noIndex: true,
    }),
  component: OrdersPageRoute,
});

export function OrdersPageRoute() {
  return <LoginPage initialTab="orders" />;
}

export default OrdersPageRoute;
