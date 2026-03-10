import { notFound, redirect } from 'next/navigation'
import PromptDetailClient from '@/components/dashboard/prompt-detail-client'
import { getCurrentUser } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'

function parseTags(tags: string) {
  try {
    return JSON.parse(tags || '[]') as string[]
  } catch {
    return []
  }
}

export default async function PromptDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { id } = await params
  const prompt = await prisma.prompt.findFirst({
    where: { id, userId: user.id },
    include: { versions: { orderBy: { version: 'desc' } } },
  })

  if (!prompt) notFound()

  const serialized = {
    id: prompt.id,
    name: prompt.name,
    tags: parseTags(prompt.tags),
    isPublic: prompt.isPublic,
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
    versions: prompt.versions.map((version) => ({
      id: version.id,
      content: version.content,
      version: version.version,
      message: version.message,
      model: version.model,
      createdAt: version.createdAt.toISOString(),
    })),
  }

  return <PromptDetailClient prompt={serialized} />
}
