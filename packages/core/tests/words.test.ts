import { describe, it, expect } from 'vitest'
import { isDictionaryWord, sharesLetter } from '../src/words'

describe('words utils', () => {
  it('validates dictionary membership & format', () => {
    expect(isDictionaryWord('CIDER')).toBe(true)
    expect(isDictionaryWord('cider')).toBe(true)
    expect(isDictionaryWord('ABCDE')).toBe(false) // not in list
    expect(isDictionaryWord('TOO-LONG')).toBe(false)
  })

  it('detects shared letters', () => {
    expect(sharesLetter('CIDER', 'PLANT')).toBe(false)
    expect(sharesLetter('APPLE', 'PLANT')).toBe(true)
  })
})
