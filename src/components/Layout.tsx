import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import { useReminders } from '../lib/reminders'
import { useApp, useData } from '../store/app'
import { Background } from './Background'
import { Logo } from './Logo'
import { cx } from './ui'

const NAV = [
  { to: '/app', end: true, icon: '⛰️', label: 'Вершина' },
  { to: '/app/arsenal', icon: '🛡️', label: 'Арсенал' },
  { to: '/app/map', icon: '🗺️', label: 'Карта' },
  { to: '/app/analytics', icon: '📊', label: 'Аналитика' },
  { to: '/app/profile', icon: '👤', label: 'Профиль' },
]

function Item({ to, end, icon, label, onClick }: { to: string; end?: boolean; icon: string; label: string; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) => cx(
        'flex items-center gap-3 rounded-2xl px-3 py-2.5 font-extrabold transition',
        isActive ? 'bg-white text-slate-900 shadow dark:bg-white/90' : 'text-white/85 hover:bg-white/10',
      )}
    >
      <span aria-hidden className="text-lg">{icon}</span>
      <span>{label}</span>
    </NavLink>
  )
}

export function AppLayout() {
  const { user } = useApp()
  if (!user) return <Navigate to="/login" replace />
  return <SignedLayout />
}

function SignedLayout() {
  const { data } = useData()
  const [open, setOpen] = useState(false)
  useReminders()
  const burger = data.settings.mobileNav === 'burger'

  return (
    <div className="relative min-h-dvh">
      <Background />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-[1600px]">
        <aside className="hidden w-64 shrink-0 flex-col gap-2 p-4 lg:flex">
          <div className="mb-4 px-1"><Logo /></div>
          {NAV.map((n) => <Item key={n.to} {...n} />)}
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex items-center justify-between gap-3 px-4 py-3 lg:hidden">
            {burger ? (
              <button type="button" className="btn btn-ghost btn-icon" aria-label="Меню" onClick={() => setOpen(true)}>☰</button>
            ) : <span className="w-11" />}
            <Logo />
            <span className="w-11" />
          </header>

          <main className={cx('min-w-0 flex-1 px-4 pb-28 pt-2 sm:px-6 lg:px-8 lg:pb-10 lg:pt-6', burger && 'pb-8')}>
            <Outlet />
          </main>

          {!burger && (
            <nav className="glass-strong fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 gap-1 px-2 py-2 lg:hidden [padding-bottom:max(.5rem,env(safe-area-inset-bottom))]">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.end}
                  className={({ isActive }) => cx('flex flex-col items-center rounded-2xl py-1.5 text-[11px] font-extrabold', isActive ? 'bg-white text-slate-900' : 'text-white/85')}
                >
                  <span className="text-lg">{n.icon}</span>{n.label}
                </NavLink>
              ))}
            </nav>
          )}
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-950/50" onClick={() => setOpen(false)} />
          <div className="glass-strong absolute inset-y-0 left-0 flex w-72 flex-col gap-2 p-4">
            <Logo />
            {NAV.map((n) => <Item key={n.to} {...n} onClick={() => setOpen(false)} />)}
          </div>
        </div>
      )}
    </div>
  )
}
