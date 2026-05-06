import { useStore } from "@/src/store/store";
import { usePortalStore } from "@/src/store/usePortalStore";
import { Button } from "@/src/components/ui/Button";
import { useNavigate } from "react-router-dom";

export function CustomerProfilePage() {
  const navigate = useNavigate();
  const user = usePortalStore((state) => state.currentUser);
  const shipping = useStore((state) => state.shippingInfo);

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-green/45">
        Customer Profile
      </p>
      <h1 className="mt-2 text-4xl font-display font-black text-offgrid-green">Account Details</h1>
      <p className="mt-2 text-sm text-offgrid-green/60">
        Local profile and default shipping details (API-ready structure).
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <h2 className="text-xl font-display font-bold text-offgrid-green">Portal Identity</h2>
          <div className="mt-4 space-y-2 text-sm text-offgrid-green/75">
            <p><span className="font-semibold">Name:</span> {user?.name ?? "N/A"}</p>
            <p><span className="font-semibold">Email:</span> {user?.email ?? "N/A"}</p>
            <p><span className="font-semibold">Role:</span> {user?.role ?? "N/A"}</p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-offgrid-green/10">
          <h2 className="text-xl font-display font-bold text-offgrid-green">Saved Shipping Snapshot</h2>
          <div className="mt-4 space-y-2 text-sm text-offgrid-green/75">
            <p><span className="font-semibold">Full Name:</span> {shipping.fullName || "Not set"}</p>
            <p><span className="font-semibold">Phone:</span> {shipping.phone || "Not set"}</p>
            <p><span className="font-semibold">Address:</span> {shipping.address || "Not set"}</p>
            <p><span className="font-semibold">City/Province:</span> {[shipping.city, shipping.province].filter(Boolean).join(", ") || "Not set"}</p>
            <p><span className="font-semibold">ZIP:</span> {shipping.zip || "Not set"}</p>
          </div>
          <Button className="mt-4" variant="outline" onClick={() => navigate("/shop")}>
            Update On Next Checkout
          </Button>
        </section>
      </div>
    </div>
  );
}
