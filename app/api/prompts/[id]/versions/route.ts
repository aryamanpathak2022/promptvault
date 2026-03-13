import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const prompt = await prisma.prompt.findFirst({
    where: { id, userId: ctx.userId },
  })

  if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const versions = await prisma.version.findMany({
    where: { promptId: id },
    orderBy: { version: 'desc' },
  })

  return NextResponse.json(versions.map(serializeVersion))
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const prompt = await prisma.prompt.findFirst({
    where: { id, userId: ctx.userId },
  })

  if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const content = typeof body.content === 'string' ? body.content.trim() : ''
  const message = typeof body.message === 'string' ? body.message.trim() : ''
  const model = typeof body.model === 'string' ? body.model.trim() : ''

  if (!content) {
    return NextResponse.json({ error: 'Content is required.' }, { status: 400 })
  }

  if (content.length > 100_000) {
    return NextResponse.json({ error: 'Content must be 100,000 characters or less.' }, { status: 400 })
  }

  const version = await prisma.$transaction(async (tx) => {
    const lastVersion = await tx.version.findFirst({
      where: { promptId: id },
      orderBy: { version: 'desc' },
    })

    const createdVersion = await tx.version.create({
      data: {
        promptId: id,
        content,
        message: message || null,
        version: (lastVersion?.version ?? 0) + 1,
        model: model || null,
      },
    })

    await tx.prompt.update({
      where: { id },
      data: { updatedAt: new Date() },
    })

    return createdVersion
  })

  return NextResponse.json(serializeVersion(version), { status: 201 })
}
