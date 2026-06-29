import { supabase } from "@/src/lib/supabase";
import type { Database } from "@/src/types/database";

type ReviewRow = Database["public"]["Tables"]["og_product_reviews"]["Row"];
type ReviewInsert = Database["public"]["Tables"]["og_product_reviews"]["Insert"];

export type ReviewStatus = "pending" | "approved" | "rejected";

export interface ProductReview {
  id: string;
  productId: string;
  productName: string;
  orderId: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitReviewInput {
  productId: string;
  productName: string;
  orderId: string;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  rating: number;
  title: string;
  body: string;
}

function rowToReview(row: ReviewRow): ProductReview {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    orderId: row.order_id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    rating: row.rating,
    title: row.title,
    body: row.body,
    status: row.status as ReviewStatus,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export const reviewService = {
  submit: async (input: SubmitReviewInput): Promise<{ ok: boolean; message?: string }> => {
    const insert: ReviewInsert = {
      product_id: input.productId,
      product_name: input.productName,
      order_id: input.orderId,
      customer_id: input.customerId ?? null,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      rating: input.rating,
      title: input.title.trim(),
      body: input.body.trim(),
      status: "pending",
    };

    const { error } = await supabase.from("og_product_reviews").insert(insert);
    if (error) {
      console.warn("Review submit failed:", error.message);
      return { ok: false, message: "Could not submit review. Please try again." };
    }
    return { ok: true };
  },

  listApprovedByProduct: async (productId: string): Promise<ProductReview[]> => {
    const { data, error } = await supabase
      .from("og_product_reviews")
      .select("*")
      .eq("product_id", productId)
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToReview);
  },

  listAll: async (): Promise<ProductReview[]> => {
    const { data, error } = await supabase
      .from("og_product_reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return [];
    return data.map(rowToReview);
  },

  setStatus: async (id: string, status: ReviewStatus): Promise<{ ok: boolean }> => {
    const { error } = await supabase
      .from("og_product_reviews")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) {
      console.warn("Review status update failed:", error.message);
      return { ok: false };
    }
    return { ok: true };
  },

  remove: async (id: string): Promise<{ ok: boolean }> => {
    const { error } = await supabase.from("og_product_reviews").delete().eq("id", id);
    if (error) {
      console.warn("Review delete failed:", error.message);
      return { ok: false };
    }
    return { ok: true };
  },

  /** Check if the customer has already reviewed a specific product from a specific order */
  hasReviewed: async (orderId: string, productId: string, customerEmail: string): Promise<boolean> => {
    const { data } = await supabase
      .from("og_product_reviews")
      .select("id")
      .eq("order_id", orderId)
      .eq("product_id", productId)
      .eq("customer_email", customerEmail)
      .limit(1);

    return (data?.length ?? 0) > 0;
  },
};
