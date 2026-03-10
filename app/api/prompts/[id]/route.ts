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

function serializePrompt(prompt: any) {
  return {
    id: prompt.id,
    name: prompt.name,
    tags: parseTags(prompt.tags),
    isPublic: prompt.isPublic,
    createdAt: prompt.createdAt.toISOString(),
    updatedAt: prompt.updatedAt.toISOString(),
    versions: prompt.versions.map(serializeVersion),
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const prompt = await prisma.prompt.findFirst({
    where: { id, userId: ctx.userId },
    include: { versions: { orderBy: { version: 'desc' } } },
  })

  if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(serializePrompt(prompt))
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const name = typeof body.name === 'string' ? body.name.trim() : undefined
  const tags = Array.isArray(body.tags) ? body.tags.filter((tag: unknown) => typeof tag === 'string') : undefined
  const isPublic = typeof body.isPublic === 'boolean' ? body.isPublic : undefined

  const updated = await prisma.prompt.updateMany({
    where: { id, userId: ctx.userId },
    data: {
      ...(name ? { name } : {}),
      ...(tags ? { tags: JSON.stringify(tags) } : {}),
      ...(isPublic !== undefined ? { isPublic } : {}),
    },
  })

  if (updated.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const prompt = await prisma.prompt.findFirst({
    where: { id, userId: ctx.userId },
    include: { versions: { orderBy: { version: 'desc' } } },
  })

  return NextResponse.json(prompt ? serializePrompt(prompt) : { success: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const result = await prisma.prompt.deleteMany({
    where: { id, userId: ctx.userId },
  })

  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
