import type {
  EngineConfig,
  GameState,
  Mode,
  ClassicState,
  RushState,
  EngineEvent,
  Guess,
} from './types'
import { CLASSIC_DEFAULTS } from './classic'
import { RUSH_DEFAULTS } from './rush'
import { isDictionaryWord, sharesLetter } from './words'

const FIVE = /^[A-Z]{5}$/

export function createGame(mode: Mode, target: string, config?: EngineConfig): GameState {
  const T = target.toUpperCase()
  if (!FIVE.test(T)) throw new Error('target must be 5 uppercase letters')

  if (mode === 'classic') {
    const c = { ...CLASSIC_DEFAULTS, ...(config?.classic ?? {}) }
    const st: ClassicState = {
      mode,
      target: T,
      attemptsToWin: c.attemptsToWin,
      focusPips: c.focusPips,
      initialFocusPips: c.focusPips,
      guesses: [],
      fadeProgress: 0,
      ended: false,
    }
    return st
  } else {
    const r = { ...RUSH_DEFAULTS, ...(config?.rush ?? {}) }
    const st: RushState = {
      mode,
      target: T,
      timeMs: r.timeMs,
      initialTimeMs: r.timeMs,
      score: 0,
      combo: 1,
      maxCombo: r.maxCombo,
      focusPips: r.focusPips,
      initialFocusPips: r.focusPips,
      guesses: [],
      fadeProgress: 0,
      ended: false,
    }
    return st
  }
}

export function submitGuess(state: GameState, word: string): { state: GameState; event: EngineEvent } {
  if (state.ended) return { state, event: { type: 'noop' } }
  const W = word.toUpperCase()
  if (!FIVE.test(W)) {
    const fail = { ...state, guesses: [...state.guesses, { word: W as Guess, ok: false, reason: 'Guess must be 5 letters A–Z' }] }
    return { state: fail, event: { type: 'fail', word: W as Guess, reason: 'length' } }
  }
  if (!isDictionaryWord(W)) {
    const fail = { ...state, guesses: [...state.guesses, { word: W as Guess, ok: false, reason: 'Not in dictionary' }] }
    return { state: fail, event: { type: 'fail', word: W as Guess, reason: 'dictionary' } }
  }
  if (sharesLetter(W, state.target)) {
    // Fail consumes a focus pip if available
    const nextPips = Math.max(0, ('focusPips' in state ? state.focusPips : 0) - 1)
    const base = {
      ...state,
      guesses: [...state.guesses, { word: W as Guess, ok: false, reason: 'Contains target letter' }],
    } as GameState

    if (state.mode === 'classic') {
      const st: GameState = { ...(base as any), focusPips: nextPips }
      return { state: st, event: { type: 'fail', word: W as Guess, reason: 'target-letter' } }
    } else {
      const st: GameState = { ...(base as any), focusPips: nextPips, combo: 1 }
      return { state: st, event: { type: 'fail', word: W as Guess, reason: 'target-letter' } }
    }
  }

  // Success path (perfect gray)
  if (state.mode === 'classic') {
    const successful = state.guesses.filter(g => g.ok).length + 1
    const fade = Math.min(1, successful / state.attemptsToWin)
    const ended = successful >= state.attemptsToWin
    const st: GameState = {
      ...state,
      guesses: [...state.guesses, { word: W as Guess, ok: true }],
      fadeProgress: fade,
      ended,
      endReason: ended ? 'win' : state.endReason,
    }
    return { state: st, event: ended ? { type: 'win' } : { type: 'success', word: W as Guess } }
  } else {
    // rush
    const newCombo = Math.min(state.maxCombo, state.combo + 1)
    const st: GameState = {
      ...state,
      guesses: [...state.guesses, { word: W as Guess, ok: true }],
      score: state.score + 1 * newCombo,
      combo: newCombo,
      fadeProgress: Math.min(1, (state.guesses.filter(g => g.ok).length + 1) / 6), // cosmetic
    }
    return { state: st, event: { type: 'success', word: W as Guess } }
  }
}

export function tick(state: GameState, ms: number): { state: GameState; event: EngineEvent } {
  if (state.ended) return { state, event: { type: 'noop' } }
  if (state.mode === 'classic') {
    return { state, event: { type: 'noop' } }
  }
  const next = Math.max(0, state.timeMs - Math.max(0, ms | 0))
  const ended = next === 0
  const st: GameState = { ...state, timeMs: next, ended, endReason: ended ? 'time' : state.endReason }
  return { state: st, event: ended ? { type: 'timeUp' } : { type: 'noop' } }
}

// ---------------- Selectors ----------------
export const selectors = {
  isOver: (s: GameState) => s.ended,
  fade: (s: GameState) => s.fadeProgress,
  lastGuess: (s: GameState) => s.guesses.at(-1),
  remainingPips: (s: GameState) => ('focusPips' in s ? s.focusPips : 0),
  timeRemaining: (s: GameState) => (s.mode === 'rush' ? s.timeMs : undefined),
  combo: (s: GameState) => (s.mode === 'rush' ? s.combo : undefined),
}
