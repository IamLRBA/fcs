'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Send, Sparkles, X } from 'lucide-react'
import { XAVYR_INTRO } from '@/lib/xavyr/knowledge'
import { respondToQuery } from '@/lib/xavyr/responder'
import type { XavyrLink, XavyrMessage } from '@/lib/xavyr/types'

const INTRO_SEEN_KEY = 'xavyr-intro-seen'
const INTRO_SNOOZE_KEY = 'xavyr-intro-snooze-until'
const INTRO_DELAY_MS = 6500

function newId() {
  return `xavyr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function MessageLinks({ links }: { links?: XavyrLink[] }) {
  if (!links?.length) return null
  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5">
      {links.map((link) => (
        <Link
          key={link.href + link.label}
          href={link.href}
          className="focus-ring-none inline-flex items-center rounded-full border border-primary-400/50 bg-primary-50/90 px-2.5 py-1 text-[11px] font-medium text-primary-800 transition-colors hover:bg-primary-100 dark:border-primary-500/40 dark:bg-primary-950/50 dark:text-primary-100 dark:hover:bg-primary-900/60"
        >
          {link.label}
        </Link>
      ))}
    </div>
  )
}

function SuggestionChips({
  suggestions,
  onPick,
  disabled,
}: {
  suggestions: string[]
  onPick: (text: string) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-wrap gap-1.5 pt-1">
      {suggestions.map((s) => (
        <button
          key={s}
          type="button"
          disabled={disabled}
          onClick={() => onPick(s)}
          className="focus-ring-none rounded-full border border-neutral-300/80 bg-white/70 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-colors hover:border-primary-400 hover:text-primary-800 disabled:opacity-50 dark:border-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-200 dark:hover:border-primary-500/50 dark:hover:text-primary-100"
        >
          {s}
        </button>
      ))}
    </div>
  )
}

export default function XavyrGuide() {
  const pathname = usePathname()
  const panelId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [open, setOpen] = useState(false)
  const [introBubble, setIntroBubble] = useState(false)
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [messages, setMessages] = useState<XavyrMessage[]>([])
  const [lastSuggestions, setLastSuggestions] = useState<string[]>([])

  const isAdminRoute = pathname?.startsWith('/admin')

  const pushAssistant = useCallback((content: string, links?: XavyrLink[], suggestions?: string[]) => {
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: 'assistant', content, links, timestamp: Date.now() },
    ])
    if (suggestions?.length) setLastSuggestions(suggestions)
  }, [])

  const sendQuery = useCallback(
    (text: string) => {
      const q = text.trim()
      if (!q || busy) return

      setMessages((prev) => [...prev, { id: newId(), role: 'user', content: q, timestamp: Date.now() }])
      setInput('')
      setBusy(true)
      setIntroBubble(false)

      window.setTimeout(() => {
        const res = respondToQuery(q)
        pushAssistant(res.content, res.links, res.suggestions)
        setBusy(false)
      }, 280)
    },
    [busy, pushAssistant]
  )

  useEffect(() => {
    if (isAdminRoute) return
    try {
      const snooze = localStorage.getItem(INTRO_SNOOZE_KEY)
      if (snooze && Date.now() < Number.parseInt(snooze, 10)) return
      if (localStorage.getItem(INTRO_SEEN_KEY) === '1') return
    } catch {
      /* storage unavailable */
    }

    const timer = window.setTimeout(() => {
      setIntroBubble(true)
      try {
        localStorage.setItem(INTRO_SEEN_KEY, '1')
      } catch {
        /* ignore */
      }
    }, INTRO_DELAY_MS)

    return () => window.clearTimeout(timer)
  }, [isAdminRoute, pathname])

  useEffect(() => {
    if (!open) return
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, open, busy])

  useEffect(() => {
    if (open) {
      window.setTimeout(() => inputRef.current?.focus(), 120)
    }
  }, [open])

  const openPanel = () => {
    setOpen(true)
    setIntroBubble(false)
    if (messages.length === 0) {
      pushAssistant(XAVYR_INTRO, undefined, [
        'Browse collections',
        'How do I order?',
        'Delivery & payment',
        'Contact the store',
      ])
    }
  }

  const dismissIntro = () => {
    setIntroBubble(false)
    try {
      localStorage.setItem(INTRO_SNOOZE_KEY, String(Date.now() + 24 * 60 * 60 * 1000))
    } catch {
      /* ignore */
    }
  }

  if (isAdminRoute) return null

  return (
    <div
      className="pointer-events-none fixed bottom-5 left-5 z-[900] flex flex-col items-start gap-2 sm:bottom-6 sm:left-6"
      aria-live="polite"
    >
      <AnimatePresence>
        {introBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="pointer-events-auto relative max-w-[min(18rem,calc(100vw-5rem))]"
          >
            <div className="hero-glass-frame relative backdrop-blur-md">
              <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
              <div className="glass-inner-panel relative rounded-2xl border border-primary-500/30 px-3.5 py-3 pr-9 shadow-lg dark:border-primary-500/35">
                <p className="text-xs leading-relaxed text-neutral-800 dark:text-primary-100">
                  <span className="font-semibold text-primary-700 dark:text-primary-200">Xavyr</span> — your MysticalPIECES
                  guide. Tap if you need directions or shopping help.
                </p>
                <button
                  type="button"
                  onClick={dismissIntro}
                  className="focus-ring-none absolute right-2 top-2 rounded-full p-1 text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-800 dark:hover:bg-neutral-700/60 dark:hover:text-neutral-100"
                  aria-label="Dismiss introduction"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <div
              className="absolute -bottom-1.5 left-5 h-3 w-3 rotate-45 border-b border-l border-primary-500/30 bg-white/90 dark:border-primary-500/35 dark:bg-neutral-900/90"
              aria-hidden
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            id={panelId}
            role="dialog"
            aria-label="Xavyr site guide"
            className="pointer-events-auto mb-1 flex max-h-[min(70vh,32rem)] w-[min(100vw-2.5rem,22rem)] flex-col overflow-hidden sm:w-[22rem]"
          >
            <div className="hero-glass-frame relative flex min-h-0 flex-1 flex-col backdrop-blur-lg">
              <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
              <div className="glass-inner-panel relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary-500/35 shadow-2xl dark:border-primary-500/40">
                <header className="flex shrink-0 items-center gap-2.5 border-b border-neutral-200/80 px-3.5 py-3 dark:border-neutral-700/80">
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-700 to-primary-900 text-white shadow-inner dark:from-primary-500 dark:to-primary-800">
                    <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-accent-500 ring-2 ring-white dark:ring-neutral-900" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-neutral-900 dark:text-primary-50">Xavyr</p>
                    <p className="truncate text-[10px] uppercase tracking-wider text-primary-600 dark:text-primary-300">
                      Site guide
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="focus-ring-none rounded-full p-1.5 text-neutral-500 hover:bg-neutral-200/70 hover:text-neutral-800 dark:hover:bg-neutral-700/70 dark:hover:text-neutral-100"
                    aria-label="Close guide"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </header>

                <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-3 py-3">
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[92%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${
                          msg.role === 'user'
                            ? 'rounded-br-md bg-primary-700 text-white dark:bg-primary-600'
                            : 'rounded-bl-md border border-neutral-200/80 bg-white/80 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800/70 dark:text-primary-50'
                        }`}
                      >
                        {msg.content}
                        {msg.role === 'assistant' && <MessageLinks links={msg.links} />}
                      </div>
                    </div>
                  ))}
                  {busy && (
                    <div className="flex justify-start">
                      <div className="rounded-2xl rounded-bl-md border border-neutral-200/80 bg-white/80 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800/70">
                        <span className="inline-flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.span
                              key={i}
                              className="h-1.5 w-1.5 rounded-full bg-primary-500"
                              animate={{ opacity: [0.35, 1, 0.35] }}
                              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                            />
                          ))}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {lastSuggestions.length > 0 && (
                  <div className="shrink-0 border-t border-neutral-200/70 px-3 py-2 dark:border-neutral-700/70">
                    <SuggestionChips suggestions={lastSuggestions} onPick={sendQuery} disabled={busy} />
                  </div>
                )}

                <form
                  className="flex shrink-0 gap-2 border-t border-neutral-200/80 p-3 dark:border-neutral-700/80"
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendQuery(input)
                  }}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about the shop…"
                    maxLength={400}
                    className="input-overlay min-w-0 flex-1 rounded-xl px-3 py-2 text-sm dark:bg-neutral-800 dark:text-white"
                    aria-label="Message to Xavyr"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || busy}
                    className="focus-ring-none flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-700 text-white transition-opacity hover:bg-primary-800 disabled:opacity-40 dark:bg-primary-600 dark:hover:bg-primary-500"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => (open ? setOpen(false) : openPanel())}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? 'Close Xavyr guide' : 'Open Xavyr guide'}
        className="focus-ring-none pointer-events-auto group relative"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        <span className="absolute inset-0 rounded-full bg-primary-500/20 blur-md transition-opacity group-hover:opacity-100 opacity-70 dark:bg-primary-400/15" />
        <span className="relative flex h-12 w-12 items-center justify-center rounded-full border border-primary-500/40 bg-gradient-to-br from-primary-800 to-primary-950 text-white shadow-lg dark:from-primary-700 dark:to-primary-900 sm:h-[3.25rem] sm:w-[3.25rem]">
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" strokeWidth={1.75} />}
        </span>
        {!open && (
          <motion.span
            className="absolute -right-0.5 -top-0.5 flex h-3 w-3"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-60 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-500 ring-2 ring-white dark:ring-neutral-900" />
          </motion.span>
        )}
      </motion.button>
    </div>
  )
}
