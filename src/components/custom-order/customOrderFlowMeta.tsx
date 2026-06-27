import type { LucideIcon } from "lucide-react";
import { BookOpenCheck, ClipboardList, Palette, Send, Factory, Truck } from "lucide-react";
import type { CustomProcessStepCopy } from "@/src/data/customPageContent";

export interface ProcessStepMeta {
  icon: LucideIcon;
  label: string;
  desc: string;
}

const PROCESS_STEP_ICONS = [BookOpenCheck, Palette, ClipboardList, Send, Factory, Truck] as const;

const WIZARD_STEP_ICONS = [Palette, ClipboardList, Send] as const;

/** Icons fixed; labels/descriptions from CMS. */
export function buildProcessSteps(copy: CustomProcessStepCopy[]): ProcessStepMeta[] {
  return PROCESS_STEP_ICONS.map((icon, index) => ({
    icon,
    label: copy[index]?.label ?? `Step ${index + 1}`,
    desc: copy[index]?.description ?? "",
  }));
}

export function buildWizardStepIndicator(stepLabels: string[]) {
  return WIZARD_STEP_ICONS.map((icon, index) => ({
    icon,
    label: stepLabels[index] ?? `Step ${index + 1}`,
  }));
}
