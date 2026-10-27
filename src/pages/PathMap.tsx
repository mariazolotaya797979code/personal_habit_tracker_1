import { useState } from 'react'
import { formatLong, formatShort } from '../lib/date'
import { isDone, isDue, milestones } from '../lib/habits'
import { useData } from '../store/app'
import { Heatmap } from '../components/Heatmap'
import { Card, Drawer, PageHeader } from '../components/ui'

export function PathMap() {
  const { data, today, toggleEntry } = useData()
  const [picked, setPicked] = useState<string | null>(null)
  const events = milestones(data.habits, data.entries, today)
  const dayHabits = data.habits.filter((h) => !h.archived && (isDue(h, data.entries, picked ?? today) || isDone(data.entries, h.id, picked ?? today)))

  return (
    <div>
      <PageHeader title="Карта пути" subtitle="Тепловая карта восхождения и лента побед" />
      <Card>
        <Heatmap selected={picked ?? undefined} onPick={setPicked} />
      </Card>
      <h2 className="display mt-8 text-2xl font-black text-white [text-shadow:0_4px_16px_rgba(0,20,50,.45)]">Таймлайн достижений</h2>
      <div className="mt-4 space-y-3">
        {events.length === 0 && <Card>Пока тишина. Первая отметка откроет ленту.</Card>}
        {events.map((e) => (
          <Card key={e.id} className="flex items-start gap-4">
            <span className="text-3xl">{e.emoji}</span>
            <div>
              <p className="font-black">{e.title}</p>
              <p className="text-soft">{e.text}</p>
              <p className="mt-1 text-sm font-bold">{formatShort(e.date)}</p>
            </div>
          </Card>
        ))}
      </div>
      <Drawer open={!!picked} onClose={() => setPicked(null)} title={picked ? formatLong(picked) : ''}>
        <div className="space-y-3">
          {dayHabits.length === 0 && <p className="text-soft">На этот день привычек нет.</p>}
          {dayHabits.map((h) => {
            const done = isDone(data.entries, h.id, picked!)
            return (
              <button
                key={h.id}
                type="button"
                className="flex w-full items-center justify-between rounded-2xl bg-black/5 px-4 py-3 text-left font-bold dark:bg-white/10"
                onClick={() => toggleEntry(h.id, picked!)}
              >
                <span>{h.icon} {h.name}</span>
                <span>{done ? '✓ Есть' : 'Пропуск'}</span>
              </button>
            )
          })}
        </div>
      </Drawer>
    </div>
  )
}
