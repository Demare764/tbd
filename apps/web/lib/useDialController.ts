'use client'

import { useMemo, useCallback } from 'react'
import { sharesLetter } from '@focus-fade/core'

export type UseDialController = ReturnType<typeof useDialController>

export function useDialController({ target }: { target: string }) {
  const targetUp = target.toUpperCase()
  const isAllowed = useCallback(
    (letter: string) => !sharesLetter(letter.toUpperCase(), targetUp),
    [targetUp],
  )

  const letters = useMemo(
    () => 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
    [],
  )

  return { letters, isAllowed }
}
