import type { LucideIcon } from "lucide-react";
import { Upload, Layers3, ClipboardCheck } from "lucide-react";

export interface ProcessStepMeta {
  icon: LucideIcon;
  label: string;
  desc: string;
}

/** Icons + copy for “How it works” — keep in sync with TOTAL_STEPS (3) in useCustomOrderStore. */
export const CUSTOM_ORDER_PROCESS_STEPS: ProcessStepMeta[] = [
  {
    icon: Upload,
    label: "Design",
    desc: "Submit your artwork or use our template",
  },
  {
    icon: Layers3,
    label: "Specs",
    desc: "Cut, fabric, and print method in one place",
  },
  {
    icon: ClipboardCheck,
    label: "Summary",
    desc: "Review, get your quote, and confirm",
  },
];
