import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextRequest } from 'next/server'

export async function getAuthContext(req: NextRequest) {
  // Try session first
  const session = await auth()
  if (session?.user?.id) {
    return { userId: session.user.id, via: 'session' as const }
  }

  // Try API key
  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      select: { userId: true, id: true },
    })
    if (key) {
      // Update lastUsed
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsed: new Date() },
      })
      return { userId: key.userId, via: 'apikey' as const }
    }
  }

  return null
}
