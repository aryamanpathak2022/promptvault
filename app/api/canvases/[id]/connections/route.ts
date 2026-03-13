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

// GET /api/canvases/[id]/connections
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
    where: { id, userId: user.id }
  })

  if (!canvas) {
    return NextResponse.json({ error: 'Canvas not found' }, { status: 404 })
  }

  const connections = await prisma.blockConnection.findMany({
    where: { canvasId: id }
  })

  return NextResponse.json(connections)
}

// POST /api/canvases/[id]/connections
export async function POST(
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

  const body = await request.json()
  const { sourceBlockId, targetBlockId, sourceHandle, targetHandle, label } = body

  const sourceBlock = await prisma.promptBlock.findFirst({
    where: { id: sourceBlockId, canvasId: id }
  })
  const targetBlock = await prisma.promptBlock.findFirst({
    where: { id: targetBlockId, canvasId: id }
  })

  if (!sourceBlock || !targetBlock) {
    return NextResponse.json({ error: 'Invalid blocks' }, { status: 400 })
  }

  const connection = await prisma.blockConnection.create({
    data: {
      canvasId: id,
      sourceBlockId,
      targetBlockId,
      sourceHandle: sourceHandle || 'output',
      targetHandle: targetHandle || 'input',
      label
    }
  })

  await prisma.canvas.update({
    where: { id },
    data: { updatedAt: new Date() }
  })

  return NextResponse.json(connection)
}

// DELETE /api/canvases/[id]/connections
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUserFromSession()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const { searchParams } = new URL(request.url)
  const connectionId = searchParams.get('connectionId')

  if (!connectionId) {
    return NextResponse.json({ error: 'Connection ID required' }, { status: 400 })
  }

  const canvas = await prisma.canvas.findFirst({
    where: { id, userId: user.id }
  })

  if (!canvas) {
    return NextResponse.json({ error: 'Canvas not found' }, { status: 404 })
  }

  await prisma.blockConnection.delete({ where: { id: connectionId } })

  await prisma.canvas.update({
    where: { id },
    data: { updatedAt: new Date() }
  })

  return NextResponse.json({ success: true })
}
