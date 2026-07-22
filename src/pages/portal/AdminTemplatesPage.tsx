import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { TemplateSlotsEditor } from "@/src/components/admin/custom/TemplateSlotsEditor";
import { PortalPageHeader } from "@/src/components/portal/PortalPageHeader";
import { Button } from "@/src/components/ui/Button";
import { hydrateSiteContentFromSupabase } from "@/src/services";

export function AdminTemplatesPage() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void hydrateSiteContentFromSupabase().finally(() => setReady(true));
  }, []);

  return (
    <div className="min-h-full bg-[linear-gradient(180deg,rgba(45,90,61,0.04)_0%,transparent_220px)] px-4 py-8 sm:px-8 sm:py-10 lg:px-10">
      <PortalPageHeader
        eyebrow="Content"
        title="OG client templates"
        description="Manage downloadable artwork packs for /custom/templates. Canonical OG files ship from /templates/og-client/; uploads go to site-cms and publish live for customers."
        actions={
          <Button variant="outline" size="sm" className="cursor-pointer" asChild>
            <Link to="/custom/templates" target="_blank" rel="noreferrer">
              Open storefront
            </Link>
          </Button>
        }
      />

      {!ready ? <p className="text-sm text-offgrid-green/55">Loading template slots…</p> : <TemplateSlotsEditor />}
    </div>
  );
}
