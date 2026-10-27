import { isDone, scheduleText, streakInfo } from '../lib/habits'
import { useData } from '../store/app'
import type { DateKey, Habit } from '../lib/types'
import { burst } from '../lib/effects'
import { Card, cx } from './ui'

export function HabitCard({ habit, date, onOpen }: { habit: Habit; date: DateKey; onOpen?: () => void }) {
  const { data, toggleEntry, today } = useData()
  const done = isDone(data.entries, habit.id, date)
  const streak = streakInfo(habit, data.entries, today)
  const energy = Math.min(100, streak.current * 12)

  return (
    <Card
      lit={done}
      color={habit.color}
      className={cx('flex flex-col gap-4 transition duration-300', done && 'scale-[1.01]')}
    >
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onOpen} className="flex min-w-0 items-center gap-3 text-left">
          <span className="grid h-12 w-12 place-items-center rounded-2xl text-2xl" style={{ background: `${habit.color}22` }}>{habit.icon}</span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-black">{habit.name}</span>
            <span className="text-soft text-sm">{scheduleText(habit.schedule)}</span>
          </span>
        </button>
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={done ? `Снять отметку «${habit.name}»` : `Отметить «${habit.name}»`}
          className={cx(
            'focus-ring grid h-14 w-14 place-items-center rounded-full text-2xl transition duration-300',
            done ? 'text-white' : 'bg-black/5 text-black/30 dark:bg-white/10 dark:text-white/40',
          )}
          style={done ? { background: habit.color, boxShadow: `0 0 24px ${habit.color}99` } : undefined}
          onClick={(e) => {
            const next = toggleEntry(habit.id, date)
            if (next) burst(e.clientX, e.clientY, habit.color)
          }}
        >
          {done ? '✓' : '○'}
        </button>
      </div>
      <div>
        <div className="mb-1 flex items-center justify-between text-sm font-bold">
          <span><span className="flame">🔥</span> {streak.current} {streak.unit === 'weeks' ? 'нед.' : 'дн.'}</span>
          <span className="text-soft">рекорд {streak.best}</span>
        </div>
        <div className="streak-bar" aria-hidden><i style={{ width: `${energy}%` }} /></div>
      </div>
    </Card>
  )
}
