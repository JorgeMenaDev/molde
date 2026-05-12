import * as React from "react";
import { cn } from "../utils";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "min-h-20 w-full resize-y border border-zinc-300 bg-white px-2 py-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
