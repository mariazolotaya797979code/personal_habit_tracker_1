import confetti from 'canvas-confetti'

export function celebrate(colors: string[]) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduced) return
  const common = { colors, disableForReducedMotion: true }
  confetti({ ...common, particleCount: 70, spread: 70, origin: { y: 0.7 } })
  confetti({ ...common, particleCount: 40, spread: 100, startVelocity: 35, origin: { y: 0.65 } })
}

export function burst(x: number, y: number, color: string) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  confetti({
    particleCount: 18,
    spread: 46,
    startVelocity: 22,
    origin: { x: x / window.innerWidth, y: y / window.innerHeight },
    colors: [color, '#ffffff', '#ffc857'],
    scalar: 0.8,
  })
}
