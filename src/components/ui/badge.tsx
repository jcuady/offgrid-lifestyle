import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-offgrid-green text-offgrid-cream",
        outline: "border-offgrid-green/20 bg-transparent text-offgrid-green/70",
        secondary: "border-transparent bg-offgrid-green/[0.06] text-offgrid-green",
        accent: "border-transparent bg-offgrid-lime/10 text-offgrid-lime",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);

type BadgeProps = React.ComponentProps<"div"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants, type BadgeProps };
