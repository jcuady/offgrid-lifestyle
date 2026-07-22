import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface PortalDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  /** Sticky footer action row (e.g. Save / Cancel). */
  footer?: ReactNode;
}

/** Right-side slide-over used by portal CRUD editors. Stays mounted so it can animate in/out. */
export function PortalDrawer({ open, onClose, title, description, children, footer }: PortalDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <div className={cn("fixed inset-0 z-50", !open && "pointer-events-none")} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Close editor"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
        className={cn(
          "absolute inset-0 bg-offgrid-dark/50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-full flex-col bg-offgrid-cream shadow-2xl transition-transform duration-300 ease-out sm:max-w-md lg:max-w-lg",
          "pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-offgrid-green/10 bg-white px-5 py-4">
          <div className="min-w-0">
            <h2 className="font-display text-xl font-black text-offgrid-green">{title}</h2>
            {description ? <p className="mt-1 text-xs text-offgrid-green/55">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-offgrid-green/15 text-offgrid-green/70 transition-colors hover:bg-offgrid-green/5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <div className="border-t border-offgrid-green/10 bg-white px-5 py-4">{footer}</div> : null}
      </div>
    </div>
  );
}
