export const WORDS: string[] = [
  'CIDER', 'MOUSE', 'BRICK', 'FLOAT', 'GYROS', 'PLUMB', 'SHINE', 'WAVES',
  'TOKYO', 'PRIDE', 'FABLE', 'GLINT', 'ZESTY', 'CHALK', 'BERRY', 'QUILT',
  'PLANT', 'FADED', 'QUIET', 'RHYME', 'TANGO', 'CLOUD', 'SHIFT'
]

const ALPHA = /^[A-Z]{5}$/

export function isDictionaryWord(s: string): boolean {
  const u = s.toUpperCase()
  if (!ALPHA.test(u)) return false
  return WORDS.includes(u)
}

export function sharesLetter(a: string, b: string): boolean {
  const A = a.toUpperCase()
  const B = b.toUpperCase()
  const set = new Set(B.split(''))
  return A.split('').some((ch) => set.has(ch))
}
