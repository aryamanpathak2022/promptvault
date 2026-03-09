import Link from 'next/link'
import { auth } from '@/lib/auth'

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen text-[#EDEDED] overflow-x-hidden" style={{ background: '#080808' }}>
      {/* Dot grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #242424 1px, transparent 1px)',
        backgroundSize: '32px 32px',
        opacity: 0.6,
      }} />
      {/* Violet glow top */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(124,58,237,0.18) 0%, transparent 60%)',
      }} />

      <style>{`
        @keyframes typewriter {
          from { width: 0 }
          to { width: 100% }
        }
        @keyframes blink {
          0%, 100% { opacity: 1 }
          50% { opacity: 0 }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes shimmer {
          0% { background-position: -200% center }
          100% { background-position: 200% center }
        }
        .animate-fade-up { animation: fadeUp 0.6s ease forwards; }
        .animate-fade-up-1 { animation: fadeUp 0.6s 0.1s ease both; }
        .animate-fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; }
        .animate-fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }
        .card-hover {
          transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
        }
        .card-hover:hover {
          transform: translateY(-2px);
          border-color: rgba(124, 58, 237, 0.4) !important;
          box-shadow: 0 0 24px rgba(124, 58, 237, 0.1);
        }
        .gradient-border-btn {
          position: relative;
          background: linear-gradient(135deg, #7C3AED, #a855f7);
          border: none;
          color: white;
          transition: opacity 0.2s, transform 0.2s;
        }
        .gradient-border-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(124,58,237,0.35);
        }
        .outline-btn {
          transition: background 0.2s, border-color 0.2s, transform 0.2s;
        }
        .outline-btn:hover {
          background: rgba(124,58,237,0.1);
          border-color: rgba(124,58,237,0.4);
          transform: translateY(-1px);
        }
        .terminal-line { opacity: 0; animation: fadeUp 0.4s ease forwards; }
        .terminal-line:nth-child(1) { animation-delay: 0.3s }
        .terminal-line:nth-child(2) { animation-delay: 0.7s }
        .terminal-line:nth-child(3) { animation-delay: 1.1s }
        .terminal-line:nth-child(4) { animation-delay: 1.4s }
        .terminal-line:nth-child(5) { animation-delay: 1.6s }
        .terminal-line:nth-child(6) { animation-delay: 1.9s }
        .terminal-line:nth-child(7) { animation-delay: 2.1s }
        .terminal-line:nth-child(8) { animation-delay: 2.4s }
        .terminal-line:nth-child(9) { animation-delay: 2.7s }
        .terminal-line:nth-child(10) { animation-delay: 2.9s }
        .step-connector {
          position: absolute;
          top: 20px;
          left: calc(50% + 40px);
          width: calc(100% - 80px);
          height: 1px;
          background: linear-gradient(to right, #7C3AED, transparent);
        }
      `}</style>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #a855f7)' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="white" strokeWidth="1.5"/>
              <path d="M4 6h6M4 8.5h4" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">PromptVault</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: '#888' }}>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          <a href="#mcp" className="hover:text-white transition-colors">MCP</a>
          <a href="https://github.com/aryamanpathak2022/promptvault" target="_blank" rel="noopener" className="hover:text-white transition-colors">GitHub</a>
        </div>
        <div className="flex items-center gap-3">
          {session ? (
            <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm font-medium gradient-border-btn">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm transition-colors" style={{ color: '#888' }}>Sign in</Link>
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium gradient-border-btn">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs mb-8 animate-fade-up" style={{ borderColor: '#242424', background: '#111111', color: '#888' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Now with MCP server support
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05] animate-fade-up-1">
          Version control for your{' '}
          <span style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #a855f7 50%, #c084fc 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>prompts.</span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-up-2 leading-relaxed" style={{ color: '#888' }}>
          Track every iteration of your AI prompts like code. Diff versions, tag releases, sync across machines — never lose a breakthrough again.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up-3">
          <Link href="/login" className="px-6 py-3 rounded-xl font-semibold gradient-border-btn w-full sm:w-auto text-center">
            Start free →
          </Link>
          <a href="#how-it-works" className="px-6 py-3 rounded-xl border outline-btn w-full sm:w-auto text-center text-sm" style={{ borderColor: '#242424', color: '#888' }}>
            See how it works
          </a>
        </div>

        {/* Terminal demo */}
        <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden text-left shadow-2xl" style={{ border: '1px solid #242424', background: '#111111' }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#242424', background: '#161616' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
            <span className="ml-4 text-xs font-mono" style={{ color: '#444' }}>pvault — terminal</span>
          </div>
          <div className="p-6 font-mono text-sm space-y-1.5">
            <div className="terminal-line"><span style={{ color: '#7C3AED' }}>~</span> <span style={{ color: '#888' }}>$</span> <span style={{ color: '#EDEDED' }}>pv save &quot;code-reviewer&quot; --message &quot;Added security checks&quot;</span></div>
            <div className="terminal-line" style={{ color: '#4ADE80' }}>✓ Saved version 3 of &quot;code-reviewer&quot;</div>
            <div className="terminal-line mt-3"><span style={{ color: '#7C3AED' }}>~</span> <span style={{ color: '#888' }}>$</span> <span style={{ color: '#EDEDED' }}>pv diff code-reviewer v2 v3</span></div>
            <div className="terminal-line pl-2 space-y-0.5">
              <div style={{ color: '#f87171' }}>- Review the following code for bugs only</div>
            </div>
            <div className="terminal-line pl-2">
              <div style={{ color: '#4ADE80' }}>+ Review for bugs AND security vulnerabilities</div>
            </div>
            <div className="terminal-line pl-2">
              <div style={{ color: '#4ADE80' }}>+ Pay attention to injection attacks and auth bypasses</div>
            </div>
            <div className="terminal-line mt-3"><span style={{ color: '#7C3AED' }}>~</span> <span style={{ color: '#888' }}>$</span> <span style={{ color: '#EDEDED' }}>pv list --tag production</span></div>
            <div className="terminal-line" style={{ color: '#888' }}>Found 4 prompts tagged &quot;production&quot;</div>
            <div className="terminal-line" style={{ color: '#888' }}>  → code-reviewer (v3) · summarizer (v7) · email-drafter (v2) · sql-gen (v5)</div>
            <div className="terminal-line flex items-center gap-1">
              <span style={{ color: '#7C3AED' }}>~</span> <span style={{ color: '#888' }}>$</span>
              <span className="inline-block w-2 h-4 ml-1" style={{ background: '#7C3AED', animation: 'blink 1s step-end infinite', animationDelay: '3s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Problem section */}
      <section className="relative z-10 py-16 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { icon: '😭', title: 'Lost prompts', desc: "You crafted the perfect prompt last week. Now it's gone — buried in some chat history you'll never find." },
            { icon: '🔁', title: 'No version history', desc: "You improve a prompt and it works great. Then you try again and now it's worse. What was v1 again?" },
            { icon: '💻', title: 'Scattered everywhere', desc: 'Prompts in Notion, Obsidian, random text files, GitHub gists... no single source of truth.' },
          ].map((item) => (
            <div key={item.title} className="p-6 rounded-xl card-hover" style={{ border: '1px solid #242424', background: '#111111' }}>
              <div className="text-2xl mb-3">{item.icon}</div>
              <h3 className="font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#888' }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need</h2>
          <p className="max-w-xl mx-auto" style={{ color: '#888' }}>Built for developers who take prompts seriously.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '📝', title: 'Version history', desc: 'Every save creates a new version. Roll back anytime. See exactly what changed.' },
            { icon: '🔍', title: 'Diff viewer', desc: 'Inline diffs between any two versions. Insertions in green, deletions in red.' },
            { icon: '🏷️', title: 'Tags & search', desc: 'Tag prompts as production, experimental, deprecated. Full-text search instantly.' },
            { icon: '⚡', title: 'CLI sync', desc: 'Works entirely from the command line. Save, load, diff — all from your terminal.' },
            { icon: '🔑', title: 'API keys', desc: 'Generate API keys for CLI access from any machine or CI pipeline.' },
            { icon: '🤖', title: 'MCP server', desc: 'Plug directly into Claude, Cursor, and AI tools via Model Context Protocol.' },
          ].map((f) => (
            <div key={f.title} className="p-6 rounded-xl card-hover group" style={{ border: '1px solid #242424', background: '#111111' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-4" style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                {f.icon}
              </div>
              <h3 className="font-semibold text-white mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#888' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How it works</h2>
          <p style={{ color: '#888' }}>Three commands to get started.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            { step: '01', title: 'Install the CLI', code: 'npm install -g pvault\npv login' },
            { step: '02', title: 'Save your prompts', code: 'pv save "code-reviewer"\npv save "code-reviewer" -m "v2: added context"' },
            { step: '03', title: 'Use anywhere', code: 'pv load "code-reviewer"\npv diff code-reviewer v1 v2' },
          ].map((s, i) => (
            <div key={s.step} className="space-y-4 relative">
              {i < 2 && (
                <div className="hidden md:block absolute top-4 left-[calc(100%_-_8px)] w-full h-px" style={{ background: 'linear-gradient(to right, rgba(124,58,237,0.5), transparent)', zIndex: 0 }} />
              )}
              <div className="text-xs font-mono font-bold tracking-widest" style={{ color: '#7C3AED' }}>{s.step}</div>
              <h3 className="text-lg font-semibold text-white">{s.title}</h3>
              <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ border: '1px solid #242424', background: '#111111', color: '#4ADE80' }}>{s.code}</pre>
            </div>
          ))}
        </div>
      </section>

      {/* MCP section */}
      <section id="mcp" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="rounded-2xl p-10" style={{ border: '1px solid rgba(124,58,237,0.3)', background: 'rgba(124,58,237,0.05)' }}>
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6" style={{ border: '1px solid rgba(124,58,237,0.4)', background: 'rgba(124,58,237,0.1)', color: '#a78bfa' }}>
                🤖 MCP Server
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Your prompts,<br />inside your AI tools.
              </h2>
              <p className="leading-relaxed mb-6" style={{ color: '#888' }}>
                PromptVault ships with an MCP server. Connect it to Claude Desktop, Cursor, or any MCP-compatible tool and access your entire prompt library directly from within your AI sessions.
              </p>
              <ul className="space-y-2 text-sm" style={{ color: '#888' }}>
                {['Access prompts by name in any AI session', 'Auto-complete prompt names with context', 'Swap prompt versions without leaving your editor'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span style={{ color: '#4ADE80' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #242424', background: '#111111' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#242424', background: '#161616' }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                  <span className="ml-3 text-xs font-mono" style={{ color: '#444' }}>claude_desktop_config.json</span>
                </div>
                <pre className="p-5 text-sm font-mono overflow-x-auto" style={{ color: '#EDEDED' }}>{`{
  "mcpServers": {
    "promptvault": {
      "command": "pv",
      "args": ["mcp-server"],
      "env": {
        "PROMPTVAULT_API_KEY": "pv_..."
      }
    }
  }
}`}</pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-24 px-6 max-w-7xl mx-auto text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Start building better prompts.
          </h2>
          <p className="max-w-lg mx-auto mb-10" style={{ color: '#888' }}>
            Join developers who treat their prompts like production code.
          </p>
          <div className="inline-block p-px rounded-xl" style={{ background: 'linear-gradient(135deg, #7C3AED, #a855f7)' }}>
            <Link href="/login" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-white transition-colors" style={{ background: '#080808' }}>
              <span>Get started free</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t py-10 px-6 max-w-7xl mx-auto" style={{ borderColor: '#242424' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: '#444' }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7C3AED, #a855f7)' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="2" width="8" height="6" rx="1" stroke="white" strokeWidth="1.2"/>
                <path d="M3 4.5h4M3 6h2.5" stroke="white" strokeWidth="1" strokeLinecap="round"/>
              </svg>
            </div>
            <span>PromptVault</span>
          </div>
          <div>Built for developers who take prompts seriously.</div>
          <div className="flex items-center gap-6">
            <a href="https://github.com/aryamanpathak2022/promptvault" target="_blank" rel="noopener" className="hover:text-white transition-colors">GitHub</a>
            <a href="/api/prompts" className="hover:text-white transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
