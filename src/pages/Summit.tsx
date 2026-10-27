import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { addDays, formatLong } from '../lib/date'
import { benefits, dayProgress, heroLevel, isDone, motivation } from '../lib/habits'
import { quoteOfDay } from '../lib/quotes'
import { celebrate } from '../lib/effects'
import { useData } from '../store/app'
import { HabitCard } from '../components/HabitCard'
import { ProgressRing } from '../components/ProgressRing'
import { Card, EmptyState, PageHeader, Segmented } from '../components/ui'

export function Summit() {
  const { data, user, today, dayTheme } = useData()
  const nav = useNavigate()
  const [offset, setOffset] = useState(0)
  const date = addDays(today, offset)
  const progress = useMemo(() => dayProgress(data.habits, data.entries, date), [data, date])
  const notes = useMemo(() => motivation(data.habits, data.entries, today), [data, today])
  const force = useMemo(() => benefits(data.habits, data.entries, data.categories, today), [data, today])
  const completions = Object.values(data.entries).reduce((n, map) => n + Object.values(map).filter((v) => v > 0).length, 0)
  const level = heroLevel(completions)
  const pct = progress.total ? Math.round((progress.done / progress.total) * 100) : 0
  const quote = quoteOfDay(today)
  const past = ['-2', '-1', '0'].map((n) => ({ n: Number(n), key: addDays(today, Number(n)) }))

  return (
    <div>
      <PageHeader
        title={`Привет, ${user.name}`}
        subtitle={`${dayTheme.mood} · ${formatLong(today)}`}
        action={<Link to="/app/lab" className="btn btn-primary">+ Привычка</Link>}
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,380px)]">
        <Card className="overflow-hidden">
          <p className="text-soft text-sm font-extrabold uppercase tracking-wider">Фраза дня</p>
          <p className="display mt-2 text-2xl font-black leading-snug sm:text-3xl">{quote}</p>
          {notes[0] && <p className="mt-4 text-lg font-bold">{notes[0].emoji} {notes[0].text}</p>}
          <div className="mt-5 flex items-center justify-between gap-3">
            <span className="rounded-full bg-black/5 px-3 py-1 text-sm font-extrabold dark:bg-white/10">{level.title} · ур. {level.level}</span>
            <div className="streak-bar w-40"><i style={{ width: `${level.progress}%` }} /></div>
          </div>
        </Card>

        <Card className="grid place-items-center">
          <ProgressRing
            value={pct}
            lit={pct === 100}
            label={pct === 100 ? 'Ты почти у цели? Ты уже на ней.' : pct >= 70 ? 'Ты почти у цели!' : 'Держи темп'}
            hint={`${progress.done} из ${progress.total}`}
          />
        </Card>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="display text-2xl font-black text-white [text-shadow:0_4px_16px_rgba(0,20,50,.45)]">Сетка дня</h2>
        <Segmented
          size="sm"
          value={String(offset)}
          onChange={(v) => setOffset(Number(v))}
          options={past.map((p) => ({ value: String(p.n), label: p.n === 0 ? 'Сегодня' : p.n === -1 ? 'Вчера' : formatLong(p.key).split(',')[0] }))}
        />
      </div>

      {progress.due.length === 0 ? (
        <Card className="mt-4">
          {data.habits.some((h) => !h.archived) ? (
            <EmptyState
              emoji="🌅"
              title="На этот день пусто"
              text="Либо привычка ещё не началась, либо по расписанию сегодня выходной. Можно открыть другой день сверху."
            />
          ) : (
            <EmptyState
              emoji="⛰️"
              title="Пока тихо"
              text="Добавь привычку — и карточки зажгутся здесь."
              action={<Link to="/app/lab" className="btn btn-primary">Создать первую</Link>}
            />
          )}
        </Card>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {progress.due.map((h) => (
            <HabitCard key={h.id} habit={h} date={date} onOpen={() => nav(`/app/lab/${h.id}`)} />
          ))}
        </div>
      )}

      {progress.total > 0 && progress.done === progress.total && (
        <div className="mt-4">
          <button type="button" className="btn btn-primary" onClick={() => celebrate(['#f5b42a', '#ff7a1a', '#ffffff', '#7ec8ff'])}>Отпраздновать день</button>
        </div>
      )}

      <h2 className="display mt-10 text-2xl font-black text-white [text-shadow:0_4px_16px_rgba(0,20,50,.45)]">Твоя сила</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {force.map((b) => (
          <Card key={b.id} className="min-h-[140px]">
            <div className="text-3xl">{b.emoji}</div>
            <p className="text-soft mt-2 text-sm font-bold">{b.title}</p>
            <p className="display tabular mt-1 text-3xl font-black">{b.value}</p>
            <p className="text-soft text-sm">{b.hint}</p>
            <p className="mt-2 text-sm font-extrabold text-amber-700 dark:text-amber-300">{b.weekDelta}</p>
          </Card>
        ))}
      </div>

      {notes.slice(1).length > 0 && (
        <div className="mt-6 grid gap-3">
          {notes.slice(1).map((m) => (
            <Card key={m.text} className="py-4">{m.emoji} {m.text}</Card>
          ))}
        </div>
      )}

      {offset < 0 && progress.due.some((h) => !isDone(data.entries, h.id, date)) && (
        <p className="text-soft mt-4 text-sm">Можно закрыть прошлый день — ретроспектива разрешена.</p>
      )}
    </div>
  )
}
