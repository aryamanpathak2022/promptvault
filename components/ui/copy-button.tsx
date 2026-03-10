'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function CopyButton({
  value,
  label = 'Copy',
  copiedLabel = 'Copied',
  variant = 'outline',
  size = 'sm',
  className,
}: {
  value: string
  label?: string
  copiedLabel?: string
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'secondary'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  className?: string
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button variant={variant} size={size} className={cn('transition-all duration-200', className)} onClick={handleCopy}>
      <span className="inline-flex min-w-[5.5rem] items-center justify-center gap-1.5">
        <span className={cn('transition-opacity duration-200', copied ? 'opacity-100' : 'opacity-0')}>✓</span>
        <span>{copied ? copiedLabel : label}</span>
      </span>
    </Button>
  )
}
