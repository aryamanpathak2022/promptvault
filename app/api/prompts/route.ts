import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

function parseTags(tags: string) {
  try {
    return JSON.parse(tags || '[]') as string[]
  } catch {
    return []
  }
}

function serializeVersion(version: any) {
  return {
    id: version.id,
    content: version.content,
    version: version.version,
    message: version.message,
    model: version.model,
    createdAt: version.createdAt.toISOString(),
  }
}

function serializePromptSummary(prompt: any) {
  return {
    id: prompt.id,
    name: prompt.name,
    tags: parseTags(prompt.tags),
    isPublic: prompt.isPublic,
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
    versionCount: prompt.versions.length,
    searchableText: [prompt.name, prompt.tags, ...prompt.versions.map((version: any) => version.content)].join(' '),
    latestVersion: prompt.versions[0] ? serializeVersion(prompt.versions[0]) : null,
  }
}

export async function GET(req: Request) {
  const ctx = await getAuthContext(req)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prompts = await prisma.prompt.findMany({
    where: { userId: ctx.userId },
    include: {
      versions: { orderBy: { version: 'desc' } },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(prompts.map(serializePromptSummary))
}

export async function POST(req: Request) {
  const ctx = await getAuthContext(req)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const tags = Array.isArray(body.tags) ? body.tags.filter((tag: unknown) => typeof tag === 'string') : []
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const model = typeof body.model === 'string' ? body.model.trim() : ''
  const isPublic = Boolean(body.isPublic)

  if (!name || !content) {
    return NextResponse.json({ error: 'Name and content are required.' }, { status: 400 })
  }

  const prompt = await prisma.prompt.create({
    data: {
      name,
      userId: ctx.userId,
      tags: JSON.stringify(tags),
      isPublic,
      versions: {
        create: {
          content,
          message: message || 'Initial version',
          version: 1,
          model: model || null,
        },
      },
    },
    include: {
      versions: { orderBy: { version: 'desc' } },
    },
  })

  return NextResponse.json(serializePromptSummary(prompt), { status: 201 })
}
