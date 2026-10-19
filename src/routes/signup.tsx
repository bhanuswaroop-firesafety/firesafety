import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth-context";
import { seoHead } from "@/lib/seo";
import { Signup1 } from "@/components/ui/signup-1";
import { PhoneOtpModal } from "@/components/phone-otp-modal";

export const Route = createFileRoute("/signup")({
  head: () =>
    seoHead({
      title: "Create an Account | Sri Udharchi Enterprises",
      description:
        "Register for Sri Udharchi Enterprises portal to track quotations, manage safety equipment orders, and access inspection records.",
      path: "/signup",
      noIndex: true,
    }),
  component: SignupPage,
});

export function SignupPage() {
  const { user, registerWithEmail, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);

  // If already authenticated, redirect
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

  const handleSignupSubmit = async (
    e: FormEvent,
    data: { email: string; password: string; name?: string },
  ) => {
    setErrorMsg("");
    setSuccessMsg("");

    const targetEmail = data.email.trim();
    const targetPassword = data.password;

    if (!targetEmail) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (targetPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const fallbackName = targetEmail.split("@")[0] || "Client";
      await registerWithEmail(targetEmail, targetPassword, fallbackName);
      setSuccessMsg("Account created successfully! Redirecting...");
      setTimeout(() => {
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const redirect = params?.get("redirect");
        if (redirect && redirect.startsWith("/") && redirect !== "/signup" && redirect !== "/login") {
          window.location.href = redirect;
        } else {
          navigate({ to: "/" });
        }
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg
          .replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim(),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);
    try {
      await loginWithGoogle();
      setSuccessMsg("Signed in with Google! Redirecting...");
      setTimeout(() => {
        const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
        const redirect = params?.get("redirect");
        if (redirect && redirect.startsWith("/") && redirect !== "/signup" && redirect !== "/login") {
          window.location.href = redirect;
        } else {
          navigate({ to: "/" });
        }
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(
        msg
          .replace("Firebase: ", "")
          .replace(/\(auth\/[^)]+\)/, "")
          .trim(),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Signup1
        mode="signup"
        heading="Create an account"
        logo={{
          url: "/",
          src: "/sri-udharchi-enterprises-logo.png",
          alt: "Sri Udharchi Enterprises",
          title: "Sri Udharchi Enterprises",
        }}
        signupText="Create an account"
        googleText="Sign up with Google"
        loginText="Already have an account?"
        loginUrl="/login"
        linkLabel="Login"
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSignupSubmit}
        onGoogleClick={handleGoogleAuth}
        onPhoneOtpClick={() => setShowPhoneOtp(true)}
        isLoading={loading}
        errorMessage={errorMsg}
        successMessage={successMsg}
      />

      <PhoneOtpModal
        isOpen={showPhoneOtp}
        onClose={() => setShowPhoneOtp(false)}
        onSuccess={() => {
          setShowPhoneOtp(false);
          navigate({ to: "/" });
        }}
        title="Mobile Phone Registration"
        subtitle="Verify your mobile number via 6-digit SMS OTP"
      />
    </>
  );
}

export default SignupPage;
