export type DateKey = string // YYYY-MM-DD в локальном времени

export type Schedule =
  | { type: 'daily' }
  | { type: 'weekdays'; days: number[] } // 0 = понедельник … 6 = воскресенье
  | { type: 'perWeek'; times: number }

export type UnitKind = 'times' | 'pages' | 'minutes' | 'ml' | 'glasses' | 'km' | 'steps' | 'money' | 'custom'

export interface Habit {
  id: string
  name: string
  icon: string
  color: string
  categoryId: string | null
  schedule: Schedule
  reminderTime: string | null
  unit: UnitKind
  unitLabel: string
  amount: number
  allowedSkips: number
  archived: boolean
  createdAt: DateKey
  order: number
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
}

export type Entries = Record<string, Record<DateKey, number>>

export type ThemeMode = 'light' | 'dark' | 'system'
export type MobileNav = 'tabs' | 'burger'

export interface Settings {
  theme: ThemeMode
  mobileNav: MobileNav
  push: boolean
  effects: boolean
  background: 'auto' | number
  avatar: string
}

export interface AppData {
  version: 1
  habits: Habit[]
  categories: Category[]
  entries: Entries
  settings: Settings
  updatedAt: number
}

export interface User {
  id: string
  login: string
  email: string
  name: string
  passwordHash: string
  salt: string
  createdAt: number
}
