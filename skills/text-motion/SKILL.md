---
name: text-motion
description: >-
  Text animation composables powered by split-type and GSAP: `useTextReveal()` splits
  headings into words, chars, or lines on scroll, `TextReveal.vue` is a declarative
  wrapper, and `useCounter()` animates numeric stat values. Use for animated headings,
  staggered text entrances, and counting numbers, keyed to `animationIntensity`.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "motion, text, animation"
  stack: "nuxt4, vue3, tailwind4, gsap, split-type"
---

# Text Motion Skill

## When to use
Any heading, subheading, or label that should animate on scroll — a hallmark of Awwward-class sites. Use whenever SPEC specifies `animationIntensity` of `polished`, `energetic`, or `cinematic`. For `calm` intensity, use simple `useScrollReveal` from [scroll-motion](../scroll-motion/SKILL.md) instead.


> **Guard your refs before animating.** `sectionRef.value` can be null when `onMounted` runs; a tween with no targets fails silently and the section never animates. Start motion setup with `if (!sectionRef.value) return`.


> **Motion targets must be guarded.** A tween whose target list resolves to nothing plays silently and never animates. Rules: (1) resolve the section root via a template ref, falling back to a known-good element (`headlineRef.value?.closest('section')`) — never assume the root ref is populated; (2) pass targets as a lazy function `() => root.value?.querySelectorAll('.item') ?? []` so GSAP resolves them at render time; (3) early-bail when the ref is null: `if (!root.value) { console.warn('motion: section ref unresolved'); return }`. Empty targets are now a build failure (motion-target-watch), so guard them.


> **Never call `context.selector()`.** It only exists on a *scoped* context and is `undefined` on `gsap.matchMedia()` / `gsap.context(fn)`, where calling it throws. Query through the section’s template ref instead: `sectionRef.value?.querySelectorAll('.item') ?? []`.

Provides:
- `useTextReveal()` — composable that splits text and animates lines/words/chars on scroll
- Counter animation pattern for stat numbers

## Architecture

> **⚠️ `app/composables/useTextMotion.ts` is PRE-INSTALLED and guarded
> (`@guard:use-text-motion`) — DO NOT create or rewrite it.** It already uses
> `gsap.set()` + `gsap.to()` (never `gsap.from()` with a ScrollTrigger), carries the
> shared visibility fail-safe, and honors `prefers-reduced-motion`. Just import and call
> `useTextReveal` / `useCounter`. The code listing below is reference only.

Nothing to generate — the composable is already installed:

| File | Purpose |
|------|---------|
| `app/composables/useTextMotion.ts` | **Pre-installed, guarded** — `useTextReveal` + `useCounter` |

## Required imports

```ts
import SplitType from 'split-type'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onMounted, onUnmounted, type Ref } from 'vue'
```

## Animation modes

| Mode | Split by | Technique | Best for |
|---|---|---|---|
| `words` | Words | Slide up from clip-path mask | Headings, polished/energetic |
| `chars` | Characters | Staggered char entrance | Display headings, cinematic |
| `lines` | Lines | Line-by-line fade up | Body copy reveals |
| `scramble` | Characters | Randomise → resolve to real text | Hero eyebrow labels, energetic |

## Full composable: `app/composables/useTextMotion.ts`

```ts
import SplitType from 'split-type'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { onMounted, onUnmounted } from 'vue'

gsap.registerPlugin(ScrollTrigger)

type TextMode = 'words' | 'chars' | 'lines' | 'scramble'
type Intensity = 'calm' | 'polished' | 'energetic' | 'cinematic'

interface TextRevealOptions {
  mode?: TextMode
  intensity?: Intensity
  delay?: number
  stagger?: number
  once?: boolean
  triggerStart?: string
}

export function useTextReveal(
  getEl: () => HTMLElement | null,
  options: TextRevealOptions = {},
) {
  const {
    mode = 'words',
    intensity = 'polished',
    delay = 0,
    stagger,
    once = true,
    triggerStart = 'top 85%',
  } = options

  let split: SplitType | null = null
  let ctx: gsap.Context | null = null

  onMounted(() => {
    const el = getEl()
    if (!el) return

    if (mode === 'words' || mode === 'scramble') {
      split = new SplitType(el, { types: 'words', tagName: 'span' })
    } else if (mode === 'chars') {
      split = new SplitType(el, { types: 'chars,words', tagName: 'span' })
    } else {
      split = new SplitType(el, { types: 'lines', tagName: 'span' })
    }

    const units = (
      mode === 'chars' ? split.chars
      : mode === 'lines' ? split.lines
      : split.words
    ) as Element[]

    if (!units?.length) return

    // Wrap each unit in a clip container so text doesn't peek above baseline
    if (mode === 'words' || mode === 'chars') {
      units.forEach((u) => {
        const wrapper = document.createElement('span')
        wrapper.style.display = 'inline-block'
        // Tight display leading (0.95) shrinks the line box below the glyph em
        // box — an un-padded overflow:hidden clip cuts descenders/ascenders
        // (g, y, p, q). Padding enlarges the clip region; the compensating
        // negative margin keeps the margin box (line wrapping + rhythm)
        // identical on every viewport.
        wrapper.style.padding = '0.15em 0'
        wrapper.style.margin = '-0.15em 0'
        wrapper.style.overflow = 'hidden'
        u.parentNode?.insertBefore(wrapper, u)
        wrapper.appendChild(u)
      })
    }

    ctx = gsap.context(() => {
      const toggleActions = once ? 'play none none none' : 'play none none reverse'

      if (mode === 'scramble') {
        // Manual scramble: randomise chars then snap to real text
        const chars = '!<>-_\\/[]{}—=+*^?#'
        const originalText = el.textContent ?? ''
        let frame = 0
        let iteration = 0

        const trigger = ScrollTrigger.create({
          trigger: el,
          start: triggerStart,
          onEnter() {
            const interval = setInterval(() => {
              el.textContent = originalText
                .split('')
                .map((char, i) => {
                  if (i < iteration) return originalText[i]
                  if (char === ' ') return ' '
                  return chars[Math.floor(Math.random() * chars.length)]
                })
                .join('')
              if (iteration >= originalText.length) clearInterval(interval)
              if (frame % 2 === 0) iteration += 1 / 3
              frame++
            }, 30)
          },
        })

        return () => trigger.kill()
      }

      const defaultStagger =
        mode === 'chars'
          ? stagger ?? 0.03
          : mode === 'lines'
            ? stagger ?? 0.1
            : stagger ?? 0.07

      const fromY = intensity === 'calm' ? 15 : intensity === 'polished' ? 30 : 50
      const duration = intensity === 'calm' ? 0.5 : intensity === 'cinematic' ? 1 : 0.7
      const ease =
        intensity === 'cinematic'
          ? 'power4.out'
          : intensity === 'energetic'
            ? 'expo.out'
            : 'power3.out'

      // NEVER gsap.from() with a scrollTrigger — the from-values are read from computed
      // style at creation time and go stale after ScrollTrigger recalculates, leaving
      // text stuck invisible. Use explicit set() + to() target values instead.
      gsap.set(units, { opacity: 0, y: fromY })
      gsap.to(units, {
        opacity: 1,
        y: 0,
        duration,
        ease,
        stagger: defaultStagger,
        delay,
        scrollTrigger: {
          trigger: el,
          start: triggerStart,
          toggleActions,
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
    ctx = null
    split?.revert()
    split = null
  })
}

// ─── Animated counter ─────────────────────────────────────────────────────────

interface CounterOptions {
  from?: number
  duration?: number
  ease?: string
  formatter?: (val: number) => string
}

export function useCounter(
  getEl: () => HTMLElement | null,
  to: number,
  options: CounterOptions = {},
) {
  const {
    from = 0,
    duration = 2,
    ease = 'power2.out',
    formatter = (v) => Math.round(v).toLocaleString(),
  } = options

  let ctx: gsap.Context | null = null

  onMounted(() => {
    const el = getEl()
    if (!el) return

    ctx = gsap.context(() => {
      const obj = { val: from }
      gsap.to(obj, {
        val: to,
        duration,
        ease,
        onUpdate() {
          el.textContent = formatter(obj.val)
        },
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      })
    })
  })

  onUnmounted(() => {
    ctx?.revert()
    ctx = null
  })
}
```

## Usage examples

### Heading with word reveal
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTextReveal } from '~/composables/useTextMotion'

const headingEl = ref<HTMLElement | null>(null)
useTextReveal(() => headingEl.value, { mode: 'words', intensity: 'polished' })
</script>

<template>
  <h2 ref="headingEl" class="text-5xl font-heading font-bold leading-tight">
    We build things that matter
  </h2>
</template>
```

### Animated counter
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useCounter } from '~/composables/useTextMotion'

const statEl = ref<HTMLElement | null>(null)
useCounter(() => statEl.value, 98, {
  formatter: (v) => `${Math.round(v)}%`,
  duration: 2.5,
})
</script>

<template>
  <span ref="statEl" class="text-6xl font-heading font-black tabular-nums">0%</span>
</template>
```

### Scramble effect on an eyebrow label
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTextReveal } from '~/composables/useTextMotion'

const eyebrowEl = ref<HTMLElement | null>(null)
useTextReveal(() => eyebrowEl.value, { mode: 'scramble', intensity: 'energetic' })
</script>

<template>
  <p ref="eyebrowEl" class="text-sm font-mono uppercase tracking-widest text-primary">
    Award-winning design
  </p>
</template>
```

## Non-negotiables

1. **NEVER split text manually with `String.split(/\s+/)` or `innerHTML` manipulation** — always use `new SplitType(el, { types: '...' })`. Manual splitting: (a) has no `revert()` so orphan spans accumulate on navigation, (b) only handles spaces (no support for chars/lines), (c) breaks on emoji/ligatures. `split-type` is installed — use it.
2. `split-type` MUST have a matching `split.revert()` in `onUnmounted` — it mutates the DOM and leaves orphan `<span>` elements if not cleaned up
2. Words and chars mode: wrap each unit in an `overflow-hidden` `<span>` container so the slide-up animation clips cleanly at the baseline — without this wrapper, text flies in from below the line. **The wrapper MUST carry `padding: 0.15em 0` + `margin: -0.15em 0`** — with display leading below ~1em the line box is smaller than the glyph em box and an un-padded clip cuts descenders/ascenders (`g`, `y`, `p`, `q`). The padding enlarges the clip region; the compensating negative margin keeps the margin box — and therefore line wrapping and vertical rhythm on mobile — identical.
3. Scramble mode bypasses SplitType entirely — it operates on raw `textContent` directly; restore original text on unmount via `split?.revert()` + re-set `el.textContent`
4. Intensity drives duration + easing — read from SPEC.md, never hardcode in the template
5. **Never split by characters alone.** `chars` mode MUST use `types: 'words,chars'` — the char-level slide-up works because each character wraps inside a nowrap word span; `types: 'chars'` alone wraps every char in its own span and breaks words across lines mid-word
6. Every `useTextReveal` / `useCounter` call must produce a `ctx.revert()` in `onUnmounted`
7. Import `SplitType` as a default import: `import SplitType from 'split-type'` — it has no named exports
8. Never apply `useTextReveal` to elements with child Vue components — SplitType wraps text nodes and will break reactive bindings inside the target element
9. Counter initial display value (`el.textContent`) should show the `from` value (e.g. `0`) before hydration so there is no flash of the final number
10. **`useTextMotion.ts` is pre-installed and guarded — never create or rewrite it.** Import `useTextReveal` / `useCounter`.
11. **Never `gsap.from()` with a `scrollTrigger`** — use `gsap.set()` + `gsap.to()` with explicit target values (mirrors [scroll-motion](../scroll-motion/SKILL.md) non-negotiable #13). `gsap.from` reads target values from computed style at creation time, which go stale after ScrollTrigger recalculation and leave text permanently invisible.
12. **Honor `prefers-reduced-motion`:** the installed composable leaves text fully visible and unsplit (no reveal, no scramble) when reduced. `useCounter` snaps to its final value. Never leave text hidden.
13. **Reveals carry the shared `ensureRevealFailsafe`** so a miscalculated ScrollTrigger can never leave a heading invisible; the global `motion-failsafe` plugin is an additional backstop.
