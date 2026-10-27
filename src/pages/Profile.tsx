import { useRef, useState } from 'react'
import { DAY_THEMES } from '../lib/days'
import { changePassword, deleteAccount, updateProfile } from '../lib/auth'
import { download, exportCSV, exportJSON, exportName, parseImport } from '../lib/storage'
import { excelBlob, excelFilename, openMailWithFile } from '../lib/excel'
import { requestPushPermission } from '../lib/reminders'
import { useData } from '../store/app'
import type { ThemeMode } from '../lib/types'
import { Card, Confirm, Field, PageHeader, Segmented, Switch, useToast } from '../components/ui'

const AVATARS = ['⛰️', '🏆', '🦅', '🔥', '⚡', '🛡️', '🌅', '🧭']

export function Profile() {
  const { user, data, setUser, logout, updateSettings, replaceData, addCategory, deleteCategory } = useData()
  const toast = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [wipe, setWipe] = useState(false)

  const saveProfile = async () => {
    try {
      const nextUser = await updateProfile(user.id, { name, email })
      setUser(nextUser)
      toast('Профиль сохранён')
    } catch (e) {
      toast((e as Error).message, 'error')
    }
  }

  const exportXlsx = () => {
    const blob = excelBlob(user, data)
    const nameX = excelFilename()
    download(nameX, blob)
    return nameX
  }

  return (
    <div>
      <PageHeader title="Профиль" subtitle="Тема, данные и выход" />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="display text-xl font-black">Герой</h2>
          <div className="flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button key={a} type="button" className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl ${data.settings.avatar === a ? 'bg-white shadow' : 'bg-black/5 dark:bg-white/10'}`} onClick={() => updateSettings({ avatar: a })}>{a}</button>
            ))}
          </div>
          <Field label="Имя"><input className="field" value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email"><input className="field" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
          <p className="text-soft text-sm">Логин: <b>{user.login}</b></p>
          <button type="button" className="btn btn-primary" onClick={saveProfile}>Сохранить</button>
        </Card>

        <Card className="space-y-4">
          <h2 className="display text-xl font-black">Тема</h2>
          <Segmented
            value={data.settings.theme}
            onChange={(v) => updateSettings({ theme: v as ThemeMode })}
            options={[{ value: 'light', label: 'Ясный день' }, { value: 'dark', label: 'Ночной полёт' }, { value: 'system', label: 'Система' }]}
          />
          <Switch checked={data.settings.mobileNav === 'burger'} onChange={(v) => updateSettings({ mobileNav: v ? 'burger' : 'tabs' })} label="Бургер-меню на телефоне" description="Иначе нижние вкладки" />
          <Switch checked={data.settings.effects} onChange={(v) => updateSettings({ effects: v })} label="Эффекты и анимации" />
          <Switch
            checked={data.settings.push}
            onChange={async (v) => {
              if (v) {
                const ok = await requestPushPermission()
                if (!ok) { toast('Уведомления не разрешены', 'error'); return }
              }
              updateSettings({ push: v })
            }}
            label="Напоминания"
            description="Работают, пока приложение открыто"
          />
        </Card>

        <Card>
          <h2 className="display mb-3 text-xl font-black">Фон дня</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <button type="button" className={`rounded-2xl p-3 font-bold ${data.settings.background === 'auto' ? 'bg-white shadow' : 'bg-black/5 dark:bg-white/10'}`} onClick={() => updateSettings({ background: 'auto' })}>Авто</button>
            {DAY_THEMES.map((d, i) => (
              <button key={d.file} type="button" className={`rounded-2xl p-3 text-left text-sm font-bold ${data.settings.background === i ? 'bg-white shadow' : 'bg-black/5 dark:bg-white/10'}`} onClick={() => updateSettings({ background: i })}>
                {d.name}<div className="text-soft text-xs">{d.mood}</div>
              </button>
            ))}
          </div>
        </Card>

        <Card className="space-y-3">
          <h2 className="display text-xl font-black">Данные</h2>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn btn-primary" onClick={() => { exportXlsx(); toast('Excel скачан') }}>Выгрузить в Excel</button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const filename = exportXlsx()
                openMailWithFile(user.email, filename)
                toast('Файл скачан. Приложи его к письму', 'info')
              }}
            >
              Отправить на email
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => download(exportName('csv'), exportCSV(data), 'text/csv;charset=utf-8')}>CSV</button>
            <button type="button" className="btn btn-ghost" onClick={() => download(exportName('json'), exportJSON(user, data), 'application/json')}>JSON</button>
            <button type="button" className="btn btn-ghost" onClick={() => fileRef.current?.click()}>Импорт JSON</button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              e.target.value = ''
              if (!file) return
              try {
                replaceData(parseImport(await file.text()))
                toast('Данные импортированы')
              } catch (err) {
                toast((err as Error).message, 'error')
              }
            }}
          />
        </Card>

        <Card className="space-y-3">
          <h2 className="display text-xl font-black">Пароль</h2>
          <Field label="Текущий"><input className="field" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} /></Field>
          <Field label="Новый"><input className="field" type="password" value={next} onChange={(e) => setNext(e.target.value)} /></Field>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={async () => {
              try {
                await changePassword(user.id, current, next)
                setCurrent(''); setNext('')
                toast('Пароль изменён')
              } catch (e) {
                toast((e as Error).message, 'error')
              }
            }}
          >
            Сменить пароль
          </button>
        </Card>

        <Card className="space-y-3">
          <h2 className="display text-xl font-black">Категории</h2>
          <div className="flex flex-wrap gap-2">
            {data.categories.map((c) => (
              <span key={c.id} className="inline-flex items-center gap-2 rounded-full bg-black/5 px-3 py-1 text-sm font-bold dark:bg-white/10">
                {c.icon} {c.name}
                <button type="button" className="text-rose-500" aria-label={`Удалить ${c.name}`} onClick={() => deleteCategory(c.id)}>✕</button>
              </span>
            ))}
          </div>
          <form
            className="flex flex-wrap gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              const input = e.currentTarget.elements.namedItem('cat') as HTMLInputElement
              if (!input.value.trim()) return
              addCategory({ name: input.value.trim(), icon: '📌', color: '#94a3b8' })
              input.value = ''
            }}
          >
            <input name="cat" className="field max-w-xs" placeholder="Новая категория" />
            <button type="submit" className="btn btn-ghost btn-sm">+ Добавить</button>
          </form>
        </Card>

        <Card className="space-y-3">
          <h2 className="display text-xl font-black">Сессия</h2>
          <button type="button" className="btn btn-ghost" onClick={logout}>Выйти</button>
          <button type="button" className="btn btn-primary btn-danger" onClick={() => setWipe(true)}>Удалить все данные</button>
        </Card>
      </div>

      <Confirm
        open={wipe}
        title="Удалить всё?"
        text="Аккаунт, привычки и история будут стёрты. Регистрация снова откроется."
        confirmLabel="Удалить"
        onClose={() => setWipe(false)}
        onConfirm={() => { deleteAccount(user.id); logout() }}
      />
    </div>
  )
}
