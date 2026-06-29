import { useNavigate } from "react-router-dom";
import { useStore } from "@/src/store/store";
import { usePortalStore } from "@/src/store/usePortalStore";
import { Button } from "@/src/components/ui/Button";
import { AccountLayout } from "@/src/components/account/AccountLayout";
import { NotificationSettings } from "@/src/components/settings/NotificationSettings";
import { ChangePasswordForm } from "@/src/components/account/ChangePasswordForm";

const fieldLabel = "text-[10px] font-semibold uppercase tracking-[0.14em] text-offgrid-green/45";

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className={fieldLabel}>{label}</dt>
      <dd className="mt-1 break-words font-medium text-offgrid-green">{value}</dd>
    </div>
  );
}

export function CustomerProfilePage() {
  const navigate = useNavigate();
  const user = usePortalStore((state) => state.currentUser);
  const shipping = useStore((state) => state.shippingInfo);

  return (
    <AccountLayout
      active="profile"
      eyebrow="Account details"
      title="Account details"
      description="Your sign-in identity and the shipping snapshot saved from your last checkout."
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-offgrid-green/[0.08]">
          <h2 className="font-display text-lg font-bold text-offgrid-green">Account identity</h2>
          <dl className="mt-5 space-y-4">
            <Field label="Name" value={user?.name ?? "N/A"} />
            <Field label="Email" value={user?.email ?? "N/A"} />
            <Field label="Role" value={user?.role ? user.role[0].toUpperCase() + user.role.slice(1) : "N/A"} />
          </dl>
        </section>

        <section className="min-w-0 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-offgrid-green/[0.08]">
          <h2 className="font-display text-lg font-bold text-offgrid-green">Saved shipping snapshot</h2>
          <dl className="mt-5 space-y-4">
            <Field label="Full name" value={shipping.fullName || "Not set"} />
            <Field label="Phone" value={shipping.phone || "Not set"} />
            <Field label="Street address" value={shipping.address || "Not set"} />
            <Field label="Barangay" value={shipping.barangay || "Not set"} />
            <Field label="Region" value={shipping.region || "Not set"} />
            <Field
              label="City / province"
              value={[shipping.city, shipping.province].filter(Boolean).join(", ") || "Not set"}
            />
            <Field label="ZIP" value={shipping.zip || "Not set"} />
          </dl>
          <Button className="mt-6 w-full sm:w-auto" variant="outline" onClick={() => navigate("/shop")}>
            Update on next checkout
          </Button>
        </section>

        <NotificationSettings />
        <ChangePasswordForm />
      </div>
    </AccountLayout>
  );
}
