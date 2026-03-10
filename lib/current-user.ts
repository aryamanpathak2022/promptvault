import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

function getSessionEmail(user: { email?: string | null; id?: string | null }) {
  if (user.email) return user.email
  if (user.id) return `github-${user.id}@users.noreply.promptvault.local`
  return null
}

export async function getCurrentUser() {
  const session = await auth()
  const email = session?.user ? getSessionEmail(session.user) : null

  if (!session?.user || !email) return null

  return prisma.user.upsert({
    where: { email },
    update: {
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    },
    create: {
      email,
      name: session.user.name ?? undefined,
      image: session.user.image ?? undefined,
    },
  })
}
