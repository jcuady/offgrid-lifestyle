import type { LucideIcon } from "lucide-react";
import { Upload, ClipboardList, ClipboardCheck } from "lucide-react";
import type { CustomProcessStepCopy } from "@/src/data/customPageContent";

export interface ProcessStepMeta {
  icon: LucideIcon;
  label: string;
  desc: string;
}

const PROCESS_STEP_ICONS = [Upload, ClipboardList, ClipboardCheck] as const;

const WIZARD_STEP_ICONS = [Upload, ClipboardList, ClipboardCheck] as const;

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
