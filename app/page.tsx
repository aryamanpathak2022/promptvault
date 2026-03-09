import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/lib/auth'

export default async function LandingPage() {
  const session = await auth()

  return (
    <div className="min-h-screen text-[#FAFAFA] overflow-x-hidden" style={{ background: '#080808' }}>
      {/* Dot grid background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #1a1a1a 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
      {/* Amber glow top */}
      <div className="fixed inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse 70% 40% at 50% -5%, rgba(245,158,11,0.12) 0%, transparent 60%)',
      }} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px) }
          to { opacity: 1; transform: translateY(0) }
        }
        @keyframes blink {
          0%, 100% { opacity: 1 }
          50% { opacity: 0 }
        }
        .animate-fade-up { animation: fadeUp 0.6s ease forwards; }
        .animate-fade-up-1 { animation: fadeUp 0.6s 0.1s ease both; }
        .animate-fade-up-2 { animation: fadeUp 0.6s 0.2s ease both; }
        .animate-fade-up-3 { animation: fadeUp 0.6s 0.3s ease both; }
        .amber-btn {
          background: #F59E0B;
          color: #080808;
          font-weight: 600;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .amber-btn:hover {
          background: #FCD34D;
          transform: translateY(-1px);
          box-shadow: 0 8px 32px rgba(245,158,11,0.35);
        }
        .outline-btn {
          border: 1px solid #333;
          color: #888;
          transition: border-color 0.2s, color 0.2s, transform 0.15s;
        }
        .outline-btn:hover {
          border-color: rgba(245,158,11,0.5);
          color: #FAFAFA;
          transform: translateY(-1px);
        }
        .glow-card {
          position: relative;
          background: #141414;
          border: 1px solid #222;
          border-radius: 12px;
          transition: border-color 0.2s;
        }
        .glow-card::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 12px;
          padding: 1px;
          background: radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(245,158,11,0.4), transparent 60%);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s;
          pointer-events: none;
        }
        .glow-card:hover::before { opacity: 1; }
        .glow-card:hover { border-color: #333; }
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
      `}</style>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: '#F59E0B' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="3" width="12" height="8" rx="1.5" stroke="#080808" strokeWidth="1.5"/>
              <path d="M4 6h6M4 8.5h4" stroke="#080808" strokeWidth="1.2" strokeLinecap="round"/>
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
            <Link href="/dashboard" className="px-4 py-2 rounded-lg text-sm amber-btn">
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm transition-colors" style={{ color: '#888' }}>Sign in</Link>
              <Link href="/login" className="px-4 py-2 rounded-lg text-sm amber-btn">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs mb-8 animate-fade-up" style={{ borderColor: '#333', background: '#111111', color: '#888' }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#F59E0B' }} />
          Now with MCP server support
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05] animate-fade-up-1">
          Version control for your{' '}
          <span style={{
            background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 60%, #F59E0B 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>prompts.</span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-up-2 leading-relaxed" style={{ color: '#888' }}>
          Git-like versioning for LLM prompts. CLI + MCP server. Works natively in Claude Code and Cursor.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up-3">
          <Link href="/login" className="px-6 py-3 rounded-xl amber-btn w-full sm:w-auto text-center">
            Install CLI →
          </Link>
          <a href="https://github.com/aryamanpathak2022/promptvault" target="_blank" rel="noopener" className="px-6 py-3 rounded-xl outline-btn w-full sm:w-auto text-center text-sm" style={{ background: 'transparent' }}>
            View GitHub →
          </a>
        </div>

        {/* Terminal demo */}
        <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden text-left shadow-2xl" style={{ border: '1px solid #222', background: '#0f0f0f' }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#222', background: '#141414' }}>
            <div className="w-3 h-3 rounded-full" style={{ background: '#FF5F57' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#FFBD2E' }} />
            <div className="w-3 h-3 rounded-full" style={{ background: '#28C840' }} />
            <span className="ml-4 text-xs font-mono" style={{ color: '#555' }}>pvault — terminal</span>
          </div>
          <div className="p-6 font-mono text-sm space-y-1.5">
            <div className="terminal-line"><span style={{ color: '#F59E0B' }}>~</span> <span style={{ color: '#888' }}>$</span> <span style={{ color: '#FAFAFA' }}>pvault save &quot;code-reviewer&quot; --message &quot;Added security checks&quot;</span></div>
            <div className="terminal-line" style={{ color: '#4ADE80' }}>✓ Saved version 3 of &quot;code-reviewer&quot;</div>
            <div className="terminal-line mt-3"><span style={{ color: '#F59E0B' }}>~</span> <span style={{ color: '#888' }}>$</span> <span style={{ color: '#FAFAFA' }}>pvault diff code-reviewer 1 2</span></div>
            <div className="terminal-line pl-2">
              <div style={{ color: '#f87171' }}>- Review the following code for bugs only</div>
            </div>
            <div className="terminal-line pl-2">
              <div style={{ color: '#4ADE80' }}>+ Review for bugs AND security vulnerabilities</div>
            </div>
            <div className="terminal-line pl-2">
              <div style={{ color: '#4ADE80' }}>+ Pay attention to injection attacks and auth bypasses</div>
            </div>
            <div className="terminal-line mt-3"><span style={{ color: '#F59E0B' }}>~</span> <span style={{ color: '#888' }}>$</span> <span style={{ color: '#FAFAFA' }}>pvault list --tag production</span></div>
            <div className="terminal-line" style={{ color: '#888' }}>Found 4 prompts tagged &quot;production&quot;</div>
            <div className="terminal-line" style={{ color: '#888' }}>  → code-reviewer (v3) · summarizer (v7) · email-drafter (v2) · sql-gen (v5)</div>
            <div className="terminal-line flex items-center gap-1">
              <span style={{ color: '#F59E0B' }}>~</span> <span style={{ color: '#888' }}>$</span>
              <span className="inline-block w-2 h-4 ml-1" style={{ background: '#F59E0B', animation: 'blink 1s step-end infinite', animationDelay: '3s' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Compatible with — Scrolling marquee */}
      <section className="relative z-10 py-12 overflow-hidden border-y" style={{ borderColor: '#1a1a1a' }}>
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0) }
            100% { transform: translateX(-50%) }
          }
          .marquee-track {
            display: flex;
            width: max-content;
            animation: marquee 28s linear infinite;
          }
          .marquee-track:hover { animation-play-state: paused; }
        `}</style>
        <p className="text-center text-xs uppercase tracking-widest mb-8" style={{ color: '#444' }}>Works natively with</p>
        <div className="relative overflow-hidden">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #080808, transparent)' }} />
          <div className="absolute right-0 top-0 bottom-0 w-32 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #080808, transparent)' }} />
          <div className="marquee-track">
            {[
              { name: 'Claude Code', logo: '/logos/claude.svg', bg: '#2a1810' },
              { name: 'Cursor', logo: '/logos/cursor.svg', bg: '#0d0d1a' },
              { name: 'Windsurf', logo: '/logos/windsurf.svg', bg: '#0a1520', invert: true },
              { name: 'GitHub Copilot', logo: '/logos/github.svg', bg: '#0d1117', invert: true },
              { name: 'Codex (OpenAI)', logo: '/logos/openai.svg', bg: '#0a0a0a', invert: true },
              { name: 'Cline', logo: '/logos/cline.svg', bg: '#0d1117' },
              { name: 'VS Code', logo: '/logos/vscode.svg', bg: '#1e1e2e' },
              { name: 'Zed', logo: '/logos/zed.svg', bg: '#1c1c1c' },
              // Duplicate for seamless loop
              { name: 'Claude Code', logo: '/logos/claude.svg', bg: '#2a1810' },
              { name: 'Cursor', logo: '/logos/cursor.svg', bg: '#0d0d1a' },
              { name: 'Windsurf', logo: '/logos/windsurf.svg', bg: '#0a1520', invert: true },
              { name: 'GitHub Copilot', logo: '/logos/github.svg', bg: '#0d1117', invert: true },
              { name: 'Codex (OpenAI)', logo: '/logos/openai.svg', bg: '#0a0a0a', invert: true },
              { name: 'Cline', logo: '/logos/cline.svg', bg: '#0d1117' },
              { name: 'VS Code', logo: '/logos/vscode.svg', bg: '#1e1e2e' },
              { name: 'Zed', logo: '/logos/zed.svg', bg: '#1c1c1c' },
            ].map((tool, i) => (
              <div key={i} className="flex items-center gap-3 mx-6 px-5 py-3 rounded-xl" style={{
                border: '1px solid #222',
                background: tool.bg,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}>
                <div className="w-6 h-6 relative flex-shrink-0">
                  <Image
                    src={tool.logo}
                    alt={tool.name}
                    width={24}
                    height={24}
                    className="object-contain"
                    style={tool.invert ? { filter: 'brightness(0) invert(1)' } : {}}
                  />
                </div>
                <span className="text-sm font-medium" style={{ color: '#AAAAAA' }}>{tool.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features — Bento Grid */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need</h2>
          <p className="max-w-xl mx-auto" style={{ color: '#888' }}>Built for developers who take prompts seriously.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: '🔄', title: 'Version History', desc: 'Every change tracked. Roll back anytime.' },
            { icon: '⚡', title: 'CLI Tool', desc: 'pvault save, get, diff, history. Fast.' },
            { icon: '🔌', title: 'MCP Native', desc: 'Works directly in Claude Code and Cursor.' },
            { icon: '🔍', title: 'Diff Viewer', desc: 'See exactly what changed between versions.' },
            { icon: '🏷️', title: 'Tags & Search', desc: 'Organize prompts. Find them instantly.' },
            { icon: '🔑', title: 'API Keys', desc: 'Sync from CLI to web and back.' },
          ].map((f) => (
            <div key={f.title} className="glow-card p-6" style={{ background: '#141414' }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-4" style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.2)' }}>
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
          <p style={{ color: '#888' }}>Three steps to get started.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {[
            { step: '01', title: 'Save a prompt', code: 'pvault save "You are..." --name my-prompt' },
            { step: '02', title: 'Iterate and diff', code: 'pvault diff my-prompt 1 2' },
            { step: '03', title: 'Use in Claude Code via MCP', code: '# works natively via MCP server' },
          ].map((s, i) => (
            <div key={s.step} className="space-y-4 relative">
              {i < 2 && (
                <div className="hidden md:block absolute top-4 left-[calc(100%_-_8px)] w-full h-px" style={{ background: 'linear-gradient(to right, rgba(245,158,11,0.5), transparent)', zIndex: 0 }} />
              )}
              <div className="text-xs font-mono font-bold tracking-widest" style={{ color: '#F59E0B' }}>{s.step}</div>
              <h3 className="text-lg font-semibold text-white">{s.title}</h3>
              <pre className="p-4 rounded-xl text-sm font-mono overflow-x-auto" style={{ border: '1px solid #222', background: '#0f0f0f', color: '#F59E0B' }}>{s.code}</pre>
            </div>
          ))}
        </div>
      </section>

      {/* MCP section */}
      <section id="mcp" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="rounded-2xl p-10" style={{ border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.04)' }}>
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6" style={{ border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.1)', color: '#FCD34D' }}>
                🔌 MCP Server
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Works natively in Claude Code
              </h2>
              <p className="leading-relaxed mb-6" style={{ color: '#888' }}>
                Add PromptVault&apos;s MCP server to your claude_desktop_config.json and access all your prompts directly in Claude Code.
              </p>
              <ul className="space-y-2 text-sm" style={{ color: '#888' }}>
                {['Access prompts by name in any AI session', 'Auto-complete prompt names with context', 'Swap prompt versions without leaving your editor'].map(item => (
                  <li key={item} className="flex items-center gap-2">
                    <span style={{ color: '#F59E0B' }}>✓</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1">
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #222', background: '#0f0f0f' }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#222', background: '#141414' }}>
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                  <span className="ml-3 text-xs font-mono" style={{ color: '#555' }}>claude_desktop_config.json</span>
                </div>
                <pre className="p-5 text-sm font-mono overflow-x-auto" style={{ color: '#F59E0B' }}>{`{
  "mcpServers": {
    "promptvault": {
      "command": "pvault",
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
            Start versioning your prompts today.
          </h2>
          <p className="max-w-lg mx-auto mb-10" style={{ color: '#888' }}>
            Join developers who treat their prompts like production code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <Link href="/login" className="px-8 py-4 rounded-xl amber-btn text-center font-semibold">
              Get Started Free
            </Link>
            <a href="https://github.com/aryamanpathak2022/promptvault" target="_blank" rel="noopener" className="px-8 py-4 rounded-xl outline-btn text-center text-sm" style={{ background: 'transparent' }}>
              View on GitHub →
            </a>
          </div>
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-xl font-mono text-sm" style={{ border: '1px solid #222', background: '#0f0f0f', color: '#F59E0B' }}>
            npm install -g promptvault
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t py-10 px-6 max-w-7xl mx-auto" style={{ borderColor: '#222' }}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm" style={{ color: '#555' }}>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: '#F59E0B' }}>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <rect x="1" y="2" width="8" height="6" rx="1" stroke="#080808" strokeWidth="1.2"/>
                <path d="M3 4.5h4M3 6h2.5" stroke="#080808" strokeWidth="1" strokeLinecap="round"/>
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

      <script dangerouslySetInnerHTML={{ __html: `
        document.querySelectorAll('.glow-card').forEach(card => {
          card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mouse-x', x + '%');
            card.style.setProperty('--mouse-y', y + '%');
          });
        });
      `}} />
    </div>
  )
}
