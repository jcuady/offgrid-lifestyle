/**
 * Portal orders (`retailOrders`, `customOrders`) persist in localStorage (`og-portal`).
 * All admins share the same queue only on this browser profile. For multi-device staff,
 * replace with a shared API (e.g. Supabase) and optional email (e.g. Resend) on submit.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomOrderDraft, Money, Order, OrderStatus, PaymentStatus } from "@/src/types/commerce";
import type { AuditLogEntry, CreateStaffInput, ManagedStaffAccount, RegisterCustomerInput, RegisteredCustomer } from "@/src/types/portal";
import { DEFAULT_COD_SETTINGS, DEFAULT_PAYMONGO_SETTINGS, type CodSettings, type PayMongoSettings } from "@/src/types/payments";
import { createAuditEntry, prependAuditLog } from "@/src/lib/portalAudit";

export type UserRole = "customer" | "admin" | "staff";

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface DemoAccount extends PortalUser {
  password: string;
}

export interface ManagedRetailOrder extends Order {
  channel: "shop";
  customerName: string;
  customerEmail: string;
}

export interface ManagedCustomOrder {
  id: string;
  type: "custom";
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  customerId: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  teamOrOrg: string;
  quantity: number;
  category: CustomOrderDraft["category"];
  headwearType: CustomOrderDraft["headwearType"];
  cut: CustomOrderDraft["cut"];
  material: CustomOrderDraft["material"];
  printMethod: CustomOrderDraft["printMethod"];
  designFileName: string | null;
  designFileKey: string | null;
  designFileUrl: string | null;
  orderSheetFileName: string | null;
  orderSheetFileKey: string | null;
  orderSheetFileUrl: string | null;
  designNotes: string;
  estimatedTotal: CustomOrderDraft["estimatedTotal"];
  depositRequired: CustomOrderDraft["depositRequired"];
  /** Admin-set binding total; null until quoted in portal. */
  officialTotal: Money | null;
  officialDeposit: Money | null;
  quoteCustomerNotes: string;
  quoteInternalNotes: string;
  quotedAt: string | null;
  quotedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomOrderQuoteUpdate {
  officialTotal: Money | null;
  officialDeposit: Money | null;
  quoteCustomerNotes: string;
  quoteInternalNotes: string;
}

export interface PaymentSettings {
  gcashQrImageUrl: string;
  gcashInstructions: string;
  cod: CodSettings;
  paymongo: PayMongoSettings;
}

type PersistedPortalSlice = {
  currentUser: PortalUser | null;
  retailOrders: ManagedRetailOrder[];
  customOrders: ManagedCustomOrder[];
  paymentSettings: PaymentSettings;
  managedStaffAccounts: ManagedStaffAccount[];
  registeredCustomers: RegisteredCustomer[];
  auditLogs: AuditLogEntry[];
};

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  gcashQrImageUrl: "https://placehold.co/640x640/png?text=Upload+GCash+QR",
  gcashInstructions:
    "Scan the QR with GCash, complete the payment, then keep your receipt for verification. Orders move once payment is confirmed.",
  cod: { ...DEFAULT_COD_SETTINGS },
  paymongo: { ...DEFAULT_PAYMONGO_SETTINGS },
};

function defaultQuoteFields(): Pick<
  ManagedCustomOrder,
  | "officialTotal"
  | "officialDeposit"
  | "quoteCustomerNotes"
  | "quoteInternalNotes"
  | "quotedAt"
  | "quotedBy"
> {
  return {
    officialTotal: null,
    officialDeposit: null,
    quoteCustomerNotes: "",
    quoteInternalNotes: "",
    quotedAt: null,
    quotedBy: null,
  };
}

function migrateManagedCustomOrderRecord(raw: unknown): ManagedCustomOrder {
  const c = raw as Partial<ManagedCustomOrder> & { id: string };
  return {
    ...c,
    category: c.category ?? "apparel",
    headwearType: c.headwearType ?? null,
    orderSheetFileName: c.orderSheetFileName ?? null,
    orderSheetFileKey: c.orderSheetFileKey ?? null,
    designFileKey: c.designFileKey ?? null,
    designFileUrl: c.designFileUrl ?? null,
    orderSheetFileUrl: c.orderSheetFileUrl ?? null,
    officialTotal: c.officialTotal ?? null,
    officialDeposit: c.officialDeposit ?? null,
    quoteCustomerNotes: c.quoteCustomerNotes ?? "",
    quoteInternalNotes: c.quoteInternalNotes ?? "",
    quotedAt: c.quotedAt ?? null,
    quotedBy: c.quotedBy ?? null,
  } as ManagedCustomOrder;
}

interface PortalState {
  demoAccounts: DemoAccount[];
  currentUser: PortalUser | null;
  retailOrders: ManagedRetailOrder[];
  customOrders: ManagedCustomOrder[];
  paymentSettings: PaymentSettings;
  managedStaffAccounts: ManagedStaffAccount[];
  registeredCustomers: RegisteredCustomer[];
  auditLogs: AuditLogEntry[];
  setCurrentUser: (user: PortalUser | null) => void;
  login: (email: string, password: string) => { ok: boolean; message?: string };
  loginAsRole: (role: UserRole) => void;
  registerCustomer: (input: RegisterCustomerInput) => { ok: boolean; message?: string; userId?: string };
  logout: () => void;
  recordAudit: (entry: Omit<AuditLogEntry, "id" | "createdAt">) => void;
  createStaffAccount: (input: CreateStaffInput) => { ok: boolean; message?: string; accountId?: string };
  setStaffAccountStatus: (staffId: string, status: ManagedStaffAccount["status"]) => { ok: boolean; message?: string };
  resetStaffPassword: (staffId: string, newPassword: string) => { ok: boolean; message?: string };
  recordRetailOrder: (order: Order, customerName: string, customerEmail: string) => void;
  recordCustomOrder: (draft: CustomOrderDraft) => string;
  updateRetailOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateRetailPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;
  updateCustomOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateCustomPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;
  /** Admin only — sets official quote fields and audit timestamps. */
  updateCustomOrderQuote: (orderId: string, update: CustomOrderQuoteUpdate) => void;
  updatePaymentSettings: (patch: Partial<PaymentSettings>) => void;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "cust-001",
    name: "Juan Dela Cruz",
    email: "customer@offgrid.test",
    password: "offgrid123",
    role: "customer",
  },
  {
    id: "admin-001",
    name: "John Doe",
    email: "admin@offgrid.test",
    password: "offgrid123",
    role: "admin",
  },
  {
    id: "staff-001",
    name: "Marco Reyes",
    email: "staff@offgrid.test",
    password: "offgrid123",
    role: "staff",
  },
];

function loginAccounts(
  state: Pick<PortalState, "demoAccounts" | "managedStaffAccounts" | "registeredCustomers">,
): DemoAccount[] {
  const managedStaff = state.managedStaffAccounts
    .filter((account) => account.status === "active")
    .map((account) => ({
      id: account.id,
      name: account.name,
      email: account.email,
      password: account.password,
      role: "staff" as const,
    }));
  const registered = state.registeredCustomers.map((account) => ({
    id: account.id,
    name: account.name,
    email: account.email,
    password: account.password,
    role: "customer" as const,
  }));
  return [...state.demoAccounts, ...registered, ...managedStaff];
}

function allKnownEmails(
  state: Pick<PortalState, "demoAccounts" | "managedStaffAccounts" | "registeredCustomers">,
): string[] {
  return [
    ...state.demoAccounts.map((a) => a.email.toLowerCase()),
    ...state.managedStaffAccounts.map((a) => a.email.toLowerCase()),
    ...state.registeredCustomers.map((a) => a.email.toLowerCase()),
  ];
}

function requireAdmin(state: PortalState): PortalUser | null {
  return state.currentUser?.role === "admin" ? state.currentUser : null;
}

export function getPortalLandingByRole(role: UserRole): string {
  if (role === "customer") return "/account/orders";
  if (role === "admin") return "/portal/admin";
  return "/portal/staff";
}

/** Whether a signed-in user may access a protected portal/account path. */
export function isPathAllowedForRole(pathname: string, role: UserRole): boolean {
  if (pathname.startsWith("/portal/admin")) return role === "admin";
  if (pathname.startsWith("/portal/staff")) return role === "staff";
  if (pathname.startsWith("/account")) return role === "customer";
  return false;
}

/** Post-login destination: honor `from` only when the role is allowed on that path. */
export function resolvePostLoginPath(role: UserRole, from?: string | null): string {
  if (from && isPathAllowedForRole(from, role)) return from;
  return getPortalLandingByRole(role);
}

export const usePortalStore = create<PortalState>()(
  persist(
    (set, get) => ({
      demoAccounts: DEMO_ACCOUNTS,
      currentUser: null,
      retailOrders: [],
      customOrders: [],
      paymentSettings: { ...DEFAULT_PAYMENT_SETTINGS },
      managedStaffAccounts: [],
      registeredCustomers: [],
      auditLogs: [],

      setCurrentUser: (user) => set({ currentUser: user }),

      login: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const match = loginAccounts(get()).find(
          (account) =>
            account.email.toLowerCase() === normalizedEmail &&
            account.password === password.trim(),
        );

        if (!match) {
          return { ok: false, message: "Invalid credentials. Try one of the demo accounts." };
        }

        const { password: _password, ...safeUser } = match;
        const now = new Date().toISOString();
        set((state) => ({
          currentUser: safeUser,
          managedStaffAccounts: state.managedStaffAccounts.map((account) =>
            account.id === match.id ? { ...account, lastLoginAt: now, updatedAt: now } : account,
          ),
          registeredCustomers: state.registeredCustomers.map((account) =>
            account.id === match.id ? { ...account, lastLoginAt: now, updatedAt: now } : account,
          ),
          auditLogs: prependAuditLog(
            state.auditLogs,
            createAuditEntry({
              action: "auth.login",
              actorId: safeUser.id,
              actorEmail: safeUser.email,
              actorRole: safeUser.role,
              targetType: "session",
              targetId: safeUser.id,
              summary: `${safeUser.email} signed in`,
            }),
          ),
        }));
        return { ok: true };
      },

      loginAsRole: (role) => {
        const account = get().demoAccounts.find((entry) => entry.role === role);
        if (!account) return;
        const { password: _password, ...safeUser } = account;
        set((state) => ({
          currentUser: safeUser,
          auditLogs: prependAuditLog(
            state.auditLogs,
            createAuditEntry({
              action: "auth.login",
              actorId: safeUser.id,
              actorEmail: safeUser.email,
              actorRole: safeUser.role,
              targetType: "session",
              targetId: safeUser.id,
              summary: `${safeUser.email} signed in (demo role)`,
              metadata: { demo: true },
            }),
          ),
        }));
      },

      registerCustomer: (input) => {
        const name = input.name.trim();
        const email = input.email.trim().toLowerCase();
        const password = input.password.trim();

        if (!name) return { ok: false, message: "Full name is required." };
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return { ok: false, message: "Enter a valid email address." };
        }
        if (password.length < 8) {
          return { ok: false, message: "Password must be at least 8 characters." };
        }
        if (allKnownEmails(get()).includes(email)) {
          return { ok: false, message: "An account with this email already exists. Sign in instead." };
        }

        const now = new Date().toISOString();
        const account: RegisteredCustomer = {
          id: `cust-${crypto.randomUUID().slice(0, 8)}`,
          name,
          email,
          password,
          role: "customer",
          createdAt: now,
          updatedAt: now,
          lastLoginAt: null,
        };

        const { password: _password, ...safeUser } = account;

        set((state) => ({
          registeredCustomers: [account, ...state.registeredCustomers],
          currentUser: safeUser,
          auditLogs: prependAuditLog(
            state.auditLogs,
            createAuditEntry({
              action: "auth.register",
              actorId: safeUser.id,
              actorEmail: safeUser.email,
              actorRole: safeUser.role,
              targetType: "user",
              targetId: safeUser.id,
              summary: `Customer account created for ${safeUser.email}`,
              metadata: { customerId: safeUser.id },
            }),
          ),
        }));

        return { ok: true, userId: account.id };
      },

      logout: () => {
        const user = get().currentUser;
        if (!user) {
          set({ currentUser: null });
          return;
        }
        set((state) => ({
          currentUser: null,
          auditLogs: prependAuditLog(
            state.auditLogs,
            createAuditEntry({
              action: "auth.logout",
              actorId: user.id,
              actorEmail: user.email,
              actorRole: user.role,
              targetType: "session",
              targetId: user.id,
              summary: `${user.email} signed out`,
            }),
          ),
        }));
      },

      recordAudit: (entry) =>
        set((state) => ({
          auditLogs: prependAuditLog(state.auditLogs, createAuditEntry(entry)),
        })),

      createStaffAccount: (input) => {
        const admin = requireAdmin(get());
        if (!admin) return { ok: false, message: "Only admins can create staff accounts." };

        const name = input.name.trim();
        const email = input.email.trim().toLowerCase();
        const password = input.password.trim();

        if (!name) return { ok: false, message: "Full name is required." };
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return { ok: false, message: "Enter a valid email address." };
        }
        if (password.length < 8) {
          return { ok: false, message: "Password must be at least 8 characters." };
        }
        if (allKnownEmails(get()).includes(email)) {
          return { ok: false, message: "That email is already registered." };
        }

        const now = new Date().toISOString();
        const account: ManagedStaffAccount = {
          id: `staff-${crypto.randomUUID().slice(0, 8)}`,
          name,
          email,
          password,
          role: "staff",
          status: "active",
          createdAt: now,
          createdBy: admin.id,
          updatedAt: now,
          lastLoginAt: null,
        };

        set((state) => ({
          managedStaffAccounts: [account, ...state.managedStaffAccounts],
          auditLogs: prependAuditLog(
            state.auditLogs,
            createAuditEntry({
              action: "staff.created",
              actorId: admin.id,
              actorEmail: admin.email,
              actorRole: admin.role,
              targetType: "user",
              targetId: account.id,
              summary: `Created staff account for ${account.name} (${account.email})`,
              metadata: { staffId: account.id, staffEmail: account.email },
            }),
          ),
        }));

        return { ok: true, accountId: account.id };
      },

      setStaffAccountStatus: (staffId, status) => {
        const admin = requireAdmin(get());
        if (!admin) return { ok: false, message: "Only admins can update staff accounts." };

        const target = get().managedStaffAccounts.find((a) => a.id === staffId);
        if (!target) return { ok: false, message: "Staff account not found." };
        if (target.status === status) return { ok: true };

        const now = new Date().toISOString();
        const action = status === "active" ? "staff.reactivated" : "staff.deactivated";

        set((state) => ({
          managedStaffAccounts: state.managedStaffAccounts.map((account) =>
            account.id === staffId ? { ...account, status, updatedAt: now } : account,
          ),
          auditLogs: prependAuditLog(
            state.auditLogs,
            createAuditEntry({
              action,
              actorId: admin.id,
              actorEmail: admin.email,
              actorRole: admin.role,
              targetType: "user",
              targetId: staffId,
              summary: `${status === "active" ? "Reactivated" : "Deactivated"} staff account ${target.email}`,
              metadata: { staffId, staffEmail: target.email, status },
            }),
          ),
        }));

        return { ok: true };
      },

      resetStaffPassword: (staffId, newPassword) => {
        const admin = requireAdmin(get());
        if (!admin) return { ok: false, message: "Only admins can reset passwords." };

        const password = newPassword.trim();
        if (password.length < 8) {
          return { ok: false, message: "Password must be at least 8 characters." };
        }

        const target = get().managedStaffAccounts.find((a) => a.id === staffId);
        if (!target) return { ok: false, message: "Staff account not found." };

        const now = new Date().toISOString();
        set((state) => ({
          managedStaffAccounts: state.managedStaffAccounts.map((account) =>
            account.id === staffId ? { ...account, password, updatedAt: now } : account,
          ),
          auditLogs: prependAuditLog(
            state.auditLogs,
            createAuditEntry({
              action: "staff.password_reset",
              actorId: admin.id,
              actorEmail: admin.email,
              actorRole: admin.role,
              targetType: "user",
              targetId: staffId,
              summary: `Reset password for staff account ${target.email}`,
              metadata: { staffId, staffEmail: target.email },
            }),
          ),
        }));

        return { ok: true };
      },

      recordRetailOrder: (order, customerName, customerEmail) =>
        set((state) => ({
          retailOrders: [
            {
              ...order,
              channel: "shop",
              customerName,
              customerEmail,
            },
            ...state.retailOrders,
          ],
        })),

      recordCustomOrder: (draft) => {
        const customOrderId =
          draft.id ?? `CO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
        set((state) => {
          const currentUser = state.currentUser;
          const now = new Date().toISOString();
          const customOrder: ManagedCustomOrder = {
            id: customOrderId,
            type: "custom",
            status: draft.status === "draft" ? "pending_deposit" : draft.status,
            paymentStatus: "unpaid",
            customerId: currentUser?.role === "customer" ? currentUser.id : null,
            customerName: draft.contactName,
            customerEmail: draft.contactEmail,
            customerPhone: draft.contactPhone,
            teamOrOrg: draft.teamOrOrg,
            quantity: draft.quantity,
            category: draft.category,
            headwearType: draft.headwearType,
            cut: draft.cut,
            material: draft.material,
            printMethod: draft.printMethod,
            designFileName: draft.designFileName,
            designFileKey: draft.designFileKey ?? null,
            designFileUrl: draft.designFileUrl ?? null,
            orderSheetFileName: draft.orderSheetFileName,
            orderSheetFileKey: draft.orderSheetFileKey ?? null,
            orderSheetFileUrl: draft.orderSheetFileUrl ?? null,
            designNotes: draft.designNotes,
            estimatedTotal: draft.estimatedTotal,
            depositRequired: draft.depositRequired,
            ...defaultQuoteFields(),
            createdAt: draft.createdAt ?? now,
            updatedAt: now,
          };
          return { customOrders: [customOrder, ...state.customOrders] };
        });
        return customOrderId;
      },

      updateRetailOrderStatus: (orderId, status) => {
        const actor = get().currentUser;
        const previous = get().retailOrders.find((e) => e.id === orderId);
        set((state) => ({
          retailOrders: state.retailOrders.map((entry) =>
            entry.id === orderId ? { ...entry, status, updatedAt: new Date().toISOString() } : entry,
          ),
          auditLogs:
            actor && previous && previous.status !== status
              ? prependAuditLog(
                  state.auditLogs,
                  createAuditEntry({
                    action: "order.retail_status_changed",
                    actorId: actor.id,
                    actorEmail: actor.email,
                    actorRole: actor.role,
                    targetType: "order",
                    targetId: orderId,
                    summary: `Retail order ${orderId}: ${previous.status} → ${status}`,
                    metadata: { channel: "shop", from: previous.status, to: status },
                  }),
                )
              : state.auditLogs,
        }));
      },

      updateRetailPaymentStatus: (orderId, paymentStatus) => {
        const actor = get().currentUser;
        const previous = get().retailOrders.find((e) => e.id === orderId);
        set((state) => ({
          retailOrders: state.retailOrders.map((entry) =>
            entry.id === orderId
              ? { ...entry, paymentStatus, updatedAt: new Date().toISOString() }
              : entry,
          ),
          auditLogs:
            actor && previous && previous.paymentStatus !== paymentStatus
              ? prependAuditLog(
                  state.auditLogs,
                  createAuditEntry({
                    action: "order.retail_payment_changed",
                    actorId: actor.id,
                    actorEmail: actor.email,
                    actorRole: actor.role,
                    targetType: "order",
                    targetId: orderId,
                    summary: `Retail order ${orderId} payment: ${previous.paymentStatus} → ${paymentStatus}`,
                    metadata: { channel: "shop", from: previous.paymentStatus, to: paymentStatus },
                  }),
                )
              : state.auditLogs,
        }));
      },

      updateCustomOrderStatus: (orderId, status) => {
        const actor = get().currentUser;
        const previous = get().customOrders.find((e) => e.id === orderId);
        set((state) => ({
          customOrders: state.customOrders.map((entry) =>
            entry.id === orderId ? { ...entry, status, updatedAt: new Date().toISOString() } : entry,
          ),
          auditLogs:
            actor && previous && previous.status !== status
              ? prependAuditLog(
                  state.auditLogs,
                  createAuditEntry({
                    action: "order.custom_status_changed",
                    actorId: actor.id,
                    actorEmail: actor.email,
                    actorRole: actor.role,
                    targetType: "order",
                    targetId: orderId,
                    summary: `Custom order ${orderId}: ${previous.status} → ${status}`,
                    metadata: { channel: "custom", from: previous.status, to: status },
                  }),
                )
              : state.auditLogs,
        }));
      },

      updateCustomPaymentStatus: (orderId, paymentStatus) => {
        const actor = get().currentUser;
        const previous = get().customOrders.find((e) => e.id === orderId);
        set((state) => ({
          customOrders: state.customOrders.map((entry) =>
            entry.id === orderId
              ? { ...entry, paymentStatus, updatedAt: new Date().toISOString() }
              : entry,
          ),
          auditLogs:
            actor && previous && previous.paymentStatus !== paymentStatus
              ? prependAuditLog(
                  state.auditLogs,
                  createAuditEntry({
                    action: "order.custom_payment_changed",
                    actorId: actor.id,
                    actorEmail: actor.email,
                    actorRole: actor.role,
                    targetType: "order",
                    targetId: orderId,
                    summary: `Custom order ${orderId} payment: ${previous.paymentStatus} → ${paymentStatus}`,
                    metadata: { channel: "custom", from: previous.paymentStatus, to: paymentStatus },
                  }),
                )
              : state.auditLogs,
        }));
      },

      updateCustomOrderQuote: (orderId, update) => {
        if (get().currentUser?.role !== "admin") return;
        const actor = get().currentUser!;
        const now = new Date().toISOString();
        const hasOfficial =
          update.officialTotal !== null &&
          update.officialTotal !== undefined &&
          update.officialTotal.amount > 0;

        let officialDeposit: Money | null = null;
        if (hasOfficial && update.officialTotal) {
          if (update.officialDeposit && update.officialDeposit.amount > 0) {
            officialDeposit = update.officialDeposit;
          } else {
            officialDeposit = {
              amount: Math.round(update.officialTotal.amount * 0.6),
              currency: update.officialTotal.currency,
            };
          }
        }

        set((state) => ({
          customOrders: state.customOrders.map((entry) => {
            if (entry.id !== orderId) return entry;
            return {
              ...entry,
              officialTotal: hasOfficial ? update.officialTotal : null,
              officialDeposit: hasOfficial ? officialDeposit : null,
              quoteCustomerNotes: hasOfficial ? update.quoteCustomerNotes : "",
              quoteInternalNotes: hasOfficial ? update.quoteInternalNotes : "",
              quotedAt: hasOfficial ? now : null,
              quotedBy: hasOfficial ? actor.id : null,
              updatedAt: now,
            };
          }),
          auditLogs: hasOfficial
            ? prependAuditLog(
                state.auditLogs,
                createAuditEntry({
                  action: "order.custom_quote_updated",
                  actorId: actor.id,
                  actorEmail: actor.email,
                  actorRole: actor.role,
                  targetType: "order",
                  targetId: orderId,
                  summary: `Official quote set for custom order ${orderId}`,
                  metadata: {
                    orderId,
                    officialTotal: update.officialTotal,
                    officialDeposit,
                  },
                }),
              )
            : state.auditLogs,
        }));
      },

      updatePaymentSettings: (patch) =>
        set((state) => {
          const actor = state.currentUser;
          return {
            paymentSettings: { ...state.paymentSettings, ...patch },
            auditLogs:
              actor &&
              (patch.gcashQrImageUrl !== undefined ||
                patch.gcashInstructions !== undefined ||
                patch.paymongo !== undefined ||
                patch.cod !== undefined)
                ? prependAuditLog(
                    state.auditLogs,
                    createAuditEntry({
                      action: "payment.settings_updated",
                      actorId: actor.id,
                      actorEmail: actor.email,
                      actorRole: actor.role,
                      targetType: "payment",
                      targetId:
                        patch.paymongo !== undefined
                          ? "global-paymongo"
                          : patch.cod !== undefined
                            ? "global-cod"
                            : "global-gcash",
                      summary:
                        patch.paymongo !== undefined
                          ? "Updated PayMongo payment settings"
                          : patch.cod !== undefined
                            ? "Updated COD payment settings"
                            : "Updated global GCash payment settings",
                      metadata: {
                        fields: Object.keys(patch),
                        paymongoEnabled: patch.paymongo?.enabled,
                        codEnabled: patch.cod?.enabled,
                      },
                    }),
                  )
                : state.auditLogs,
          };
        }),
    }),
    {
      name: "og-portal",
      version: 6,
      partialize: (state): PersistedPortalSlice => ({
        currentUser: state.currentUser,
        retailOrders: state.retailOrders,
        customOrders: state.customOrders,
        paymentSettings: state.paymentSettings,
        managedStaffAccounts: state.managedStaffAccounts,
        registeredCustomers: state.registeredCustomers,
        auditLogs: state.auditLogs,
      }),
      migrate: (persistedState, version): PersistedPortalSlice => {
        const p = (persistedState ?? {}) as Partial<PersistedPortalSlice>;
        const base: PersistedPortalSlice = {
          currentUser: p.currentUser ?? null,
          retailOrders: Array.isArray(p.retailOrders) ? p.retailOrders : [],
          customOrders: Array.isArray(p.customOrders)
            ? p.customOrders.map((row) => migrateManagedCustomOrderRecord(row))
            : [],
          paymentSettings: {
            ...DEFAULT_PAYMENT_SETTINGS,
            ...p.paymentSettings,
            paymongo: {
              ...DEFAULT_PAYMONGO_SETTINGS,
              ...p.paymentSettings?.paymongo,
            },
            cod: {
              ...DEFAULT_COD_SETTINGS,
              ...p.paymentSettings?.cod,
            },
          },
          managedStaffAccounts: Array.isArray(p.managedStaffAccounts) ? p.managedStaffAccounts : [],
          registeredCustomers: Array.isArray(p.registeredCustomers) ? p.registeredCustomers : [],
          auditLogs: Array.isArray(p.auditLogs) ? p.auditLogs : [],
        };
        if (version < 6) {
          base.registeredCustomers = base.registeredCustomers ?? [];
        }
        if (version < 5) {
          base.paymentSettings.cod = {
            ...DEFAULT_COD_SETTINGS,
            ...base.paymentSettings.cod,
          };
        }
        if (version < 4) {
          base.paymentSettings.paymongo = {
            ...DEFAULT_PAYMONGO_SETTINGS,
            ...base.paymentSettings.paymongo,
          };
        }
        if (version < 3) return base;
        return base;
      },
    },
  ),
);
