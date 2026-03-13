import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function getUserFromSession() {
  const session: any = await auth()
  if (!session?.user?.email) {
    return null
  }
  return prisma.user.findUnique({
    where: { email: session.user.email }
  })
}

// GET /api/canvases/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromSession()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const canvas = await prisma.canvas.findFirst({
    where: { id, userId: user.id },
    include: {
      blocks: { orderBy: { createdAt: 'asc' } },
      connections: true
    }
  })

  if (!canvas) {
    return NextResponse.json({ error: 'Canvas not found' }, { status: 404 })
  }

  return NextResponse.json(canvas)
}

// PUT /api/canvases/[id]
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromSession()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()
  const { name, description, isPublic } = body

  const canvas = await prisma.canvas.findFirst({
    where: { id, userId: user.id }
  })

  if (!canvas) {
    return NextResponse.json({ error: 'Canvas not found' }, { status: 404 })
  }

  const updated = await prisma.canvas.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(isPublic !== undefined && { isPublic })
    },
    include: { blocks: true, connections: true }
  })

  return NextResponse.json(updated)
}

// DELETE /api/canvases/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromSession()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const canvas = await prisma.canvas.findFirst({
    where: { id, userId: user.id }
  })

  if (!canvas) {
    return NextResponse.json({ error: 'Canvas not found' }, { status: 404 })
  }

  await prisma.canvas.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
