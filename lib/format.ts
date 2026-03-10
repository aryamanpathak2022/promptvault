export function formatRelativeTime(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  const now = Date.now()
  const diffMs = now - date.getTime()
  const diffMinutes = Math.max(1, Math.round(diffMs / 60000))
  const diffHours = Math.round(diffMinutes / 60)
  const diffDays = Math.round(diffHours / 24)

  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays == 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays}d ago`

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function estimateTokens(text: string) {
  return Math.max(1, Math.ceil(text.length / 4))
}
