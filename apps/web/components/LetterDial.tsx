'use client'

import { useRef, useMemo, useState, useEffect } from 'react'
import { motion, useMotionValue, useAnimation } from 'framer-motion'
import { useDialController } from '../lib/useDialController'

type Props = {
  target: string
  onPick: (letter: string) => void
  className?: string
}

const ITEM_W = 44 // px, including gap compensation
const GAP = 8
const PAD = 16

export default function LetterDial({ target, onPick, className }: Props) {
  const { letters, isAllowed } = useDialController({ target })
  const trackRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const controls = useAnimation()
  const [active, setActive] = useState(0)
  const perLetterCtrls = useMemo(
    () => letters.map(() => useAnimation()),
    [letters],
  )

  // keep x within rail bounds
  const maxIndex = letters.length - 1
  const width = useMemo(() => letters.length * ITEM_W + (letters.length - 1) * GAP + PAD * 2, [letters])
  const minX = useMemo(() => -maxIndex * (ITEM_W + GAP), [maxIndex])

  useEffect(() => {
    // snap to initial (A)
    controls.start({ x: 0, transition: { type: 'spring', stiffness: 400, damping: 36 } })
  }, [controls])

  function snapToIndex(idx: number) {
    const clamped = Math.max(0, Math.min(maxIndex, idx))
    setActive(clamped)
    const targetX = -clamped * (ITEM_W + GAP)
    controls.start({ x: targetX, transition: { type: 'spring', stiffness: 500, damping: 38 } })
    return clamped
  }

  function nearestIndexFromX(val: number) {
    const raw = -val / (ITEM_W + GAP)
    return Math.round(raw)
  }

  async function handleRelease() {
    const v = x.get()
    const idx = snapToIndex(nearestIndexFromX(v))
    const letter = letters[idx]
    if (isAllowed(letter)) {
      // allowed → subtle pulse
      await perLetterCtrls[idx].start({
        scale: [1, 1.1, 1],
        transition: { times: [0, 0.45, 1], duration: 0.22 },
      })
      onPick(letter)
    } else {
      // forbidden → repel (brief translateY + opacity dip)
      await perLetterCtrls[idx].start({
        y: [-2, -10, 0],
        opacity: [1, 0.6, 1],
        transition: { duration: 0.22 },
      })
    }
  }

  return (
    <div
      className={[
        'relative select-none touch-pan-x',
        'w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5',
        className ?? '',
      ].join(' ')}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      <div className="h-14" />
      <motion.div
        ref={trackRef}
        className="absolute inset-0 flex items-center"
        style={{ width, x, paddingInline: PAD }}
        drag="x"
        dragConstraints={{ left: minX, right: 0 }}
        dragElastic={0.12}
        dragMomentum
        onDragEnd={handleRelease}
        animate={controls}
      >
        {letters.map((ch, i) => {
          const allowed = isAllowed(ch)
          return (
            <motion.button
              key={ch}
              onClick={() => {
                const idx = snapToIndex(i)
                const letter = letters[idx]
                if (isAllowed(letter)) {
                  perLetterCtrls[idx].start({
                    scale: [1, 1.1, 1],
                    transition: { duration: 0.18 },
                  })
                  onPick(letter)
                } else {
                  perLetterCtrls[idx].start({
                    y: [-2, -10, 0],
                    opacity: [1, 0.6, 1],
                    transition: { duration: 0.2 },
                  })
                }
              }}
              animate={perLetterCtrls[i]}
              whileTap={{ scale: 0.95 }}
              className={[
                'mx-1 grid h-10 w-10 place-items-center rounded-xl border text-sm font-semibold',
                allowed
                  ? 'border-white/10 bg-white/10'
                  : 'border-white/10 bg-white/5 text-white/60',
                i === active ? 'ring-1 ring-white/20' : '',
              ].join(' ')}
              style={{ marginRight: GAP }}
            >
              {ch}
            </motion.button>
          )
        })}
      </motion.div>

      {/* center snap indicator */}
      <div className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2">
        <div className="mt-2 h-10 w-10 rounded-xl border border-white/15" />
      </div>
    </div>
  )
}
