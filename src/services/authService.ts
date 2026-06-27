import { usePortalStore, type UserRole } from "@/src/store/usePortalStore";
import type { RegisterCustomerInput } from "@/src/types/portal";

export interface AuthService {
  currentUser: () => ReturnType<typeof usePortalStore.getState>["currentUser"];
  login: (email: string, password: string) => { ok: boolean; message?: string };
  loginAsRole: (role: UserRole) => void;
  registerCustomer: (input: RegisterCustomerInput) => { ok: boolean; message?: string; userId?: string };
  logout: () => void;
}

export const localAuthService: AuthService = {
  currentUser: () => usePortalStore.getState().currentUser,
  login: (email, password) => usePortalStore.getState().login(email, password),
  loginAsRole: (role) => usePortalStore.getState().loginAsRole(role),
  registerCustomer: (input) => usePortalStore.getState().registerCustomer(input),
  logout: () => usePortalStore.getState().logout(),
};
