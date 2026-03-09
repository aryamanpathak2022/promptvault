import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req as any)
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
  return NextResponse.json(versions)
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req as any)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const prompt = await prisma.prompt.findFirst({
    where: { id, userId: ctx.userId },
  })
  if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const { content, message, model } = body

  if (!content) return NextResponse.json({ error: 'content required' }, { status: 400 })

  const lastVersion = await prisma.version.findFirst({
    where: { promptId: id },
    orderBy: { version: 'desc' },
  })

  const nextVersion = (lastVersion?.version ?? 0) + 1

  const version = await prisma.version.create({
    data: {
      promptId: id,
      content,
      message,
      version: nextVersion,
      model,
    },
  })

  await prisma.prompt.update({
    where: { id },
    data: { updatedAt: new Date() },
  })

  return NextResponse.json(version, { status: 201 })
}
