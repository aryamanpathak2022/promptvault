import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req as any)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const prompt = await prisma.prompt.findFirst({
    where: { id, userId: ctx.userId },
    include: { versions: { orderBy: { version: 'desc' } } },
  })

  if (!prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(prompt)
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req as any)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const body = await req.json()
  const { name, tags, isPublic } = body

  const prompt = await prisma.prompt.updateMany({
    where: { id, userId: ctx.userId },
    data: {
      ...(name && { name }),
      ...(tags !== undefined && { tags: JSON.stringify(tags) }),
      ...(isPublic !== undefined && { isPublic }),
    },
  })

  if (prompt.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const ctx = await getAuthContext(req as any)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = await params

  const result = await prisma.prompt.deleteMany({
    where: { id, userId: ctx.userId },
  })

  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
