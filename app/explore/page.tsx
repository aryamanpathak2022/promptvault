import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { formatRelativeTime } from '@/lib/format'

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
    <div className="min-h-screen bg-[#080808] px-4 py-8 text-zinc-100 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-5">
          <p className="text-[11px] uppercase tracking-[0.18em] text-zinc-500">Explore</p>
          <h1 className="mt-1.5 text-xl font-semibold text-zinc-50">Public prompts</h1>
          <p className="mt-1 text-sm text-zinc-500">Browse what other people decided was worth sharing.</p>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {prompts.map((prompt) => {
            const author = prompt.user.name ?? prompt.user.email ?? 'Anonymous'
            const tags = parseTags(prompt.tags)
            const latest = prompt.versions[0]
            return (
              <Link
                key={prompt.id}
                href={`/p/${prompt.id}`}
                className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4 transition-colors hover:border-[#2f2413] hover:bg-[#121212]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-50">{prompt.name}</p>
                    <p className="mt-1 text-sm text-zinc-500">by {author}</p>
                    {latest && (
                      <p className="mt-1 font-mono text-[12px] text-zinc-500">
                        v{latest.version} · {formatRelativeTime(latest.createdAt)} · {latest.message ?? 'No commit message'}
                      </p>
                    )}
                  </div>
                  <span className="rounded-full border border-[#1f1f1f] bg-[#0b0b0b] px-2 py-0.5 text-[11px] text-zinc-400">
                    {prompt._count.versions}
                  </span>
                </div>

                {tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#222222] px-2 py-0.5 text-[11px] text-zinc-400">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 rounded-lg border border-[#181818] bg-[#0b0b0b] p-3">
                  <p className="line-clamp-4 whitespace-pre-wrap font-mono text-[12px] leading-5 text-zinc-400">
                    {latest?.content ?? 'No versions yet. Save your first version above.'}
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
