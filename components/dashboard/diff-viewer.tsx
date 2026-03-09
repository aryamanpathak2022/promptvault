'use client'

import { useMemo } from 'react'

interface Props {
  oldText: string
  newText: string
}

function computeDiff(oldLines: string[], newLines: string[]) {
  // Simple LCS-based diff
  const result: { type: 'same' | 'add' | 'remove'; line: string; oldNum?: number; newNum?: number }[] = []
  
  // Use Myers diff algorithm simplified
  let oi = 0, ni = 0
  
  while (oi < oldLines.length || ni < newLines.length) {
    if (oi < oldLines.length && ni < newLines.length && oldLines[oi] === newLines[ni]) {
      result.push({ type: 'same', line: oldLines[oi], oldNum: oi + 1, newNum: ni + 1 })
      oi++; ni++
    } else {
      // Look ahead to find match
      let foundMatch = false
      for (let lookahead = 1; lookahead <= 3; lookahead++) {
        if (oi + lookahead < oldLines.length && oldLines[oi + lookahead] === newLines[ni]) {
          for (let k = 0; k < lookahead; k++) {
            result.push({ type: 'remove', line: oldLines[oi + k], oldNum: oi + k + 1 })
          }
          oi += lookahead
          foundMatch = true
          break
        }
        if (ni + lookahead < newLines.length && oldLines[oi] === newLines[ni + lookahead]) {
          for (let k = 0; k < lookahead; k++) {
            result.push({ type: 'add', line: newLines[ni + k], newNum: ni + k + 1 })
          }
          ni += lookahead
          foundMatch = true
          break
        }
      }
      if (!foundMatch) {
        if (oi < oldLines.length) {
          result.push({ type: 'remove', line: oldLines[oi], oldNum: oi + 1 })
          oi++
        }
        if (ni < newLines.length) {
          result.push({ type: 'add', line: newLines[ni], newNum: ni + 1 })
          ni++
        }
      }
    }
  }
  
  return result
}

export default function DiffViewer({ oldText, newText }: Props) {
  const diff = useMemo(() => {
    const oldLines = oldText.split('\n')
    const newLines = newText.split('\n')
    return computeDiff(oldLines, newLines)
  }, [oldText, newText])

  const adds = diff.filter(d => d.type === 'add').length
  const removes = diff.filter(d => d.type === 'remove').length

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-2.5 bg-white/5 border-b border-white/10 text-xs">
        <span className="text-white/50">Diff</span>
        <span className="text-emerald-400">+{adds} added</span>
        <span className="text-red-400">-{removes} removed</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full font-mono text-xs">
          <tbody>
            {diff.map((line, i) => (
              <tr key={i} className={
                line.type === 'add' ? 'bg-emerald-500/10' :
                line.type === 'remove' ? 'bg-red-500/10' :
                ''
              }>
                <td className="w-10 px-3 py-0.5 text-white/20 text-right select-none border-r border-white/5">
                  {line.oldNum ?? ''}
                </td>
                <td className="w-10 px-3 py-0.5 text-white/20 text-right select-none border-r border-white/5">
                  {line.newNum ?? ''}
                </td>
                <td className="px-1 py-0.5 w-5 text-center select-none">
                  {line.type === 'add' ? <span className="text-emerald-400">+</span> :
                   line.type === 'remove' ? <span className="text-red-400">-</span> :
                   <span className="text-white/20"> </span>}
                </td>
                <td className={`px-3 py-0.5 whitespace-pre ${
                  line.type === 'add' ? 'text-emerald-300' :
                  line.type === 'remove' ? 'text-red-300' :
                  'text-white/60'
                }`}>
                  {line.line || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
