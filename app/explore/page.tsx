import Link from 'next/link'
import { prisma } from '@/lib/prisma'

function parseTags(tags: string) {
  try {
    return JSON.parse(tags || '[]') as string[]
  } catch {
    return []
  }
}

export default async function ExplorePage() {
  const prompts = await prisma.prompt.findMany({
    where: { isPublic: true },
    include: {
      user: { select: { name: true, email: true } },
      versions: {
        orderBy: { version: 'desc' },
        take: 1,
      },
      _count: {
        select: { versions: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return (
    <div className="min-h-screen bg-[#080808] px-5 py-10 text-zinc-100 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-[#1f1f1f] bg-[#101010] p-6">
          <p className="text-xs uppercase tracking-[0.24em] text-[#F59E0B]">Explore</p>
          <h1 className="mt-3 text-3xl font-semibold text-zinc-50">Public prompts from the community</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Browse publicly shared prompts, inspect versions, and open any prompt in read-only mode.
          </p>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {prompts.map((prompt) => {
            const author = prompt.user.name ?? prompt.user.email ?? 'Anonymous'
            const tags = parseTags(prompt.tags)
            return (
              <Link
                key={prompt.id}
                href={`/p/${prompt.id}`}
                className="rounded-3xl border border-[#1f1f1f] bg-[#101010] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#F59E0B]/35 hover:bg-[#131313]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-zinc-50">{prompt.name}</p>
                    <p className="mt-1 text-sm text-zinc-400">by {author}</p>
                  </div>
                  <span className="rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2.5 py-1 text-xs font-medium text-[#f8c86f]">
                    {prompt._count.versions} version{prompt._count.versions === 1 ? '' : 's'}
                  </span>
                </div>

                {tags.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#2a2a2a] bg-[#151515] px-2.5 py-1 text-xs text-zinc-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-[#1f1f1f] bg-[#0b0b0b] p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {prompt.versions[0]?.model ?? 'Public prompt'}
                  </p>
                  <p className="mt-3 line-clamp-3 whitespace-pre-wrap font-mono text-xs leading-6 text-zinc-400">
                    {prompt.versions[0]?.content ?? 'No content available.'}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
