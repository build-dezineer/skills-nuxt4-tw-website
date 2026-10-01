---
name: page-transitions
description: >-
  GSAP-powered Nuxt route transitions: fade or clip-path slide modes keyed to the
  `pageTransitions` wizard answer, plus a cinematic full-screen colour overlay sweep
  registered through router hooks in `default.vue`. Use when a site should feel
  continuously choreographed between pages.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "motion, transitions"
  stack: "nuxt4, vue3, tailwind4, gsap"
---

# Page Transitions Skill

## When to use
When the SPEC specifies `pageTransitions` of `fade` or `slide`, or `animationIntensity` of `cinematic`. Skip for `instant` transitions — the default Nuxt behaviour with no transition applied is correct.


> **Never call `context.selector()`.** It only exists on a *scoped* context and is `undefined` on `gsap.matchMedia()` / `gsap.context(fn)`, where calling it throws. Query through the section’s template ref instead: `sectionRef.value?.querySelectorAll('.item') ?? []`.

Provides GSAP-powered page transitions using Nuxt's `<NuxtPage>` transition hooks.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/plugins/page-transitions.client.ts` | Registers GSAP page transition hooks via Nuxt plugin |

The plugin is picked up automatically by Nuxt's plugin system.

## Transition modes by SPEC setting

| `pageTransitions` | `animationIntensity` | What happens |
|---|---|---|
| `instant` | any | No transition — do not create this plugin |
| `fade` | calm / polished | Opacity 0→1 on enter, 1→0 on leave, 300ms |
| `fade` | energetic / cinematic | Opacity fade + slight Y translate |
| `slide` | polished | Horizontal clip-path wipe |
| `slide` | cinematic | Full-screen colour overlay sweeps left-to-right, then reveals new page |

## Plugin: `app/plugins/page-transitions.client.ts`

```ts
import gsap from 'gsap'
import { prefersReducedMotion } from '~/composables/useScrollMotion'

export default defineNuxtPlugin((nuxtApp) => {
  // Read from SPEC: 'fade' | 'slide'
  // This file is generated with the correct mode baked in based on wizard answers
  const MODE: string = 'slide'                     // ← replaced by planner with 'fade' or 'slide'
  const INTENSITY: string = 'cinematic'            // ← replaced by planner with actual value

  nuxtApp.hook('page:transition:finish', () => {
    window.scrollTo(0, 0)
  })

  // Expose hooks so app.vue <NuxtPage> can reference them
  nuxtApp.provide('pageTransition', {
    onBeforeEnter(el: Element) {
      // Reduced motion: never hide the incoming page.
      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1, y: 0, clipPath: 'none' })
        return
      }
      if (MODE === 'fade') {
        gsap.set(el, { opacity: 0, y: INTENSITY === 'calm' ? 0 : 20 })
      } else {
        // slide — element starts clipped from right
        gsap.set(el, { clipPath: 'inset(0 100% 0 0)' })
      }
    },

    onEnter(el: Element, done: () => void) {
      // Reduced motion: show instantly and resolve — MUST still call done() or the
      // page never mounts.
      if (prefersReducedMotion()) {
        gsap.set(el, { opacity: 1, y: 0, clipPath: 'none' })
        done()
        return
      }
      if (MODE === 'fade') {
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: INTENSITY === 'cinematic' ? 0.8 : 0.4,
          ease: INTENSITY === 'cinematic' ? 'power4.out' : 'power2.out',
          onComplete: done,
          onInterrupt: done,   // a preempted enter must still resolve, and it ends visible
        })
      } else {
        gsap.to(el, {
          clipPath: 'inset(0 0% 0 0)',
          duration: 0.7,
          ease: 'expo.inOut',
          onComplete: done,
          onInterrupt: done,
        })
      }
    },

    onLeave(el: Element, done: () => void) {
      // Reduced motion: resolve immediately so the next page can enter.
      if (prefersReducedMotion()) {
        done()
        return
      }
      if (MODE === 'fade') {
        gsap.to(el, {
          opacity: 0,
          y: INTENSITY === 'calm' ? 0 : -20,
          duration: INTENSITY === 'cinematic' ? 0.5 : 0.3,
          ease: 'power2.in',
          onComplete: done,
          onInterrupt: done,   // under mode:'out-in' a stalled leave blocks the incoming page
        })
      } else {
        gsap.to(el, {
          clipPath: 'inset(0 0 0 100%)',
          duration: 0.5,
          ease: 'expo.in',
          onComplete: done,
          onInterrupt: done,
        })
      }
    },
  })
})
```

## `app/app.vue` — wiring the transition

```vue
<script setup lang="ts">
import { useNuxtApp } from '#imports'
const { $pageTransition } = useNuxtApp()
</script>

<template>
  <NuxtLayout>
    <NuxtPage
      :transition="{
        mode: 'out-in',
        appear: true,
        onBeforeEnter: $pageTransition?.onBeforeEnter,
        onEnter: $pageTransition?.onEnter,
        onLeave: $pageTransition?.onLeave,
      }"
    />
  </NuxtLayout>
</template>
```

## Cinematic wipe overlay variant

For `animationIntensity: cinematic` + `pageTransitions: slide`, add a full-screen overlay that sweeps across. Add this to `app/layouts/default.vue`:

```vue
<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useRouter } from '#imports'
import AppCursor from '~/components/shared/AppCursor.vue'
import { useLenis } from '~/composables/useScrollMotion'

useLenis()

const overlayEl = ref<HTMLElement | null>(null)
const router = useRouter()

const unsubBefore = router.beforeEach(() => {
  return new Promise<void>((resolve) => {
    gsap.fromTo(
      overlayEl.value,
      { scaleX: 0, transformOrigin: 'left center' },
      {
        scaleX: 1,
        duration: 0.5,
        ease: 'expo.inOut',
        onComplete: () => resolve(),
      },
    )
  })
})

const unsubAfter = router.afterEach(() => {
  gsap.fromTo(
    overlayEl.value,
    { scaleX: 1, transformOrigin: 'right center' },
    { scaleX: 0, duration: 0.5, ease: 'expo.inOut' },
  )
})

onUnmounted(() => {
  unsubBefore()
  unsubAfter()
})
</script>

<template>
  <!-- Transition overlay (cinematic mode) -->
  <div
    ref="overlayEl"
    class="fixed inset-0 z-[9998] bg-foreground pointer-events-none origin-left scale-x-0"
    aria-hidden="true"
  />

  <AppCursor />
  <slot />
</template>
```

## Non-negotiables

1. The plugin file must be named `*.client.ts` — GSAP and DOM access are browser-only
2. `page:transition:finish` hook calls `window.scrollTo(0, 0)` — always scroll to top on page change
3. `mode: 'out-in'` on `<NuxtPage>` ensures the leaving page fully exits before the entering page starts
4. `appear: true` triggers the enter transition on the initial page load — gives the first page a polished entrance
5. Do NOT create this plugin when `pageTransitions === 'instant'` — the correct behaviour is simply no plugin
6. The cinematic overlay uses `scaleX` not `width` — `transform` animates on the compositor thread (no layout reflow)
7. `transformOrigin: 'left center'` on enter, `'right center'` on leave — the overlay enters from left and exits to right
8. `router.beforeEach` returns a `Promise` so navigation is blocked until the leave animation completes
9. Overlay `z-index` must be below cursor (`z-[9999]`) but above all page content (`z-[9998]`)
10. The `MODE` and `INTENSITY` constants in the plugin are replaced by the planner with actual values from wizard answers — never leave them as literals in production
11. **Every transition hook must always call `done()` and land the page at the visible state.** Add `onInterrupt: done` alongside `onComplete: done` on both `onEnter` and `onLeave`, and in the reduced-motion branch call `done()` synchronously after setting the page visible. A preempted (rapid navigation) or reduced-motion transition must never leave a blank page — under `mode: 'out-in'` a stalled `onLeave` also blocks the incoming page. Import `prefersReducedMotion` from `~/composables/useScrollMotion` (pre-installed).
