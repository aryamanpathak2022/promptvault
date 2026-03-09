import { NextResponse } from 'next/server'
import { getAuthContext } from '@/lib/api-auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request) {
  const ctx = await getAuthContext(req as any)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prompts = await prisma.prompt.findMany({
    where: { userId: ctx.userId },
    include: {
      versions: {
        orderBy: { version: 'desc' },
        take: 1,
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(prompts)
}

export async function POST(req: Request) {
  const ctx = await getAuthContext(req as any)
  if (!ctx) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { name, content, tags = [], message, model, isPublic = false } = body

  if (!name || !content) {
    return NextResponse.json({ error: 'name and content required' }, { status: 400 })
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
          model,
        },
      },
    },
    include: { versions: true },
  })

  return NextResponse.json(prompt, { status: 201 })
}
