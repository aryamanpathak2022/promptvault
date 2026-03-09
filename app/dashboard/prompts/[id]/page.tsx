import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import PromptDetailClient from '@/components/dashboard/prompt-detail-client'

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return null
  const { id } = await params

  const prompt = await prisma.prompt.findFirst({
    where: { id, userId: session.user.id },
    include: { versions: { orderBy: { version: 'desc' } } },
  })

  if (!prompt) notFound()

  const serialized = {
    ...prompt,
    tags: JSON.parse(prompt.tags || '[]') as string[],
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
    versions: prompt.versions.map(v => ({
      ...v,
      createdAt: v.createdAt.toISOString(),
    })),
  }

  return <PromptDetailClient prompt={serialized} />
}
