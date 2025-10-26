'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { createGame, submitGuess, tick, selectors } from '@focus-fade/core'

export default function RushPage() {
  const [state, setState] = useState(() =>
    createGame('rush', 'PLANT', { rush: { timeMs: 60_000, maxCombo: 5 } })
  )
  const [input, setInput] = useState('')
  const [paused, setPaused] = useState(false)
  const stateRef = useRef(state)
  stateRef.current = state
  const pausedRef = useRef(paused)
  pausedRef.current = paused

  const onSubmit = useCallback(() => {
    const word = input.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5)
    if (word.length !== 5 || state.ended) return
    const { state: next } = submitGuess(stateRef.current, word)
    setState(next)
    setInput('')
  }, [input, state.ended])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        onSubmit()
      } else if (e.code === 'Space') {
        e.preventDefault()
        setPaused((p) => !p)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSubmit])

  useEffect(() => {
    let raf = 0
    let prev = performance.now()
    const loop = (now: number) => {
      const dt = now - prev
      prev = now
      if (!pausedRef.current && !stateRef.current.ended && stateRef.current.mode === 'rush') {
        const { state: next } = tick(stateRef.current, dt)
        if (next !== stateRef.current) setState(next)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const time = state.mode === 'rush' ? state.timeMs : 0
  const seconds = Math.ceil(time / 1000)
  const combo = state.mode === 'rush' ? state.combo : 1
  const fade = selectors.fade(state)

  const rows = useMemo(() => {
    const words = state.guesses.map((g) => g.word)
    const out: string[][] = []
    for (let r = 0; r < 6; r++) {
      const w = words[r] ?? ''
      out.push(Array.from({ length: 5 }, (_, c) => w[c] ?? ''))
    }
    return out
  }, [state.guesses])

  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto max-w-md px-4 py-6">
        <header className="flex items-center justify-between">
          <h1 className="text-lg tracking-wide">⚡ Rush</h1>
          <div className="flex items-center gap-3">
            <div className="text-3xl tabular-nums">{seconds}s</div>
            <div className="text-sm opacity-70">x{combo}</div>
          </div>
        </header>

        <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className="h-full bg-white/60"
            initial={{ width: '0%' }}
            animate={{ width: `${Math.round(fade * 100)}%` }}
            transition={{ type: 'tween', duration: 0.15 }}
          />
        </div>

        <section className="mt-6 text-center">
          <div className="text-xs uppercase tracking-widest text-white/70">Target (avoid)</div>
          <div className="mt-1 text-3xl font-light">{state.target}</div>
        </section>

        <section className="mt-6">
          <div className="grid gap-2">
            {rows.map((row, i) => (
              <div key={i} className="grid grid-cols-5 gap-2">
                {row.map((ch, j) => (
                  <motion.div
                    key={j}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'tween', duration: 0.1 }}
                    className="aspect-square rounded-lg border border-white/10 bg-white/5 grid place-items-center text-xl"
                  >
                    <span className="font-semibold">{ch}</span>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </section>

        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            onSubmit()
          }}
        >
          <input
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-lg tracking-widest outline-none focus:border-white/20"
            placeholder="TYPE 5 LETTERS"
            disabled={state.ended}
          />
          <button
            type="submit"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-40"
            disabled={input.length !== 5 || state.ended}
          >
            Guess
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-white/60">
          <div>{paused ? 'Paused' : state.ended ? 'Time up' : 'Avoid target letters'}</div>
          <button
            onClick={() => setPaused((p) => !p)}
            className="rounded-lg border border-white/10 px-2 py-1 hover:bg-white/10"
          >
            {paused ? 'Resume' : 'Pause'}
          </button>
        </div>
      </div>
    </main>
  )
}
