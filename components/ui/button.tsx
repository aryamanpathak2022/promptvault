import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: "bg-white text-black hover:bg-white/90",
      destructive: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30",
      outline: "border border-white/10 bg-transparent text-white hover:bg-white/5",
      ghost: "hover:bg-white/5 text-white/70 hover:text-white",
      link: "text-white underline-offset-4 hover:underline",
      secondary: "bg-white/10 text-white hover:bg-white/20",
    }
    const sizes = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-7 px-3 text-xs",
      lg: "h-11 px-8 text-base",
      icon: "h-9 w-9",
    }
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
