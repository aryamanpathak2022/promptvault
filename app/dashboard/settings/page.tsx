import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import SettingsClient from '@/components/dashboard/settings-client'

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = keys.map((k: any) => ({
    id: k.id,
    name: k.name,
    key: k.key.slice(0, 8) + '...' + k.key.slice(-4),
    createdAt: k.createdAt.toISOString(),
    lastUsed: k.lastUsed?.toISOString() ?? null,
  }))

  return <SettingsClient initialKeys={serialized} />
}
