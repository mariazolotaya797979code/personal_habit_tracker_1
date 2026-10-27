import { addDays, monthKey, rangeKeys, startOfWeek, weekdayIndex, WEEKDAYS_SHORT, plural } from './date'
import type { Category, DateKey, Entries, Habit, Schedule, UnitKind } from './types'

export const isDone = (entries: Entries, habitId: string, key: DateKey) => (entries[habitId]?.[key] ?? 0) > 0

export function isScheduled(habit: Habit, key: DateKey): boolean {
  if (key < habit.createdAt) return false
  const s = habit.schedule
  if (s.type === 'weekdays') return s.days.includes(weekdayIndex(key))
  return true
}

export function weekCount(entries: Entries, habit: Habit, key: DateKey, exclude?: DateKey): number {
  const start = startOfWeek(key)
  let n = 0
  for (let i = 0; i < 7; i++) {
    const k = addDays(start, i)
    if (k !== exclude && isDone(entries, habit.id, k)) n++
  }
  return n
}

export function isDue(habit: Habit, entries: Entries, key: DateKey): boolean {
  if (!isScheduled(habit, key)) return false
  if (habit.schedule.type === 'perWeek') {
    return isDone(entries, habit.id, key) || weekCount(entries, habit, key, key) < habit.schedule.times
  }
  return true
}

export function dayProgress(habits: Habit[], entries: Entries, key: DateKey) {
  const due = habits.filter((h) => !h.archived && isDue(h, entries, key))
  const done = due.filter((h) => isDone(entries, h.id, key)).length
  return { done, total: due.length, due }
}

export interface StreakInfo {
  current: number
  best: number
  previous: number
  unit: 'days' | 'weeks'
  skipsUsedThisMonth: number
  skipsLeft: number
  skipSavedRecently: boolean
}

export function streakInfo(habit: Habit, entries: Entries, today: DateKey): StreakInfo {
  const skipsUsed: Record<string, number> = {}
  let run = 0
  let best = 0
  let previous = 0
  let lastSkip = null as DateKey | null

  const miss = (month: string, amount: number, at: DateKey) => {
    if (run === 0) return
    const used = skipsUsed[month] ?? 0
    const fits = used + amount <= habit.allowedSkips
    skipsUsed[month] = Math.min(habit.allowedSkips, used + amount)
    if (fits && run > 0) {
      lastSkip = at
      return
    }
    if (!fits) {
      if (run > 0) previous = run
      run = 0
    }
  }

  if (habit.createdAt <= today) {
    if (habit.schedule.type === 'perWeek') {
      const times = habit.schedule.times
      for (let w = startOfWeek(habit.createdAt); w <= today; w = addDays(w, 7)) {
        const weekEnd = addDays(w, 6)
        const available = rangeKeys(w, weekEnd).filter((k) => k >= habit.createdAt).length
        const required = Math.min(times, available)
        const count = weekCount(entries, habit, w)
        if (count >= required) {
          run++
          best = Math.max(best, run)
        } else if (weekEnd >= today) {
          // текущая неделя ещё не закончилась
        } else {
          miss(monthKey(weekEnd), required - count, weekEnd)
        }
      }
    } else {
      for (let k = habit.createdAt; k <= today; k = addDays(k, 1)) {
        if (!isScheduled(habit, k)) continue
        if (isDone(entries, habit.id, k)) {
          run++
          best = Math.max(best, run)
        } else if (k === today) {
          // сегодня ещё можно успеть
        } else {
          miss(monthKey(k), 1, k)
        }
      }
    }
  }

  const used = skipsUsed[monthKey(today)] ?? 0
  return {
    current: run,
    best,
    previous,
    unit: habit.schedule.type === 'perWeek' ? 'weeks' : 'days',
    skipsUsedThisMonth: used,
    skipsLeft: Math.max(0, habit.allowedSkips - used),
    skipSavedRecently: lastSkip !== null && lastSkip >= addDays(today, -2),
  }
}

export function completionRate(habit: Habit, entries: Entries, today: DateKey, daysBack: number): number {
  const from = addDays(today, -(daysBack - 1))
  const start = from < habit.createdAt ? habit.createdAt : from
  if (start > today) return 0
  let done = 0
  let planned = 0
  if (habit.schedule.type === 'perWeek') {
    const keys = rangeKeys(start, today)
    done = keys.filter((k) => isDone(entries, habit.id, k)).length
    const span = keys.length - (isDone(entries, habit.id, today) ? 0 : 1)
    planned = (habit.schedule.times * Math.max(span, 1)) / 7
  } else {
    for (const k of rangeKeys(start, today)) {
      if (!isScheduled(habit, k)) continue
      const d = isDone(entries, habit.id, k)
      if (k === today && !d) continue
      planned++
      if (d) done++
    }
  }
  if (planned <= 0) return done > 0 ? 100 : 0
  return Math.min(100, Math.round((done / planned) * 100))
}

export function scheduleText(s: Schedule): string {
  if (s.type === 'daily') return 'Каждый день'
  if (s.type === 'perWeek') return `${s.times} ${plural(s.times, 'раз', 'раза', 'раз')} в неделю`
  if (s.days.length === 7) return 'Каждый день'
  if (s.days.length === 5 && [0, 1, 2, 3, 4].every((d) => s.days.includes(d))) return 'По будням'
  if (s.days.length === 2 && s.days.includes(5) && s.days.includes(6)) return 'По выходным'
  return [...s.days].sort().map((d) => WEEKDAYS_SHORT[d]).join(', ')
}

export const UNITS: { kind: UnitKind; label: string; title: string; defaultAmount: number }[] = [
  { kind: 'times', label: 'раз', title: 'Разы (просто отметка)', defaultAmount: 1 },
  { kind: 'pages', label: 'стр.', title: 'Страницы', defaultAmount: 20 },
  { kind: 'minutes', label: 'мин', title: 'Минуты', defaultAmount: 15 },
  { kind: 'ml', label: 'мл', title: 'Миллилитры', defaultAmount: 2000 },
  { kind: 'glasses', label: 'стак.', title: 'Стаканы воды', defaultAmount: 8 },
  { kind: 'km', label: 'км', title: 'Километры', defaultAmount: 3 },
  { kind: 'steps', label: 'шагов', title: 'Шаги', defaultAmount: 10000 },
  { kind: 'money', label: '₽', title: 'Деньги (сэкономлено)', defaultAmount: 300 },
  { kind: 'custom', label: '', title: 'Своя единица', defaultAmount: 1 },
]

export function totalValue(habit: Habit, entries: Entries, from?: DateKey, to?: DateKey): number {
  const map = entries[habit.id] ?? {}
  let sum = 0
  for (const [k, v] of Object.entries(map)) {
    if ((from && k < from) || (to && k > to)) continue
    sum += v
  }
  return sum
}

export interface Benefit {
  id: string
  emoji: string
  title: string
  value: string
  hint: string
  weekDelta: string
}

const fmt = (n: number, digits = 0) => n.toLocaleString('ru-RU', { maximumFractionDigits: digits })

function approx(n: number, digits: number, one: string, few: string, many: string) {
  const r = Math.round(n * 10 ** digits) / 10 ** digits
  return `≈ ${fmt(r, digits)} ${Number.isInteger(r) ? plural(r, one, few, many) : few}`
}

export function benefits(habits: Habit[], entries: Entries, categories: Category[], today: DateKey): Benefit[] {
  const weekFrom = addDays(today, -6)
  const badIds = new Set(categories.filter((c) => /вредн/i.test(c.name)).map((c) => c.id))
  const acc = {
    pages: [0, 0], water: [0, 0], invested: [0, 0], saved: [0, 0], distance: [0, 0], money: [0, 0], completions: [0, 0],
  } as Record<string, [number, number]>
  for (const h of habits) {
    const all = totalValue(h, entries)
    const week = totalValue(h, entries, weekFrom, today)
    const add = (key: string, a: number, w: number) => { acc[key][0] += a; acc[key][1] += w }
    const doneAll = Object.values(entries[h.id] ?? {}).filter((v) => v > 0).length
    const doneWeek = Object.entries(entries[h.id] ?? {}).filter(([k, v]) => v > 0 && k >= weekFrom && k <= today).length
    add('completions', doneAll, doneWeek)
    switch (h.unit) {
      case 'pages': add('pages', all, week); break
      case 'ml': add('water', all / 1000, week / 1000); break
      case 'glasses': add('water', (all * 250) / 1000, (week * 250) / 1000); break
      case 'minutes': add(h.categoryId && badIds.has(h.categoryId) ? 'saved' : 'invested', all / 60, week / 60); break
      case 'km': add('distance', all, week); break
      case 'steps': add('distance', all * 0.00075, week * 0.00075); break
      case 'money': add('money', all, week); break
      default: break
    }
  }
  const out: Benefit[] = []
  const delta = (v: string) => `+${v} за неделю`
  if (acc.pages[0] > 0) out.push({ id: 'pages', emoji: '📚', title: 'Прочитано', value: `${fmt(acc.pages[0])} стр.`, hint: approx(acc.pages[0] / 250, 1, 'книга', 'книги', 'книг'), weekDelta: delta(`${fmt(acc.pages[1])} стр.`) })
  if (acc.water[0] > 0) out.push({ id: 'water', emoji: '💧', title: 'Выпито воды', value: `${fmt(acc.water[0], 1)} л`, hint: `${approx(acc.water[0] / 0.5, 0, 'бутылка', 'бутылки', 'бутылок')} по 0,5 л`, weekDelta: delta(`${fmt(acc.water[1], 1)} л`) })
  if (acc.invested[0] > 0) out.push({ id: 'invested', emoji: '⏳', title: 'Вложено в себя', value: `${fmt(acc.invested[0], 1)} ч`, hint: `≈ ${fmt(acc.invested[0] / 24, 1)} суток практики`, weekDelta: delta(`${fmt(acc.invested[1], 1)} ч`) })
  if (acc.saved[0] > 0) out.push({ id: 'saved', emoji: '🕊️', title: 'Сэкономлено времени', value: `${fmt(acc.saved[0], 1)} ч`, hint: 'без вредных привычек', weekDelta: delta(`${fmt(acc.saved[1], 1)} ч`) })
  if (acc.distance[0] > 0) out.push({ id: 'distance', emoji: '👟', title: 'Пройдено', value: `${fmt(acc.distance[0], 1)} км`, hint: approx(acc.distance[0] / 42.195, 1, 'марафон', 'марафона', 'марафонов'), weekDelta: delta(`${fmt(acc.distance[1], 1)} км`) })
  if (acc.money[0] > 0) out.push({ id: 'money', emoji: '💰', title: 'Сэкономлено', value: `${fmt(acc.money[0])} ₽`, hint: 'осталось в кошельке', weekDelta: delta(`${fmt(acc.money[1])} ₽`) })
  out.push({ id: 'completions', emoji: '🏆', title: 'Всего побед', value: fmt(acc.completions[0]), hint: 'каждая отметка — шаг к вершине', weekDelta: delta(fmt(acc.completions[1])) })
  return out
}

export interface Motivation {
  tone: 'party' | 'up' | 'warn' | 'support' | 'info'
  emoji: string
  text: string
}

export function motivation(habits: Habit[], entries: Entries, today: DateKey): Motivation[] {
  const active = habits.filter((h) => !h.archived)
  if (active.length === 0) return [{ tone: 'info', emoji: '⛰️', text: 'Добавь первую привычку — и начнём восхождение.' }]
  const out: Motivation[] = []
  const yesterday = addDays(today, -1)
  const t = dayProgress(habits, entries, today)
  const y = dayProgress(habits, entries, yesterday)
  const hadYesterday = active.some((h) => h.createdAt <= yesterday) && y.total > 0

  if (t.total === 0) out.push({ tone: 'info', emoji: '☀️', text: 'На сегодня ничего не запланировано — отличный день, чтобы набраться сил.' })
  else if (t.done === t.total) out.push({ tone: 'party', emoji: '🏆', text: `Все ${t.total} из ${t.total} выполнены! Сегодня ты на вершине.` })
  else if (hadYesterday && t.done < y.done) out.push({ tone: 'warn', emoji: '💪', text: `Вчера ${y.done}/${y.total}, сегодня ${t.done}/${t.total} — подтянись!` })
  else if (hadYesterday && t.done > y.done) out.push({ tone: 'up', emoji: '🚀', text: `Выше, чем вчера: ${t.done}/${t.total} против ${y.done}/${y.total}.` })
  else if (hadYesterday) out.push({ tone: 'info', emoji: '⚖️', text: `Пока вровень со вчера (${t.done}/${t.total}). Ещё одна отметка — и ты впереди!` })
  else out.push({ tone: 'info', emoji: '✨', text: `Выполнено ${t.done} из ${t.total}. Каждая отметка приближает к вершине.` })

  let bestGain: { name: string; gain: number; unit: 'days' | 'weeks' } | null = null
  let saved: string | null = null
  for (const h of active) {
    const s = streakInfo(h, entries, today)
    if (s.previous > 0 && s.current > s.previous) {
      const gain = s.current - s.previous
      if (!bestGain || gain > bestGain.gain) bestGain = { name: h.name, gain, unit: s.unit }
    }
    if (s.skipSavedRecently && s.current > 0 && !saved) saved = h.name
  }
  if (bestGain) {
    const unit = bestGain.unit === 'weeks' ? plural(bestGain.gain, 'неделю', 'недели', 'недель') : plural(bestGain.gain, 'день', 'дня', 'дней')
    out.push({ tone: 'up', emoji: '🔥', text: `«${bestGain.name}»: ты держишься дольше на ${bestGain.gain} ${unit}, чем в прошлый раз!` })
  }

  const weekRate = (end: DateKey) => {
    let d = 0, tot = 0
    for (let i = 0; i < 7; i++) {
      const k = addDays(end, -i)
      const p = dayProgress(habits, entries, k)
      if (k === today && p.done < p.total) { d += p.done; tot += p.done; continue }
      d += p.done; tot += p.total
    }
    return tot ? d / tot : null
  }
  const thisW = weekRate(today)
  const lastW = weekRate(addDays(today, -7))
  if (thisW !== null && lastW !== null && active.some((h) => h.createdAt <= addDays(today, -7))) {
    const diff = Math.round((thisW - lastW) * 100)
    if (diff >= 5) out.push({ tone: 'up', emoji: '📈', text: `За последние 7 дней ты на ${diff}% стабильнее, чем неделей раньше.` })
    else if (diff <= -5) out.push({ tone: 'warn', emoji: '📉', text: `Неделя вышла на ${-diff}% слабее предыдущей — ничего, догоним!` })
  }

  if (saved) out.push({ tone: 'support', emoji: '🛟', text: `Серия «${saved}» сохранена благодаря легальному пропуску. Продолжай!` })
  if (hadYesterday && y.done < y.total) {
    out.push({ tone: 'support', emoji: '🌈', text: y.done === 0 ? 'Вчера не получилось — не расстраивайся, сегодня новый день.' : `Вчера пропущено ${y.total - y.done} — не расстраивайся, сегодня новый день.` })
  }
  return out.slice(0, 4)
}

export interface Bucket { key: string; done: number }

export function overallStats(habits: Habit[], entries: Entries, categories: Category[], today: DateKey) {
  const perDay: Record<DateKey, number> = {}
  let total = 0
  for (const h of habits) {
    for (const [k, v] of Object.entries(entries[h.id] ?? {})) {
      if (v > 0 && k <= today) { perDay[k] = (perDay[k] ?? 0) + 1; total++ }
    }
  }
  const dayKeys = Object.keys(perDay).sort()
  const best = (group: (k: DateKey) => string): Bucket | null => {
    const m: Record<string, number> = {}
    for (const k of dayKeys) m[group(k)] = (m[group(k)] ?? 0) + perDay[k]
    let res: Bucket | null = null
    for (const [key, done] of Object.entries(m)) if (!res || done > res.done || (done === res.done && key > res.key)) res = { key, done }
    return res
  }
  const byWeekday = WEEKDAYS_SHORT.map((name, i) => ({ name, value: dayKeys.filter((k) => weekdayIndex(k) === i).reduce((a, k) => a + perDay[k], 0) }))
  const catMap: Record<string, number> = {}
  for (const h of habits) {
    const n = Object.values(entries[h.id] ?? {}).filter((v) => v > 0).length
    if (!n) continue
    const id = h.categoryId ?? 'none'
    catMap[id] = (catMap[id] ?? 0) + n
  }
  const byCategory = Object.entries(catMap).map(([id, value]) => {
    const c = categories.find((x) => x.id === id)
    return { id, name: c ? c.name : 'Без категории', color: c ? c.color : '#94a3b8', icon: c ? c.icon : '📌', value }
  }).sort((a, b) => b.value - a.value)
  const top = habits
    .filter((h) => !h.archived)
    .map((h) => ({ habit: h, rate: completionRate(h, entries, today, 30), streak: streakInfo(h, entries, today) }))
    .sort((a, b) => b.rate - a.rate || b.streak.current - a.streak.current)
  return {
    total,
    activeDays: dayKeys.length,
    firstDay: dayKeys[0] ?? null,
    bestDay: best((k) => k),
    bestWeek: best((k) => startOfWeek(k)),
    bestMonth: best((k) => monthKey(k)),
    byWeekday,
    byCategory,
    top,
    perDay,
  }
}

export function dailySeries(habits: Habit[], entries: Entries, today: DateKey, n: number) {
  return rangeKeys(addDays(today, -(n - 1)), today).map((k) => {
    const p = dayProgress(habits, entries, k)
    const doneAll = habits.filter((h) => isDone(entries, h.id, k)).length
    return { key: k, done: doneAll, total: Math.max(p.total, doneAll), rate: p.total ? Math.round((p.done / p.total) * 100) : 0 }
  })
}

export function heroLevel(totalCompletions: number) {
  const thresholds = [0, 7, 21, 50, 100, 200, 365, 600, 1000]
  const titles = ['Новичок тропы', 'Странник', 'Восходитель', 'Страж вершины', 'Герой дня', 'Мастер дисциплины', 'Легенда тропы', 'Властелин привычек', 'Олимпиец']
  let i = 0
  while (i < thresholds.length - 1 && totalCompletions >= thresholds[i + 1]) i++
  const from = thresholds[i]
  const to = thresholds[i + 1] ?? thresholds[i] + 400
  const span = Math.max(1, to - from)
  return { title: titles[i], level: i + 1, from, to, progress: Math.min(100, Math.round(((totalCompletions - from) / span) * 100)) }
}

export interface Insight {
  emoji: string
  text: string
}

export function insights(habits: Habit[], entries: Entries, categories: Category[], today: DateKey): Insight[] {
  const s = overallStats(habits, entries, categories, today)
  const out: Insight[] = []
  const activeWeekdays = s.byWeekday.filter((d) => d.value > 0)
  if (s.total >= 7 && activeWeekdays.length) {
    const best = [...s.byWeekday].sort((a, b) => b.value - a.value)[0]
    const worst = [...s.byWeekday].sort((a, b) => a.value - b.value)[0]
    if (best.value > 0) out.push({ emoji: '📅', text: `Твой самый продуктивный день — ${best.name}.` })
    if (activeWeekdays.length >= 3 && worst && best.value > 0 && worst.value < best.value) {
      const drop = Math.round((1 - worst.value / best.value) * 100)
      if (drop >= 20) out.push({ emoji: '📉', text: `В ${worst.name.toLowerCase()} активность падает на ${drop}%.` })
    }
  }
  const weekend = s.byWeekday.slice(5).reduce((a, d) => a + d.value, 0)
  const weekday = s.byWeekday.slice(0, 5).reduce((a, d) => a + d.value, 0)
  if (s.total >= 10 && weekday > 0 && weekend < weekday * 0.3) out.push({ emoji: '🌄', text: 'В выходные восхождение слабее — запланируй одну лёгкую привычку на субботу.' })
  const weak = s.top.filter((t) => t.rate < 50).slice(0, 1)
  if (weak[0]) out.push({ emoji: '🧭', text: `«${weak[0].habit.name}» держится ниже 50% за месяц — упрости цель или добавь поблажку.` })
  const fire = s.top.find((t) => t.streak.current >= 7)
  if (fire) out.push({ emoji: '🔥', text: `Серия «${fire.habit.name}» уже ${fire.streak.current} — это огненный меч героя.` })
  if (!out.length) out.push({ emoji: '⛰️', text: 'Отмечай дни — и здесь появятся инсайты о твоём пути.' })
  return out.slice(0, 4)
}

export interface Milestone {
  id: string
  date: DateKey
  emoji: string
  title: string
  text: string
}

export function milestones(habits: Habit[], entries: Entries, today: DateKey): Milestone[] {
  const out: Milestone[] = []
  const firsts: { date: DateKey; name: string }[] = []
  for (const h of habits) {
    const keys = Object.entries(entries[h.id] ?? {}).filter(([, v]) => v > 0).map(([k]) => k).sort()
    if (keys[0]) firsts.push({ date: keys[0], name: h.name })
    const s = streakInfo(h, entries, today)
    if (s.best >= 7) out.push({ id: `best-${h.id}`, date: today, emoji: '⚡', title: `Рекорд «${h.name}»`, text: `${s.best} ${s.unit === 'weeks' ? 'недель' : 'дней'} подряд` })
  }
  firsts.sort((a, b) => a.date.localeCompare(b.date))
  if (firsts[0]) out.unshift({ id: 'first', date: firsts[0].date, emoji: '🏁', title: 'Первая победа', text: `«${firsts[0].name}» — начало восхождения` })
  const days = new Set<string>()
  for (const h of habits) for (const [k, v] of Object.entries(entries[h.id] ?? {})) if (v > 0) days.add(k)
  if (days.size >= 21) out.push({ id: '21', date: today, emoji: '🏔️', title: '21 день на тропе', text: 'Привычка становится характером' })
  return out.slice(0, 8)
}
