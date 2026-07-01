import { useCallback, useEffect, useMemo, useState } from "react";
import { notificationService, type AppNotification } from "@/src/services/notificationService";
import { usePortalStore } from "@/src/store/usePortalStore";

const POLL_MS = 45_000;

export function useNotifications() {
  const currentUser = usePortalStore((s) => s.currentUser);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!currentUser) {
      setItems([]);
      return;
    }
    setLoading(true);
    try {
      const rows = await notificationService.listForCurrentUser();
      setItems(rows);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    void refresh();
    if (!currentUser) return;
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    return () => window.clearInterval(timer);
  }, [currentUser, refresh]);

  const unreadCount = useMemo(() => items.filter((n) => !n.readAt).length, [items]);

  const markRead = useCallback(
    async (id: string) => {
      await notificationService.markRead(id);
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n)),
      );
    },
    [],
  );

  const markAllRead = useCallback(async () => {
    if (!currentUser?.id) return;
    await notificationService.markAllRead(currentUser.id);
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, readAt: n.readAt ?? now })));
  }, [currentUser?.id]);

  return {
    items,
    unreadCount,
    loading,
    refresh,
    markRead,
    markAllRead,
  };
}
