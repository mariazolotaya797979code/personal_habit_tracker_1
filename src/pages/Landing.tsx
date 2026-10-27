import { Link } from 'react-router-dom'
import { registrationOpen } from '../lib/auth'
import { useApp } from '../store/app'
import { Background } from '../components/Background'
import { Logo } from '../components/Logo'
import { Card } from '../components/ui'

export function Landing() {
  const { user } = useApp()
  const open = registrationOpen()
  return (
    <div className="relative min-h-dvh">
      <Background />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-6xl flex-col px-4 py-6 sm:px-8">
        <header className="flex items-center justify-between"><Logo to="/" /><div className="flex gap-2">
          {user ? <Link to="/app" className="btn btn-primary">В приложение</Link> : <>
            <Link to="/login" className="btn btn-ghost">Войти</Link>
            {open && <Link to="/register" className="btn btn-primary">Начать</Link>}
          </>}
        </div></header>
        <section className="my-auto grid gap-10 py-16 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 font-extrabold uppercase tracking-[0.2em] text-white/80">Персональный трекер</p>
            <h1 className="display hero-title text-5xl font-black leading-[1.05] sm:text-7xl">Вершина</h1>
            <p className="mt-5 max-w-xl text-lg font-semibold text-white/90 [text-shadow:0_2px_12px_rgba(0,20,50,.5)]">
              Ты — герой своей жизни. Этот трекер — твой пьедестал. Скачал, установил, ввёл логин и пароль — пользуешься. Все данные остаются на устройстве.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to={user ? '/app' : open ? '/register' : '/login'} className="btn btn-primary">{user ? 'На вершину' : 'Создать аккаунт'}</Link>
              <Link to="/login" className="btn btn-ghost">У меня уже есть вход</Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ['⛰️', 'Дашборд «Вершина»', 'Кольцо дня, карточки привычек и фраза, которая поднимает.'],
              ['🛡️', 'Арсенал', 'Серии, рекорды и массовые действия как у героя.'],
              ['🗺️', 'Карта пути', 'Тепловая карта и лента побед за весь маршрут.'],
              ['📤', 'Excel и почта', 'Выгрузи данные или открой письмо с файлом за секунду.'],
            ].map(([e, t, d]) => (
              <Card key={t} className="p-5">
                <div className="text-3xl">{e}</div>
                <h2 className="mt-2 font-black">{t}</h2>
                <p className="text-soft mt-1 text-sm">{d}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
