'use client'

import { create } from 'zustand'
import {
  type GameState,
  type EngineEvent,
  createGame,
  submitGuess,
  selectors,
} from '@focus-fade/core'

type Store = {
  state: GameState
  input: string
  setInput: (s: string) => void
  submit: () => EngineEvent
  reset: (target?: string) => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

const INITIAL_TARGET = 'PLANT'
const isWon = (s: GameState) =>
  selectors.fade(s) >= 0.999 || (s as any).status === 'won' || (s as any).ended === true
const isLost = (s: GameState) => selectors.remainingPips(s) <= 0 || (s as any).status === 'lost'

export const useGame = create<Store>((set, get) => ({
  state: createGame('classic', INITIAL_TARGET, {
    classic: { attemptsToWin: 6, focusPips: 3 },
  }),
  input: '',
  setInput(s) {
    const v = s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5)
    set({ input: v })
  },
  submit() {
    const { state, input } = get()
    if (input.length !== 5) return { type: 'noop' } as EngineEvent
    if (isLost(state) || isWon(state)) return { type: 'noop' } as EngineEvent

    const { state: next, event } = submitGuess(state, input)
    set({ state: next, input: '' })
    return event
  },
  reset(target = INITIAL_TARGET) {
    set({
      state: createGame('classic', target, {
        classic: { attemptsToWin: 6, focusPips: 3 },
      }),
      input: '',
    })
  },
  onKeyDown(e) {
    if (e.key === 'Escape') set({ input: '' })
  },
}))

export const gameSelectors = {
  fade: () => selectors.fade(useGame.getState().state),
  remainingPips: () => selectors.remainingPips(useGame.getState().state),
}
