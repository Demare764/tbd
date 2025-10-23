'use client'

import { useGameStore } from '../store/useGameStore'
import { motion } from 'framer-motion'

export default function Grid() {
  const rows = useGameStore((s) => s.state.rows)

  return (
    <div className="grid gap-2">
      {rows.map((row, i) => (
        <div key={i} className="grid grid-cols-5 gap-2">
          {row.map((cell, j) => (
            <motion.div
              key={j}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              className={[
                'aspect-square rounded-lg border grid place-items-center text-xl font-medium',
                cell.status === 'empty' && 'border-white/10 bg-white/5',
                cell.status === 'gray' && 'border-white/10 bg-white/20 text-white',
                cell.status === 'fail' && 'border-red-500/40 bg-red-500/20 text-red-100',
              ].join(' ')}
            >
              {cell.letter}
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  )
}
