'use client'

import { create } from 'zustand'
import {
  type GameConfig,
  type GameState,
  type GameEvent,
  CLASSIC_MODE,
  createInitialState,
  reducer,
} from '@focus-fade/core'

type Store = {
  config: GameConfig
  state: GameState
  dispatch: (e: GameEvent) => void
  initClassic: (target: string) => void
}

export const useGameStore = create<Store>((set, get) => ({
  config: {
    target: 'PLANT',
    mode: 'classic',
    modeConfig: CLASSIC_MODE,
  },
  state: createInitialState({
    target: 'PLANT',
    mode: 'classic',
    modeConfig: CLASSIC_MODE,
  }),
  initClassic(target) {
    const config: GameConfig = { target, mode: 'classic', modeConfig: CLASSIC_MODE }
    set({ config, state: createInitialState(config) })
  },
  dispatch(e) {
    const { state, config } = get()
    set({ state: reducer(state, e, config) })
  },
}))
