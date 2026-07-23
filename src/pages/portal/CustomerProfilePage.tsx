import { lazy, Suspense, useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
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
import { cn } from "@/src/lib/utils";

const PhilippinesAddressFields = lazy(() =>
  import("@/src/components/checkout/PhilippinesAddressFields").then((m) => ({
    default: m.PhilippinesAddressFields,
  })),
);

const fieldLabel = "text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45";

const inputClass =
  "min-h-11 w-full rounded-xl border border-offgrid-green/20 bg-white px-3 py-2.5 text-base text-offgrid-green outline-none transition-all focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/25";

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

  return (
    <AccountLayout
      active="profile"
      eyebrow="Account details"
      title="Account details"
      description="Your sign-in identity and the shipping address we use to autofill checkout."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/[0.08] sm:p-6">
          <h2 className="font-display text-lg font-bold text-offgrid-green">Account identity</h2>
          <dl className="mt-5 space-y-4">
            <Field label="Name" value={user?.name ?? "N/A"} />
            <Field label="Email" value={user?.email ?? "N/A"} />
            <Field label="Role" value={user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : "N/A"} />
          </dl>
        </section>

        <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/[0.08] sm:p-6 lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="font-display text-lg font-bold text-offgrid-green">Shipping details</h2>
              <p className="mt-1 text-sm text-offgrid-green/60">
                Save once — checkout and custom orders will use this address next time.
              </p>
            </div>
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

        <NotificationSettings />
        <ChangeEmailForm />
        <ChangePasswordForm />
      </div>
    </AccountLayout>
  );
}
