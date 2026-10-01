---
name: scroll-motion
description: >-
  Foundational scroll animation layer: `useLenis()` smooth scroll, `useScrollReveal()`
  GSAP ScrollTrigger reveals keyed to `animationIntensity`, `useParallax()` depth
  parallax, and `useHorizontalTrack()` pinned horizontal sections. Use when a page needs
  scroll-driven motion, smooth scrolling, reveal-on-scroll, or cinematic pinned tracks.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "motion, scroll, animation"
  stack: "nuxt4, vue3, tailwind4, gsap, lenis"
---

# Scroll Motion Skill

## When to use
Any website that needs scroll-driven animations — which is every Awwward-class site. This skill is the foundational motion layer. Initialize it first; all other section skills depend on it for scroll reveals and parallax.


> **Guard your refs before animating.** `sectionRef.value` can be null when `onMounted` runs; a tween with no targets fails silently and the section never animates. Start motion setup with `if (!sectionRef.value) return`.


> **Motion targets must be guarded.** A tween whose target list resolves to nothing plays silently and never animates. Rules: (1) resolve the section root via a template ref, falling back to a known-good element (`headlineRef.value?.closest('section')`) — never assume the root ref is populated; (2) pass targets as a lazy function `() => root.value?.querySelectorAll('.item') ?? []` so GSAP resolves them at render time; (3) early-bail when the ref is null: `if (!root.value) { console.warn('motion: section ref unresolved'); return }`. Empty targets are now a build failure (motion-target-watch), so guard them.


> **Never call `context.selector()`.** It only exists on a *scoped* context and is `undefined` on `gsap.matchMedia()` / `gsap.context(fn)`, where calling it throws. Query through the section’s template ref instead: `sectionRef.value?.querySelectorAll('.item') ?? []`.


> **Never pass a raw template ref as the `gsap.context()` scope.** `gsap.context(fn, sectionRef)` looks valid but is broken: GSAP resolves scope elements via `.current`/`.nativeElement`, never Vue 3's `.value`, so the scope silently becomes an empty detached element and every selector target inside animates nothing. Pass `sectionRef.value ?? undefined` and resolve targets explicitly (`sectionRef.value?.querySelectorAll('.item') ?? []`).

Provides three composables:
- `useLenis()` — smooth inertial scroll, called once in the default layout
- `useScrollReveal()` — GSAP ScrollTrigger reveals keyed to `animationIntensity`
- `useParallax()` — depth parallax on images and decorative elements
- `useHorizontalTrack()` — pinned horizontal scroll section (cinematic intensity only)

## Architecture

> **⚠️ PRE-INSTALLED — DO NOT CREATE OR REWRITE THIS FILE.**
> `app/composables/useScrollMotion.ts` already exists in the scaffold, is guarded
> (`@guard:use-scroll-motion`), and contains the hardened implementation (fail-safe
> visibility net + `prefers-reduced-motion` support). Just **import and call** its
> composables. Attempting to recreate it will fail the guard check. The listing below
> documents the installed API/behaviour for reference — treat the installed file as
> authoritative.

| File | Purpose |
|------|---------|
| `app/composables/useScrollMotion.ts` | All scroll motion composables (pre-installed, guarded) |

Also pre-installed: `app/plugins/motion-failsafe.client.ts` (`@guard:motion-failsafe`) — a
model-independent runtime net that force-reveals any on-screen element left invisible by a
broken/never-firing animation. It is a backstop; still author reveals correctly.

Exported helpers you can reuse: `prefersReducedMotion()` and `ensureRevealFailsafe()`.

Called from:
- `app/layouts/default.vue` — `useLenis()` once at root
- Individual section components — `useScrollReveal()`, `useParallax()`

## Required imports

```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { onMounted, onUnmounted } from 'vue'
```

## Animation intensity reference

Read `animationIntensity` from the project SPEC.md and pass it to `useScrollReveal`:

| Intensity | Feel | What it does |
|---|---|---|
| `calm` | Accessible, minimal | Opacity + 20px Y, 600ms, no stagger |
| `polished` | Professional | Opacity + 40px Y, spring ease, 0.08s stagger |
| `energetic` | Brand-forward | Clip-path wipe + subtle rotation, 0.12s stagger |
| `cinematic` | Immersive | Opacity + 80px Y + scale, 1s, 0.15s stagger; enables pinned horizontal tracks |

## Full composable: `app/composables/useScrollMotion.ts`

```ts
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import { onMounted, onUnmounted } from 'vue'

gsap.registerPlugin(ScrollTrigger)

// ─── Lenis smooth scroll ─────────────────────────────────────────────────────
// Call once in app/layouts/default.vue — never in individual sections

let _lenis: Lenis | null = null
let _tickerFn: ((time: number) => void) | null = null

export function useLenis() {
  onMounted(() => {
    _lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })

    _tickerFn = (time) => { _lenis?.raf(time * 1000) }
    gsap.ticker.add(_tickerFn)
    gsap.ticker.lagSmoothing(0)
    _lenis.on('scroll', ScrollTrigger.update)
    ScrollTrigger.refresh()
  })

  onUnmounted(() => {
    if (_tickerFn) {
      gsap.ticker.remove(_tickerFn)
      _tickerFn = null
    }
    _lenis?.destroy()
    _lenis = null
  })
}

// ─── Scroll reveal ───────────────────────────────────────────────────────────

type Intensity = 'calm' | 'polished' | 'energetic' | 'cinematic'

interface RevealOptions {
  intensity?: Intensity
  stagger?: number
  delay?: number
  once?: boolean
  start?: string
}

export function useScrollReveal(
  getEls: () => Element | Element[] | NodeListOf<Element> | null,
  options: RevealOptions = {},
) {
  const {
    intensity = 'polished',
    stagger,
    delay = 0,
    once = true,
    start = 'top 85%',
  } = options

  let ctx: gsap.Context | null = null

  onMounted(() => {
    const raw = getEls()
    if (!raw) return
    const els: Element[] =
      raw instanceof NodeList
        ? Array.from(raw)
        : Array.isArray(raw)
          ? raw
          : [raw]
    if (!els.length) return

    ctx = gsap.context(() => {
      const trigger = els[0] as Element
      const toggleActions = once ? 'play none none none' : 'play none none reverse'

      if (intensity === 'calm') {
        gsap.set(els, { opacity: 0, y: 20 })
        gsap.to(els, {
          opacity: 1, y: 0,
          duration: 0.6,
          ease: 'power2.out',
          delay,
          scrollTrigger: { trigger, start: 'top 88%', toggleActions },
        })
      } else if (intensity === 'polished') {
        gsap.set(els, { opacity: 0, y: 40 })
        gsap.to(els, {
          opacity: 1, y: 0,
          duration: 0.7,
          ease: 'power3.out',
          stagger: stagger ?? 0.08,
          delay,
          scrollTrigger: { trigger, start, toggleActions },
        })
      } else if (intensity === 'energetic') {
        gsap.set(els, { clipPath: 'inset(100% 0 0 0)', opacity: 1 })
        gsap.to(els, {
          clipPath: 'inset(0% 0 0 0)',
          duration: 0.6,
          ease: 'expo.out',
          stagger: stagger ?? 0.12,
          delay,
          scrollTrigger: { trigger, start: 'top 82%', toggleActions },
        })
        gsap.set(els, { rotation: 1.5 })
        gsap.to(els, {
          rotation: 0,
          duration: 0.6,
          ease: 'expo.out',
          stagger: stagger ?? 0.12,
          delay,
        })
      } else {
        // cinematic
        gsap.set(els, { opacity: 0, y: 80, scale: 0.96 })
        gsap.to(els, {
          opacity: 1, y: 0, scale: 1,
          duration: 1,
          ease: 'power4.out',
          stagger: stagger ?? 0.15,
          delay,
          scrollTrigger: { trigger, start: 'top 80%', toggleActions },
        })
      }
    })
  })

  onUnmounted(() => {
    ctx?.revert()
    ctx = null
  })
}

// ─── Parallax ────────────────────────────────────────────────────────────────
// Always wrap the parallaxed element in overflow-hidden

interface ParallaxOptions {
  speed?: number      // 0.1 = subtle, 0.4 = strong. Default: 0.2
  direction?: 'y' | 'x'
}

export function useParallax(
  getEl: () => Element | null,
  options: ParallaxOptions = {},
) {
  const { speed = 0.2, direction = 'y' } = options
  let ctx: gsap.Context | null = null

  onMounted(() => {
    const el = getEl()
    if (!el) return
    const htmlEl = el as HTMLElement

    ctx = gsap.context(() => {
      const distance = direction === 'y'
        ? htmlEl.offsetHeight * speed
        : htmlEl.offsetWidth * speed

      gsap.fromTo(
        el,
        { [direction]: -distance / 2 },
        {
          [direction]: distance / 2,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      )
    })
  })

  onUnmounted(() => {
    ctx?.revert()
    ctx = null
  })
}

// ─── Pinned horizontal track (cinematic intensity only) ──────────────────────

interface HorizontalTrackOptions {
  trackSelector: string   // CSS selector for the inner scrolling strip
}

export function useHorizontalTrack(
  getWrapper: () => Element | null,
  options: HorizontalTrackOptions,
) {
  let ctx: gsap.Context | null = null

  onMounted(() => {
    const wrapper = getWrapper()
    if (!wrapper) return
    const htmlWrapper = wrapper as HTMLElement
    const track = wrapper.querySelector<HTMLElement>(options.trackSelector)
    if (!track) return

    ctx = gsap.context(() => {
      gsap.to(track, {
        x: () => -(track.scrollWidth - htmlWrapper.clientWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: wrapper,
          pin: true,
          scrub: 1,
          end: () => `+=${track.scrollWidth - htmlWrapper.clientWidth}`,
          invalidateOnRefresh: true,
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

## Usage in `app/layouts/default.vue`

```vue
<script setup lang="ts">
import { useLenis } from '~/composables/useScrollMotion'
useLenis()
</script>
```

## Usage in a section component

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useScrollReveal, useParallax } from '~/composables/useScrollMotion'

const cardsEl = ref<HTMLElement | null>(null)
const imageEl = ref<HTMLElement | null>(null)

useScrollReveal(() => cardsEl.value?.querySelectorAll('.reveal-item') ?? null, {
  intensity: 'polished',   // from SPEC animationIntensity
  stagger: 0.1,
})

useParallax(() => imageEl.value, { speed: 0.25 })
</script>

<template>
  <section class="py-24">
    <div ref="cardsEl" class="grid grid-cols-3 gap-6">
      <div class="reveal-item">…</div>
      <div class="reveal-item">…</div>
      <div class="reveal-item">…</div>
    </div>
    <div class="overflow-hidden rounded-xl mt-12">
      <div ref="imageEl">
        <img data-media-id="feature-image" alt="Feature image" width="1200" height="675" decoding="async" class="aspect-video w-full object-cover" />
      </div>
    </div>
  </section>
</template>
```

## Non-negotiables

1. `useLenis()` is called **once** in `app/layouts/default.vue` only — never inside page components or sections. **This is the first line in default.vue's `<script setup>` — it must always be generated.**
2. `gsap.registerPlugin(ScrollTrigger)` is at module level in `useScrollMotion.ts` — not inside `onMounted`
3. Every composable call creates a `gsap.Context` and calls `ctx.revert()` in `onUnmounted` — no exceptions
4. Parallax elements must be inside an `overflow-hidden` wrapper — otherwise the scale/translate peeks beyond the container boundary
5. `once: true` is the default — elements animate in once and stay. Use `once: false` only when the SPEC explicitly specifies repeating animations
6. Always pass `invalidateOnRefresh: true` to horizontal track and parallax ScrollTriggers so they recalculate on resize
7. `useHorizontalTrack` is used **only** when `animationIntensity === 'cinematic'`
8. `gsap.ticker.lagSmoothing(0)` is required to prevent frame-skip glitches when Lenis is active
9. Read `animationIntensity` from SPEC.md — never hardcode it in the component
10. Explicit imports only: `import { useScrollReveal } from '~/composables/useScrollMotion'` — no Nuxt auto-import reliance
11. **NEVER rewrite `useScrollReveal` as a factory returning `{ create }`.** The function must be called directly with a getter and options, exactly as documented. The factory pattern breaks the ScrollTrigger trigger: passing a NodeList to `scrollTrigger.trigger` is invalid — GSAP requires a single `Element`. The result is all animated elements stay at `opacity: 0` forever, producing empty white sections.
12. Inside `useScrollReveal`, the ScrollTrigger `trigger` **must** be `els[0]` (the first element in the set) — never the full array or NodeList. GSAP's `to()` animates all `els`, but the trigger only needs one anchor point to know when to fire.
13. Use `gsap.set()` + `gsap.to()` (NEVER `gsap.from()`) for all scroll-triggered `useScrollReveal` animations. `gsap.from()` reads the target "to" values from the element's computed style at creation time, which becomes stale after ScrollTrigger recalculates (Lenis init, SPA remounts, DOM mutations). `gsap.set()` + `gsap.to()` uses explicit target values (`opacity: 1, y: 0, scale: 1`) that are immune to recalculation.
14. **SPA navigation must refresh ScrollTrigger.** In `app/layouts/default.vue`, import `ScrollTrigger` and call `ScrollTrigger.refresh()` after page navigation. Double `requestAnimationFrame` ensures child components have mounted and registered their ScrollTriggers before the refresh:

```typescript
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useRouter } from '#imports'

const router = useRouter()
router.afterEach(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => ScrollTrigger.refresh())
  })
})
```

Without this, sections may stay invisible after navigating between pages because newly created ScrollTriggers aren't positioned correctly.

15. **`useScrollMotion.ts` is pre-installed and guarded — never create or rewrite it.** Import its composables. The installed version already includes items 16–18 below.
16. **Every `useScrollReveal` reveal carries a visibility fail-safe** (`ensureRevealFailsafe`): the reveal tween flips a `revealed` flag in `onComplete`, and an `IntersectionObserver` forces the element visible if it is on screen but never completed (~3s window). Content must never depend *solely* on a ScrollTrigger firing. This works alongside the global `motion-failsafe` plugin.
17. **Honor `prefers-reduced-motion`.** Reveals resolve to their final visible state instantly (no animation, no trigger); `useParallax` is inert (it only translates, never hides); `useHorizontalTrack` MUST fall back to native `overflow-x: auto` (never leave a pinned/translated strip unreachable); `useLenis` falls back to native scroll.
18. **The fail-safe uses a completion flag, not an opacity check** — the `energetic` intensity hides via `clip-path` at `opacity:1`, so a style-based check would miss it.
19. **NEVER add a CSS rule that hides reveal targets** (e.g. `.stagger-item { opacity: 0 }` in `<style scoped>`). `useScrollReveal` already sets the hidden state itself via `gsap.set()`. A CSS hidden state is redundant, and if the reveal does not run — for example because the elements had not rendered yet — the CSS keeps them invisible with nothing to undo it.
20. **NEVER simulate async loading for static content.** Do not write `loading = ref(true)` with `await new Promise(r => setTimeout(...))` for copy that is hard-coded in the component. It renders skeletons first, so scroll reveals wired at mount find no elements and silently do nothing. Render static content directly.
