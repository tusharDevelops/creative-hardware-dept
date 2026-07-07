import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[40px] w-full min-w-0 rounded-[var(--radius-md)] border border-hairline bg-canvas px-3 py-2 text-[16px] text-ink transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-soft focus-visible:border-ink disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface-soft disabled:opacity-50 aria-invalid:border-error md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
