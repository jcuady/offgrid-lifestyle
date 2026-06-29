import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isValidEmail, validatePassword, validateTermsAccepted } from "@/src/lib/formValidation";
import { CUSTOMER_SIGN_IN_PATH } from "@/src/lib/authRoutes";
import { usePortalStore } from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";
import { AuthPage } from "@/src/components/ui/auth-page";

export function CustomerSignUpPage() {
  const navigate = useNavigate();
  const currentUser = usePortalStore((state) => state.currentUser);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptedTerms?: string;
    form?: string;
  }>({});

  useEffect(() => {
    if (currentUser?.role === "customer") {
      navigate("/account/orders", { replace: true });
    }
  }, [currentUser, navigate]);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!isValidEmail(email)) next.email = "Enter a valid email address.";
    const passwordError = validatePassword(password);
    if (passwordError) next.password = passwordError;
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    const termsError = validateTermsAccepted(acceptedTerms);
    if (termsError) next.acceptedTerms = termsError;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const result = await localAuthService.registerCustomer({ name, email, password });
    if (!result.ok) {
      setErrors({ form: result.message ?? "Unable to create account." });
      return;
    }

    if (result.emailConfirmationRequired) {
      // Email confirmation required — show confirmation message, don't redirect
      setPendingEmail(email);
      return;
    }

    navigate("/account/orders", { replace: true });
  };

  // Email confirmation pending state
  if (pendingEmail) {
    return (
      <AuthPage
        mode="sign-in"
        title="Check your email"
        description={`We sent a confirmation link to ${pendingEmail}. Click it to activate your account, then sign in here.`}
        email={pendingEmail}
        password=""
        onEmailChange={() => {}}
        onPasswordChange={() => {}}
        onSubmit={() => navigate(CUSTOMER_SIGN_IN_PATH)}
        submitLabel="Go to sign in"
        alternateLink={{
          prompt: "Didn't receive the email?",
          label: "Try again",
          href: "/account/sign-up",
        }}
      />
    );
  }

  return (
    <AuthPage
      mode="sign-up"
      title="Create your account"
      description="Register to track shop orders, custom requests, and delivery status."
      name={name}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      onNameChange={setName}
      onEmailChange={setEmail}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      acceptedTerms={acceptedTerms}
      onAcceptedTermsChange={setAcceptedTerms}
      onSubmit={handleSubmit}
      fieldErrors={errors}
      alternateLink={{
        prompt: "Already have an account?",
        label: "Sign in",
        href: CUSTOMER_SIGN_IN_PATH,
      }}
    />
  );
}
