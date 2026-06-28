import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isValidEmail } from "@/src/lib/formValidation";
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
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
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
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (password !== confirmPassword) next.confirmPassword = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const result = localAuthService.registerCustomer({ name, email, password });
    if (!result.ok) {
      setErrors({ form: result.message ?? "Unable to create account." });
      return;
    }

    navigate("/account/orders", { replace: true });
  };

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
