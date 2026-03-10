import { redirect } from 'next/navigation'
import PromptsClient from '@/components/dashboard/prompts-client'
import { getCurrentUser } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'

function parseTags(tags: string) {
  try {
    return JSON.parse(tags || '[]') as string[]
  } catch {
    return []
  }
}

export default async function DashboardPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const prompts = await prisma.prompt.findMany({
    where: { userId: user.id },
    include: {
      versions: { orderBy: { version: 'desc' } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  const serialized = prompts.map((prompt) => ({
    id: prompt.id,
    name: prompt.name,
    tags: parseTags(prompt.tags),
    isPublic: prompt.isPublic,
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
    versionCount: prompt.versions.length,
    searchableText: [prompt.name, prompt.tags, ...prompt.versions.map((version) => version.content)].join(' '),
    latestVersion: prompt.versions[0]
      ? {
          id: prompt.versions[0].id,
          content: prompt.versions[0].content,
          version: prompt.versions[0].version,
          message: prompt.versions[0].message,
          model: prompt.versions[0].model,
          createdAt: prompt.versions[0].createdAt.toISOString(),
        }
      : null,
  }))

  return <PromptsClient initialPrompts={serialized} />
}
