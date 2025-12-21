import * as React from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

import { cn } from "@/lib/utils";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement>;

const baseStyles =
  "flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background";
const focusStyles =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";
const disabledStyles = "disabled:cursor-not-allowed disabled:opacity-50";

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          baseStyles,
          focusStyles,
          disabledStyles,
          "pr-9",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    </div>
  )
);
Select.displayName = "Select";

export { Select };
