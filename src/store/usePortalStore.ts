/**
 * Portal orders (`retailOrders`, `customOrders`) persist in localStorage (`og-portal`).
 * All admins share the same queue only on this browser profile. For multi-device staff,
 * replace with a shared API (e.g. Supabase) and optional email (e.g. Resend) on submit.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomOrderDraft, Money, Order, OrderStatus, PaymentStatus } from "@/src/types/commerce";

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
  orderSheetFileName: string | null;
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
}

type PersistedPortalSlice = {
  currentUser: PortalUser | null;
  retailOrders: ManagedRetailOrder[];
  customOrders: ManagedCustomOrder[];
  paymentSettings: PaymentSettings;
};

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
  gcashQrImageUrl: "https://placehold.co/640x640/png?text=Upload+GCash+QR",
  gcashInstructions:
    "Scan the QR with GCash, complete the payment, then keep your receipt for verification. Orders move once payment is confirmed.",
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
  login: (email: string, password: string) => { ok: boolean; message?: string };
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
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

      login: (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const match = get().demoAccounts.find(
          (account) =>
            account.email.toLowerCase() === normalizedEmail &&
            account.password === password.trim(),
        );

        if (!match) {
          return { ok: false, message: "Invalid credentials. Try one of the demo accounts." };
        }

        const { password: _password, ...safeUser } = match;
        set({ currentUser: safeUser });
        return { ok: true };
      },

      loginAsRole: (role) => {
        const account = get().demoAccounts.find((entry) => entry.role === role);
        if (!account) return;
        const { password: _password, ...safeUser } = account;
        set({ currentUser: safeUser });
      },

      logout: () => set({ currentUser: null }),

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
            orderSheetFileName: draft.orderSheetFileName,
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

      updateRetailOrderStatus: (orderId, status) =>
        set((state) => ({
          retailOrders: state.retailOrders.map((entry) =>
            entry.id === orderId ? { ...entry, status, updatedAt: new Date().toISOString() } : entry,
          ),
        })),

      updateRetailPaymentStatus: (orderId, paymentStatus) =>
        set((state) => ({
          retailOrders: state.retailOrders.map((entry) =>
            entry.id === orderId
              ? { ...entry, paymentStatus, updatedAt: new Date().toISOString() }
              : entry,
          ),
        })),

      updateCustomOrderStatus: (orderId, status) =>
        set((state) => ({
          customOrders: state.customOrders.map((entry) =>
            entry.id === orderId ? { ...entry, status, updatedAt: new Date().toISOString() } : entry,
          ),
        })),

      updateCustomPaymentStatus: (orderId, paymentStatus) =>
        set((state) => ({
          customOrders: state.customOrders.map((entry) =>
            entry.id === orderId
              ? { ...entry, paymentStatus, updatedAt: new Date().toISOString() }
              : entry,
          ),
        })),

      updateCustomOrderQuote: (orderId, update) => {
        if (get().currentUser?.role !== "admin") return;
        const now = new Date().toISOString();
        const actor = get().currentUser!;
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
        }));
      },

      updatePaymentSettings: (patch) =>
        set((state) => ({
          paymentSettings: { ...state.paymentSettings, ...patch },
        })),
    }),
    {
      name: "og-portal",
      version: 2,
      partialize: (state): PersistedPortalSlice => ({
        currentUser: state.currentUser,
        retailOrders: state.retailOrders,
        customOrders: state.customOrders,
        paymentSettings: state.paymentSettings,
      }),
      migrate: (persistedState, _fromVersion): PersistedPortalSlice => {
        const p = (persistedState ?? {}) as Partial<PersistedPortalSlice>;
        return {
          currentUser: p.currentUser ?? null,
          retailOrders: Array.isArray(p.retailOrders) ? p.retailOrders : [],
          customOrders: Array.isArray(p.customOrders)
            ? p.customOrders.map((row) => migrateManagedCustomOrderRecord(row))
            : [],
          paymentSettings: {
            ...DEFAULT_PAYMENT_SETTINGS,
            ...p.paymentSettings,
          },
        };
      },
    },
  ),
);
