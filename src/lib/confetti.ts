import confetti from 'canvas-confetti'

export const triggerConfetti = () => {
  const duration = 3000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#22c55e', '#ef4444', '#3b82f6', '#eab308'], // Brand colors
    })
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#22c55e', '#ef4444', '#3b82f6', '#eab308'],
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }

  frame()
}

export const triggerSmallConfetti = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#22c55e'], // Just Green for correct answer? Or multi? Let's go multi.
  })
}
