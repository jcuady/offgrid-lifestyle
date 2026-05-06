import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CustomOrderDraft, GarmentCut, FabricType, PrintMethod } from "@/src/types/commerce";

const EMPTY_DRAFT: CustomOrderDraft = {
  id: null,
  designFileName: null,
  designNotes: "",
  cut: null,
  material: null,
  printMethod: null,
  quantity: 25,
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  teamOrOrg: "",
  estimatedTotal: null,
  depositRequired: null,
  status: "draft",
  createdAt: null,
  updatedAt: null,
};

interface CustomOrderState {
  currentStep: number;
  draft: CustomOrderDraft;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setCut: (cut: GarmentCut) => void;
  setMaterial: (material: FabricType) => void;
  setPrintMethod: (method: PrintMethod) => void;
  updateDraft: (partial: Partial<CustomOrderDraft>) => void;
  resetDraft: () => void;
}

export const TOTAL_STEPS = 3;

export const useCustomOrderStore = create<CustomOrderState>()(
  persist(
    (set) => ({
      currentStep: 1,
      draft: { ...EMPTY_DRAFT },

      setStep: (step) => set({ currentStep: Math.min(Math.max(step, 1), TOTAL_STEPS) }),
      nextStep: () => set((s) => ({ currentStep: Math.min(s.currentStep + 1, TOTAL_STEPS) })),
      prevStep: () => set((s) => ({ currentStep: Math.max(s.currentStep - 1, 1) })),

      setCut: (cut) =>
        set((s) => ({ draft: { ...s.draft, cut, updatedAt: new Date().toISOString() } })),
      setMaterial: (material) =>
        set((s) => ({ draft: { ...s.draft, material, updatedAt: new Date().toISOString() } })),
      setPrintMethod: (method) =>
        set((s) => ({ draft: { ...s.draft, printMethod: method, updatedAt: new Date().toISOString() } })),

      updateDraft: (partial) =>
        set((s) => ({
          draft: { ...s.draft, ...partial, updatedAt: new Date().toISOString() },
        })),

      resetDraft: () => set({ currentStep: 1, draft: { ...EMPTY_DRAFT } }),
    }),
    {
      name: "og-custom-order",
      version: 2,
      migrate: (persisted, fromVersion) => {
        const next = { ...(persisted as Record<string, unknown>) };
        const step = next.currentStep;
        if (fromVersion < 2 && typeof step === "number") {
          const legacyToNew: Record<number, number> = {
            1: 1,
            2: 2,
            3: 2,
            4: 2,
            5: 3,
          };
          next.currentStep = legacyToNew[step] ?? Math.min(step, TOTAL_STEPS);
        }
        if (typeof next.currentStep === "number") {
          next.currentStep = Math.min(Math.max(next.currentStep as number, 1), TOTAL_STEPS);
        }
        return next;
      },
      partialize: (state) => ({ draft: state.draft, currentStep: state.currentStep }),
    },
  ),
);
