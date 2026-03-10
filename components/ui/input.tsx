import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'flex h-11 w-full rounded-xl border border-[#2a2a2a] bg-[#111111] px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-[#F59E0B]/60 focus:outline-none',
        className
      )}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export { Input }
