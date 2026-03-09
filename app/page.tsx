import Link from 'next/link'
import { auth } from '@/lib/auth'

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-[#060810] text-[#e2e8f0] overflow-x-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0" style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(56,189,248,0.12) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 50%, rgba(129,140,248,0.08) 0%, transparent 50%)'
        }} />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔒</span>
          <span className="font-bold text-white text-lg">PromptVault</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#mcp" className="hover:text-white transition-colors">MCP</a>
          <a href="https://github.com/aryamanbagchi/promptvault" target="_blank" rel="noopener" className="hover:text-white transition-colors">GitHub</a>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-white/60 hover:text-white transition-colors">Sign in</Link>
              <Link href="/login" className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Now with MCP server support
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6" style={{
          background: 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 50%, #38bdf8 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          Version control<br />for your prompts
        </h1>

        <p className="text-lg md:text-xl text-white/50 max-w-2xl mx-auto mb-10">
          Track every iteration of your AI prompts like code. Diff versions, tag releases, sync across machines, and never lose a breakthrough prompt again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link href="/login" className="px-6 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors w-full sm:w-auto text-center">
            Start free →
          </Link>
          <a href="#how-it-works" className="px-6 py-3 rounded-xl border border-white/10 text-white/70 hover:bg-white/5 hover:text-white transition-colors w-full sm:w-auto text-center">
            See how it works
          </a>
        </div>

        {/* Terminal demo */}
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden text-left shadow-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
            <div className="w-3 h-3 rounded-full bg-red-500/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="ml-4 text-xs text-white/30 font-mono">terminal</span>
          </div>
          <div className="p-6 font-mono text-sm space-y-2">
            <div><span className="text-emerald-400">$</span> <span className="text-white/90">pv save &quot;code-reviewer&quot; --message &quot;Added security checks&quot;</span></div>
            <div className="text-white/40">✓ Saved version 3 of &quot;code-reviewer&quot;</div>
            <div className="mt-4"><span className="text-emerald-400">$</span> <span className="text-white/90">pv diff code-reviewer v2 v3</span></div>
            <div className="pl-4 space-y-1">
              <div className="text-red-400/80">- Review the following code for bugs only</div>
              <div className="text-emerald-400/80">+ Review the following code for bugs AND security vulnerabilities</div>
              <div className="text-emerald-400/80">+ Pay special attention to injection attacks and auth bypasses</div>
            </div>
            <div className="mt-4"><span className="text-emerald-400">$</span> <span className="text-white/90">pv list --tag production</span></div>
            <div className="text-white/40">Found 4 prompts tagged &quot;production&quot;</div>
            <div className="text-white/40">  → code-reviewer (v3) · summarizer (v7) · email-drafter (v2) · sql-gen (v5)</div>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { emoji: '😭', title: 'Lost prompts', desc: 'You crafted the perfect prompt last week. Now it\'s gone — buried in some chat history you\'ll never find.' },
            { emoji: '🔁', title: 'No version history', desc: 'You improve a prompt and it works great. Then you try to improve it more and now it\'s worse. What was v1 again?' },
            { emoji: '💻', title: 'Scattered everywhere', desc: 'Prompts in Notion, Obsidian, random text files, GitHub gists... there\'s no single source of truth.' },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-xl border border-white/10 bg-white/5">
              <div className="text-3xl mb-4">{item.emoji}</div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Everything you need</h2>
          <p className="text-white/50 max-w-xl mx-auto">Built for developers who take prompts seriously.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: '📝', title: 'Version history', desc: 'Every save creates a new version. Roll back anytime. See exactly what changed between versions with a beautiful diff viewer.' },
            { icon: '🔍', title: 'Diff viewer', desc: 'Side-by-side or inline diffs between any two versions. See insertions in green, deletions in red.' },
            { icon: '🏷️', title: 'Tags & search', desc: 'Tag prompts as production, experimental, deprecated. Full-text search across all your prompts instantly.' },
            { icon: '🔄', title: 'CLI sync', desc: 'Works entirely from the command line. Save, load, diff, push, pull — all from your terminal.' },
            { icon: '🔑', title: 'API keys', desc: 'Generate API keys for your CLI. Access your vault from any machine, any CI pipeline.' },
            { icon: '🤖', title: 'MCP server', desc: 'Plug directly into Claude, Cursor, and other AI tools via the Model Context Protocol.' },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors">
              <div className="text-2xl mb-4">{f.icon}</div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">How it works</h2>
          <p className="text-white/50">Three commands to get started.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Install', code: 'npm install -g promptvault\npv login' },
            { step: '02', title: 'Save prompts', code: 'pv save "my-prompt"\npv save "my-prompt" -m "v2: added context"' },
            { step: '03', title: 'Use anywhere', code: 'pv load "my-prompt"\npv diff my-prompt v1 v2' },
          ].map((s) => (
            <div key={s.step} className="space-y-4">
              <div className="text-4xl font-bold text-white/10">{s.step}</div>
              <h3 className="text-lg font-semibold text-white">{s.title}</h3>
              <pre className="p-4 rounded-lg border border-white/10 bg-black/40 text-sm text-emerald-400/90 font-mono overflow-x-auto">{s.code}</pre>
            </div>
          ))}
        </div>
      </section>

      {/* MCP section */}
      <section id="mcp" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="rounded-2xl border border-sky-500/20 bg-sky-500/5 p-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-xs text-sky-400 mb-6">
            🤖 MCP Server
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Your prompts, inside your AI tools
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mb-8">
            PromptVault ships with an MCP server. Connect it to Claude Desktop, Cursor, or any MCP-compatible tool and access your entire prompt library from within your AI sessions.
          </p>
          <pre className="inline-block text-left px-6 py-4 rounded-xl border border-white/10 bg-black/40 text-sm text-white/80 font-mono">
{`{
  "mcpServers": {
    "promptvault": {
      "command": "pv",
      "args": ["mcp-server"]
    }
  }
}`}
          </pre>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Start building better prompts
        </h2>
        <p className="text-white/50 max-w-lg mx-auto mb-10">
          Join developers who treat their prompts like production code.
        </p>
        <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-black font-semibold text-lg hover:bg-white/90 transition-colors">
          Get started free →
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 py-10 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/30">
          <div className="flex items-center gap-2">
            <span>🔒</span>
            <span>PromptVault</span>
          </div>
          <div>Built for developers who take prompts seriously.</div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/aryamanbagchi/promptvault" target="_blank" rel="noopener" className="hover:text-white/60 transition-colors">GitHub</a>
            <a href="/api/prompts" className="hover:text-white/60 transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
