import confetti from 'canvas-confetti'

export const triggerConfetti = () => {
  if (typeof window !== 'undefined') {
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    )?.matches
    if (reduceMotion) return
  }

  const colors = ['#22c55e', '#3b82f6', '#eab308', '#f97316']
  const base = {
    spread: 70,
    ticks: 120,
    gravity: 1.0,
    decay: 0.92,
    startVelocity: 45,
    colors,
  } as const

  // Big center burst
  confetti({
    ...base,
    particleCount: 140,
    origin: { x: 0.5, y: 0.62 },
  })

  // Side cannons
  confetti({
    ...base,
    particleCount: 70,
    angle: 60,
    origin: { x: 0.05, y: 0.7 },
  })
  confetti({
    ...base,
    particleCount: 70,
    angle: 120,
    origin: { x: 0.95, y: 0.7 },
  })

  // Second wave for richness
  setTimeout(() => {
    confetti({
      ...base,
      particleCount: 90,
      startVelocity: 35,
      spread: 90,
      origin: { x: 0.5, y: 0.55 },
    })
  }, 220)
}

export const triggerSmallConfetti = () => {
  if (typeof window !== 'undefined') {
    const reduceMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    )?.matches
    if (reduceMotion) return
  }
  confetti({
    particleCount: 80,
    spread: 70,
    origin: { y: 0.6 },
    startVelocity: 35,
    gravity: 1.1,
    decay: 0.9,
    colors: ['#22c55e', '#3b82f6', '#eab308'],
  })
}
