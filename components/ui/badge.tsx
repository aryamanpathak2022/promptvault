import * as React from 'react'
import { cn } from '@/lib/utils'

function Badge({
  className,
  variant = 'default',
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: 'default' | 'secondary' | 'destructive' | 'outline' }) {
  const variants = {
    default: 'border-[#F59E0B]/20 bg-[#F59E0B]/10 text-[#f7c66a]',
    secondary: 'border-[#2a2a2a] bg-[#151515] text-zinc-300',
    destructive: 'border-red-500/30 bg-red-500/10 text-red-300',
    outline: 'border-[#2a2a2a] bg-transparent text-zinc-400',
  }

  return (
    <div
      className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', variants[variant], className)}
      {...props}
    />
  )
}

export { Badge }
