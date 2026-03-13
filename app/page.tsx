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
        
        /* Main elevated surface - cards and panels */
        .elevated-surface {
          background: linear-gradient(145deg, #161616 0%, #0f0f0f 100%) !important;
          box-shadow: 
            0 1px 0 rgba(255,255,255,0.04) inset,
            0 2px 4px rgba(0,0,0,0.3) inset,
            0 10px 40px rgba(0,0,0,0.5),
            0 0 0 1px rgba(255,255,255,0.03);
        }
        
        /* Primary elevated - current/new/active items */
        .elevated-primary {
          background: linear-gradient(145deg, rgba(245,158,11,0.12) 0%, rgba(245,158,11,0.06) 100%) !important;
          box-shadow: 
            0 1px 0 rgba(245,158,11,0.15) inset,
            0 4px 12px rgba(245,158,11,0.15) inset,
            0 8px 24px rgba(0,0,0,0.4),
            0 12px 48px rgba(245,158,11,0.1),
            0 0 0 1px rgba(245,158,11,0.25);
        }
        
        /* Secondary elevated - success/green */
        .elevated-success {
          background: linear-gradient(145deg, rgba(74,222,128,0.1) 0%, rgba(74,222,128,0.04) 100%) !important;
          box-shadow: 
            0 1px 0 rgba(74,222,128,0.12) inset,
            0 4px 12px rgba(74,222,128,0.1) inset,
            0 8px 24px rgba(0,0,0,0.4),
            0 12px 48px rgba(74,222,128,0.08),
            0 0 0 1px rgba(74,222,128,0.2);
        }
        
        /* Tertiary elevated - purple/search */
        .elevated-accent {
          background: linear-gradient(145deg, rgba(168,85,247,0.1) 0%, rgba(168,85,247,0.04) 100%) !important;
          box-shadow: 
            0 1px 0 rgba(168,85,247,0.12) inset,
            0 4px 12px rgba(168,85,247,0.1) inset,
            0 8px 24px rgba(0,0,0,0.4),
            0 12px 48px rgba(168,85,247,0.08),
            0 0 0 1px rgba(168,85,247,0.2);
        }
        
        /* Subtle raised - inputs, buttons */
        .elevated-raised {
          background: linear-gradient(180deg, #1a1a1a 0%, #141414 100%) !important;
          box-shadow: 
            0 1px 2px rgba(0,0,0,0.5),
            0 4px 8px rgba(0,0,0,0.3),
            0 0 0 1px rgba(255,255,255,0.05);
        }
        
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
        .diff-line { opacity: 0; animation: fadeUp 0.4s ease forwards; }
        .diff-line:nth-child(1) { animation-delay: 0.3s }
        .diff-line:nth-child(2) { animation-delay: 0.5s }
        .diff-line:nth-child(3) { animation-delay: 0.7s }
        .diff-line:nth-child(4) { animation-delay: 0.9s }
        .diff-line:nth-child(5) { animation-delay: 1.1s }
        .diff-line:nth-child(6) { animation-delay: 1.3s }
        .diff-line:nth-child(7) { animation-delay: 1.5s }
        .diff-line:nth-child(8) { animation-delay: 1.7s }
        .diff-line:nth-child(9) { animation-delay: 1.9s }
        .diff-line:nth-child(10) { animation-delay: 2.1s }
        .diff-line:nth-child(11) { animation-delay: 2.3s }
        .diff-line:nth-child(12) { animation-delay: 2.5s }
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
          {/* "Version" with strikethrough + "vibe" scrawled on top */}
          <span className="relative inline-block mr-3">
            <span style={{ color: '#444', textDecoration: 'none' }}>Version</span>
            {/* Strikethrough SVG */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 160 80" preserveAspectRatio="none" style={{ top: 0, left: 0 }}>
              <path d="M4,42 Q40,38 80,40 Q120,42 156,39" stroke="#F59E0B" strokeWidth="3" fill="none" strokeLinecap="round"
                style={{ opacity: 0.8 }}
              />
            </svg>
            {/* "vibe" handwritten above, tilted */}
            <span className="absolute font-normal pointer-events-none select-none"
              style={{
                top: '-0.7em',
                left: '10%',
                fontSize: '0.45em',
                color: '#F59E0B',
                fontFamily: "'Caveat', 'Segoe Script', cursive",
                transform: 'rotate(-4deg)',
                letterSpacing: '0.05em',
                whiteSpace: 'nowrap',
                textShadow: '0 0 20px rgba(245,158,11,0.4)',
              }}>
              vibe ✦
            </span>
          </span>
          control for your{' '}
          {/* "prompts." with hand-drawn circle SVG */}
          <span className="relative inline-block">
            <span style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #FCD34D 60%, #F59E0B 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>prompts.</span>
            {/* Hand-drawn circle around "prompts." */}
            <svg className="absolute pointer-events-none" viewBox="0 0 220 80"
              style={{ top: '-18%', left: '-6%', width: '112%', height: '136%', overflow: 'visible' }}>
              <ellipse cx="110" cy="42" rx="103" ry="34"
                fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round"
                strokeDasharray="4 2"
                style={{ opacity: 0.65 }}
              />
              {/* Small arrow pointing to circle */}
              <path d="M195,14 Q205,20 200,28" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" style={{ opacity: 0.5 }}/>
              <path d="M198,26 L200,28 L203,24" stroke="#F59E0B" strokeWidth="2" fill="none" strokeLinecap="round" style={{ opacity: 0.5 }}/>
            </svg>
            {/* "← the good stuff" annotation */}
            <span className="absolute hidden md:block font-normal pointer-events-none select-none"
              style={{
                bottom: '-1.4em',
                right: '-0.5em',
                fontSize: '0.28em',
                color: '#F59E0B',
                fontFamily: "'Caveat', 'Segoe Script', cursive",
                transform: 'rotate(2deg)',
                opacity: 0.7,
                whiteSpace: 'nowrap',
              }}>
              ← the important part
            </span>
          </span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-up-2 leading-relaxed" style={{ color: '#888' }}>
          Git for your prompts. Version, share, and iterate without losing what worked.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up-3">
          <Link href="/login" className="px-6 py-3 rounded-xl amber-btn w-full sm:w-auto text-center">
            Install CLI →
          </Link>
          <Link href="/explore" className="px-6 py-3 rounded-xl outline-btn w-full sm:w-auto text-center text-sm" style={{ background: 'transparent' }}>
            Browse public prompts →
          </Link>
        </div>

        {/* Terminal demo */}
        <div className="max-w-3xl mx-auto rounded-2xl overflow-hidden text-left elevated-surface" style={{ border: '1px solid #333', background: undefined }}>
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

      {/* Features — Professional Sections with Demos */}
      <section id="features" className="relative z-10 py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Everything you need</h2>
          <p className="max-w-xl mx-auto" style={{ color: '#888' }}>Built for developers who take prompts seriously.</p>
        </div>

        {/* Feature 1: Version History */}
        <div className="mb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Every change tracked. Roll back anytime.</h3>
              <p className="text-lg leading-relaxed mb-6" style={{ color: '#888' }}>
                Never lose a working prompt version again. Each save creates a new version with a timestamp and optional message. Browse history, compare versions, and restore any previous state with a single command.
              </p>
              <ul className="space-y-3">
                {['Full version history with timestamps', 'Restore any version instantly', 'Compare any two versions with diff'].map(item => (
                  <li key={item} className="flex items-center gap-3" style={{ color: '#888' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
                      <span style={{ color: '#4ADE80', fontSize: '12px' }}>✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="rounded-xl overflow-hidden elevated-surface" style={{ border: '1px solid #333', background: undefined }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: '#222', background: '#141414' }}>
                  <span className="text-xs font-mono" style={{ color: '#555' }}>Version History — code-reviewer</span>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { v: 'v7', date: 'Today, 2:30 PM', msg: 'Added SQL injection checks', current: true },
                    { v: 'v6', date: 'Today, 11:15 AM', msg: 'Improved error handling', current: false },
                    { v: 'v5', date: 'Yesterday', msg: 'Added authentication checks', current: false },
                    { v: 'v4', date: 'Feb 28', msg: 'Refactored for clarity', current: false },
                    { v: 'v3', date: 'Feb 25', msg: 'Added security focus', current: false },
                    { v: 'v2', date: 'Feb 20', msg: 'Initial version', current: false },
                  ].map((version, i) => (
                    <div key={version.v} className={`flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-all ${version.current ? 'elevated-primary' : ''}`} style={{ 
                      background: version.current ? undefined : 'transparent',
                      border: version.current ? 'none' : '1px solid transparent'
                    }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold" style={{ 
                        background: version.current ? '#F59E0B' : '#1a1a1a',
                        color: version.current ? '#080808' : '#666'
                      }}>
                        {version.v}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium" style={{ color: version.current ? '#F59E0B' : '#FAFAFA' }}>{version.msg}</div>
                        <div className="text-xs" style={{ color: '#555' }}>{version.date}</div>
                      </div>
                      {version.current && (
                        <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(245,158,11,0.2)', color: '#F59E0B' }}>Current</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 2: Diff Viewer */}
        <div className="mb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
            <div className="lg:order-2">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">See exactly what changed between versions.</h3>
              <p className="text-lg leading-relaxed mb-6" style={{ color: '#888' }}>
                Compare any two versions side-by-side with clear visual diffs. Red highlights show what was removed, green shows what was added. Understand your prompt evolution at a glance.
              </p>
              <ul className="space-y-3">
                {['Side-by-side version comparison', 'Color-coded additions and deletions', 'Percentage similarity indicator'].map(item => (
                  <li key={item} className="flex items-center gap-3" style={{ color: '#888' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
                      <span style={{ color: '#4ADE80', fontSize: '12px' }}>✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-1">
              <div className="rounded-xl overflow-hidden elevated-surface" style={{ border: '1px solid #333', background: undefined }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#222', background: '#141414' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FF5F57' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#FFBD2E' }} />
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#28C840' }} />
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: '#1a1a1a', color: '#666' }}>v2</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#555' }}>
                      <path d="M4 8h8M9 5l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-xs font-mono px-2 py-1 rounded" style={{ background: '#F59E0B', color: '#080808' }}>v3</span>
                  </div>
                </div>
                <div className="p-0 font-mono text-sm">
                  {/* Version header */}
                  <div className="flex items-center gap-4 px-4 py-2 border-b text-xs" style={{ borderColor: '#222', background: '#141414', color: '#555' }}>
                    <span className="w-8">Ver</span>
                    <span>Prompt Content</span>
                  </div>
                  {/* Old version - v2 */}
                  <div className="flex" style={{ background: 'rgba(248,113,113,0.04)' }}>
                    <div className="w-16 px-3 py-2 text-xs flex-shrink-0 border-r flex items-center gap-2" style={{ borderColor: '#222', color: '#666' }}>
                      <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: '#1a1a1a', color: '#666' }}>v2</span>
                    </div>
                    <div className="flex-1 p-2 overflow-x-auto">
                      <div className="whitespace-pre" style={{ color: '#888' }}>You are a code reviewer. Review the following code for bugs only.</div>
                    </div>
                  </div>
                  {/* Diff highlights */}
                  <div className="flex" style={{ background: 'rgba(248,113,113,0.08)' }}>
                    <div className="w-16 px-3 py-1.5 text-xs flex-shrink-0 border-r flex items-center justify-center" style={{ borderColor: '#222' }}>
                      <span className="text-xs font-bold" style={{ color: '#F87171' }}>−1</span>
                    </div>
                    <div className="flex-1 px-3 py-1.5 overflow-x-auto">
                      <span style={{ color: '#F87171', textDecoration: 'line-through', opacity: 0.7 }}>Review the following code for bugs only</span>
                    </div>
                  </div>
                  <div className="flex" style={{ background: 'rgba(74,222,128,0.08)' }}>
                    <div className="w-16 px-3 py-1.5 text-xs flex-shrink-0 border-r flex items-center justify-center" style={{ borderColor: '#222' }}>
                      <span className="text-xs font-bold" style={{ color: '#4ADE80' }}>+1</span>
                    </div>
                    <div className="flex-1 px-3 py-1.5 overflow-x-auto">
                      <span style={{ color: '#4ADE80' }}>+ Review for bugs AND security vulnerabilities</span>
                    </div>
                  </div>
                  <div className="flex" style={{ background: 'rgba(74,222,128,0.08)' }}>
                    <div className="w-16 px-3 py-1.5 text-xs flex-shrink-0 border-r flex items-center justify-center" style={{ borderColor: '#222' }}>
                      <span className="text-xs font-bold" style={{ color: '#4ADE80' }}>+2</span>
                    </div>
                    <div className="flex-1 px-3 py-1.5 overflow-x-auto">
                      <span style={{ color: '#4ADE80' }}>+ Pay attention to injection attacks and auth bypasses</span>
                    </div>
                  </div>
                  {/* New version - v3 */}
                  <div className="flex elevated-success" style={{ background: undefined }}>
                    <div className="w-16 px-3 py-2 text-xs flex-shrink-0 border-r flex items-center gap-2" style={{ borderColor: '#222', color: '#666' }}>
                      <span className="px-1.5 py-0.5 rounded text-xs font-bold" style={{ background: '#F59E0B', color: '#080808' }}>v3</span>
                    </div>
                    <div className="flex-1 p-2 overflow-x-auto">
                      <div className="whitespace-pre font-medium" style={{ color: '#FAFAFA' }}>You are a code reviewer.</div>
                    </div>
                  </div>
                  {/* Stats footer */}
                  <div className="flex items-center gap-4 px-4 py-2 border-t text-xs" style={{ borderColor: '#222', background: '#141414', color: '#555' }}>
                    <span><span style={{ color: '#F87171' }}>−1</span> line removed</span>
                    <span><span style={{ color: '#4ADE80' }}>+2</span> lines added</span>
                    <span style={{ color: '#888' }}>98% similar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Tags & Search */}
        <div className="mb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center lg:flex-row-reverse">
            <div className="lg:order-2">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Organize prompts. Find them instantly.</h3>
              <p className="text-lg leading-relaxed mb-6" style={{ color: '#888' }}>
                Tag your prompts with meaningful labels like "production", "testing", or "deprecated". Search across all your prompts with instant filtering by name, content, or tags.
              </p>
              <ul className="space-y-3">
                {['Filter by multiple tags at once', 'Full-text search across all prompts', 'Keyboard shortcuts for power users'].map(item => (
                  <li key={item} className="flex items-center gap-3" style={{ color: '#888' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
                      <span style={{ color: '#4ADE80', fontSize: '12px' }}>✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-1">
              <div className="rounded-xl overflow-hidden elevated-surface" style={{ border: '1px solid #333', background: undefined }}>
                <div className="p-4 border-b" style={{ borderColor: '#222' }}>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-lg elevated-raised" style={{ background: '#141414', border: '1px solid #333' }}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: '#555' }}>
                        <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                        <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                      </svg>
                      <span className="text-sm" style={{ color: '#555' }}>Search prompts...</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {['production', 'testing', 'security', 'refactor'].map(tag => (
                      <span key={tag} className={`px-3 py-1 rounded-full text-xs cursor-pointer transition-all ${tag === 'production' ? 'elevated-primary' : ''}`} style={{ 
                        background: tag === 'production' ? undefined : '#1a1a1a',
                        color: tag === 'production' ? '#F59E0B' : '#666',
                        border: '1px solid',
                        borderColor: tag === 'production' ? 'transparent' : '#222'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    { name: 'code-reviewer', tags: ['production', 'security'], desc: 'Comprehensive code review prompt...', match: true },
                    { name: 'sql-generator', tags: ['production'], desc: 'Generate safe SQL queries with...', match: true },
                    { name: 'test-writer', tags: ['testing'], desc: 'Write unit tests for given code...', match: false },
                  ].map((prompt, i) => (
                    <div key={prompt.name} className={`p-3 rounded-lg cursor-pointer transition-all ${prompt.match ? 'elevated-accent' : ''}`} style={{ 
                      background: prompt.match ? undefined : 'transparent',
                      border: '1px solid',
                      borderColor: prompt.match ? 'transparent' : 'transparent'
                    }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm" style={{ color: '#FAFAFA' }}>{prompt.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded elevated-raised" style={{ background: undefined, color: '#4ADE80' }}>v7</span>
                      </div>
                      <p className="text-xs mb-2" style={{ color: '#555' }}>{prompt.desc}</p>
                      <div className="flex gap-1">
                        {prompt.tags.map(t => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded" style={{ background: '#1a1a1a', color: '#666' }}>{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 4: API Keys */}
        <div>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">Sync from CLI to web and back.</h3>
              <p className="text-lg leading-relaxed mb-6" style={{ color: '#888' }}>
                Generate API keys from the web dashboard and use them to authenticate your CLI. Your prompts stay in sync across all your machines via the cloud storage.
              </p>
              <ul className="space-y-3">
                {['Multiple keys for different machines', 'Revoke keys instantly from dashboard', 'Track usage and last used time'].map(item => (
                  <li key={item} className="flex items-center gap-3" style={{ color: '#888' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: 'rgba(74,222,128,0.15)' }}>
                      <span style={{ color: '#4ADE80', fontSize: '12px' }}>✓</span>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="rounded-xl overflow-hidden elevated-surface" style={{ border: '1px solid #333', background: undefined }}>
                <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: '#222', background: '#141414' }}>
                  <span className="text-xs font-mono" style={{ color: '#555' }}>API Keys</span>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium elevated-surface" style={{ background: '#F59E0B', color: '#080808' }}>+ Generate Key</button>
                </div>
                <div className="p-4 space-y-3">
                  {[
                    { name: 'MacBook Pro', key: 'pv_l4k8...j2m3', last: '2 minutes ago', active: true },
                    { name: 'Work Desktop', key: 'pv_x9m2...p5k1', last: '3 hours ago', active: true },
                    { name: 'Old Laptop', key: 'pv_a1b8...c7d4', last: '2 days ago', active: false },
                  ].map((apiKey, i) => (
                    <div key={apiKey.name} className={`flex items-center gap-4 p-3 rounded-lg ${apiKey.active ? 'elevated-success' : ''}`} style={{ background: apiKey.active ? undefined : '#141414', border: '1px solid', borderColor: apiKey.active ? 'transparent' : '#222' }}>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: '#1a1a1a' }}>
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ color: apiKey.active ? '#4ADE80' : '#555' }}>
                          <path d="M9 2L3 5v6c0 3.5 2.5 6.5 6 7.5 3.5-1 6-4 6-7.5V5L9 2z" stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm" style={{ color: '#FAFAFA' }}>{apiKey.name}</span>
                          {apiKey.active && <span className="w-2 h-2 rounded-full" style={{ background: '#4ADE80' }} />}
                        </div>
                        <div className="text-xs font-mono" style={{ color: '#555' }}>{apiKey.key}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs" style={{ color: '#555' }}>{apiKey.last}</div>
                        <button className="text-xs mt-1" style={{ color: '#F87171' }}>Revoke</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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
              <div className="rounded-xl overflow-hidden elevated-surface" style={{ border: '1px solid #333', background: undefined }}>
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
