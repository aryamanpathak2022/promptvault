import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-[#F59E0B] text-[#080808] hover:bg-[#f7b541]',
      destructive: 'border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/15',
      outline: 'border border-[#2a2a2a] bg-[#111111] text-zinc-100 hover:border-[#F59E0B]/50 hover:bg-[#171717]',
      ghost: 'text-zinc-400 hover:bg-[#171717] hover:text-zinc-100',
      link: 'text-[#F59E0B] underline-offset-4 hover:underline',
      secondary: 'bg-[#171717] text-zinc-100 hover:bg-[#202020]',
    }

    const sizes = {
      default: 'h-10 px-4 py-2 text-sm',
      sm: 'h-8 px-3 text-xs',
      lg: 'h-11 px-6 text-sm',
      icon: 'h-10 w-10',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/30 focus:ring-offset-0 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
