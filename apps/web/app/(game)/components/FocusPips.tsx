'use client'

import { useGameStore } from '../store/useGameStore'

export default function FocusPips() {
  const pips = useGameStore((s) => s.state.focusPips)
  const total = useGameStore((s) => s.config.modeConfig.focusPips)

  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-3 w-3 rounded-full ${i < pips ? 'bg-gray-300' : 'bg-white/20'}`}
          title="Grace pip"
        />
      ))}
    </div>
  )
}
