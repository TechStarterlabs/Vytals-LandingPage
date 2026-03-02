import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:border-[var(--green)] focus-visible:ring-2 focus-visible:ring-[var(--green-glow)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  )
}

export { Input }
