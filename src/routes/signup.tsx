import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
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
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
      const redirect = params?.get("redirect");
      if (redirect && redirect.startsWith("/") && redirect !== "/signup" && redirect !== "/login") {
        window.location.href = redirect;
      } else {
        navigate({ to: "/" });
      }
    }
  }, [user, navigate]);

  return <LoginPage initialMode="signup" />;
}

export default SignupPage;
