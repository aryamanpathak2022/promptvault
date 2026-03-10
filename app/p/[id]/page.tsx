import Link from 'next/link'
import { notFound } from 'next/navigation'
import CopyButton from '@/components/ui/copy-button'
import { prisma } from '@/lib/prisma'

function parseTags(tags: string) {
  try {
    return JSON.parse(tags || '[]') as string[]
  } catch {
    return []
  }
}

function formatTimestamp(dateString: Date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(dateString)
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
    <div className="min-h-screen bg-[#080808] px-5 py-10 text-zinc-100 md:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col gap-4 rounded-3xl border border-[#1f1f1f] bg-[#101010] p-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Link href="/explore" className="transition-colors hover:text-zinc-200">
                Explore
              </Link>
              <span>/</span>
              <span className="text-zinc-300">Public prompt</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold text-zinc-50">{prompt.name}</h1>
            <p className="mt-2 text-sm text-zinc-400">Shared by {author}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-zinc-400">
              <span>{prompt.versions.length} versions</span>
              {tags.map((tag) => (
                <span key={tag} className="rounded-full border border-[#2a2a2a] bg-[#151515] px-2.5 py-1 text-xs text-zinc-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <Link href="/login" className="rounded-xl border border-[#F59E0B]/30 bg-[#F59E0B]/10 px-4 py-2 text-sm font-medium text-[#f8c86f] transition-colors hover:bg-[#F59E0B]/15">
            Open PromptVault
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          {prompt.versions.map((version, index) => (
            <section key={version.id} className="rounded-3xl border border-[#1f1f1f] bg-[#101010] p-5 md:p-6">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-[#F59E0B]/20 bg-[#F59E0B]/10 px-2.5 py-1 font-mono text-xs text-[#f8c86f]">
                      v{version.version}
                    </span>
                    {index === 0 && (
                      <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-300">
                        latest
                      </span>
                    )}
                    {version.model && (
                      <span className="rounded-full border border-[#2a2a2a] px-2.5 py-1 text-[11px] text-zinc-400">
                        {version.model}
                      </span>
                    )}
                  </div>
                  <p className="mt-3 text-sm font-medium text-zinc-100">{version.message || 'No commit message'}</p>
                  <p className="mt-1 text-xs text-zinc-500">{formatTimestamp(version.createdAt)}</p>
                </div>
                <CopyButton value={version.content} label="Copy version" copiedLabel="Copied" />
              </div>
              <pre className="mt-5 whitespace-pre-wrap break-words rounded-3xl border border-[#1f1f1f] bg-[#0b0b0b] p-4 font-mono text-sm leading-7 text-zinc-200">
                {version.content}
              </pre>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
}
