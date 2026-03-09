import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import PromptsClient from '@/components/dashboard/prompts-client'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.id) return null

  const prompts = await prisma.prompt.findMany({
    where: { userId: session.user.id },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const serialized = prompts.map(p => ({
    ...p,
    tags: JSON.parse(p.tags || '[]') as string[],
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    versions: p.versions.map(v => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
    })),
  }))

  return <PromptsClient initialPrompts={serialized} />
}
