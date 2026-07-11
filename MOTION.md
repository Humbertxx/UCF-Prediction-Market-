# Knightshi Motion Kit
> Stack: React + Framer Motion (landing route only) | Visual tokens: **DESIGN.md** | Scope: Motion choreography

**Companion doc:** `DESIGN.md` is the visual source of truth (UCF black/gold, light trading UI).
This file defines **how things move**. Do not import purple/Aave color values from §1.1 into
components — map glows and accents to `--gold` and `--deck` instead.

---

## 0. CONTEXT & PHILOSOPHY

This motion kit governs animated state on **marketing/landing surfaces** (`/`). Trading routes
use CSS motion only (see `DESIGN.md` §10 and §16).

The design philosophy follows four rules:

1. **Motion is state** — animate transitions between UI states, not decoration.
2. **Budget motion** — high-frequency interactions (hover, button tap) stay under 150ms. Low-frequency moments (page entrance, modals, onboarding) may use up to 600ms.
3. **Exit faster than entrance** — outgoing elements dismiss 20–30% faster so they don't block the user's next action.
4. **GPU-safe** — animate only `transform` (translateX/Y, scale, rotate) and `opacity`. Never animate `top`, `left`, `width`, `height`, or `background-color` directly via Framer Motion (use CSS transitions for color/shadow).

---

## 1. DESIGN TOKENS

### 1.1 Color Palette

> **Knightshi:** Use `DESIGN.md` §4 tokens in components. The palette below is the original
> Aave-inspired reference — keep for radial-glow math only; substitute `rgba(255,201,4,…)` for
> brand purple and `#1B1E26` (`--deck`) for dark surfaces.

```ts
// tokens/colors.ts
export const colors = {
  background: {
    base:     '#0B0E1A',   // deepest navy — page background
    surface:  '#111827',   // card / panel surface
    elevated: '#1A2035',   // modals, dropdowns, tooltip bg
    overlay:  'rgba(11,14,26,0.85)', // backdrop overlays
  },
  brand: {
    purple:   '#7B5EA7',   // primary brand purple
    violet:   '#9B7FD4',   // hover/active state of purple
    lavender: '#C4B5FD',   // accent / highlight text
    glow:     'rgba(123,94,167,0.35)', // glow spread for box-shadow
    glowHot:  'rgba(155,127,212,0.55)', // intense glow on focus/hover
  },
  semantic: {
    positive: '#22D3A5',   // green — gains, success
    negative: '#F87171',   // red — losses, danger
    warning:  '#FBBF24',   // yellow — caution
    neutral:  '#6B7280',   // muted text
  },
  border: {
    subtle:   'rgba(255,255,255,0.06)',
    default:  'rgba(255,255,255,0.10)',
    brand:    'rgba(123,94,167,0.45)',
    focus:    'rgba(155,127,212,0.80)',
  },
}
```

### 1.2 Duration Tokens

```ts
// tokens/motion.ts
export const duration = {
  // Micro — hover states, icon swaps, checkbox toggles
  instant:  80,   // ms
  fast:     120,  // ms
  quick:    150,  // ms

  // Standard — tooltips, dropdowns, small card reveals
  short:    200,  // ms
  base:     250,  // ms
  moderate: 300,  // ms

  // Expressive — modal open/close, page transitions, hero entrances
  slow:     400,  // ms
  long:     500,  // ms
  dramatic: 600,  // ms

  // Ambient — background glow pulses, idle shimmer
  ambient: 2000,  // ms (looping)
}
```

### 1.3 Easing Tokens

```ts
// tokens/easing.ts
export const easing = {
  // Standard deceleration — most entrances (starts fast, settles softly)
  decelerate: [0.0, 0.0, 0.2, 1.0],

  // Standard acceleration — exits (starts slow, ends sharp)
  accelerate: [0.4, 0.0, 1.0, 1.0],

  // Standard — begins and ends at rest; shared-axis moves
  standard:   [0.4, 0.0, 0.2, 1.0],

  // Expressive — emphasis, bouncy CTA, onboarding flourishes
  expressive: [0.34, 1.56, 0.64, 1.0],

  // Linear — only for continuous looping (progress bars, shimmer)
  linear:     [0.0, 0.0, 1.0, 1.0],
}
```

### 1.4 Spring Presets

```ts
// tokens/springs.ts
export const springs = {
  // CTA / primary buttons — snappy, tactile
  button: { type: 'spring', stiffness: 400, damping: 15 },

  // Card lifts, panel reveals — smooth authority
  card:   { type: 'spring', stiffness: 260, damping: 24 },

  // Modal / drawer entrance — confident + weighted
  modal:  { type: 'spring', stiffness: 200, damping: 22, mass: 1.1 },

  // Data number counters — fluid, organic
  counter: { type: 'spring', stiffness: 120, damping: 18 },

  // Tooltip / popover — instant feel
  tooltip: { type: 'spring', stiffness: 500, damping: 28 },
}
```

---

## 2. VARIANT LIBRARY

### 2.1 Fade Up (Most Common Entrance)

```ts
// variants/fadeUp.ts
import { Variants } from 'framer-motion'

export const fadeUp: Variants = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.0, 0.0, 0.2, 1.0] },
  },
  exit: {
    opacity: 0, y: -12,
    transition: { duration: 0.25, ease: [0.4, 0.0, 1.0, 1.0] },
  },
}
```

### 2.2 Stagger Container (Card Grids, Lists)

```ts
// variants/staggerContainer.ts
import { Variants } from 'framer-motion'

export const staggerContainer: Variants = {
  hidden:  { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren:   0.1,
      when: 'beforeChildren',
    },
  },
}
// Usage: wrap grid with staggerContainer, each child uses fadeUp
```

### 2.3 Slide In from Right (Drawer / Side Panel)

```ts
// variants/slideInRight.ts
export const slideInRight: Variants = {
  hidden:  { x: '100%', opacity: 0 },
  visible: {
    x: 0, opacity: 1,
    transition: { type: 'spring', stiffness: 200, damping: 22, mass: 1.1 },
  },
  exit: {
    x: '100%', opacity: 0,
    transition: { duration: 0.3, ease: [0.4, 0.0, 1.0, 1.0] },
  },
}
```

### 2.4 Scale Pop (Modal / Dialog)

```ts
// variants/scalePop.ts
export const scalePop: Variants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1, scale: 1,
    transition: { type: 'spring', stiffness: 200, damping: 22, mass: 1.1 },
  },
  exit: {
    opacity: 0, scale: 0.95,
    transition: { duration: 0.2, ease: [0.4, 0.0, 1.0, 1.0] },
  },
}
```

### 2.5 Fade Through (Tab / View Switching)

```ts
// variants/fadeThrough.ts
export const fadeThrough: Variants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: [0.4, 0.0, 0.2, 1.0] } },
  exit:    { opacity: 0, transition: { duration: 0.15, ease: [0.4, 0.0, 1.0, 1.0] } },
}
```

---

## 3. COMPONENT MOTION PATTERNS

### 3.1 Hero Section — Orchestrated Entrance

```
Waterfall sequence:
  T+0ms   — Ambient glow orb fades in, begins looping pulse
  T+0ms   — Navbar fades in
  T+150ms — H1 headline: fadeUp
  T+300ms — Subtitle: fadeUp
  T+450ms — CTA buttons: fadeUp + spring scale
  T+600ms — Stats strip: staggerContainer (80ms per stat)
  T+800ms — Dashboard preview image: y 40→0, opacity 0→1, 600ms
```

```tsx
// Ambient glow orb — loops forever
const glowVariant = {
  animate: {
    opacity: [0.3, 0.6, 0.3],
    scale:   [1, 1.08, 1],
    transition: { duration: 4, ease: 'linear', repeat: Infinity },
  },
}

// Example structure
<section className="relative overflow-hidden">
  <motion.div
    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px]
               rounded-full blur-[120px] bg-brand-purple/30 pointer-events-none"
    variants={glowVariant}
    animate="animate"
  />
  <motion.h1 variants={fadeUp} initial="hidden" animate="visible">
    Put your money to work
  </motion.h1>
  <motion.div variants={staggerContainer} initial="hidden" animate="visible">
    {stats.map(s => (
      <motion.div key={s.id} variants={fadeUp}>
        <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
      </motion.div>
    ))}
  </motion.div>
</section>
```

### 3.2 Stat Counter — Number Roll Animation

```tsx
// components/AnimatedCounter.tsx
import { useSpring, useTransform, motion, MotionValue } from 'framer-motion'
import { useEffect, useRef } from 'react'

interface CounterProps {
  value: number
  prefix?: string  // e.g. "$"
  suffix?: string  // e.g. "B" | "T" | "%"
  decimals?: number
}

function SingleDigit({ mv, digit }: { mv: MotionValue<number>; digit: number }) {
  const fontSize = 32
  const height   = fontSize + 8
  const y = useTransform(mv, (v) => {
    const placeVal = Math.floor(v) % 10
    const offset   = (10 + digit - placeVal) % 10
    let   memo     = offset * height
    if (offset > 5) memo -= 10 * height
    return memo
  })
  return (
    <motion.span
      style={{ y, height, lineHeight: `${height}px` }}
      className="absolute inset-0 flex items-center justify-center tabular-nums"
    >
      {digit}
    </motion.span>
  )
}

export function AnimatedCounter({ value, prefix = '', suffix = '' }: CounterProps) {
  const springVal = useSpring(value, { stiffness: 120, damping: 18 })
  const ref = useRef(value)

  useEffect(() => {
    if (ref.current !== value) {
      springVal.set(value)
      ref.current = value
    }
  }, [value, springVal])

  return (
    <span className="inline-flex items-center font-mono font-bold text-white">
      {prefix}
      <span className="relative overflow-hidden" style={{ height: 40 }}>
        {[...Array(10).keys()].map(d => (
          <SingleDigit key={d} mv={springVal} digit={d} />
        ))}
      </span>
      {suffix}
    </span>
  )
}

// Trigger with whileInView:
// <motion.div whileInView="visible" initial="hidden" viewport={{ once: true, amount: 0.5 }} variants={fadeUp}>
//   <AnimatedCounter value={3460000000000} prefix="$" />
// </motion.div>
```

### 3.3 Market Card — Magnetic Cursor Glow

```tsx
// components/MarketCard.tsx
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useRef } from 'react'

export function MarketCard({ children }: { children: React.ReactNode }) {
  const ref    = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const glowX  = useTransform(mouseX, v => `${v}px`)
  const glowY  = useTransform(mouseY, v => `${v}px`)

  function handleMouseMove(e: React.MouseEvent) {
    const rect = ref.current!.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left)
    mouseY.set(e.clientY - rect.top)
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      variants={fadeUp}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="relative rounded-2xl border border-white/10 bg-[#111827] overflow-hidden cursor-pointer"
    >
      {/* Magnetic glow follows cursor */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 rounded-2xl"
        style={{
          background: `radial-gradient(circle 220px at ${glowX} ${glowY}, rgba(123,94,167,0.20), transparent 70%)`,
        }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.15 }}
      />
      {/* Top edge gradient highlight */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
      <div className="relative z-10 p-6">{children}</div>
    </motion.div>
  )
}
```

### 3.4 CTA Button — Spring Physics

```tsx
// components/Button.tsx
import { motion } from 'framer-motion'

type Variant = 'primary' | 'outline' | 'ghost'
const spring = { type: 'spring', stiffness: 400, damping: 15 } as const

export function Button({ variant, children, onClick }: { variant: Variant; children: React.ReactNode; onClick?: () => void }) {
  const isPrimary = variant === 'primary'
  return (
    <motion.button
      onClick={onClick}
      whileHover={isPrimary ? { scale: 1.04 } : undefined}
      whileTap={isPrimary  ? { scale: 0.96 } : undefined}
      transition={isPrimary ? spring : undefined}
      className={[
        'px-6 py-3 rounded-xl font-semibold text-sm tracking-wide',
        'transition-[background-color,box-shadow,border-color] duration-150',
        variant === 'primary' && 'bg-violet-600 text-white hover:bg-violet-500 shadow-[0_0_20px_rgba(123,94,167,0.4)] hover:shadow-[0_0_32px_rgba(123,94,167,0.7)]',
        variant === 'outline' && 'border border-white/20 text-white hover:border-violet-500/60 hover:bg-white/5',
        variant === 'ghost'   && 'text-white/60 hover:text-white hover:bg-white/5',
      ].filter(Boolean).join(' ')}
    >
      {children}
    </motion.button>
  )
}
```

### 3.5 Modal / Dialog

```tsx
// components/Modal.tsx
import { AnimatePresence, motion } from 'framer-motion'

export function Modal({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95,  y: 8  }}
            transition={{ type: 'spring', stiffness: 200, damping: 22, mass: 1.1 }}
          >
            <div className="w-full max-w-md rounded-2xl bg-[#1A2035] border border-white/10 shadow-2xl p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

### 3.6 Page / Route Transitions

```tsx
// components/PageTransition.tsx
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'

const pageVariants = {
  hidden:  { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.35, ease: [0.0, 0.0, 0.2, 1.0] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.22, ease: [0.4, 0.0, 1.0, 1.0] } },
}

export function PageTransition({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div key={location.pathname} variants={pageVariants} initial="hidden" animate="visible" exit="exit">
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

### 3.7 Scroll Progress Bar

```tsx
// components/ScrollProgressBar.tsx
import { motion, useScroll, useSpring } from 'framer-motion'

export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 })
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-600 to-violet-400 origin-left z-[999]"
      style={{ scaleX }}
    />
  )
}
```

### 3.8 Glassmorphism Stat Card

```tsx
// components/GlassCard.tsx
import { motion } from 'framer-motion'

export function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className={[
        'relative rounded-2xl overflow-hidden',
        'bg-white/[0.04] backdrop-blur-xl',
        'border border-white/[0.08]',
        'shadow-[0_4px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.04)]',
        'hover:shadow-[0_8px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(123,94,167,0.25)]',
        'transition-shadow duration-300',
        className,
      ].filter(Boolean).join(' ')}
    >
      {/* Top edge gradient highlight */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(155,127,212,0.5) 50%, transparent)' }}
      />
      <div className="relative z-10 p-6">{children}</div>
    </motion.div>
  )
}
```

### 3.9 Skeleton Shimmer Loader

```tsx
// components/Skeleton.tsx
import { motion } from 'framer-motion'

export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-white/[0.06] ${className}`}>
      <motion.div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)' }}
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.6, ease: 'linear', repeat: Infinity, repeatDelay: 0.4 }}
      />
    </div>
  )
}
```

### 3.10 Toast Notification

```tsx
// components/Toast.tsx
import { AnimatePresence, motion } from 'framer-motion'

const toastVariants = {
  hidden:  { opacity: 0, x: 80,  scale: 0.92 },
  visible: { opacity: 1, x: 0,   scale: 1,
    transition: { type: 'spring', stiffness: 280, damping: 20 },
  },
  exit:    { opacity: 0, x: 60,  scale: 0.95,
    transition: { duration: 0.2, ease: [0.4, 0.0, 1.0, 1.0] },
  },
}

export function Toast({ message, type, visible }: { message: string; type: 'success'|'error'|'info'; visible: boolean }) {
  const styles = {
    success: 'border-emerald-500/40 text-emerald-400',
    error:   'border-red-500/40 text-red-400',
    info:    'border-violet-500/40 text-violet-400',
  }
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          variants={toastVariants}
          initial="hidden" animate="visible" exit="exit"
          className={`fixed bottom-6 right-6 z-[1000] rounded-xl bg-[#1A2035] border px-5 py-4 shadow-2xl text-sm font-medium ${styles[type]}`}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

### 3.11 Navbar — Scroll-Linked Blur

```tsx
// components/Navbar.tsx
import { motion, useScroll, useTransform } from 'framer-motion'

export function Navbar() {
  const { scrollY } = useScroll()
  const backdropBlur  = useTransform(scrollY, [0, 60], ['blur(0px)', 'blur(16px)'])
  const bgOpacity     = useTransform(scrollY, [0, 60], [0, 0.85])
  const borderOpacity = useTransform(scrollY, [0, 60], [0, 0.12])

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
      style={{
        backdropFilter: backdropBlur,
        backgroundColor: `rgba(11,14,26,${bgOpacity})`,
        borderBottom:    `1px solid rgba(255,255,255,${borderOpacity})`,
      }}
    >
      {/* Nav content */}
    </motion.nav>
  )
}
```

---

## 4. SCROLL ANIMATION PATTERNS

### 4.1 Section Reveal — whileInView (apply to every content section)

```tsx
<motion.section
  variants={staggerContainer}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.2 }}
>
  <motion.h2 variants={fadeUp}>Markets for every strategy</motion.h2>
  <motion.div className="grid grid-cols-3 gap-4">
    {markets.map(m => (
      <motion.div key={m.id} variants={fadeUp}>
        <MarketCard>{/* ... */}</MarketCard>
      </motion.div>
    ))}
  </motion.div>
</motion.section>
```

### 4.2 Parallax Hero Background Orb

```tsx
import { useScroll, useTransform, motion } from 'framer-motion'

export function ParallaxOrb() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 800], [0, -160]) // moves at 20% scroll speed

  return (
    <motion.div
      style={{ y }}
      className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[900px] h-[600px]
                 rounded-full blur-[140px] bg-violet-800/20 pointer-events-none"
    />
  )
}
```

### 4.3 Alternating Horizontal Reveal (Stats Strip)

```tsx
// Even index → slide from left, odd index → slide from right
const statsVariants = (i: number): Variants => ({
  hidden:  { opacity: 0, x: i % 2 === 0 ? -32 : 32 },
  visible: {
    opacity: 1, x: 0,
    transition: { type: 'spring', stiffness: 180, damping: 20 },
  },
})
```

---

## 5. MOTION ORCHESTRATION MAP

Full millisecond choreography for every major UI area.

```
HERO SECTION
  T+0ms    Ambient glow orbs: opacity 0→0.3, scale 1→1.08, loop 4s
  T+0ms    Navbar: opacity 0→1, duration 300ms
  T+150ms  H1 headline: fadeUp (y 24→0, duration 400ms)
  T+300ms  Subtitle: fadeUp
  T+450ms  CTA buttons: fadeUp + spring scale pop
  T+600ms  Stats strip: staggerContainer (80ms between each stat)
  T+800ms  Dashboard preview: y 40→0, opacity 0→1, duration 600ms

MARKETS SECTION (whileInView, amount: 0.2)
  T+0ms    Section heading: fadeUp
  T+100ms  Cards grid: staggerContainer (80ms stagger × 3 cols = 0/80/160ms)
  Hover    Card: y -4, scale 1.015 + magnetic glow cursor follow

STATS / TVL SECTION (whileInView, amount: 0.5)
  T+0ms    Number counters begin rolling (spring stiffness:120, damping:18)
  T+100ms  Label text fades in

MODAL (Supply / Borrow dialog)
  Open   Backdrop: opacity 0→1 (200ms)
         Panel: scale 0.92→1, y 16→0 (spring stiffness:200, damping:22)
  Close  Panel: scale 1→0.95, opacity 1→0 (200ms)
         Backdrop: opacity 1→0 (200ms)

ROUTE CHANGE (AnimatePresence mode="wait")
  Exit   Current page: y 0→-8, opacity 1→0 (220ms ease-in)
  Enter  Next page: y 12→0, opacity 0→1 (350ms ease-out)

TOAST
  Enter  x 80→0, scale 0.92→1 (spring stiffness:280, damping:20)
  Exit   x 0→60, opacity 1→0 (200ms ease-in)

DRAWER / SIDE PANEL
  Open   x 100%→0, opacity 0→1 (spring stiffness:200, damping:22)
  Close  x 0→100%, opacity 1→0 (300ms ease-in)
```

---

## 6. PERFORMANCE RULES

```
✅ ANIMATE THESE (GPU composited, no layout reflow):
   opacity
   transform: translateX/Y, scale, rotate

⚠️  EXPENSIVE — USE SPARINGLY:
   filter: blur()  — use only on ambient/background elements, not on lists/cards

❌ NEVER ANIMATE THESE VIA FRAMER:
   width / height  → use scaleX/scaleY + transform-origin instead
   top / left      → use translateY / translateX instead
   background-color / box-shadow → use CSS transition-[property] duration-150
   margin / padding → causes layout reflow, never animate

ADDITIONAL RULES:
   viewport={{ once: true }} on ALL whileInView — never re-trigger on scroll-up
   will-change: transform  on GPU-promoted elements (apply sparingly, max 3–4 per page)
   Avoid stacking route transitions — debounce navigation
   Skeleton loaders must start/stop with actual data, not timers
```

---

## 7. ACCESSIBILITY

```tsx
// hooks/useMotionSafe.ts
import { useReducedMotion } from 'framer-motion'

export function useMotionSafe() {
  const reduce = useReducedMotion()
  return {
    transition:   reduce ? { duration: 0 }                               : undefined,
    springConfig: reduce ? { type: 'tween', duration: 0 } as const       : { type: 'spring', stiffness: 400, damping: 15 } as const,
    variants:     (v: any) => reduce ? {} : v,
  }
}
```

```tsx
// App.tsx — global reduced motion via MotionConfig
import { MotionConfig } from 'framer-motion'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      {/* Automatically respects OS prefers-reduced-motion */}
      <PageTransition>
        <RouterOutlet />
      </PageTransition>
    </MotionConfig>
  )
}
```

```tsx
// Per-component pattern:
const shouldReduce = useReducedMotion()

<motion.div
  initial={shouldReduce ? false : 'hidden'}
  animate="visible"
  variants={shouldReduce ? {} : fadeUp}
>
```

---

## 8. FULL COMPONENT INVENTORY

| Component            | Animation Type          | Variant / Hook            | Trigger         | Duration    |
|----------------------|-------------------------|---------------------------|-----------------|-------------|
| Hero Headline        | Fade Up                 | `fadeUp`                  | Mount           | 400ms       |
| Hero Subtitle        | Fade Up                 | `fadeUp`                  | Mount +150ms    | 400ms       |
| Hero CTA             | Fade Up + Spring Pop    | `fadeUp` + spring         | Mount +300ms    | 400ms       |
| Hero Stats Row       | Stagger Fade Up         | `staggerContainer`        | Mount +450ms    | 80ms gap    |
| Market Cards Grid    | Stagger Fade Up         | `staggerContainer`        | whileInView     | 80ms gap    |
| Card Hover           | Lift + Magnetic Glow    | `whileHover` + cursor     | Hover           | Spring      |
| Primary Button       | Spring Tap/Hover        | `whileTap` `whileHover`   | Interaction     | Spring      |
| Counter Numbers      | Spring Roll             | `useSpring`               | whileInView     | Spring      |
| Modal Open           | Scale + Fade            | `scalePop`                | State change    | Spring      |
| Modal Backdrop       | Fade                    | `fadeThrough`             | State change    | 200ms       |
| Drawer / Side Panel  | Slide In Right          | `slideInRight`            | State change    | Spring      |
| Page Route           | Fade Up / Down          | `pageVariants`            | Route change    | 350 / 220ms |
| Tab Switch           | Fade Through            | `fadeThrough`             | State change    | 200ms       |
| Toast                | Slide + Scale           | `toastVariants`           | State change    | Spring      |
| Skeleton Loader      | Shimmer Sweep           | `animate` x loop          | Mount           | 1600ms ∞    |
| Navbar               | Blur + Fade on Scroll   | `useScroll` `useTransform`| Scroll          | Continuous  |
| Scroll Progress Bar  | Scale X Spring          | `useSpring`               | Scroll          | Continuous  |
| Ambient Orb          | Scale + Opacity Pulse   | `animate` loop            | Mount           | 4000ms ∞    |
| Parallax Orb         | Y Translate             | `useTransform`            | Scroll          | Continuous  |
| Glass Card           | Fade Up + Hover Lift    | `fadeUp` + `whileHover`   | whileInView     | 400ms       |

---

## 9. FILE STRUCTURE

```
frontend/src/motion/              # Implemented — landing route only
├── tokens.ts
├── variants.ts
├── hooks/useMotionSafe.ts
├── components/
│   ├── MotionReveal.tsx
│   ├── MotionButton.tsx
│   ├── Skeleton.tsx              # Framer shimmer (landing preview)
│   └── PageTransition.tsx        # Optional; not used on trading routes
└── index.ts

frontend/src/components/ui/
└── Skeleton.tsx                  # CSS shimmer (trading routes)

frontend/src/pages/Home.tsx       # MotionConfig + lazy route entry
```

---

## 10. INSTALL & SETUP

```bash
# Required (already in frontend/package.json)
npm install framer-motion
```

**Bundle strategy:** Home is `React.lazy()`-loaded in `App.tsx` so Framer Motion ships in the
landing chunk, not the trading-route critical path. Trading surfaces use CSS from `DESIGN.md` §10.

```tsx
// pages/Home.tsx — MotionConfig only on landing
import { MotionConfig } from "framer-motion";

export default function Home() {
  return (
    <MotionConfig reducedMotion="user">
      {/* landing sections with whileInView / orchestration */}
    </MotionConfig>
  );
}
```

`scalePop` modals: wire when admin/trade confirmation dialogs are added.

---

*End of Motion Kit — pair with `DESIGN.md` for Knightshi visuals. Feed both files to AI agents.*
