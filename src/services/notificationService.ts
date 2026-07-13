import { supabase } from "@/src/lib/supabase";
import { logger } from "@/src/lib/logger";

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  url: string | null;
  category: string;
  readAt: string | null;
  createdAt: string;
}

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  url: string | null;
  category: string;
  read_at: string | null;
  created_at: string;
};

function rowToNotification(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    body: row.body,
    url: row.url,
    category: row.category,
    readAt: row.read_at,
    createdAt: row.created_at,
  };
}

export const notificationService = {
  async listForCurrentUser(limit = 30): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from("og_notifications")
      .select("id, user_id, title, body, url, category, read_at, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      logger.warn("Failed to load notifications", {
        service: "notificationService",
        operation: "list",
        error: error.message,
      });
      return [];
    }

    return (data as NotificationRow[]).map(rowToNotification);
  },

  async create(input: {
    userId: string;
    title: string;
    body: string;
    url?: string | null;
    category?: string;
  }): Promise<void> {
    const { error } = await supabase.from("og_notifications").insert({
      user_id: input.userId,
      title: input.title,
      body: input.body,
      url: input.url ?? null,
      category: input.category ?? "order",
    });

    if (error) {
      logger.warn("Failed to create notification", {
        service: "notificationService",
        operation: "create",
        userId: input.userId,
        error: error.message,
      });
    }
  },

  async markRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from("og_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", notificationId)
      .is("read_at", null);

    if (error) {
      logger.warn("Failed to mark notification read", {
        service: "notificationService",
        operation: "markRead",
        notificationId,
        error: error.message,
      });
    }
  },

  async markAllRead(userId: string): Promise<void> {
    const { error } = await supabase
      .from("og_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null);

    if (error) {
      logger.warn("Failed to mark all notifications read", {
        service: "notificationService",
        operation: "markAllRead",
        error: error.message,
      });
    }
  },
};
