import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        "pastel-blue":
          "border-transparent bg-[hsl(var(--pastel-blue-bg))] text-[hsl(var(--pastel-blue-fg))] hover:brightness-95",
        "pastel-green":
          "border-transparent bg-[hsl(var(--pastel-green-bg))] text-[hsl(var(--pastel-green-fg))] hover:brightness-95",
        "pastel-pink":
          "border-transparent bg-[hsl(var(--pastel-pink-bg))] text-[hsl(var(--pastel-pink-fg))] hover:brightness-95",
        "pastel-yellow":
          "border-transparent bg-[hsl(var(--pastel-yellow-bg))] text-[hsl(var(--pastel-yellow-fg))] hover:brightness-95",
        "pastel-yellow":
 "border-transparent bg-[hsl(var(--pastel-yellow-bg))] text-[hsl(var(--pastel-yellow-fg))] hover:brightness-95",
        "pastel-purple":
          "border-transparent bg-[hsl(var(--pastel-purple-bg))] text-[hsl(var(--pastel-purple-fg))] hover:brightness-95",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, // Changed from HTMLDivElement
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} /> // Changed div to span
  )
}

export { Badge, badgeVariants }
