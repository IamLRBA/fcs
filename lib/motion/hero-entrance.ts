import type { TargetAndTransition, Transition } from 'framer-motion'

export type HeroEntranceVariant =
  | 'curtain'   // Shop — wardrobe rise from depth
  | 'portrait'  // CEO / profile — circular reveal
  | 'catalogue' // Category pages — split assembly
  | 'reveal'    // About — split title convergence
  | 'seal'      // Legal / policy headers — stamp in
  | 'gate'      // Login / forms — blur resolve
  | 'pulse'     // Cart / checkout — crisp slide
  | 'triumph'   // Order confirmation — celebratory spring

export type HeroEntranceRole =
  | 'container'
  | 'media'
  | 'icon'
  | 'title'
  | 'titleLeft'
  | 'titleRight'
  | 'subtitle'
  | 'body'
  | 'actions'
  | 'meta'
  | 'divider'

export const HERO_EASE_OUT_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1]
export const HERO_EASE_OUT_QUART: [number, number, number, number] = [0.25, 1, 0.5, 1]

type Preset = {
  initial: TargetAndTransition
  animate: TargetAndTransition
  transition: Transition
}

type PresetMap = Partial<Record<HeroEntranceRole, Preset>>

const PRESETS: Record<HeroEntranceVariant, PresetMap> = {
  curtain: {
    media: {
      initial: { opacity: 0, y: 72, scale: 0.72, filter: 'blur(14px)' },
      animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
      transition: { duration: 1.05, delay: 0.18, ease: HERO_EASE_OUT_EXPO },
    },
    title: {
      initial: { opacity: 0, scale: 0.55, filter: 'blur(10px)' },
      animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
      transition: { duration: 0.9, delay: 0.58, ease: HERO_EASE_OUT_EXPO },
    },
    subtitle: {
      initial: { opacity: 0, y: 28, filter: 'blur(6px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.78, delay: 0.88, ease: HERO_EASE_OUT_EXPO },
    },
  },
  portrait: {
    media: {
      initial: { opacity: 0, scale: 0.62, clipPath: 'circle(0% at 50% 50%)' },
      animate: { opacity: 1, scale: 1, clipPath: 'circle(75% at 50% 50%)' },
      transition: { duration: 1, delay: 0.22, ease: HERO_EASE_OUT_EXPO },
    },
    title: {
      initial: { opacity: 0, y: 44, filter: 'blur(8px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.85, delay: 0.82, ease: HERO_EASE_OUT_EXPO },
    },
    subtitle: {
      initial: { opacity: 0, y: 22 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.72, delay: 1.02, ease: HERO_EASE_OUT_QUART },
    },
    body: {
      initial: { opacity: 0, y: 18, filter: 'blur(4px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.7, delay: 1.18, ease: HERO_EASE_OUT_QUART },
    },
  },
  catalogue: {
    media: {
      initial: { opacity: 0, x: -52, rotate: -7, filter: 'blur(10px)' },
      animate: { opacity: 1, x: 0, rotate: 0, filter: 'blur(0px)' },
      transition: { duration: 0.92, delay: 0.2, ease: HERO_EASE_OUT_EXPO },
    },
    title: {
      initial: { opacity: 0, x: 52, filter: 'blur(10px)' },
      animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
      transition: { duration: 0.92, delay: 0.42, ease: HERO_EASE_OUT_EXPO },
    },
    body: {
      initial: { opacity: 0, y: 22, filter: 'blur(5px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.75, delay: 0.72, ease: HERO_EASE_OUT_QUART },
    },
    actions: {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.65, delay: 0.92, ease: HERO_EASE_OUT_QUART },
    },
  },
  reveal: {
    titleLeft: {
      initial: { opacity: 0, x: -48, filter: 'blur(8px)' },
      animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
      transition: { duration: 0.88, delay: 0.32, ease: HERO_EASE_OUT_EXPO },
    },
    titleRight: {
      initial: { opacity: 0, x: 48, filter: 'blur(8px)' },
      animate: { opacity: 1, x: 0, filter: 'blur(0px)' },
      transition: { duration: 0.88, delay: 0.46, ease: HERO_EASE_OUT_EXPO },
    },
    subtitle: {
      initial: { opacity: 0, y: 20, filter: 'blur(5px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.72, delay: 0.74, ease: HERO_EASE_OUT_QUART },
    },
  },
  seal: {
    icon: {
      initial: { opacity: 0, scale: 0.35, rotate: -18 },
      animate: { opacity: 1, scale: 1, rotate: 0 },
      transition: { duration: 0.75, delay: 0.12, ease: HERO_EASE_OUT_EXPO },
    },
    title: {
      initial: { opacity: 0, y: 26, filter: 'blur(6px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.72, delay: 0.48, ease: HERO_EASE_OUT_EXPO },
    },
    subtitle: {
      initial: { opacity: 0, y: 18 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.65, delay: 0.68, ease: HERO_EASE_OUT_QUART },
    },
    meta: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5, delay: 0.88, ease: HERO_EASE_OUT_QUART },
    },
  },
  gate: {
    container: {
      initial: { opacity: 0, y: 36, scale: 0.94, filter: 'blur(12px)' },
      animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
      transition: { duration: 0.88, delay: 0.16, ease: HERO_EASE_OUT_EXPO },
    },
    title: {
      initial: { opacity: 0, y: 14 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.6, delay: 0.52, ease: HERO_EASE_OUT_QUART },
    },
    subtitle: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.55, delay: 0.68, ease: HERO_EASE_OUT_QUART },
    },
  },
  pulse: {
    title: {
      initial: { opacity: 0, y: 14, filter: 'blur(4px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.68, delay: 0.14, ease: HERO_EASE_OUT_EXPO },
    },
    subtitle: {
      initial: { opacity: 0, y: 10 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.58, delay: 0.34, ease: HERO_EASE_OUT_QUART },
    },
    actions: {
      initial: { opacity: 0, scale: 0.96 },
      animate: { opacity: 1, scale: 1 },
      transition: { duration: 0.5, delay: 0.48, ease: HERO_EASE_OUT_QUART },
    },
  },
  triumph: {
    icon: {
      initial: { opacity: 0, scale: 0.2 },
      animate: { opacity: 1, scale: 1 },
      transition: { type: 'spring', stiffness: 320, damping: 22, delay: 0.1 },
    },
    title: {
      initial: { opacity: 0, y: 28, filter: 'blur(6px)' },
      animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
      transition: { duration: 0.78, delay: 0.42, ease: HERO_EASE_OUT_EXPO },
    },
    subtitle: {
      initial: { opacity: 0, y: 16 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.65, delay: 0.6, ease: HERO_EASE_OUT_QUART },
    },
    meta: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.45, delay: 0.78 },
    },
  },
}

const FALLBACK: Preset = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: HERO_EASE_OUT_QUART },
}

export function getHeroEntranceMotion(
  variant: HeroEntranceVariant,
  role: HeroEntranceRole,
  options: { started: boolean; instant: boolean; index?: number }
) {
  const preset = PRESETS[variant][role] ?? FALLBACK
  const indexDelay = (options.index ?? 0) * 0.06
  const transition: Transition = {
    ...preset.transition,
    delay: ((preset.transition.delay as number) ?? 0) + indexDelay,
  }

  if (options.instant) {
    return {
      initial: false as const,
      animate: preset.animate,
      transition: { duration: 0.01 },
    }
  }

  return {
    initial: preset.initial,
    animate: options.started ? preset.animate : preset.initial,
    transition,
  }
}
