import Link from 'next/link'
import { notFound } from 'next/navigation'
import CopyButton from '@/components/ui/copy-button'
import { formatRelativeTime } from '@/lib/format'
import { prisma } from '@/lib/prisma'

function parseTags(tags: string) {
  try {
    return JSON.parse(tags || '[]') as string[]
  } catch {
    return []
  }
}

export default async function PublicPromptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prompt = await prisma.prompt.findFirst({
    where: { id, isPublic: true },
    include: {
      user: { select: { name: true, email: true } },
      versions: { orderBy: { version: 'desc' } },
    },
  })

  if (!prompt) notFound()

  const author = prompt.user.name ?? prompt.user.email ?? 'Anonymous'
  const tags = parseTags(prompt.tags)

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-8 text-zinc-100 md:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 rounded-xl border border-[#1b1b1b] bg-[#101010] p-5 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-zinc-500">
              <Link href="/explore" className="transition-colors hover:text-zinc-200">
                Explore
              </Link>
              <span>/</span>
              <span className="text-zinc-300">Public prompt</span>
            </div>
            <h1 className="mt-1.5 text-xl font-semibold text-zinc-50">{prompt.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">Shared by {author}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
              <span>{prompt.versions.length} versions</span>
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#222222] px-2 py-0.5 text-[11px] text-zinc-400">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <Link href="/login" className="rounded-lg border border-[#222222] bg-[#101010] px-3 py-2 text-sm font-medium text-zinc-300 transition-colors hover:bg-[#131313] hover:text-zinc-50">
            Open PromptVault
          </Link>
        </div>

        <div className="mt-4 space-y-3">
          {prompt.versions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#222222] bg-[#0f0f0f] px-5 py-10 text-center text-sm text-zinc-500">
              No versions yet. Save your first version above.
            </div>
          ) : (
            prompt.versions.map((version, index) => (
              <section key={version.id} className="rounded-xl border border-[#1b1b1b] bg-[#101010] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[12px] text-zinc-500">
                        v{version.version} · {formatRelativeTime(version.createdAt)} · {version.message ?? 'No commit message'}
                      </p>
                      {index === 0 && <span className="text-[10px] text-zinc-600">latest</span>}
                      {version.model && <span className="rounded-full border border-[#222222] px-2 py-0.5 text-[11px] text-zinc-400">{version.model}</span>}
                    </div>
                  </div>
                  <CopyButton value={version.content} label="Copy version" copiedLabel="✓ Copied" />
                </div>
                <pre className="mt-3 whitespace-pre-wrap break-words rounded-lg border border-[#181818] bg-[#0b0b0b] p-3 font-mono text-[13px] leading-6 text-zinc-200">
                  {version.content}
                </pre>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
