import { describe, it, expect } from 'vitest'
import { createGame, submitGuess, tick, isGrayValidGuess } from '../index'

const TARGET = 'PLANT'

// helper: submit and return next state
function play(state: any, word: string) {
  const { state: next } = submitGuess(state, word)
  return next
}

describe('validators: isGrayValidGuess', () => {
  it('accepts words with zero overlap', () => {
    expect(isGrayValidGuess(TARGET, 'CIDER')).toBe(true)
    expect(isGrayValidGuess(TARGET, 'MOUSE')).toBe(true)
    expect(isGrayValidGuess(TARGET, 'BRICK')).toBe(true)
  })
  it('rejects any overlap with target', () => {
    expect(isGrayValidGuess(TARGET, 'APPLE')).toBe(false) // A,P,L
    expect(isGrayValidGuess(TARGET, 'FLOAT')).toBe(false) // L,A,T
    expect(isGrayValidGuess(TARGET, 'GLINT')).toBe(false) // L,N,T
  })
})

describe('classic flow: pips and win/loss', () => {
  it('starts with pips=3 and decrements on invalid to lost at 0', () => {
    let g: any = createGame('classic', TARGET)
    expect(g.pips ?? g.focusPips).toBe(3)

    g = play(g, 'APPLE') // invalid (overlap)
    expect(g.pips ?? g.focusPips).toBe(2)
    expect(g.status ?? (g.ended ? 'lost' : 'playing')).not.toBe('lost')

    g = play(g, 'PLUMB') // invalid
    expect(g.pips ?? g.focusPips).toBe(1)

    g = play(g, 'PLANT') // invalid
    expect(g.pips ?? g.focusPips).toBe(0)

    // assume core sets status to 'lost' when pips reach 0
    expect(g.status ?? (g.ended ? 'lost' : 'playing')).toBe('lost')
  })

  it('six valid gray guesses lead to status won with no pip loss', () => {
    let g: any = createGame('classic', TARGET)
    const startPips = g.pips ?? g.focusPips

    const words = ['CIDER', 'MOUSE', 'BRICK', 'GYROS', 'BERRY', 'RHYME']
    for (const w of words) g = play(g, w)

    expect(g.status ?? (g.ended ? 'won' : 'playing')).toBe('won')
    expect(g.pips ?? g.focusPips).toBe(startPips)
  })
})

describe('rush flow: timer, combo, and score', () => {
  it('valid guess increases combo and adds to score; invalid resets combo and time decays', () => {
    let g: any = createGame('rush', TARGET, { rush: { timeMs: 2000, maxCombo: 3 } })
    const t0 = g.timeMs

    // success 1 -> combo 2, score +2
    g = play(g, 'CIDER')
    expect(g.combo).toBe(2)
    expect(g.score).toBeGreaterThanOrEqual(2)

    // success 2 -> combo 3, score +3
    g = play(g, 'MOUSE')
    expect(g.combo).toBe(3)
    expect(g.score).toBeGreaterThanOrEqual(5)

    // invalid -> reset combo to 1
    g = play(g, 'APPLE')
    expect(g.combo).toBe(1)

    // time decays on tick
    const { state: afterTick } = tick(g, 500)
    expect(afterTick.timeMs).toBeLessThan(t0)
  })
})
