import * as React from "react";
import { X } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/src/lib/utils";

const closeButtonVariants = cva(
  "inline-flex items-center justify-center rounded-sm p-1 text-slate-400 transition-colors hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 dark:text-slate-500 dark:hover:text-slate-100 dark:focus:ring-slate-400 dark:focus:ring-offset-slate-900",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "h-auto w-auto",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface CloseButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof closeButtonVariants> {}

const CloseButton = React.forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(closeButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    );
  }
);
CloseButton.displayName = "CloseButton";

export { CloseButton, closeButtonVariants };
