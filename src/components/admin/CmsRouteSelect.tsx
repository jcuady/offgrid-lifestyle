import { CMS_ROUTE_OPTIONS } from "@/src/lib/cmsNavigation";
import { cn } from "@/src/lib/utils";

interface CmsRouteSelectProps {
  value: string;
  onChange: (href: string) => void;
  className?: string;
}

export function CmsRouteSelect({ value, onChange, className }: CmsRouteSelectProps) {
  const groups = [...new Set(CMS_ROUTE_OPTIONS.map((o) => o.group))];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "w-full rounded-lg border border-offgrid-green/20 bg-white px-3 py-2 text-sm text-offgrid-green outline-none focus:border-offgrid-lime focus:ring-2 focus:ring-offgrid-lime/20",
        className,
      )}
    >
      {groups.map((group) => (
        <optgroup key={group} label={group}>
          {CMS_ROUTE_OPTIONS.filter((o) => o.group === group).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
