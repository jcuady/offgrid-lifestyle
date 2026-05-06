import { cn } from "@/src/lib/utils";
import { Check } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface OptionCardProps {
  label: string;
  description: string;
  selected: boolean;
  onClick: () => void;
  icon?: LucideIcon;
}

export function OptionCard({ label, description, selected, onClick, icon: Icon }: OptionCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-xl border-2 transition-all text-left cursor-pointer",
        selected
          ? "border-offgrid-green bg-offgrid-green/5"
          : "border-offgrid-green/15 hover:border-offgrid-green/40",
      )}
    >
      {Icon && (
        <div className={cn(
          "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0",
          selected ? "bg-offgrid-green text-offgrid-cream" : "bg-offgrid-green/10 text-offgrid-green",
        )}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-bold text-offgrid-green text-sm sm:text-base">{label}</p>
        <p className="text-[10px] sm:text-xs text-offgrid-green/60 mt-0.5">{description}</p>
      </div>
      {selected && (
        <div className="w-6 h-6 rounded-full bg-offgrid-lime flex items-center justify-center flex-shrink-0">
          <Check className="w-4 h-4 text-offgrid-dark" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
