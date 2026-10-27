import { useMemo, useState } from 'react'
import { formatTiny } from '../lib/date'
import { dailySeries, insights, overallStats } from '../lib/habits'
import { useData } from '../store/app'
import { Bars, Lines, Pies } from '../components/charts'
import { Card, PageHeader, Segmented } from '../components/ui'

type Range = '7' | '30' | '365' | 'all'

export function Analytics() {
  const { data, today } = useData()
  const [range, setRange] = useState<Range>('30')
  const days = range === '7' ? 7 : range === '30' ? 30 : range === '365' ? 365 : 720
  const series = useMemo(() => dailySeries(data.habits, data.entries, today, days).map((d) => ({ ...d, label: formatTiny(d.key) })), [data, today, days])
  const stats = useMemo(() => overallStats(data.habits, data.entries, data.categories, today), [data, today])
  const tips = useMemo(() => insights(data.habits, data.entries, data.categories, today), [data, today])

  return (
    <div>
      <PageHeader
        title="Аналитика"
        subtitle="Графики, сравнение периодов и инсайты"
        action={<Segmented value={range} onChange={setRange} size="sm" options={[{ value: '7', label: 'Неделя' }, { value: '30', label: 'Месяц' }, { value: '365', label: 'Год' }, { value: 'all', label: 'Всё' }]} />}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><p className="text-soft text-sm font-bold">Отметок</p><p className="display tabular text-4xl font-black">{stats.total}</p></Card>
        <Card><p className="text-soft text-sm font-bold">Активных дней</p><p className="display tabular text-4xl font-black">{stats.activeDays}</p></Card>
        <Card><p className="text-soft text-sm font-bold">Лучший день</p><p className="display text-2xl font-black">{stats.bestDay ? `${stats.bestDay.key} · ${stats.bestDay.done}` : '—'}</p></Card>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card>
          <h2 className="mb-3 font-black">Динамика выполнения</h2>
          <Lines data={series} x="label" y="rate" />
        </Card>
        <Card>
          <h2 className="mb-3 font-black">По дням недели</h2>
          <Bars data={stats.byWeekday} x="name" y="value" />
        </Card>
        <Card>
          <h2 className="mb-3 font-black">По категориям</h2>
          {stats.byCategory.length ? <Pies data={stats.byCategory} /> : <p className="text-soft">Пока нет данных</p>}
        </Card>
        <Card>
          <h2 className="mb-3 font-black">Инсайты</h2>
          <ul className="space-y-3">
            {tips.map((t) => <li key={t.text} className="font-bold">{t.emoji} {t.text}</li>)}
          </ul>
        </Card>
      </div>
    </div>
  )
}
