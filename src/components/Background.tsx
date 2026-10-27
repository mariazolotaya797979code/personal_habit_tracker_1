import { bgUrl } from '../lib/days'
import { useApp } from '../store/app'

export function Background() {
  const { dayIndex, data } = useApp()
  const effects = data?.settings.effects !== false
  const tiny = bgUrl(dayIndex, true)
  const full = bgUrl(dayIndex)
  return (
    <div className={effects ? '' : 'reduce-effects'} aria-hidden>
      <div className="bg-layer" style={{ backgroundImage: `url(${tiny})`, filter: 'blur(18px) saturate(1.1)', transform: 'scale(1.15)' }} />
      <div className="bg-layer" style={{ backgroundImage: `url(${full})` }} />
      <div className="sun-glow" style={{ top: '8%', left: '50%', marginLeft: '-min(24vw, 260px)' }} />
      <div className="bg-veil" />
    </div>
  )
}
