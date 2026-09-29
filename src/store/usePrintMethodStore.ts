import { create } from "zustand";
import { PRINT_OPTIONS, type PrintMethodOption } from "@/src/data/customOptions";
import { listPrintMethods } from "@/src/services/printMethodService";
import { logger } from "@/src/lib/logger";

type LoadStatus = "idle" | "loading" | "ready" | "error";

interface PrintMethodState {
  /** Seeded with defaults so the wizard renders before the fetch resolves. */
  methods: PrintMethodOption[];
  status: LoadStatus;
  load: (force?: boolean) => Promise<void>;
  setMethods: (methods: PrintMethodOption[]) => void;
}

export const usePrintMethodStore = create<PrintMethodState>()((set, get) => ({
  methods: PRINT_OPTIONS,
  status: "idle",
  load: async (force = false) => {
    const { status } = get();
    if (!force && (status === "loading" || status === "ready")) return;
    set({ status: "loading" });
    try {
      const methods = await listPrintMethods();
      set({ methods: methods.length ? methods : PRINT_OPTIONS, status: "ready" });
    } catch (err) {
      logger.warn("Print methods load failed; using defaults", {
        service: "usePrintMethodStore",
        operation: "load",
        error: err instanceof Error ? err.message : String(err),
      });
      set({ status: "error" });
    }
  },
  setMethods: (methods) => set({ methods, status: "ready" }),
}));
