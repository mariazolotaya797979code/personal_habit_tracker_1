import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { completionRate, scheduleText, streakInfo } from '../lib/habits'
import { useData } from '../store/app'
import type { Habit } from '../lib/types'
import { Card, Confirm, EmptyState, PageHeader, Segmented, useToast } from '../components/ui'

type Filter = 'active' | 'archive' | 'all'
type Sort = 'name' | 'streak' | 'rate'

export function Arsenal() {
  const { data, today, updateHabit, deleteHabit, restoreHabit } = useData()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<Filter>('active')
  const [sort, setSort] = useState<Sort>('streak')
  const [cat, setCat] = useState('all')
  const [picked, setPicked] = useState<string[]>([])
  const [del, setDel] = useState<Habit | null>(null)

  const rows = useMemo(() => {
    return data.habits
      .filter((h) => filter === 'all' || (filter === 'archive' ? h.archived : !h.archived))
      .filter((h) => cat === 'all' || h.categoryId === cat)
      .filter((h) => !q || h.name.toLowerCase().includes(q.toLowerCase()))
      .map((h) => ({ h, streak: streakInfo(h, data.entries, today), rate: completionRate(h, data.entries, today, 30) }))
      .sort((a, b) => {
        if (sort === 'name') return a.h.name.localeCompare(b.h.name, 'ru')
        if (sort === 'rate') return b.rate - a.rate
        return b.streak.current - a.streak.current
      })
  }, [data, today, q, filter, sort, cat])

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))

  const bulk = (fn: (h: Habit) => void) => {
    data.habits.filter((h) => picked.includes(h.id)).forEach(fn)
    setPicked([])
  }

  return (
    <div>
      <PageHeader title="Арсенал" subtitle="Все привычки, серии и массовые действия" action={<Link to="/app/lab" className="btn btn-primary">+ Новая</Link>} />

      <Card className="mb-5 flex flex-wrap items-center gap-3">
        <input className="field max-w-xs" placeholder="Поиск" value={q} onChange={(e) => setQ(e.target.value)} />
        <Segmented value={filter} onChange={setFilter} size="sm" options={[{ value: 'active', label: 'Активные' }, { value: 'archive', label: 'Архив' }, { value: 'all', label: 'Все' }]} />
        <select className="field max-w-[12rem]" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="all">Все категории</option>
          {data.categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
        <select className="field max-w-[12rem]" value={sort} onChange={(e) => setSort(e.target.value as Sort)}>
          <option value="streak">По серии</option>
          <option value="rate">По эффективности</option>
          <option value="name">По имени</option>
        </select>
      </Card>

      {picked.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => bulk((h) => updateHabit(h.id, { archived: true }))}>В архив ({picked.length})</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => bulk((h) => updateHabit(h.id, { archived: false }))}>Вернуть</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPicked([])}>Снять выделение</button>
        </div>
      )}

      {rows.length === 0 ? (
        <Card>
          <EmptyState
            emoji="🛡️"
            title={filter === 'archive' ? 'Архив пуст' : q ? 'Ничего не найдено' : 'Арсенал пуст'}
            text={filter === 'archive' ? 'Сюда попадут привычки, которые вы убрали из активного списка.' : q ? 'Попробуйте другой запрос или фильтр.' : 'Создай первую привычку в лаборатории.'}
            action={filter === 'active' && !q ? <Link to="/app/lab" className="btn btn-primary">В лабораторию</Link> : undefined}
          />
        </Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[760px] text-left">
            <thead className="text-soft text-sm">
              <tr>
                <th className="p-4" />
                <th className="p-4">Название</th>
                <th className="p-4">Категория</th>
                <th className="p-4">Периодичность</th>
                <th className="p-4">Серия</th>
                <th className="p-4">30 дней</th>
                <th className="p-4">Статус</th>
                <th className="p-4" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ h, streak, rate }) => {
                const catName = data.categories.find((c) => c.id === h.categoryId)
                return (
                  <tr key={h.id} className="border-t border-black/5 dark:border-white/10">
                    <td className="p-4"><input type="checkbox" checked={picked.includes(h.id)} onChange={() => toggle(h.id)} /></td>
                    <td className="p-4 font-black">{h.icon} {h.name}</td>
                    <td className="p-4">{catName ? `${catName.icon} ${catName.name}` : '—'}</td>
                    <td className="p-4">{scheduleText(h.schedule)}</td>
                    <td className="p-4">
                      <div className="font-extrabold"><span className="flame">🔥</span> {streak.current} <span className="text-soft font-bold">/ ⚡ {streak.best}</span></div>
                      <div className="streak-bar mt-1 w-28"><i style={{ width: `${Math.min(100, streak.current * 12)}%` }} /></div>
                    </td>
                    <td className="p-4 tabular font-black">{rate}%</td>
                    <td className="p-4">{h.archived ? 'Архив' : 'Активна'}</td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/app/lab/${h.id}`} className="btn btn-ghost btn-sm">Изменить</Link>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => updateHabit(h.id, { archived: !h.archived })}>{h.archived ? 'Вернуть' : 'Архив'}</button>
                        <button
                          type="button"
                          className="btn btn-ghost btn-sm"
                          onClick={() => setDel(h)}
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </Card>
      )}

      <Confirm
        open={!!del}
        title="Удалить привычку?"
        text={del ? `«${del.name}» и её история исчезнут. Можно отменить сразу после удаления.` : ''}
        onClose={() => setDel(null)}
        onConfirm={() => {
          if (!del) return
          const snapshot = del
          const history = data.entries[del.id]
          deleteHabit(del.id)
          toast('Привычка удалена', 'info', { label: 'Отменить', run: () => restoreHabit(snapshot, history) })
        }}
      />
    </div>
  )
}
