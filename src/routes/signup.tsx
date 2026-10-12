import { createFileRoute } from "@tanstack/react-router";
import { LoginPage } from "./login";
import { seoHead } from "@/lib/seo";

export const Route = createFileRoute("/signup")({
  head: () =>
    seoHead({
      title: "Create Client Account | Sri Udharchi Enterprises",
      description:
        "Register for Sri Udharchi Enterprises B2B portal to track quotations, manage safety equipment orders, and access inspection records.",
      path: "/signup",
      noIndex: true,
    }),
  component: SignupPage,
});

export function SignupPage() {
  return <LoginPage initialMode="signup" />;
}
