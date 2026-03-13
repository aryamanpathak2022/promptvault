import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session: any = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - no email' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const canvases = await prisma.canvas.findMany({
      where: { userId: user.id },
      include: {
        blocks: true,
        _count: { select: { blocks: true, connections: true } }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json(canvases)
  } catch (error: any) {
    console.error('GET canvases error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session: any = await auth()
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized - no email' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { name } = body as { name?: string }

    const canvas = await prisma.canvas.create({
      data: {
        name: name || 'Untitled Canvas',
        userId: user.id
      },
      include: { blocks: true }
    })

    return NextResponse.json(canvas)
  } catch (error: any) {
    console.error('POST canvases error:', error)
    return NextResponse.json({ 
      error: 'Failed to create canvas', 
      details: error.message || String(error),
      code: error.code 
    }, { status: 500 })
  }
}
