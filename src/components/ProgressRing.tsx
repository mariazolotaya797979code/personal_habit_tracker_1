import { cx } from './ui'

export function ProgressRing({ value, size = 220, stroke = 16, label, hint, lit }: { value: number; size?: number; stroke?: number; label: string; hint?: string; lit?: boolean }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  return (
    <div className={cx('relative grid place-items-center', lit && 'drop-shadow-[0_0_28px_color-mix(in_srgb,var(--accent)_55%,transparent)]')} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,.28)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#ring)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct / 100)}
          style={{ transition: 'stroke-dashoffset .8s cubic-bezier(.22,1,.36,1)' }}
        />
        <defs>
          <linearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--glow)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="display tabular text-5xl font-black text-white [text-shadow:0_4px_18px_rgba(0,20,50,.45)]">{pct}%</div>
          <div className="mt-1 max-w-[9rem] text-sm font-bold text-white/90">{label}</div>
          {hint && <div className="text-xs font-semibold text-white/75">{hint}</div>}
        </div>
      </div>
    </div>
  )
}
