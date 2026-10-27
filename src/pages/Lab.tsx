import { FormEvent, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { UNITS, scheduleText } from '../lib/habits'
import { todayKey } from '../lib/date'
import { HABIT_COLORS, HABIT_ICONS } from '../lib/days'
import { useData } from '../store/app'
import type { Schedule, UnitKind } from '../lib/types'
import { Card, Field, PageHeader, Stepper, useToast } from '../components/ui'

const WEEK = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export function Lab() {
  const { id } = useParams()
  const { data, addHabit, updateHabit, today } = useData()
  const nav = useNavigate()
  const toast = useToast()
  const existing = data.habits.find((h) => h.id === id)

  const [name, setName] = useState(existing?.name ?? '')
  const [icon, setIcon] = useState(existing?.icon ?? '⛰️')
  const [color, setColor] = useState(existing?.color ?? HABIT_COLORS[0])
  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? '')
  const [schedType, setSchedType] = useState<Schedule['type']>(existing?.schedule.type ?? 'daily')
  const [days, setDays] = useState<number[]>(existing?.schedule.type === 'weekdays' ? existing.schedule.days : [0, 1, 2, 3, 4])
  const [times, setTimes] = useState(existing?.schedule.type === 'perWeek' ? existing.schedule.times : 3)
  const [unit, setUnit] = useState<UnitKind>(existing?.unit ?? 'times')
  const [unitLabel, setUnitLabel] = useState(existing?.unitLabel ?? 'раз')
  const [amount, setAmount] = useState(existing?.amount ?? 1)
  const [skips, setSkips] = useState(existing?.allowedSkips ?? 2)
  const [reminder, setReminder] = useState(existing?.reminderTime ?? '')
  const [start, setStart] = useState(existing?.createdAt ?? today)

  const schedule: Schedule = schedType === 'daily' ? { type: 'daily' } : schedType === 'perWeek' ? { type: 'perWeek', times } : { type: 'weekdays', days }

  const preview = useMemo(() => ({ name: name || 'Новая привычка', icon, color, schedule }), [name, icon, color, schedule])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    const payload = {
      name: name.trim(),
      icon,
      color,
      categoryId: categoryId || null,
      schedule,
      reminderTime: reminder || null,
      unit,
      unitLabel: unit === 'custom' ? unitLabel : UNITS.find((u) => u.kind === unit)?.label ?? unitLabel,
      amount,
      allowedSkips: skips,
    }
    if (existing) {
      updateHabit(existing.id, payload)
      toast('Привычка обновлена')
    } else {
      addHabit({ ...payload, createdAt: start || todayKey() })
      toast('Привычка создана')
    }
    nav('/app/arsenal')
  }

  return (
    <div>
      <PageHeader title={existing ? 'Лаборатория' : 'Новая привычка'} subtitle="Собери привычку и сразу увидь, как она загорится на вершине" />
      <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card className="space-y-5">
          <Field label="Название"><input className="field" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Например: Утренняя зарядка" /></Field>
          <div>
            <p className="mb-2 text-sm font-extrabold">Иконка</p>
            <div className="flex flex-wrap gap-2">
              {HABIT_ICONS.map((i) => (
                <button key={i} type="button" className={`grid h-11 w-11 place-items-center rounded-2xl text-xl ${icon === i ? 'bg-white shadow' : 'bg-black/5 dark:bg-white/10'}`} onClick={() => setIcon(i)}>{i}</button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-extrabold">Цвет</p>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map((c) => (
                <button key={c} type="button" aria-label={c} className="h-9 w-9 rounded-full" style={{ background: c, outline: color === c ? '3px solid white' : undefined, boxShadow: color === c ? `0 0 0 6px ${c}55` : undefined }} onClick={() => setColor(c)} />
              ))}
            </div>
          </div>
          <Field label="Категория">
            <select className="field" value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Без категории</option>
              {data.categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
          </Field>
          <Field label="Периодичность">
            <select className="field" value={schedType} onChange={(e) => setSchedType(e.target.value as Schedule['type'])}>
              <option value="daily">Каждый день</option>
              <option value="weekdays">По дням недели</option>
              <option value="perWeek">N раз в неделю</option>
            </select>
          </Field>
          {schedType === 'weekdays' && (
            <div className="flex flex-wrap gap-2">
              {WEEK.map((d, i) => (
                <button key={d} type="button" className={`btn btn-sm ${days.includes(i) ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setDays((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]))}>{d}</button>
              ))}
            </div>
          )}
          {schedType === 'perWeek' && <Stepper label="Раз в неделю" value={times} min={1} max={7} onChange={setTimes} />}
          <Field label="Единица">
            <select className="field" value={unit} onChange={(e) => {
              const next = e.target.value as UnitKind
              setUnit(next)
              const u = UNITS.find((x) => x.kind === next)
              if (u) { setUnitLabel(u.label); setAmount(u.defaultAmount) }
            }}>
              {UNITS.map((u) => <option key={u.kind} value={u.kind}>{u.title}</option>)}
            </select>
          </Field>
          {unit === 'custom' && <Field label="Своя единица"><input className="field" value={unitLabel} onChange={(e) => setUnitLabel(e.target.value)} /></Field>}
          <Field label="Количество за раз"><Stepper value={amount} min={1} max={100000} onChange={setAmount} /></Field>
          <Field label="Поблажки в месяц" hint="Легальные пропуски, которые не рвут серию">
            <Stepper value={skips} min={0} max={10} onChange={setSkips} />
          </Field>
          <Field label="Напоминание">
            <input className="field" type="time" value={reminder} onChange={(e) => setReminder(e.target.value)} />
          </Field>
          {!existing && <Field label="Дата старта" hint="Можно начать раньше сегодняшнего дня"><input className="field" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></Field>}
          <button className="btn btn-primary" type="submit">{existing ? 'Сохранить' : 'Добавить в арсенал'}</button>
        </Card>

        <Card lit color={preview.color} className="h-fit">
          <p className="text-soft text-sm font-extrabold uppercase tracking-wider">Превью карточки</p>
          <div className="mt-4 flex items-center gap-3">
            <span className="grid h-14 w-14 place-items-center rounded-2xl text-3xl" style={{ background: `${preview.color}22` }}>{preview.icon}</span>
            <div>
              <p className="text-xl font-black">{preview.name}</p>
              <p className="text-soft">{scheduleText(preview.schedule)}</p>
            </div>
          </div>
          <div className="streak-bar mt-5"><i style={{ width: '64%', background: `linear-gradient(90deg, ${preview.color}, #ffe08a)` }} /></div>
        </Card>
      </form>
    </div>
  )
}
