import { Link } from 'react-router-dom'

export function Logo({ to = '/app', compact = false }: { to?: string; compact?: boolean }) {
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5 no-underline" aria-label="Вершина — на главный экран">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[radial-gradient(circle_at_50%_30%,#ffd56a,#1d4f9a_70%,#071428)] shadow-[0_8px_20px_-8px_rgba(13,40,90,.6)] text-xl">
        ⛰️
      </span>
      {!compact && (
        <span className="leading-tight">
          <span className="display block text-lg font-black text-white [text-shadow:0_2px_10px_rgba(0,20,50,.5)] group-hover:underline">Вершина</span>
          <span className="text-xs font-bold text-white/80">победа над собой</span>
        </span>
      )}
    </Link>
  )
}
