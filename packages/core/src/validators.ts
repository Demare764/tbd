import { ALPHABET } from './words'
import type { ValidationResult } from './types'

export function isFiveLetters(s: string): boolean {
  return /^[A-Z]{5}$/.test(s)
}

export function containsOnlyAlphabet(s: string): boolean {
  return s.split('').every((ch) => ALPHABET.includes(ch))
}

/**
 * Valid if:
 *  - length = 5
 *  - A-Z only
 *  - shares NO letters with the target word (anti-Wordle rule)
 */
export function validateGuess(guess: string, target: string): ValidationResult {
  const g = guess.toUpperCase()
  const t = target.toUpperCase()

  if (!isFiveLetters(g)) {
    return { ok: false, reason: 'Guess must be 5 letters (A–Z).' }
  }
  if (!containsOnlyAlphabet(g)) {
    return { ok: false, reason: 'Letters only (A–Z).' }
  }
  const targetSet = new Set(t.split(''))
  for (const ch of g) {
    if (targetSet.has(ch)) {
      return { ok: false, reason: `Avoid target letters (found “${ch}”).` }
    }
  }
  return { ok: true }
}
