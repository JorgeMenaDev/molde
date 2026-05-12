import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";
import { cn } from "../utils";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-xs font-semibold uppercase tracking-wide text-zinc-600",
      className,
    )}
    {...props}
  />
));

Label.displayName = LabelPrimitive.Root.displayName;
