import type { ModeConfig } from './types'

export const CLASSIC_MODE: ModeConfig = {
  id: 'classic',
  displayName: 'Classic',
  attemptsToWin: 6,
  timerSeconds: undefined,
  focusPips: 3,
  comboEnabled: false,
}

export const RUSH_MODE: ModeConfig = {
  id: 'rush',
  displayName: 'Rush',
  attemptsToWin: 999, // irrelevant; rush is time-based
  timerSeconds: 60,
  focusPips: 0,
  comboEnabled: true,
}
