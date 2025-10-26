'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../lib/useGame'
import Pips from '../components/Pips'
import HowToPlay from '../components/HowToPlay'
import { selectors } from '@focus-fade/core'

export default function Page() {
  const state = useGame((s) => s.state as any)
  const input = useGame((s) => s.input)
  const setInput = useGame((s) => s.setInput)
  const submit = useGame((s) => s.submit)
  const reset = useGame((s) => s.reset)

  const rows = useMemo(() => {
    const letters: string[][] = []
    const taken = state.guesses?.map((g: any) => g.word) ?? []
    for (let r = 0; r < 6; r++) {
      const word = taken[r] ?? ''
      const row = Array.from({ length: 5 }, (_, c) => word[c] ?? '')
      letters.push(row)
    }
    return letters
  }, [state.guesses])

  const remainingRaw = selectors.remainingPips(state)
  const remaining =
    typeof remainingRaw === 'number' && Number.isFinite(remainingRaw) ? remainingRaw : 0

  const fade = selectors.fade(state) // 0..1

  // Victory has priority over loss in UI
  const won = fade >= 0.999 || state.status === 'won' || state.ended === true
  const lost = !won && (remaining <= 0 || state.status === 'lost')

  const pips = remaining

  return (
    <main className="min-h-dvh bg-black text-white">
      <div className="mx-auto max-w-md px-4 py-6">
        <header className="flex items-center justify-between">
          <h1 className="text-lg tracking-wide">□ Focus Fade</h1>
          <div className="flex items-center gap-2">
            <Pips n={pips} />
            <HowToPlay />
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
          <div className="mt-1 text-3xl font-light" data-testid="target-word">
            {state.target}
          </div>
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
                    transition={{ type: 'tween', duration: 0.12 }}
                    className="aspect-square rounded-lg border border-white/10 bg-white/5 grid place-items-center text-xl"
                  >
                    <span className="font-semibold">{ch}</span>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Status banner (mutually exclusive) */}
        {won ? (
          <div className="mt-4 text-center text-base" data-testid="victory" aria-live="polite">
            TOTAL FADE
          </div>
        ) : lost ? (
          <div className="mt-4 text-center text-base opacity-80" data-testid="lost" aria-live="polite">
            Out of focus
          </div>
        ) : null}

        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            onKeyDown={(e) => {
              if (e.key === 'Escape') setInput('')
            }}
            inputMode="text"
            autoComplete="off"
            spellCheck={false}
            maxLength={5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-3 py-2 font-mono text-lg tracking-widest outline-none focus:border-white/20"
            placeholder="TYPE 5 LETTERS"
            disabled={lost || won}
            data-testid="guess-input"
          />
          <button
            type="submit"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm hover:bg-white/10 disabled:opacity-40"
            disabled={input.length !== 5 || lost || won}
            data-testid="guess-button"
          >
            Guess
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-xs text-white/60">
          <div>{lost ? 'Out of focus' : won ? 'TOTAL FADE' : 'Avoid target letters'}</div>
          <button
            onClick={() => reset()}
            className="rounded-lg border border-white/10 px-2 py-1 hover:bg-white/10"
          >
            Reset
          </button>
        </div>
      </div>
    </main>
  )
}



