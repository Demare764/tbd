'use client'

import { useEffect, useRef } from 'react'
import { motion, useAnimationControls } from 'framer-motion'

type Props = { n: number }

export default function Pips({ n }: Props) {
  const prev = useRef(n)
  const ctrls = [useAnimationControls(), useAnimationControls(), useAnimationControls()]

  useEffect(() => {
    const old = prev.current
    if (n < old) {
      const turnedOffIndex = Math.max(0, Math.min(2, n)) // the dot that just turned off
      ctrls[turnedOffIndex].start({
        scale: [1, 0.6, 1],
        opacity: [1, 0.3, 0.6],
        transition: { duration: 0.25 },
      })
    }
    prev.current = n
  }, [n, ctrls])

  return (
    <div
      role="status"
      aria-label={`${n} focus pips remaining`}
      title={`${n} focus pips remaining`}
      className="flex items-center gap-1"
    >
      {[0, 1, 2].map((i) => {
        const on = i < n
        return (
          <motion.span
            key={i}
            animate={ctrls[i]}
            className={`h-3 w-3 rounded-full ${on ? 'bg-white' : 'bg-white/25'}`}
          />
        )
      })}
    </div>
  )
}
