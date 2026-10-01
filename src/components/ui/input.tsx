import * as React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-2xl border border-line bg-bg px-4 text-base text-ink outline-none placeholder:text-muted/80 focus-visible:border-accent",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-line bg-bg px-4 py-3 text-base text-ink outline-none placeholder:text-muted/80 focus-visible:border-accent",
        className,
      )}
      {...props}
    />
  );
}
