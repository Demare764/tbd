import { describe, it, expect } from 'vitest'
import { createGame, submitGuess, tick } from '../src/engine'

const TARGET = 'PLANT'

describe('rush engine', () => {
  it('counts down time and ends at zero', () => {
    let g = createGame('rush', TARGET, { rush: { timeMs: 1000 } })
    expect(g.mode).toBe('rush')
    const t1 = tick(g, 400); g = t1.state
    expect(g.timeMs).toBe(600)
    const t2 = tick(g, 1000); g = t2.state
    expect(g.ended).toBe(true)
    expect(g.endReason).toBe('time')
  })

  it('scores with combos on consecutive successes and resets on fail', () => {
    let g = createGame('rush', TARGET, { rush: { timeMs: 2000, maxCombo: 3 } })
    const s1 = submitGuess(g, 'CIDER'); g = s1.state
    expect(g.score).toBe(2) // combo becomes 2
    const s2 = submitGuess(g, 'MOUSE'); g = s2.state
    expect(g.combo).toBe(3)
    expect(g.score).toBe(5) // +3
    const f = submitGuess(g, 'APPLE'); g = f.state // contains target letter
    expect(g.combo).toBe(1)
  })
})
