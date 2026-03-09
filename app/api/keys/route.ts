import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await prisma.apiKey.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true, lastUsed: true, key: true },
  })

  // Mask keys
  const masked = keys.map(k => ({
    ...k,
    key: k.key.slice(0, 8) + '...' + k.key.slice(-4),
  }))

  return NextResponse.json(masked)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const key = 'pv_' + randomBytes(32).toString('hex')

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: session.user.id,
      name,
      key,
    },
  })

  return NextResponse.json({ ...apiKey, key }, { status: 201 })
}

export async function DELETE(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await req.json()

  await prisma.apiKey.deleteMany({
    where: { id, userId: session.user.id },
  })

  return NextResponse.json({ success: true })
}
