import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import {
  Bell,
  ChevronRight,
  Loader2,
  Lock,
  Mail,
  MapPin,
  UserRound,
} from "lucide-react";
import { useStore } from "@/src/store/store";
import { usePortalStore } from "@/src/store/usePortalStore";
import { Button } from "@/src/components/ui/Button";
import { AccountLayout } from "@/src/components/account/AccountLayout";
import { NotificationSettings } from "@/src/components/settings/NotificationSettings";
import { ChangePasswordForm } from "@/src/components/account/ChangePasswordForm";
import { ChangeEmailForm } from "@/src/components/account/ChangeEmailForm";
import {
  formatPhilippinePhoneInput,
  normalizeShippingInfo,
  sanitizeShippingInfo,
  validateShippingInfoFields,
  type ShippingFieldErrors,
} from "@/src/lib/formValidation";
import { EMPTY_SHIPPING_INFO, type ShippingInfo } from "@/src/types/commerce";
import { saveCustomerShipping } from "@/src/services/customerShippingService";
import { accountPanel } from "@/src/lib/brandLayout";
import { cn } from "@/src/lib/utils";

const PhilippinesAddressFields = lazy(() =>
  import("@/src/components/checkout/PhilippinesAddressFields").then((m) => ({
    default: m.PhilippinesAddressFields,
  })),
);

const fieldLabel = "text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45";

const inputClass =
  "min-h-11 w-full rounded-xl border border-offgrid-green/20 bg-white px-3 py-2.5 text-base text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25";

const PROFILE_JUMP = [
  { id: "shipping", label: "Shipping details", hint: "Checkout autofill address", icon: MapPin },
  { id: "notifications", label: "Push notifications", hint: "Order and delivery alerts", icon: Bell },
  { id: "email", label: "Change email", hint: "Update sign-in email", icon: Mail },
  { id: "password", label: "Change password", hint: "Keep your account secure", icon: Lock },
] as const;

function contactInputClass(hasError: boolean) {
  return cn(inputClass, hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/20");
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={fieldLabel}>{label}</dt>
      <dd className="mt-1 break-words font-medium text-offgrid-green">{value}</dd>
    </div>
  );
}

export function CustomerProfilePage() {
  const user = usePortalStore((state) => state.currentUser);
  const shipping = useStore((state) => state.shippingInfo);

  const [formData, setFormData] = useState<ShippingInfo>(() =>
    normalizeShippingInfo({
      ...shipping,
      fullName: shipping.fullName || user?.name || "",
      email: shipping.email || user?.email || "",
    }),
  );
  const [fieldErrors, setFieldErrors] = useState<ShippingFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(
      normalizeShippingInfo({
        ...shipping,
        fullName: shipping.fullName || user?.name || "",
        email: shipping.email || user?.email || "",
      }),
    );
  }, [shipping, user?.name, user?.email]);

  const clearFieldError = (field: keyof ShippingFieldErrors) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormError(null);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== "customer") {
      setFormError("Sign in as a customer to save shipping details.");
      return;
    }

    const sanitized = sanitizeShippingInfo(normalizeShippingInfo(formData));
    const errors = validateShippingInfoFields(sanitized);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setFormError(Object.values(errors)[0] ?? "Complete all shipping fields.");
      setMessage(null);
      return;
    }

    setSaving(true);
    setFormError(null);
    setMessage(null);
    try {
      const result = await saveCustomerShipping(user.id, sanitized);
      if (result.ok === false) {
        setFormError(result.message);
        return;
      }
      setFormData(sanitized);
      setFieldErrors({});
      setMessage("Shipping details saved. They’ll autofill on your next checkout.");
    } finally {
      setSaving(false);
    }
  };

  const handleClearLocal = () => {
    setFormData(
      normalizeShippingInfo({
        ...EMPTY_SHIPPING_INFO,
        fullName: user?.name || "",
        email: user?.email || "",
      }),
    );
    setFieldErrors({});
    setFormError(null);
    setMessage(null);
  };

  const shippingReady = Boolean(
    shipping.fullName?.trim() &&
      shipping.phone?.trim() &&
      shipping.address?.trim() &&
      shipping.city?.trim(),
  );

  return (
    <AccountLayout
      active="profile"
      eyebrow="Account details"
      title="Account details"
      description="Your sign-in identity and the shipping address we use to autofill checkout."
    >
      {/* Mobile jump list — app-profile pattern */}
      <nav
        aria-label="Profile sections"
        className="mb-5 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-offgrid-green/[0.08] lg:hidden"
      >
        {PROFILE_JUMP.map((item, index) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              className={cn(
                "flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3.5 transition-colors duration-200 hover:bg-offgrid-cream/50",
                index > 0 && "border-t border-offgrid-green/[0.07]",
              )}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-offgrid-green/[0.06] text-offgrid-green">
                <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.75} />
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block text-sm font-semibold text-offgrid-green">{item.label}</span>
                <span className="block text-xs text-offgrid-green/50">{item.hint}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-offgrid-green/30" aria-hidden />
            </a>
          );
        })}
      </nav>

      {/* Quick facts */}
      <div className="mb-5 grid grid-cols-2 gap-2.5 sm:gap-3 lg:mb-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-offgrid-lime/15 px-3.5 py-3.5 sm:px-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">Role</p>
          <p className="mt-1 font-display text-base font-bold text-offgrid-green sm:text-lg">
            {user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : "—"}
          </p>
        </div>
        <div className="rounded-2xl bg-offgrid-green/[0.07] px-3.5 py-3.5 sm:px-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">Shipping</p>
          <p className="mt-1 font-display text-base font-bold text-offgrid-green sm:text-lg">
            {shippingReady ? "Saved" : "Not set"}
          </p>
        </div>
        <div className="col-span-2 rounded-2xl bg-offgrid-gold/15 px-3.5 py-3.5 sm:px-4 lg:col-span-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/50">Email</p>
          <p className="mt-1 truncate font-display text-base font-bold text-offgrid-green sm:text-lg">
            {user?.email ?? "—"}
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className={cn(accountPanel, "hidden lg:block")}>
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-offgrid-green/[0.06] text-offgrid-green">
              <UserRound className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <h2 className="font-display text-lg font-bold text-offgrid-green">Account identity</h2>
          </div>
          <dl className="mt-5 space-y-4">
            <Field label="Name" value={user?.name ?? "N/A"} />
            <Field label="Email" value={user?.email ?? "N/A"} />
            <Field label="Role" value={user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : "N/A"} />
          </dl>
        </section>

        <section id="shipping" className={cn(accountPanel, "scroll-mt-28 lg:col-span-2")}>
          <div>
            <h2 className="font-display text-lg font-bold text-offgrid-green">Shipping details</h2>
            <p className="mt-1 text-sm text-offgrid-green/60">
              Save once — checkout and custom orders will use this address next time.
            </p>
          </div>

          <form onSubmit={handleSave} className="mt-5 space-y-4" noValidate>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 sm:gap-4">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green sm:text-xs">
                  Full name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => {
                    setFormData({ ...formData, fullName: e.target.value });
                    clearFieldError("fullName");
                  }}
                  className={contactInputClass(Boolean(fieldErrors.fullName))}
                  placeholder="Juan Dela Cruz"
                  autoComplete="name"
                  aria-invalid={Boolean(fieldErrors.fullName)}
                />
                {fieldErrors.fullName ? (
                  <p className="mt-1 text-xs text-red-600" role="alert">
                    {fieldErrors.fullName}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green sm:text-xs">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    setFormData({ ...formData, email: e.target.value });
                    clearFieldError("email");
                  }}
                  className={contactInputClass(Boolean(fieldErrors.email))}
                  placeholder="juan@email.com"
                  autoComplete="email"
                  aria-invalid={Boolean(fieldErrors.email)}
                />
                {fieldErrors.email ? (
                  <p className="mt-1 text-xs text-red-600" role="alert">
                    {fieldErrors.email}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.15em] text-offgrid-green sm:text-xs">
                  Phone *
                </label>
                <input
                  type="tel"
                  required
                  inputMode="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      phone: formatPhilippinePhoneInput(e.target.value),
                    });
                    clearFieldError("phone");
                  }}
                  className={contactInputClass(Boolean(fieldErrors.phone))}
                  placeholder="+63 917 123 4567"
                  autoComplete="tel"
                  aria-invalid={Boolean(fieldErrors.phone)}
                />
                {fieldErrors.phone ? (
                  <p className="mt-1 text-xs text-red-600" role="alert">
                    {fieldErrors.phone}
                  </p>
                ) : null}
              </div>
            </div>

            <Suspense
              fallback={
                <p className="rounded-xl border border-offgrid-green/15 bg-offgrid-cream/40 px-4 py-6 text-sm text-offgrid-green/60">
                  Loading Philippines address options…
                </p>
              }
            >
              <PhilippinesAddressFields
                value={formData}
                onChange={setFormData}
                errors={fieldErrors}
                onClearError={clearFieldError}
              />
            </Suspense>

            {formError ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700" role="alert">
                {formError}
              </p>
            ) : null}
            {message ? (
              <p className="rounded-xl border border-offgrid-lime/30 bg-offgrid-lime/10 px-3 py-2.5 text-sm font-medium text-offgrid-green" role="status">
                {message}
              </p>
            ) : null}

            <div className="flex flex-col-reverse gap-2 border-t border-offgrid-green/10 pt-4 sm:flex-row sm:justify-end sm:gap-3">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={handleClearLocal} disabled={saving}>
                Clear form
              </Button>
              <Button type="submit" variant="default" className="w-full sm:w-auto" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save shipping details"
                )}
              </Button>
            </div>
          </form>
        </section>

        <div id="notifications" className="scroll-mt-28">
          <NotificationSettings />
        </div>
        <div id="email" className="scroll-mt-28">
          <ChangeEmailForm />
        </div>
        <div id="password" className="scroll-mt-28 lg:col-span-2">
          <ChangePasswordForm />
        </div>
      </div>
    </AccountLayout>
  );
}
