'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Send, Sparkles, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import { XAVYR_INTRO } from '@/lib/xavyr/knowledge'
import { RESIZE_CURSOR, useXavyrPanelSize, XAVYR_PANEL_BOTTOM_OFFSET, type ResizeEdge } from '@/lib/xavyr/use-xavyr-panel-size'
import type { XavyrLink, XavyrMessage } from '@/lib/xavyr/types'

const INTRO_SEEN_KEY = 'xavyr-intro-seen'
const INTRO_SNOOZE_KEY = 'xavyr-intro-snooze-until'
const INTRO_DELAY_MS = 6500

const RESIZE_HANDLES: { edge: ResizeEdge; className: string }[] = [
  { edge: 'n', className: 'left-2 right-2 top-0 h-2 cursor-ns-resize' },
  { edge: 's', className: 'left-2 right-2 bottom-0 h-2 cursor-ns-resize' },
  { edge: 'e', className: 'right-0 top-2 bottom-2 w-2 cursor-ew-resize' },
  { edge: 'w', className: 'left-0 top-2 bottom-2 w-2 cursor-ew-resize' },
  { edge: 'nw', className: 'left-0 top-0 h-3 w-3 cursor-nwse-resize' },
  { edge: 'ne', className: 'right-0 top-0 h-3 w-3 cursor-nesw-resize' },
  { edge: 'sw', className: 'bottom-0 left-0 h-3 w-3 cursor-nesw-resize' },
  { edge: 'se', className: 'bottom-0 right-0 h-3 w-3 cursor-nwse-resize' },
]

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

  const { size, startResize } = useXavyrPanelSize(open)
  const isAdminRoute = pathname?.startsWith('/admin')

  const recentAssistantTexts = messages.filter((m) => m.role === 'assistant').map((m) => m.content)

  const pushAssistant = useCallback((content: string, links?: XavyrLink[], suggestions?: string[]) => {
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: 'assistant', content, links, timestamp: Date.now() },
    ])
    if (suggestions?.length) setLastSuggestions(suggestions)
  }, [])

  const sendQuery = useCallback(
    async (text: string) => {
      const q = text.trim()
      if (!q || busy) return

      const userMsg: XavyrMessage = { id: newId(), role: 'user', content: q, timestamp: Date.now() }
      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setBusy(true)
      setIntroBubble(false)

      const history = [...messages, userMsg].slice(-10).map((m) => ({
        role: m.role,
        content: m.content,
      }))

      try {
        const res = await fetch('/api/xavyr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: q,
            history,
            recentAssistant: recentAssistantTexts.slice(-6),
          }),
        })
        if (res.ok) {
          const data = (await res.json()) as {
            content: string
            links?: XavyrLink[]
            suggestions?: string[]
          }
          pushAssistant(data.content, data.links, data.suggestions)
        } else {
          pushAssistant(
            'I had trouble reaching my guide service. Try again in a moment, or browse the Shop from the menu.',
            [{ label: 'Shop', href: '/sections/shop' }]
          )
        }
      } catch {
        pushAssistant(
          'Connection hiccup. You can still browse via the Shop link while I catch up.',
          [{ label: 'Open Shop', href: '/sections/shop' }]
        )
      } finally {
        setBusy(false)
      }
    },
    [busy, messages, pushAssistant, recentAssistantTexts]
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
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[850] bg-black/50 backdrop-blur-sm"
            aria-hidden
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {introBubble && !open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="pointer-events-auto fixed right-8 z-[900] max-w-[min(18rem,calc(100vw-6rem))]"
            style={{ bottom: XAVYR_PANEL_BOTTOM_OFFSET }}
          >
            <div className="hero-glass-frame relative backdrop-blur-md">
              <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
              <div className="glass-inner-panel relative rounded-2xl border border-primary-500/30 px-3.5 py-3 pr-9 shadow-lg dark:border-primary-500/35">
                <p className="text-xs leading-relaxed text-neutral-800 dark:text-primary-100">
                  <span className="font-semibold text-primary-700 dark:text-primary-200">Xavyr</span>, your MysticalPIECES
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
              className="absolute -bottom-1.5 right-5 h-3 w-3 rotate-45 border-b border-r border-primary-500/30 bg-white/90 dark:border-primary-500/35 dark:bg-neutral-900/90"
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
            className="pointer-events-auto fixed right-8 z-[900] flex flex-col"
            style={{ bottom: XAVYR_PANEL_BOTTOM_OFFSET, width: size.width, height: size.height }}
          >
            {RESIZE_HANDLES.map(({ edge, className }) => (
              <div
                key={edge}
                role="presentation"
                aria-hidden
                className={`absolute z-20 touch-none ${className}`}
                style={{ cursor: RESIZE_CURSOR[edge] }}
                onPointerDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  startResize(edge, e.clientX, e.clientY)
                }}
              />
            ))}

            <div className="hero-glass-frame relative flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-neutral-200/80 shadow-2xl backdrop-blur-lg dark:border-neutral-600">
              <div className="hero-glass-frame-overlay pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden />
              <div className="glass-inner-panel relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-primary-500/35 dark:border-primary-500/40">
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
                    className="flex shrink-0 items-center gap-2 border-t border-neutral-200/80 p-3 dark:border-neutral-700/80"
                    onSubmit={(e) => {
                      e.preventDefault()
                      void sendQuery(input)
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
                    <Button
                      type="submit"
                      variant="circle"
                      size="icon"
                      disabled={!input.trim() || busy}
                      className="focus-ring-none shrink-0 disabled:opacity-40"
                      aria-label="Send message"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pointer-events-auto fixed bottom-[5.5rem] right-8 z-[901]" aria-live="polite">
        {!open && (
          <motion.span
            className="absolute -right-0.5 -top-0.5 z-10 flex h-3 w-3"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <span className="absolute inline-flex h-full w-full rounded-full bg-accent-500 opacity-60 animate-ping" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-accent-500 ring-2 ring-white dark:ring-neutral-900" />
          </motion.span>
        )}
        <Button
          type="button"
          variant="circle"
          size="md"
          onClick={() => (open ? setOpen(false) : openPanel())}
          aria-expanded={open}
          aria-controls={open ? panelId : undefined}
          aria-label={open ? 'Close Xavyr guide' : 'Open Xavyr guide'}
          className="focus-ring-none relative"
        >
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" strokeWidth={1.75} />}
        </Button>
      </div>
    </>
  )
}
