import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding button-text whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-[var(--color-on-primary)] active:bg-[var(--color-primary-active)]",
        secondary: "bg-canvas text-ink border-hairline",
        outline: "bg-canvas text-ink border-hairline",
        ghost: "bg-transparent text-ink active:bg-surface-soft",
        destructive: "bg-error/10 text-error active:bg-error/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[40px] px-[20px] rounded-[var(--radius-md)]",
        sm: "h-8 px-3 rounded-[var(--radius-md)]",
        lg: "h-12 px-6 rounded-[var(--radius-md)]",
        icon: "size-[36px] rounded-[var(--radius-full)]",
        "icon-sm": "size-8 rounded-[var(--radius-full)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
