import { redirect } from 'next/navigation'
import SettingsClient from '@/components/dashboard/settings-client'
import { getCurrentUser } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'

export default async function SettingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  })

  const serialized = keys.map((key) => ({
    id: key.id,
    name: key.name,
    key: `${key.key.slice(0, 8)}...${key.key.slice(-4)}`,
    createdAt: key.createdAt.toISOString(),
    lastUsed: key.lastUsed?.toISOString() ?? null,
  }))

  return <SettingsClient initialKeys={serialized} />
}
