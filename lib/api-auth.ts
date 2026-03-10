import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/current-user'

export async function getAuthContext(req: Request | { headers: Headers }) {
  const user = await getCurrentUser()
  if (user) {
    return { userId: user.id, via: 'session' as const }
  }

  const apiKey = req.headers.get('x-api-key')
  if (apiKey) {
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      select: { userId: true, id: true },
    })

    if (key) {
      await prisma.apiKey.update({
        where: { id: key.id },
        data: { lastUsed: new Date() },
      })

      return { userId: key.userId, via: 'apikey' as const }
    }
  }

  return null
}
