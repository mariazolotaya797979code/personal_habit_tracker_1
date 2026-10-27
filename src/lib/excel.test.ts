import { describe, expect, it } from 'vitest'
import * as XLSX from 'xlsx'
import { buildWorkbook } from './excel'
import { createInitialData } from './storage'
import type { User } from './types'

const user: User = {
  id: 'u1', login: 'hero', email: 'hero@example.com', name: 'Анна',
  passwordHash: 'x', salt: 'y', createdAt: 1,
}

describe('excel', () => {
  it('собирает книгу из трёх листов', () => {
    const data = createInitialData()
    data.habits = [{
      id: 'h1', name: 'Вода', icon: '💧', color: '#000', categoryId: null,
      schedule: { type: 'daily' }, reminderTime: null, unit: 'glasses', unitLabel: 'стак.',
      amount: 8, allowedSkips: 1, archived: false, createdAt: '2026-10-01', order: 1,
    }]
    data.entries = { h1: { '2026-10-26': 8 } }
    const wb = buildWorkbook(user, data)
    expect(wb.SheetNames).toEqual(['Сводка', 'Привычки', 'Отметки'])
    const summary = XLSX.utils.sheet_to_json<Record<string, unknown>>(wb.Sheets['Сводка'])[0]
    expect(summary['Отметок']).toBe(1)
    expect(summary['Привычек']).toBe(1)
  })
})
