import { addDays, formatShort, rangeKeys, startOfWeek, WEEKDAYS_SHORT } from '../lib/date'
import { dayProgress } from '../lib/habits'
import { useData } from '../store/app'
import type { DateKey } from '../lib/types'
import { cx } from './ui'

export function Heatmap({ onPick, selected }: { onPick: (k: DateKey) => void; selected?: DateKey }) {
  const { data, today } = useData()
  const start = startOfWeek(addDays(today, -7 * 20))
  const keys = rangeKeys(start, today)
  const weeks: DateKey[][] = []
  for (let i = 0; i < keys.length; i += 7) weeks.push(keys.slice(i, i + 7))

  return (
    <div className="overflow-x-auto">
      <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-bold text-white/80">
        {WEEKDAYS_SHORT.map((d) => <div key={d}>{d}</div>)}
      </div>
      <div className="flex min-w-[640px] flex-col gap-1">
        {weeks.map((week) => (
          <div key={week[0]} className="grid grid-cols-7 gap-1">
            {week.map((k) => {
              const p = dayProgress(data.habits, data.entries, k)
              const rate = p.total ? p.done / p.total : 0
              const future = k > today
              return (
                <button
                  key={k}
                  type="button"
                  disabled={future}
                  title={`${formatShort(k)}: ${p.done}/${p.total}`}
                  onClick={() => onPick(k)}
                  className={cx(
                    'focus-ring h-10 rounded-lg text-xs font-extrabold tabular transition',
                    selected === k && 'ring-2 ring-white',
                    future && 'opacity-30',
                  )}
                  style={{
                    background: p.total === 0
                      ? 'rgba(255,255,255,.18)'
                      : `color-mix(in srgb, var(--accent) ${Math.round(18 + rate * 82)}%, ${rate ? 'transparent' : 'rgba(255,255,255,.15)'})`,
                    color: rate > 0.55 ? '#1c1400' : 'white',
                    boxShadow: rate === 1 ? '0 0 12px color-mix(in srgb, var(--accent) 60%, transparent)' : undefined,
                  }}
                >
                  {Number(k.slice(-2))}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
