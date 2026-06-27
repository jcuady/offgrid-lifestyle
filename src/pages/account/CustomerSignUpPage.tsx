import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LockKeyhole, UserRound, Mail } from "lucide-react";
import { Button } from "@/src/components/ui/Button";
import { isValidEmail } from "@/src/lib/formValidation";
import { CUSTOMER_SIGN_IN_PATH } from "@/src/lib/authRoutes";
import { usePortalStore } from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";
import { AuthErrorBanner, AuthField, AuthShell, authInputProps } from "@/src/components/auth/AuthShell";

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
    <AuthShell
      variant="customer-sign-up"
      title="Create your account"
      description="Register to track shop orders, custom requests, and delivery status."
      footer={
        <p className="text-center text-offgrid-green/60">
          Already have an account?{" "}
          <Link to={CUSTOMER_SIGN_IN_PATH} className="font-semibold text-offgrid-green hover:underline">
            Sign in
          </Link>
        </p>
      }
    >
      <div className="space-y-4">
        <AuthField label="Full name" icon={<UserRound className="h-3.5 w-3.5" />} error={errors.name}>
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            {...authInputProps()}
          />
        </AuthField>

        <AuthField label="Email" icon={<Mail className="h-3.5 w-3.5" />} error={errors.email}>
          <input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...authInputProps()}
          />
        </AuthField>

        <AuthField label="Password" icon={<LockKeyhole className="h-3.5 w-3.5" />} error={errors.password}>
          <input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            {...authInputProps()}
          />
        </AuthField>

        <AuthField
          label="Confirm password"
          icon={<LockKeyhole className="h-3.5 w-3.5" />}
          error={errors.confirmPassword}
        >
          <input
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            {...authInputProps()}
          />
        </AuthField>

        <p className="text-[11px] leading-relaxed text-offgrid-green/50">
          By creating an account you can track orders placed with this email. Passwords are stored locally in this MVP
          build — production will use secure auth.
        </p>

        <Button size="lg" className="w-full" onClick={handleSubmit}>
          Create account
        </Button>
      </div>

      {errors.form ? (
        <div className="mt-4">
          <AuthErrorBanner message={errors.form} />
        </div>
      ) : null}
    </AuthShell>
  );
}
