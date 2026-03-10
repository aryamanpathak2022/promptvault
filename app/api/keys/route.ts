import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true, lastUsed: true, key: true },
  })

  return NextResponse.json(
    keys.map((key) => ({
      ...key,
      key: `${key.key.slice(0, 8)}...${key.key.slice(-4)}`,
    }))
  )
}

export async function POST(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const name = typeof body.name === 'string' ? body.name.trim() : ''

  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 })
  }

  const key = `pv_${randomBytes(32).toString('hex')}`
  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      name,
      key,
    },
  })

  return NextResponse.json(
    {
      id: apiKey.id,
      name: apiKey.name,
      key,
      maskedKey: `${key.slice(0, 8)}...${key.slice(-4)}`,
      createdAt: apiKey.createdAt.toISOString(),
      lastUsed: apiKey.lastUsed?.toISOString() ?? null,
    },
    { status: 201 }
  )
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const id = typeof body.id === 'string' ? body.id : ''

  if (!id) {
    return NextResponse.json({ error: 'Key id is required.' }, { status: 400 })
  }

  const result = await prisma.apiKey.deleteMany({
    where: { id, userId: user.id },
  })

  if (result.count === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ success: true })
}
