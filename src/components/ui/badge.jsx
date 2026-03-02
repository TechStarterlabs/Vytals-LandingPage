import * as React from "react"

import { cn } from "@/lib/utils"

function Badge({ className, ...props }) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--green-dim)] bg-[var(--green-glow)] px-2.5 py-1 text-xs font-semibold text-[var(--green)]",
        className,
      )}
      {...props}
    />
  )
}

export { Badge }
