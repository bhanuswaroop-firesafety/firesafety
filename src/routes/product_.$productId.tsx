import { createFileRoute, Navigate } from "@tanstack/react-router";

function ProductRedirect() {
  const { productId } = Route.useParams();
  return <Navigate to="/products/$productId" params={{ productId }} replace />;
}

export const Route = createFileRoute("/product_/$productId")({
  component: ProductRedirect,
});
