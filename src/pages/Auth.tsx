import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { confirmReset, login, passwordProblem, register, registrationOpen, requestReset, startSession } from '../lib/auth'
import { useApp } from '../store/app'
import { Background } from '../components/Background'
import { Logo } from '../components/Logo'
import { Card, Field, useToast } from '../components/ui'

function Shell({ children, title, subtitle }: { children: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="relative min-h-dvh">
      <Background />
      <div className="relative z-10 mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-4 py-10">
        <div className="mb-6"><Logo to="/" /></div>
        <Card>
          <h1 className="display text-3xl font-black">{title}</h1>
          <p className="text-soft mt-1 mb-6">{subtitle}</p>
          {children}
        </Card>
      </div>
    </div>
  )
}

export function Login() {
  const { setUser } = useApp()
  const nav = useNavigate()
  const toast = useToast()
  const [loginId, setLoginId] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const open = registrationOpen()

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      const user = await login(loginId, password)
      startSession(user, remember)
      setUser(user)
      nav('/app', { replace: true })
    } catch (err) {
      setError((err as Error).message)
      toast((err as Error).message, 'error')
    }
  }

  return (
    <Shell title="Вход" subtitle="Введи логин и пароль — и продолжай восхождение.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Логин или email"><input className="field" autoComplete="username" value={loginId} onChange={(e) => setLoginId(e.target.value)} required /></Field>
        <Field label="Пароль"><input className="field" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        <label className="flex items-center gap-2 font-bold"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Запомнить меня</label>
        {error && <p className="font-bold text-rose-600">{error}</p>}
        <button type="submit" className="btn btn-primary w-full">Войти</button>
      </form>
      <div className="mt-5 flex flex-wrap justify-between gap-3 text-sm font-bold">
        <Link to="/forgot">Забыли пароль?</Link>
        {open ? <Link to="/register">Создать аккаунт владельца</Link> : <span className="text-soft">Регистрация закрыта</span>}
      </div>
    </Shell>
  )
}

export function Register() {
  const { setUser } = useApp()
  const nav = useNavigate()
  const toast = useToast()
  const [name, setName] = useState('')
  const [loginId, setLoginId] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  if (!registrationOpen()) {
    return (
      <Shell title="Регистрация закрыта" subtitle="У этого приложения уже есть владелец.">
        <Link to="/login" className="btn btn-primary">Ко входу</Link>
      </Shell>
    )
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    const problem = passwordProblem(password)
    if (problem) { setError(problem); return }
    try {
      const user = await register(loginId, email, password, name)
      startSession(user, true)
      setUser(user)
      toast('Добро пожаловать на вершину!')
      nav('/app', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    }
  }

  return (
    <Shell title="Регистрация владельца" subtitle="Один аккаунт на это устройство. Потом только вход.">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Имя"><input className="field" value={name} onChange={(e) => setName(e.target.value)} required /></Field>
        <Field label="Логин" hint="3–32 символа, латиница и цифры"><input className="field" autoComplete="username" value={loginId} onChange={(e) => setLoginId(e.target.value)} required /></Field>
        <Field label="Email"><input className="field" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
        <Field label="Пароль" hint="Не короче 8 символов, буквы и цифры"><input className="field" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required /></Field>
        {error && <p className="font-bold text-rose-600">{error}</p>}
        <button type="submit" className="btn btn-primary w-full">Создать и войти</button>
      </form>
      <p className="mt-4 text-sm font-bold"><Link to="/login">Уже есть аккаунт</Link></p>
    </Shell>
  )
}

export function Forgot() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [next, setNext] = useState('')
  const [shown, setShown] = useState<string | null>(null)
  const [step, setStep] = useState<'ask' | 'reset'>('ask')

  return (
    <Shell title="Восстановление" subtitle="Код появится здесь — приложение работает локально, без почтового сервера.">
      {step === 'ask' ? (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const mail = await requestReset(email)
            if (!mail) { toast('Если email верный, код будет создан', 'info'); return }
            const match = mail.body.match(/(\d{6})/)
            setShown(match?.[1] ?? null)
            setStep('reset')
            toast('Код создан')
          }}
        >
          <Field label="Email"><input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required /></Field>
          <button className="btn btn-primary w-full" type="submit">Получить код</button>
        </form>
      ) : (
        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault()
            try {
              await confirmReset(email, code, next)
              toast('Пароль обновлён')
            } catch (err) {
              toast((err as Error).message, 'error')
            }
          }}
        >
          {shown && <p className="rounded-2xl bg-black/5 p-3 font-bold dark:bg-white/10">Код: {shown}</p>}
          <Field label="Код"><input className="field" value={code} onChange={(e) => setCode(e.target.value)} required /></Field>
          <Field label="Новый пароль"><input className="field" type="password" value={next} onChange={(e) => setNext(e.target.value)} required /></Field>
          <button className="btn btn-primary w-full" type="submit">Сохранить пароль</button>
        </form>
      )}
      <p className="mt-4 text-sm font-bold"><Link to="/login">Ко входу</Link></p>
    </Shell>
  )
}
