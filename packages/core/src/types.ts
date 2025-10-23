export type Mode = 'classic' | 'rush'

export type Guess = string // must be 5 letters, uppercase A–Z

export interface BaseState {
  mode: Mode
  target: string // visible target word to AVOID letters from
  guesses: { word: Guess; ok: boolean; reason?: string }[]
  fadeProgress: number // 0..1
  ended: boolean
  endReason?: 'win' | 'time' | 'aborted'
}

export interface ClassicState extends BaseState {
  mode: 'classic'
  attemptsToWin: number // usually 6 successful grays
  focusPips: number // remaining grace pips
  initialFocusPips: number
}

export interface RushState extends BaseState {
  mode: 'rush'
  timeMs: number // remaining time
  initialTimeMs: number
  score: number // number of successful words
  combo: number // current combo multiplier (>=1)
  maxCombo: number
  focusPips: number // typically 0 for rush, but configurable
  initialFocusPips: number
}

export type GameState = ClassicState | RushState

export interface ClassicConfig {
  attemptsToWin?: number
  focusPips?: number
}
export interface RushConfig {
  timeMs?: number
  focusPips?: number
  maxCombo?: number
}
export type EngineConfig = { classic?: ClassicConfig; rush?: RushConfig }

export type EngineAction =
  | { type: 'submitGuess'; word: string }
  | { type: 'tick'; ms: number }
  | { type: 'reset'; mode: Mode; target: string; config?: EngineConfig }

export type EngineEvent =
  | { type: 'success'; word: Guess }
  | { type: 'fail'; word: Guess; reason: string }
  | { type: 'win' }
  | { type: 'timeUp' }
  | { type: 'noop' }
