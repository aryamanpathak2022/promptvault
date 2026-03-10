'use client'

import { useMemo } from 'react'
import { diffLines } from 'diff'

interface Props {
  oldText: string
  newText: string
}

interface DiffRow {
  type: 'added' | 'removed' | 'unchanged'
  oldLine: number | null
  newLine: number | null
  text: string
}

function splitLines(value: string) {
  const lines = value.split('\n')
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop()
  return lines.length > 0 ? lines : ['']
}

export default function DiffViewer({ oldText, newText }: Props) {
  const rows = useMemo(() => {
    const changes = diffLines(oldText, newText)
    const output: DiffRow[] = []
    let oldLine = 1
    let newLine = 1

    for (const change of changes) {
      for (const line of splitLines(change.value)) {
        if (change.added) {
          output.push({ type: 'added', oldLine: null, newLine, text: line })
          newLine += 1
        } else if (change.removed) {
          output.push({ type: 'removed', oldLine, newLine: null, text: line })
          oldLine += 1
        } else {
          output.push({ type: 'unchanged', oldLine, newLine, text: line })
          oldLine += 1
          newLine += 1
        }
      }
    }

    return output
  }, [newText, oldText])

  const addedCount = rows.filter((row) => row.type === 'added').length
  const removedCount = rows.filter((row) => row.type === 'removed').length
  const changed = addedCount > 0 || removedCount > 0

  return (
    <div className="overflow-hidden rounded-3xl border border-[#1f1f1f] bg-[#0f0f0f]">
      <div className="flex flex-wrap items-center gap-3 border-b border-[#1f1f1f] px-4 py-3 text-xs text-zinc-400">
        <span>Diff</span>
        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-300">
          +{addedCount} added
        </span>
        <span className="rounded-full border border-red-500/20 bg-red-500/10 px-2 py-1 text-red-300">
          -{removedCount} removed
        </span>
        {!changed && <span className="text-zinc-500">No changes between these versions</span>}
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse font-mono text-xs">
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={`${row.type}-${index}`}
                className={
                  row.type === 'added'
                    ? 'bg-emerald-500/8'
                    : row.type === 'removed'
                      ? 'bg-red-500/8'
                      : 'bg-transparent'
                }
              >
                <td className="w-14 border-r border-[#1a1a1a] px-3 py-1.5 text-right text-zinc-600">{row.oldLine ?? ''}</td>
                <td className="w-14 border-r border-[#1a1a1a] px-3 py-1.5 text-right text-zinc-600">{row.newLine ?? ''}</td>
                <td className="w-8 px-2 py-1.5 text-center text-zinc-500">
                  {row.type === 'added' ? '+' : row.type === 'removed' ? '-' : ' '}
                </td>
                <td
                  className={
                    row.type === 'added'
                      ? 'whitespace-pre-wrap px-3 py-1.5 text-emerald-200'
                      : row.type === 'removed'
                        ? 'whitespace-pre-wrap px-3 py-1.5 text-red-200'
                        : 'whitespace-pre-wrap px-3 py-1.5 text-zinc-300'
                  }
                >
                  {row.text || ' '}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
