export interface DayTheme {
  file: string
  name: string
  mood: string
  accent: string
  accent2: string
  glow: string
  confetti: string[]
}

/** Индекс 0 = понедельник. Палитры сняты со сцен «победитель на вершине». */
export const DAY_THEMES: DayTheme[] = [
  { file: 'monday', name: 'Понедельник', mood: 'Рассвет силы', accent: '#f5b42a', accent2: '#1d4f9a', glow: '#ffd56a', confetti: ['#f5b42a', '#ff7a1a', '#7ec8ff', '#ffffff'] },
  { file: 'tuesday', name: 'Вторник', mood: 'Ясный день', accent: '#ffc21a', accent2: '#0b63c6', glow: '#9ad4ff', confetti: ['#ffc21a', '#2a7bff', '#ffffff', '#7ec8ff'] },
  { file: 'wednesday', name: 'Среда', mood: 'Золотой час', accent: '#ff9a1f', accent2: '#c45a12', glow: '#ffd08a', confetti: ['#ff9a1f', '#ffd08a', '#2a4a7a', '#ffffff'] },
  { file: 'thursday', name: 'Четверг', mood: 'Прорыв сквозь тучи', accent: '#ff7a1a', accent2: '#163a6b', glow: '#ffb347', confetti: ['#ff7a1a', '#f5b42a', '#7ec8ff', '#163a6b'] },
  { file: 'friday', name: 'Пятница', mood: 'Золотой финиш', accent: '#ffb000', accent2: '#e86a00', glow: '#ffe08a', confetti: ['#ffb000', '#ff7a1a', '#ffe08a', '#163a6b'] },
  { file: 'saturday', name: 'Суббота', mood: 'Свобода высоты', accent: '#4fb3f2', accent2: '#0b4aa8', glow: '#bfe6ff', confetti: ['#4fb3f2', '#ffc21a', '#ffffff', '#7ec8ff'] },
  { file: 'sunday', name: 'Воскресенье', mood: 'Тихая победа', accent: '#ffc857', accent2: '#2a4a7a', glow: '#ffe9b0', confetti: ['#ffc857', '#ff9a7a', '#9ad6ff', '#ffffff'] },
]

export const bgUrl = (i: number, tiny = false) => `./bg/${DAY_THEMES[i].file}${tiny ? '-tiny' : ''}.webp`

export const HABIT_COLORS = ['#f5b42a', '#ff7a1a', '#ff4d5e', '#8b3dff', '#2a7bff', '#0fb3c9', '#4cbf2a', '#e86a00', '#4f46e5', '#6b7280']

export const HABIT_ICONS = [
  '💧', '📚', '🏃', '🧘', '🍎', '🥗', '💤', '🦷', '💊', '🚭',
  '✍️', '🎨', '🧠', '💻', '📝', '🧹', '🪴', '💰', '🚶', '🚴',
  '🏋️', '☀️', '🌙', '❤️', '🎯', '⛰️', '🏆', '🔥', '⚡', '🛡️',
]
