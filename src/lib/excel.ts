import * as XLSX from 'xlsx'
import { todayKey } from './date'
import { scheduleText, streakInfo } from './habits'
import { exportName } from './storage'
import type { AppData, User } from './types'

export function buildWorkbook(user: User, data: AppData) {
  const habits = data.habits.map((h) => {
    const s = streakInfo(h, data.entries, todayKey())
    return {
      Название: h.name,
      Категория: data.categories.find((c) => c.id === h.categoryId)?.name ?? '',
      Периодичность: scheduleText(h.schedule),
      Единица: h.unitLabel || h.unit,
      Норма: h.amount,
      'Текущая серия': s.current,
      'Лучшая серия': s.best,
      'Поблажки / мес': h.allowedSkips,
      Статус: h.archived ? 'Архив' : 'Активна',
      Создана: h.createdAt,
    }
  })

  const marks: Record<string, string | number>[] = []
  for (const h of data.habits) {
    const cat = data.categories.find((c) => c.id === h.categoryId)?.name ?? ''
    for (const [date, value] of Object.entries(data.entries[h.id] ?? {})) {
      if (value > 0) marks.push({ Дата: date, Привычка: h.name, Категория: cat, Значение: value, Единица: h.unitLabel || h.unit })
    }
  }
  marks.sort((a, b) => String(a.Дата).localeCompare(String(b.Дата)))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([{
    Приложение: 'Вершина',
    Владелец: user.name,
    Логин: user.login,
    Email: user.email,
    'Дата выгрузки': new Date().toLocaleString('ru-RU'),
    'Привычек': data.habits.length,
    'Отметок': marks.length,
  }]), 'Сводка')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(habits.length ? habits : [{ Название: '' }]), 'Привычки')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(marks.length ? marks : [{ Дата: '' }]), 'Отметки')
  return wb
}

export function excelBlob(user: User, data: AppData): Blob {
  const wb = buildWorkbook(user, data)
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
}

export function excelFilename() {
  return exportName('xlsx')
}

export function openMailWithFile(to: string, filename: string) {
  const subject = encodeURIComponent('Данные трекера Вершина')
  const body = encodeURIComponent(
    `Привет!\n\nВыгрузка привычек из приложения «Вершина».\nФайл: ${filename}\n\nЕсли письмо открылось без вложения — приложите скачанный Excel вручную.\n`,
  )
  window.location.href = `mailto:${encodeURIComponent(to)}?subject=${subject}&body=${body}`
}
