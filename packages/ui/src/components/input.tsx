import * as React from "react";
import { cn } from "../utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "h-9 w-full border border-zinc-300 bg-white px-2 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20",
      className,
    )}
    {...props}
  />
));

Input.displayName = "Input";
