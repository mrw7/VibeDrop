import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-none px-2 py-0.5 text-[0.625rem] font-pixel tracking-wide uppercase transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground border border-border",
        secondary: "bg-muted text-muted-foreground border border-border",
        accent: "bg-transparent text-[var(--color-accent)] border border-[var(--color-accent)]",
        success: "bg-transparent text-success border border-success",
        destructive: "bg-transparent text-destructive border border-destructive",
        warning: "bg-transparent text-warning-foreground border border-warning",
        outline: "border border-border text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
