import * as React from "react"
import { cn } from "@/lib/utils"

function Badge({ className, variant = 'default', ...props }: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'destructive' | 'outline' }) {
  const variants = {
    default: "bg-white/10 text-white/80 border-transparent",
    secondary: "bg-white/5 text-white/60 border-white/10",
    destructive: "bg-red-500/20 text-red-400 border-red-500/30",
    outline: "border-white/20 text-white/70",
  }
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Badge }
