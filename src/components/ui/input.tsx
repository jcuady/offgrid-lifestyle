import * as React from "react";

import { cn } from "@/src/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

/** Shared field primitive — matches portal-surface radius + electric-blue focus; 44px tall; 16px text on mobile (no iOS zoom). */
const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 min-h-11 w-full rounded-xl border border-offgrid-green/16 bg-white px-3.5 py-2 text-base text-offgrid-green transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-offgrid-green/40 focus-visible:border-offgrid-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-lime/25 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };
