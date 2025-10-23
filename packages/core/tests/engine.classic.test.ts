import { describe, it, expect } from 'vitest'
import { createGame, submitGuess, selectors } from '../src/engine'

const TARGET = 'PLANT'

describe('classic engine', () => {
  it('builds a classic game', () => {
    const g = createGame('classic', TARGET, { classic: { attemptsToWin: 6, focusPips: 3 } })
    expect(g.mode).toBe('classic')
    expect(g.fadeProgress).toBe(0)
    expect(g.focusPips).toBe(3)
  })

  it('rejects guesses with target letters and consumes pips', () => {
    let g = createGame('classic', TARGET)
    const r = submitGuess(g, 'APPLE') // shares A,P,L
    g = r.state
    expect(r.event.type).toBe('fail')
    expect(g.guesses[0].ok).toBe(false)
    expect(g.focusPips).toBe(2)
  })

  it('accepts perfect gray guesses and wins at threshold', () => {
    let g = createGame('classic', TARGET, { classic: { attemptsToWin: 2 } })
    const ok1 = submitGuess(g, 'CIDER'); g = ok1.state
    expect(ok1.event.type).toBe('success')
    const ok2 = submitGuess(g, 'MOUSE'); g = ok2.state
    expect(g.ended).toBe(true)
    expect(selectors.fade(g)).toBe(1)
  })
})
