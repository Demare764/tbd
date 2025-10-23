'use client'

import { useCallback } from 'react'
import { useGameStore } from '../store/useGameStore'
import { motion } from 'framer-motion'

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

export default function LetterDial() {
  const dispatch = useGameStore((s) => s.dispatch)
  const guess = useGameStore((s) => s.state.currentGuess)
  const canCommit = guess.length === 5

  const onPick = useCallback(
    (ch: string) => dispatch({ type: 'input/append', letter: ch }),
    [dispatch],
  )

  const onBackspace = useCallback(() => dispatch({ type: 'input/backspace' }), [dispatch])
  const onCommit = useCallback(() => dispatch({ type: 'input/commit' }), [dispatch])

  return (
    <div className="select-none">
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="text-sm opacity-70 tracking-wide">Guess:</div>
        <div className="font-mono text-xl">{guess.padEnd(5, '·')}</div>
      </div>

      <div className="mt-4 grid grid-cols-13 gap-2">
        {LETTERS.map((ch) => (
          <motion.button
            key={ch}
            whileTap={{ scale: 0.9 }}
            className="rounded-xl border border-white/10 bg-white/5 backdrop-blur px-2 py-2 text-sm hover:bg-white/10"
            onClick={() => onPick(ch)}
          >
            {ch}
          </motion.button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          className="rounded-xl border border-white/10 px-3 py-2 text-sm hover:bg-white/10"
          onClick={onBackspace}
        >
          Backspace
        </button>
        <button
          disabled={!canCommit}
          onClick={onCommit}
          className={`rounded-xl border px-3 py-2 text-sm ${
            canCommit
              ? 'border-white/10 hover:bg-white/10'
              : 'border-white/10 opacity-40 cursor-not-allowed'
          }`}
        >
          Commit
        </button>
      </div>
    </div>
  )
}
