'use client'

import { useEffect, useRef } from 'react'

type Status = 'idle' | 'invalid' | 'win'

const STYLE_ID = 'ff-fx-css'
const NOISE_ID = 'ff-noise'
const DISSOLVE_ID = 'ff-dissolve'

function ensureStyleTag() {
  if (document.getElementById(STYLE_ID)) return
  const css = `
:root { --ff-fade: 0; }
body.ff-white { background:#fff !important; }
#${NOISE_ID}, #${DISSOLVE_ID} {
  position: fixed; inset: 0; pointer-events: none; z-index: 50; opacity: 0;
}
#${NOISE_ID} {
  background:
    repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 2px, transparent 2px 4px),
    repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 4px);
  mix-blend-mode: overlay;
}
#${DISSOLVE_ID} {
  background: radial-gradient(1200px 800px at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.92) 30%, rgba(255,255,255,0.85) 60%, rgba(255,255,255,0.8) 100%);
  filter: blur(0px);
}
.ff-noise-flash { animation: ffNoise 250ms linear 1; }
@keyframes ffNoise {
  0% { opacity: 0; }
  10% { opacity: .9; }
  50% { opacity: .6; }
  100% { opacity: 0; }
}
.ff-dissolve-run { animation: ffDissolve 600ms ease-out 1 forwards; }
@keyframes ffDissolve {
  0% { opacity: 0; filter: blur(0px); }
  40% { opacity: .85; filter: blur(6px); }
  100% { opacity: 1; filter: blur(8px); }
}
@media (prefers-reduced-motion: reduce) {
  .ff-noise-flash { animation: none !important; opacity: 0 !important; }
  .ff-dissolve-run { animation: none !important; opacity: 1 !important; filter: none !important; }
}
  `.trim()
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = css
  document.head.appendChild(style)
}

function ensureLayer(id: string) {
  let el = document.getElementById(id)
  if (!el) {
    el = document.createElement('div')
    el.id = id
    document.body.appendChild(el)
  }
  return el as HTMLDivElement
}

function prefersReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * useFadeEffects(grayCount, status)
 * - grayCount: number of successful gray guesses (0..6)
 * - status: 'idle' | 'invalid' | 'win'
 */
export function useFadeEffects(grayCount: number, status: Status) {
  const prevGray = useRef<number>(-1)

  useEffect(() => {
    if (typeof window === 'undefined') return
    ensureStyleTag()
    ensureLayer(NOISE_ID)
    ensureLayer(DISSOLVE_ID)
  }, [])

  // Fade step (0..6) -> background approaches white
  useEffect(() => {
    if (typeof document === 'undefined') return
    const step = Math.max(0, Math.min(6, grayCount))
    const prev = prevGray.current
    prevGray.current = step

    if (step === prev) return
    const reduced = prefersReducedMotion()

    // Map 0..6 -> 0..1
    const t = step / 6
    // Apply via CSS variable for any gradient-based consumers
    document.documentElement.style.setProperty('--ff-fade', String(t))

    if (reduced) {
      // Snap background in steps for reduced motion
      const shade = Math.round(10 + t * 245) // 10..255
      document.body.style.backgroundColor = `rgb(${shade},${shade},${shade})`
      return
    }

    // Smooth transition on body background via inline style
    const start = performance.now()
    const dur = 220
    const from = Number(getComputedStyle(document.documentElement).getPropertyValue('--ff-fade')) || 0
    const diff = t - from
    let raf = 0
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - k, 3)
      const v = from + diff * eased
      document.documentElement.style.setProperty('--ff-fade', v.toFixed(4))
      raf = k < 1 ? requestAnimationFrame(tick) : 0
    }
    raf = requestAnimationFrame(tick)
    return () => { if (raf) cancelAnimationFrame(raf) }
  }, [grayCount])

  // Invalid guess -> flash noise
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (status !== 'invalid') return
    if (prefersReducedMotion()) return
    const el = document.getElementById(NOISE_ID)
    if (!el) return
    el.classList.remove('ff-noise-flash')
    // force reflow to restart animation
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    el.offsetHeight
    el.classList.add('ff-noise-flash')
    const t = setTimeout(() => el.classList.remove('ff-noise-flash'), 300)
    return () => clearTimeout(t)
  }, [status])

  // Win -> white dissolve
  useEffect(() => {
    if (typeof document === 'undefined') return
    if (status !== 'win') return
    const reduced = prefersReducedMotion()
    const layer = document.getElementById(DISSOLVE_ID) as HTMLDivElement | null
    if (!layer) return

    if (reduced) {
      document.body.classList.add('ff-white')
      document.documentElement.style.setProperty('--ff-fade', '1')
      return
    }

    layer.classList.remove('ff-dissolve-run')
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    layer.offsetHeight
    layer.classList.add('ff-dissolve-run')

    const done = () => {
      document.body.classList.add('ff-white')
      document.documentElement.style.setProperty('--ff-fade', '1')
      layer.classList.remove('ff-dissolve-run')
      layer.style.opacity = '0'
    }

    const timer = setTimeout(done, 650)
    return () => clearTimeout(timer)
  }, [status])
}
