import { randomBytes, createHash } from 'crypto'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/current-user'
import { prisma } from '@/lib/prisma'

function hashKey(key: string): string {
  return createHash('sha256').update(key).digest('hex')
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true, lastUsed: true, keyPrefix: true },
  })

  return NextResponse.json(
    keys.map((key) => ({
      id: key.id,
      name: key.name,
      key: key.keyPrefix ? `${key.keyPrefix}...` : '••••••••',
      createdAt: key.createdAt.toISOString(),
      lastUsed: key.lastUsed?.toISOString() ?? null,
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

  const rawKey = `pv_${randomBytes(32).toString('hex')}`
  const hashedKey = hashKey(rawKey)
  const keyPrefix = rawKey.slice(0, 8)

  const apiKey = await prisma.apiKey.create({
    data: {
      userId: user.id,
      name,
      key: hashedKey,
      keyPrefix,
    },
  })

  // Return the raw key only on creation — it cannot be retrieved again
  return NextResponse.json(
    {
      id: apiKey.id,
      name: apiKey.name,
      key: rawKey,
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
