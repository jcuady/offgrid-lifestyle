import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  formatPhilippinePhoneInput,
  isValidEmail,
  isValidPhone,
  normalizePhilippinePhone,
  validatePassword,
  validateTermsAccepted,
} from "@/src/lib/formValidation";
import { AUTH_ACCOUNT_EXISTS } from "@/src/lib/authErrors";
import { CUSTOMER_SIGN_IN_PATH } from "@/src/lib/authRoutes";
import { subscribePendingSignupTab } from "@/src/lib/authTabSync";
import { usePortalStore } from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";
import { AuthPage } from "@/src/components/ui/auth-page";

export function CustomerSignUpPage() {
  const navigate = useNavigate();
  const currentUser = usePortalStore((state) => state.currentUser);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    name?: string;
    phone?: string;
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

  useEffect(() => {
    if (!pendingEmail) return;
    return subscribePendingSignupTab(() => {
      navigate("/account/orders", { replace: true });
    });
  }, [pendingEmail, navigate]);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Full name is required.";
    if (!isValidPhone(phone)) next.phone = "Enter a valid Philippine mobile number (e.g. +63 917 000 0000).";
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

    const normalizedEmail = email.trim().toLowerCase();
    const result = await localAuthService.registerCustomer({
      name: name.trim(),
      phone: normalizePhilippinePhone(phone),
      email: normalizedEmail,
      password,
    });
    if (!result.ok) {
      const exists = result.code === "email_exists" || result.message === AUTH_ACCOUNT_EXISTS;
      setErrors({
        email: exists ? AUTH_ACCOUNT_EXISTS : undefined,
        form: result.message ?? "Unable to create account.",
      });
      return;
    }

    if (result.emailConfirmationRequired) {
      setPendingEmail(normalizedEmail);
      return;
    }

    navigate("/account/orders", { replace: true });
  };

  if (pendingEmail) {
    return (
      <AuthPage
        mode="sign-in"
        title="Check your email"
        description={`We sent a confirmation link to ${pendingEmail}. Open it to activate your account — you'll land on your orders automatically.`}
        email=""
        password=""
        hideEmail
        hidePassword
        onEmailChange={() => {}}
        onPasswordChange={() => {}}
        onSubmit={() => navigate(`${CUSTOMER_SIGN_IN_PATH}?email=${encodeURIComponent(pendingEmail)}`)}
        submitLabel="Go to sign in"
        alternateLink={{
          prompt: "Didn't receive the email?",
          label: "Try again",
          href: "/account/sign-up",
        }}
      />
    );
  }

  const signInHref = email.trim()
    ? `${CUSTOMER_SIGN_IN_PATH}?email=${encodeURIComponent(email.trim().toLowerCase())}`
    : CUSTOMER_SIGN_IN_PATH;

  return (
    <AuthPage
      mode="sign-up"
      title="Create your account"
      description="Register to track shop orders, custom requests, and delivery status."
      name={name}
      phone={phone}
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      onNameChange={setName}
      onPhoneChange={(value) => setPhone(formatPhilippinePhoneInput(value))}
      onEmailChange={(value) => {
        setEmail(value);
        if (errors.email || errors.form) setErrors((prev) => ({ ...prev, email: undefined, form: undefined }));
      }}
      onPasswordChange={setPassword}
      onConfirmPasswordChange={setConfirmPassword}
      acceptedTerms={acceptedTerms}
      onAcceptedTermsChange={setAcceptedTerms}
      onSubmit={handleSubmit}
      fieldErrors={errors}
      alternateLink={{
        prompt: "Already have an account?",
        label: "Sign in",
        href: signInHref,
      }}
    />
  );
}
