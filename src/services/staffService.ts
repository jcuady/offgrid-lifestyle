import type { CreateStaffInput, ManagedStaffAccount } from "@/src/types/portal";
import { usePortalStore } from "@/src/store/usePortalStore";

export interface StaffService {
  list: () => ManagedStaffAccount[];
  create: (input: CreateStaffInput) => { ok: boolean; message?: string; accountId?: string };
  setStatus: (staffId: string, status: ManagedStaffAccount["status"]) => { ok: boolean; message?: string };
  resetPassword: (staffId: string, newPassword: string) => { ok: boolean; message?: string };
}

export const localStaffService: StaffService = {
  list: () => usePortalStore.getState().managedStaffAccounts,
  create: (input) => usePortalStore.getState().createStaffAccount(input),
  setStatus: (staffId, status) => usePortalStore.getState().setStaffAccountStatus(staffId, status),
  resetPassword: (staffId, newPassword) => usePortalStore.getState().resetStaffPassword(staffId, newPassword),
};
