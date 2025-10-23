import type { RushConfig } from './types'

export const RUSH_DEFAULTS: Required<RushConfig> = {
  timeMs: 60_000,
  focusPips: 0,
  maxCombo: 5,
}

/** Next combo after a successful gray guess (clamped to max). */
export function nextCombo(current: number, maxCombo: number) {
  return Math.min(maxCombo, current + 1)
}

/** Reset combo after a fail. */
export function resetCombo() {
  return 1
}

/** Apply time decay; if paused, no decay. Optional rate multiplier for tweaks. */
export function decayTime(currentMs: number, dtMs: number, opts?: { paused?: boolean; rate?: number }) {
  const paused = !!opts?.paused
  const rate = opts?.rate ?? 1
  if (paused) return currentMs
  const dec = Math.max(0, Math.floor(dtMs * Math.max(0, rate)))
  return Math.max(0, currentMs - dec)
}
