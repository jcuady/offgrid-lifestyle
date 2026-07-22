/** Portal roles — keep in sync with `UserRole` in usePortalStore. */
export type PortalRole = "customer" | "admin" | "staff";

export type AuditActorRole = PortalRole | "system";
export type AuditAction =
  | "auth.login"
  | "auth.logout"
  | "auth.register"
  | "staff.created"
  | "staff.deactivated"
  | "staff.reactivated"
  | "staff.password_reset"
  | "staff.email_changed"
  | "staff.updated"
  | "order.retail_status_changed"
  | "order.retail_payment_changed"
  | "order.custom_status_changed"
  | "order.custom_payment_changed"
  | "order.custom_quote_updated"
  | "payment.settings_updated"
  | "product.created"
  | "product.updated"
  | "product.deleted"
  | "content.created"
  | "content.updated"
  | "content.deleted"
  | "review.status_changed"
  | "review.deleted";

export type AuditTargetType = "user" | "order" | "payment" | "session" | "product" | "content" | "review";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  actorId: string | null;
  actorEmail: string;
  actorRole: AuditActorRole;
  targetType: AuditTargetType;
  targetId: string | null;
  summary: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}

export type StaffAccountStatus = "active" | "inactive";

/** Admin-provisioned staff — mirrors `og_portal_users` (role = staff). */
export interface ManagedStaffAccount {
  id: string;
  name: string;
  email: string;
  /** Plain in local MVP; store hashed in production (`auth.users`). */
  password: string;
  role: "staff";
  status: StaffAccountStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
}

/** Self-registered storefront customer — mirrors future `auth.users` (role = customer). */
export interface RegisteredCustomer {
  id: string;
  name: string;
  email: string;
  /** Plain in local MVP; store hashed in production. */
  password: string;
  role: "customer";
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
}

export interface RegisterCustomerInput {
  name: string;
  email: string;
  phone: string;
  password: string;
}
