import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomOrderDraft, Order, OrderStatus, PaymentStatus } from "@/src/types/commerce";

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
  cut: CustomOrderDraft["cut"];
  material: CustomOrderDraft["material"];
  printMethod: CustomOrderDraft["printMethod"];
  designFileName: string | null;
  designNotes: string;
  estimatedTotal: CustomOrderDraft["estimatedTotal"];
  depositRequired: CustomOrderDraft["depositRequired"];
  createdAt: string;
  updatedAt: string;
}

interface PortalState {
  demoAccounts: DemoAccount[];
  currentUser: PortalUser | null;
  retailOrders: ManagedRetailOrder[];
  customOrders: ManagedCustomOrder[];
  login: (email: string, password: string) => { ok: boolean; message?: string };
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  recordRetailOrder: (order: Order, customerName: string, customerEmail: string) => void;
  recordCustomOrder: (draft: CustomOrderDraft) => void;
  updateRetailOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateRetailPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;
  updateCustomOrderStatus: (orderId: string, status: OrderStatus) => void;
  updateCustomPaymentStatus: (orderId: string, paymentStatus: PaymentStatus) => void;
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
  if (role === "customer") return "/portal/customer";
  if (role === "admin") return "/portal/admin";
  return "/portal/staff";
}

export const usePortalStore = create<PortalState>()(
  persist(
    (set, get) => ({
      demoAccounts: DEMO_ACCOUNTS,
      currentUser: null,
      retailOrders: [],
      customOrders: [],

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

      recordCustomOrder: (draft) =>
        set((state) => {
          const currentUser = state.currentUser;
          const customOrder: ManagedCustomOrder = {
            id: `CO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            type: "custom",
            status: draft.status === "draft" ? "pending_deposit" : draft.status,
            paymentStatus: "unpaid",
            customerId: currentUser?.role === "customer" ? currentUser.id : null,
            customerName: draft.contactName,
            customerEmail: draft.contactEmail,
            customerPhone: draft.contactPhone,
            teamOrOrg: draft.teamOrOrg,
            quantity: draft.quantity,
            cut: draft.cut,
            material: draft.material,
            printMethod: draft.printMethod,
            designFileName: draft.designFileName,
            designNotes: draft.designNotes,
            estimatedTotal: draft.estimatedTotal,
            depositRequired: draft.depositRequired,
            createdAt: draft.createdAt ?? new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { customOrders: [customOrder, ...state.customOrders] };
        }),

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
    }),
    {
      name: "og-portal",
      version: 1,
      partialize: (state) => ({
        currentUser: state.currentUser,
        retailOrders: state.retailOrders,
        customOrders: state.customOrders,
      }),
    },
  ),
);
