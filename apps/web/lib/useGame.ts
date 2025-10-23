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
}

const INITIAL_TARGET = 'PLANT'

export const useGame = create<Store>((set, get) => ({
  state: createGame('classic', INITIAL_TARGET, { classic: { attemptsToWin: 6, focusPips: 3 } }),
  input: '',
  setInput(s) {
    const v = s.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 5)
    set({ input: v })
  },
  submit() {
    const { state, input } = get()
    const { state: next, event } = submitGuess(state, input)
    set({ state: next, input: '' })
    return event
  },
  reset(target = INITIAL_TARGET) {
    set({
      state: createGame('classic', target, { classic: { attemptsToWin: 6, focusPips: 3 } }),
      input: '',
    })
  },
}))

export const gameSelectors = {
  fade: () => selectors.fade(useGame.getState().state),
  remainingPips: () => selectors.remainingPips(useGame.getState().state),
}
