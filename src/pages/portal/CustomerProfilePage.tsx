import { useStore } from "@/src/store/store";
import { usePortalStore } from "@/src/store/usePortalStore";
import { Button } from "@/src/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { AccountPageShell } from "@/src/components/account/AccountPageShell";

export function CustomerProfilePage() {
  const navigate = useNavigate();
  const user = usePortalStore((state) => state.currentUser);
  const shipping = useStore((state) => state.shippingInfo);

  return (
    <AccountPageShell
      title="Account details"
      description="Your sign-in identity and the shipping snapshot saved from your last checkout."
      contentClassName="-mt-10 sm:-mt-12"
    >
      <div className="grid gap-5 sm:gap-6 lg:grid-cols-2">
        <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10 sm:p-6">
          <h2 className="text-lg font-display font-bold text-offgrid-green sm:text-xl">Account identity</h2>
          <dl className="mt-4 space-y-3 text-sm text-offgrid-green/80">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Name</dt>
              <dd className="mt-1 font-medium text-offgrid-green">{user?.name ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Email</dt>
              <dd className="mt-1 break-all font-medium text-offgrid-green">{user?.email ?? "N/A"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Role</dt>
              <dd className="mt-1 font-medium capitalize text-offgrid-green">{user?.role ?? "N/A"}</dd>
            </div>
          </dl>
        </section>

        <section className="min-w-0 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10 sm:p-6">
          <h2 className="text-lg font-display font-bold text-offgrid-green sm:text-xl">Saved shipping snapshot</h2>
          <dl className="mt-4 space-y-3 text-sm text-offgrid-green/80">
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Full name</dt>
              <dd className="mt-1 font-medium text-offgrid-green">{shipping.fullName || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Phone</dt>
              <dd className="mt-1 break-all font-medium text-offgrid-green">{shipping.phone || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">Address</dt>
              <dd className="mt-1 font-medium text-offgrid-green">{shipping.address || "Not set"}</dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">City / province</dt>
              <dd className="mt-1 font-medium text-offgrid-green">
                {[shipping.city, shipping.province].filter(Boolean).join(", ") || "Not set"}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] font-semibold uppercase tracking-[0.12em] text-offgrid-green/45">ZIP</dt>
              <dd className="mt-1 font-medium text-offgrid-green">{shipping.zip || "Not set"}</dd>
            </div>
          </dl>
          <Button className="mt-6 w-full sm:w-auto" variant="outline" onClick={() => navigate("/shop")}>
            Update on next checkout
          </Button>
        </section>
      </div>
    </AccountPageShell>
  );
}
