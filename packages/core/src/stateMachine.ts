import type { GameConfig, GameEvent, GameState } from './types'
import { validateGuess } from './validators'

export function createInitialState(config: GameConfig): GameState {
  const rows = Array.from({ length: config.modeConfig.attemptsToWin }, () =>
    Array.from({ length: 5 }, () => ({ letter: '', status: 'empty' as const })),
  )
  return {
    rows,
    currentGuess: '',
    attempts: 0,
    focusPips: config.modeConfig.focusPips,
    wins: 0,
    losses: 0,
    fadingProgress: 0,
    ended: false,
  }
}

export function reducer(state: GameState, event: GameEvent, config: GameConfig): GameState {
  if (state.ended && event.type !== 'system/reset') return state

  switch (event.type) {
    case 'system/reset':
      return createInitialState(event.config)

    case 'input/append': {
      if (state.currentGuess.length >= 5) return state
      const letter = event.letter.toUpperCase()
      if (!/^[A-Z]$/.test(letter)) return state
      return { ...state, currentGuess: state.currentGuess + letter }
    }

    case 'input/backspace': {
      if (state.currentGuess.length === 0) return state
      return { ...state, currentGuess: state.currentGuess.slice(0, -1) }
    }

    case 'input/commit': {
      if (state.currentGuess.length !== 5) return state
      const validation = validateGuess(state.currentGuess, config.target)
      const rowIndex = Math.min(state.attempts, state.rows.length - 1)

      const rows = state.rows.map((r, i) =>
        i === rowIndex
          ? r.map((cell, j) => ({
              letter: state.currentGuess[j]?.toUpperCase() ?? '',
              status: validation.ok ? 'gray' : 'fail',
            }))
          : r,
      )

      if (validation.ok) {
        const attempts = state.attempts + 1
        const fadingProgress = Math.min(1, attempts / config.modeConfig.attemptsToWin)
        const ended = attempts >= config.modeConfig.attemptsToWin && config.mode === 'classic'
        return {
          ...state,
          rows,
          currentGuess: '',
          attempts,
          fadingProgress,
          ended,
          wins: ended ? state.wins + 1 : state.wins,
          endReason: ended ? 'win' : state.endReason,
        }
      } else {
        // fail: consume a focus pip if available (classic)
        const nextPips = Math.max(0, state.focusPips - 1)
        const ended =
          config.mode === 'classic' &&
          nextPips === 0 &&
          // consider game fail only if we've made at least one attempt
          state.attempts >= 0 &&
          false // MVP: not hard failing; only progress on success
        return {
          ...state,
          rows,
          currentGuess: '',
          focusPips: nextPips,
          ended,
          losses: ended ? state.losses + 1 : state.losses,
          endReason: ended ? 'abort' : state.endReason,
        }
      }
    }

    case 'system/tick': {
      // Rush mode: end by timer (handled by host app timer)
      if (config.mode !== 'rush') return state
      // Keep pure core; host app decides when time is up.
      return state
    }
  }
}
