import { useState, type FormEvent } from "react";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff, Loader2, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Signup1Props {
  mode?: "signup" | "login";
  heading?: string;
  logo?: {
    url?: string;
    src?: string;
    alt?: string;
    title?: string;
  };
  signupText?: string;
  googleText?: string;
  loginText?: string;
  loginUrl?: string;
  linkLabel?: string;
  // Controlled or optional form state
  email?: string;
  password?: string;
  name?: string;
  phone?: string;
  onEmailChange?: (val: string) => void;
  onPasswordChange?: (val: string) => void;
  onNameChange?: (val: string) => void;
  onPhoneChange?: (val: string) => void;
  onSubmit?: (
    e: FormEvent,
    data: { email: string; password: string; name?: string; phone?: string },
  ) => void | Promise<void>;
  onGoogleClick?: () => void | Promise<void>;
  onPhoneOtpClick?: () => void;
  isLoading?: boolean;
  errorMessage?: string;
  successMessage?: string;
  showNameField?: boolean;
  showPhoneField?: boolean;
}

const DEFAULT_LOGO = {
  url: "/",
  src: "/sri-udharchi-enterprises-logo.png",
  alt: "Sri Udharchi Enterprises",
  title: "Sri Udharchi Enterprises",
};

const Signup1 = ({
  mode = "signup",
  heading,
  logo = DEFAULT_LOGO,
  googleText,
  signupText,
  loginText,
  loginUrl,
  linkLabel,
  email: controlledEmail,
  password: controlledPassword,
  name: controlledName,
  phone: controlledPhone,
  onEmailChange,
  onPasswordChange,
  onNameChange,
  onPhoneChange,
  onSubmit,
  onGoogleClick,
  onPhoneOtpClick,
  isLoading = false,
  errorMessage,
  successMessage,
  showNameField = false,
  showPhoneField = false,
}: Signup1Props) => {
  const isLogin = mode === "login";

  // Internal state when uncontrolled
  const [internalEmail, setInternalEmail] = useState("");
  const [internalPassword, setInternalPassword] = useState("");
  const [internalName, setInternalName] = useState("");
  const [internalPhone, setInternalPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const emailValue = controlledEmail !== undefined ? controlledEmail : internalEmail;
  const passwordValue = controlledPassword !== undefined ? controlledPassword : internalPassword;
  const nameValue = controlledName !== undefined ? controlledName : internalName;
  const phoneValue = controlledPhone !== undefined ? controlledPhone : internalPhone;

  const handleEmailChange = (val: string) => {
    if (onEmailChange) onEmailChange(val);
    else setInternalEmail(val);
  };

  const handlePasswordChange = (val: string) => {
    if (onPasswordChange) onPasswordChange(val);
    else setInternalPassword(val);
  };

  const handleNameChange = (val: string) => {
    if (onNameChange) onNameChange(val);
    else setInternalName(val);
  };

  const handlePhoneChange = (val: string) => {
    if (onPhoneChange) onPhoneChange(val);
    else setInternalPhone(val);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(e, {
        email: emailValue,
        password: passwordValue,
        name: nameValue,
        phone: phoneValue,
      });
    }
  };

  // Dynamic text defaults based on mode
  const resolvedHeading =
    heading ?? (isLogin ? "Welcome back" : "Create an account");
  const resolvedSignupText =
    signupText ?? (isLogin ? "Sign in" : "Create an account");
  const resolvedGoogleText =
    googleText ?? (isLogin ? "Sign in with Google" : "Sign up with Google");
  const resolvedLoginText =
    loginText ?? (isLogin ? "Don't have an account?" : "Already have an account?");
  const resolvedLoginUrl =
    loginUrl ?? (isLogin ? "/signup" : "/login");
  const resolvedLinkLabel =
    linkLabel ?? (isLogin ? "Sign up" : "Login");

  return (
    <section className="relative min-h-screen bg-muted/50 text-foreground flex items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Ambient Red Glow in Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 size-96 rounded-full bg-red-500/10 blur-[130px]" />
        <div className="absolute bottom-10 right-10 size-80 rounded-full bg-red-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 flex h-full w-full items-center justify-center">
        <div className="border-border bg-card/95 backdrop-blur-md flex w-full max-w-sm flex-col items-center gap-y-6 rounded-2xl border px-6 py-10 shadow-2xl transition-all">
          
          {/* Logo & Heading: DIRECT BRAND LOGO, NO BRAND TEXT */}
          <div className="flex flex-col items-center gap-y-3 w-full">
            <div className="flex items-center justify-center">
              <a
                href={logo.url || "/"}
                aria-label={logo.alt || "Sri Udharchi Enterprises"}
                className="inline-flex items-center justify-center transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-md"
              >
                <img
                  src={logo.src || DEFAULT_LOGO.src}
                  alt={logo.alt || DEFAULT_LOGO.alt}
                  title={logo.title || DEFAULT_LOGO.title}
                  className="h-12 w-auto max-w-[200px] object-contain select-none"
                />
              </a>
            </div>
            {resolvedHeading && (
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground text-center">
                {resolvedHeading}
              </h1>
            )}
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="w-full rounded-lg border border-red-200 bg-red-50/90 dark:border-red-900/50 dark:bg-red-950/40 p-3 text-xs text-red-700 dark:text-red-300 animate-in fade-in">
              <p className="font-medium text-center">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="w-full rounded-lg border border-emerald-200 bg-emerald-50/90 dark:border-emerald-900/50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-700 dark:text-emerald-300 animate-in fade-in">
              <p className="font-medium text-center">{successMessage}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
            <div className="flex flex-col gap-4">
              {showNameField && !isLogin && (
                <div className="flex flex-col gap-1.5">
                  <Input
                    type="text"
                    placeholder="Full Name"
                    required
                    value={nameValue}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="h-10 rounded-lg border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:border-red-600 transition-all text-sm"
                  />
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Input
                  type="email"
                  placeholder="Email *"
                  autoComplete="email"
                  required
                  value={emailValue}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  className="h-10 rounded-lg border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:border-red-600 transition-all text-sm"
                />
              </div>

              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <Input
                    type="tel"
                    placeholder="Mobile Number *"
                    autoComplete="tel"
                    required
                    value={phoneValue}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="h-10 rounded-lg border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:border-red-600 transition-all text-sm"
                  />
                </div>
              )}

              <div className="relative flex flex-col gap-1.5">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  autoComplete={isLogin ? "current-password" : "new-password"}
                  required
                  value={passwordValue}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className="h-10 pr-10 rounded-lg border-input bg-background/50 focus-visible:ring-2 focus-visible:ring-red-500/40 focus-visible:border-red-600 transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                {/* Theme Red Primary Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-10 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold rounded-lg shadow-md shadow-red-600/25 transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-red-500"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    resolvedSignupText
                  )}
                </Button>

                {/* Google Sign In Button */}
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={onGoogleClick}
                  className="w-full h-10 border-border bg-background hover:bg-red-50/50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-900 rounded-lg font-medium text-foreground transition-all cursor-pointer shadow-xs"
                >
                  <FcGoogle className="mr-2 size-5 shrink-0" />
                  <span>{resolvedGoogleText}</span>
                </Button>

                {/* Optional Phone OTP Trigger */}
                {onPhoneOtpClick && (
                  <button
                    type="button"
                    onClick={onPhoneOtpClick}
                    className="text-xs text-muted-foreground hover:text-red-600 font-medium transition-colors flex items-center justify-center gap-1.5 pt-1 cursor-pointer"
                  >
                    <Smartphone className="size-3.5" />
                    <span>Or sign in with Mobile SMS OTP</span>
                  </button>
                )}
              </div>
            </div>
          </form>

          {/* Bottom Switcher */}
          <div className="text-muted-foreground flex items-center justify-center gap-1.5 text-xs sm:text-sm">
            <p>{resolvedLoginText}</p>
            <a
              href={resolvedLoginUrl}
              className="text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 font-semibold hover:underline transition-colors"
            >
              {resolvedLinkLabel}
            </a>
          </div>

        </div>
      </div>
    </section>
  );
};

// Convenience component for Login
const Login1 = (props: Signup1Props) => {
  return <Signup1 mode="login" {...props} />;
};

// Demo component matching prompt
const DemoOne = () => {
  return <Signup1 />;
};

export { Signup1, Login1, DemoOne };
export default Signup1;
