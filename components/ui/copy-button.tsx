'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

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
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleCopy}>
      {copied ? copiedLabel : label}
    </Button>
  )
}
