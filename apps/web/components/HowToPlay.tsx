'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

type Tab = 'classic' | 'rush'

const LS_SEEN_KEY = 'ff.helpSeen.v1'
const LS_AUTOSHOW_KEY = 'ff.helpAutoShow'

function isTextInput(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  const tag = target.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable
}

export default function HowToPlay() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('classic')
  const [autoShow, setAutoShow] = useState(true)
  const prefersReduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const firstBtnRef = useRef<HTMLButtonElement>(null)
  const lastFocused = useRef<HTMLElement | null>(null)

  // Init autoshow + first-visit
  useEffect(() => {
    const savedAuto = localStorage.getItem(LS_AUTOSHOW_KEY)
    const auto = savedAuto == null ? true : savedAuto === 'true'
    setAutoShow(auto)
    const seen = localStorage.getItem(LS_SEEN_KEY)
    if (auto && !seen) setOpen(true)
  }, [])

  const close = useCallback(() => {
    localStorage.setItem(LS_SEEN_KEY, 'true')
    setOpen(false)
  }, [])

  // Keyboard: '?' to open, Esc to close (ignore while typing)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isTextInput(e.target)) return
      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault(); setOpen(true); return
      }
      if (open && e.key === 'Escape') {
        e.preventDefault(); close()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, close])

  // Focus management + trap + body scroll lock
  useEffect(() => {
    if (open) {
      lastFocused.current = document.activeElement as HTMLElement | null
      const prevOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      const to = setTimeout(() => firstBtnRef.current?.focus(), 0)

      const trap = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return
        const root = panelRef.current; if (!root) return
        const focusables = root.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const list = Array.from(focusables).filter(el => !el.hasAttribute('disabled'))
        if (list.length === 0) return
        const first = list[0], last = list[list.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      document.addEventListener('keydown', trap)

      return () => {
        clearTimeout(to)
        document.removeEventListener('keydown', trap)
        document.body.style.overflow = prevOverflow
        lastFocused.current?.focus?.()
      }
    }
  }, [open])

  const onToggleAutoShow = (next: boolean) => {
    setAutoShow(next)
    localStorage.setItem(LS_AUTOSHOW_KEY, String(next))
  }

  const fade = prefersReduce ? { duration: 0 } : { duration: 0.15 }
  const pop = prefersReduce ? { duration: 0 } : { type: 'tween', duration: 0.18 }

  const tabId = (t: Tab) => `howto-tab-${t}`
  const panelId = (t: Tab) => `howto-panel-${t}`

  return (
    <>
      <button
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="rounded-md border border-white/10 px-2 py-1 text-xs text-white/70 hover:bg-white/10"
        title="How to play (press ?)"
      >
        ?
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fade}
          >
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={close} aria-hidden="true" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="howto-title"
              ref={panelRef}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.98 }}
              transition={pop}
              className="relative mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900/95 p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 id="howto-title" className="text-lg font-medium">How to Play</h2>
                <button
                  ref={firstBtnRef}
                  onClick={close}
                  className="rounded-md border border-white/10 px-2 py-1 text-xs hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              {/* Tabs */}
              <div className="mt-3 grid grid-cols-2 gap-2" role="tablist" aria-label="Modes">
                {(['classic','rush'] as Tab[]).map((t) => {
                  const selected = tab === t
                  return (
                    <button
                      key={t}
                      id={tabId(t)}
                      role="tab"
                      aria-selected={selected}
                      aria-controls={panelId(t)}
                      onClick={() => setTab(t)}
                      className={[
                        'rounded-xl px-3 py-1.5 text-center border',
                        selected ? 'border-white/30 bg-white/10' : 'border-white/10 text-white/80 hover:bg-white/5',
                      ].join(' ')}
                    >
                      {t === 'classic' ? '🧠 Classic' : '⚡ Rush'}
                    </button>
                  )
                })}
              </div>

              {/* Panels */}
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/90">
                {tab === 'classic' ? (
                  <div id={panelId('classic')} role="tabpanel" aria-labelledby={tabId('classic')}>
                    <p className="mb-2">
                      Goal: enter 5-letter words with <strong>no letters</strong> from the target to fade the screen.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>See the target (e.g., <code>PLANT</code>).</li>
                      <li>Type or use the Letter Dial; allowed letters pulse, forbidden letters repel.</li>
                      <li>Six perfect grays ⇒ <strong>TOTAL FADE</strong>.</li>
                      <li>Three mistakes drain pips (●●● → ○○○) ⇒ <em>Out of focus</em>.</li>
                    </ul>
                  </div>
                ) : (
                  <div id={panelId('rush')} role="tabpanel" aria-labelledby={tabId('rush')}>
                    <p className="mb-2">Fast mode: 60s, no pips. Build streaks to increase combo and score.</p>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Timer counts down; mistakes cost time and reset combo.</li>
                      <li>Streaks raise multiplier (x1→xN), boosting score.</li>
                      <li>Ends at 0s; final score = words × combo.</li>
                    </ul>
                  </div>
                )}

                <div className="rounded-xl border border-white/10 p-3 text-xs text-white/70">
                  Tip: Press <span className="font-mono">?</span> anytime to open help. Keep calm; precision builds streaks.
                </div>

                <label className="flex items-center gap-2 text-xs text-white/80">
                  <input
                    type="checkbox"
                    checked={autoShow}
                    onChange={(e) => onToggleAutoShow(e.target.checked)}
                    className="accent-white/80"
                  />
                  Auto-show on first visit
                </label>

                <div className="flex justify-center gap-2">
                  <button onClick={close} className="rounded-xl border border-white/20 px-4 py-1.5 text-sm hover:bg-white/10">
                    Got it
                  </button>
                  <button onClick={() => setOpen(false)} className="rounded-xl border border-white/10 px-4 py-1.5 text-sm text-white/70 hover:bg-white/5" aria-label="Close help">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
