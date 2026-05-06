import { usePortalStore, type UserRole } from "@/src/store/usePortalStore";

export interface AuthService {
  currentUser: () => ReturnType<typeof usePortalStore.getState>["currentUser"];
  login: (email: string, password: string) => { ok: boolean; message?: string };
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
}

export const localAuthService: AuthService = {
  currentUser: () => usePortalStore.getState().currentUser,
  login: (email, password) => usePortalStore.getState().login(email, password),
  loginAsRole: (role) => usePortalStore.getState().loginAsRole(role),
  logout: () => usePortalStore.getState().logout(),
};
