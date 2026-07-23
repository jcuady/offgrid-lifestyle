import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, BellOff, Settings } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { safeNavigationUrl } from "@/src/lib/safeUrl";
import { useNotifications } from "@/src/hooks/useNotifications";
import { usePortalStore } from "@/src/store/usePortalStore";
import {
  isPushSubscribed,
  subscribeToPushDetailed,
  unsubscribeFromPush,
} from "@/src/lib/pushSubscription";
import { getCookieConsent } from "@/src/lib/consent";
import { canReceiveWebPush, getPushUnsupportedReason, isIosDevice, openInstallGuide } from "@/src/lib/pwa";

function formatWhen(iso: string): string {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

interface NotificationBellProps {
  variant?: "dark" | "light";
  settingsHref?: string;
  className?: string;
}

export function NotificationBell({
  variant = "light",
  settingsHref,
  className,
}: NotificationBellProps) {
  const navigate = useNavigate();
  const currentUser = usePortalStore((s) => s.currentUser);
  const { items, unreadCount, loading, refresh, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const [pushOn, setPushOn] = useState(false);
  const [pushBusy, setPushBusy] = useState(false);
  const [pushMessage, setPushMessage] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) return;
    void isPushSubscribed().then(setPushOn);
  }, [currentUser?.id]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const togglePush = useCallback(async () => {
    setPushMessage(null);
    setPushBusy(true);
    try {
      if (pushOn) {
        await unsubscribeFromPush();
        setPushOn(false);
        setPushMessage("Push notifications turned off.");
      } else {
        if (getCookieConsent() === "essential-only") {
          setPushMessage("Enable all cookies to use push notifications.");
          return;
        }
        if (!canReceiveWebPush()) {
          const reason = getPushUnsupportedReason() ?? "Push is not available on this browser or device.";
          setPushMessage(reason);
          if (isIosDevice()) openInstallGuide();
          return;
        }
        const result = await subscribeToPushDetailed();
        setPushOn(result.ok);
        if (result.ok) {
          setPushMessage("Push notifications enabled.");
        } else if (result.ok === false) {
          setPushMessage(result.reason);
        }
      }
    } finally {
      setPushBusy(false);
    }
  }, [pushOn]);

  if (!currentUser) return null;

  const isDark = variant === "dark";
  const triggerClass = cn(
    "relative grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors",
    isDark
      ? "border-offgrid-cream/35 text-offgrid-cream hover:border-white hover:text-white"
      : "border-offgrid-green/15 bg-white text-offgrid-green hover:bg-offgrid-green/5",
  );

  // On mobile the bell sits mid-cluster, so an `absolute right-0` panel overflows
  // the screen edge. Anchor it to the viewport on small screens, drop down on sm+.
  const panelClass = cn(
    "z-[60] overflow-hidden rounded-2xl border border-offgrid-green/10 bg-white text-offgrid-green shadow-2xl",
    "fixed inset-x-3 top-[calc(env(safe-area-inset-top,0px)+4.25rem)] w-auto",
    "sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[22rem]",
  );

  const handleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next) void refresh();
  };

  const openNotification = async (id: string, url: string | null) => {
    await markRead(id);
    setOpen(false);
    if (!url) return;
    const target = safeNavigationUrl(url, "/");
    navigate(target);
  };

  return (
    <>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[59] bg-offgrid-dark/40 sm:hidden"
            aria-hidden
            onClick={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    <div className={cn("relative", className)} ref={panelRef}>
      <button
        type="button"
        aria-label={unreadCount ? `${unreadCount} unread notifications` : "Notifications"}
        aria-expanded={open}
        onClick={handleOpen}
        className={triggerClass}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid min-h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-offgrid-lime px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className={panelClass}
          >
            <div className="flex items-center justify-between border-b border-offgrid-green/10 px-4 py-3">
              <p className="font-display text-sm font-bold">Notifications</p>
              <div className="flex items-center gap-2">
                {unreadCount > 0 ? (
                  <button
                    type="button"
                    onClick={() => void markAllRead()}
                    className="text-[11px] font-semibold uppercase tracking-[0.1em] text-offgrid-green/55 hover:text-offgrid-green"
                  >
                    Mark all read
                  </button>
                ) : null}
                {settingsHref ? (
                  <Link
                    to={settingsHref}
                    onClick={() => setOpen(false)}
                    className="grid h-7 w-7 place-items-center rounded-lg text-offgrid-green/50 hover:bg-offgrid-green/5 hover:text-offgrid-green"
                    aria-label="Notification settings"
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Link>
                ) : null}
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto">
              {loading && items.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-offgrid-green/50">Loading…</p>
              ) : items.length === 0 ? (
                <p className="px-4 py-6 text-center text-xs text-offgrid-green/50">
                  No notifications yet. Order updates will appear here.
                </p>
              ) : (
                <ul>
                  {items.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => void openNotification(n.id, n.url)}
                        className={cn(
                          "flex w-full gap-3 border-b border-offgrid-green/5 px-4 py-3 text-left transition-colors hover:bg-offgrid-green/[0.03]",
                          !n.readAt && "bg-offgrid-lime/5",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-1.5 h-2 w-2 shrink-0 rounded-full",
                            n.readAt ? "bg-transparent" : "bg-offgrid-lime",
                          )}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-semibold text-offgrid-green">{n.title}</span>
                          <span className="mt-0.5 block text-[11px] leading-relaxed text-offgrid-green/60">
                            {n.body}
                          </span>
                          <span className="mt-1 block text-[10px] text-offgrid-green/40">
                            {formatWhen(n.createdAt)}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-offgrid-green/10 bg-offgrid-cream/40 px-4 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  {pushOn ? (
                    <Bell className="h-3.5 w-3.5 shrink-0 text-offgrid-green" />
                  ) : (
                    <BellOff className="h-3.5 w-3.5 shrink-0 text-offgrid-green/45" />
                  )}
                  <p className="truncate text-[11px] text-offgrid-green/65">
                    {pushOn ? "Push enabled" : "Push off"}
                  </p>
                </div>
                <button
                  type="button"
                  disabled={pushBusy}
                  onClick={() => void togglePush()}
                  className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.1em] text-offgrid-green hover:text-offgrid-dark disabled:opacity-50"
                >
                  {pushBusy ? "…" : pushOn ? "Turn off" : "Enable"}
                </button>
              </div>
              {pushMessage ? (
                <p className="mt-1.5 text-[10px] text-offgrid-green/55">{pushMessage}</p>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
    </>
  );
}
