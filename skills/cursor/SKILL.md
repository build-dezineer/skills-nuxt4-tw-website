---
name: cursor
description: >-
  Custom cursor overlay for a premium interactive feel: `AppCursor.vue` renders a dot +
  ring follower with GSAP `quickTo`, magnetic hover via `data-magnetic`, cursor label
  morphing via `data-cursor`, and auto-hide on touch devices. Use for `energetic` or
  `cinematic` brands that want a signature cursor interaction.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "interaction, cursor"
  stack: "nuxt4, vue3, tailwind4, gsap, vueuse"
---

# Cursor Skill

## When to use
When the SPEC specifies `animationIntensity` of `energetic` or `cinematic`, or when the brand calls for a premium interactive feel. Custom cursors are a signature Awwward detail. Skip this skill for `calm` intensity or when the SPEC does not mention a custom cursor.


> **Guard your refs before animating.** `sectionRef.value` can be null when `onMounted` runs; a tween with no targets fails silently and the section never animates. Start motion setup with `if (!sectionRef.value) return`.


> **Never call `context.selector()`.** It only exists on a *scoped* context and is `undefined` on `gsap.matchMedia()` / `gsap.context(fn)`, where calling it throws. Query through the section’s template ref instead: `sectionRef.value?.querySelectorAll('.item') ?? []`.

Provides:
- `AppCursor.vue` — the cursor overlay (dot + ring, morphs on hover)
- Magnetic effect via `data-magnetic` attribute on any element
- Automatic hide on touch devices

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/shared/AppCursor.vue` | Fixed cursor overlay, added once to `app/layouts/default.vue` |

The cursor is mounted once in the layout. Individual elements opt into the magnetic effect by adding `data-magnetic` to their root element.

## Required imports

```ts
import gsap from 'gsap'
import { usePointer } from '@vueuse/core'
import { onMounted, onUnmounted, ref } from 'vue'
```

## Component: `app/components/shared/AppCursor.vue`

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { usePointer } from '@vueuse/core'
import { prefersReducedMotion } from '~/composables/useScrollMotion'

const dotEl = ref<HTMLElement | null>(null)
const ringEl = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const isHovering = ref(false)
const hoverLabel = ref('')

// usePointer from VueUse — tracks mouse position reactively
const { x: pointerX, y: pointerY, pointerType } = usePointer()

// Hide on touch devices
const isTouch = pointerType.value === 'touch'

let quickX: gsap.QuickToFunc | null = null
let quickY: gsap.QuickToFunc | null = null
let ringQuickX: gsap.QuickToFunc | null = null
let ringQuickY: gsap.QuickToFunc | null = null

function onMouseEnter() { isVisible.value = true }
function onMouseLeave() { isVisible.value = false }

function onMouseMove(e: MouseEvent) {
  if (!dotEl.value || !ringEl.value) return
  quickX?.(e.clientX)
  quickY?.(e.clientY)
  ringQuickX?.(e.clientX)
  ringQuickY?.(e.clientY)
}

// ─── Hover state detection ───────────────────────────────────────────────────

function onHoverStart(e: MouseEvent) {
  const target = (e.target as Element).closest('[data-cursor]') as HTMLElement | null
  if (target) {
    isHovering.value = true
    hoverLabel.value = target.dataset.cursor ?? ''
    gsap.to(ringEl.value, { scale: 2.5, duration: 0.3, ease: 'power3.out' })
    gsap.to(dotEl.value, { scale: 0.4, duration: 0.2 })
  }
}

function onHoverEnd(e: MouseEvent) {
  const target = (e.target as Element).closest('[data-cursor]')
  if (target) {
    isHovering.value = false
    hoverLabel.value = ''
    gsap.to(ringEl.value, { scale: 1, duration: 0.3, ease: 'power3.out' })
    gsap.to(dotEl.value, { scale: 1, duration: 0.2 })
  }
}

// ─── Magnetic effect ─────────────────────────────────────────────────────────

const magneticEls: { el: HTMLElement; handler: (e: MouseEvent) => void; reset: () => void }[] = []

function initMagnetic() {
  const els = document.querySelectorAll<HTMLElement>('[data-magnetic]')
  els.forEach((el) => {
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      gsap.to(el, { x: dx * 0.35, y: dy * 0.35, duration: 0.4, ease: 'power3.out' })
    }
    const reset = () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' })
    }
    el.addEventListener('mousemove', handler)
    el.addEventListener('mouseleave', reset)
    magneticEls.push({ el, handler, reset })
  })
}

onMounted(() => {
  // Reduced motion or touch: do NOT run the custom cursor. The native cursor is
  // hidden only while `has-custom-cursor` is present (see global style below), so
  // skipping activation here means these users always keep a real cursor.
  if (isTouch || prefersReducedMotion() || !dotEl.value || !ringEl.value) return
  document.documentElement.classList.add('has-custom-cursor')

  quickX = gsap.quickTo(dotEl.value, 'x', { duration: 0.1, ease: 'power3.out' })
  quickY = gsap.quickTo(dotEl.value, 'y', { duration: 0.1, ease: 'power3.out' })
  ringQuickX = gsap.quickTo(ringEl.value, 'x', { duration: 0.5, ease: 'power3.out' })
  ringQuickY = gsap.quickTo(ringEl.value, 'y', { duration: 0.5, ease: 'power3.out' })

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseenter', onMouseEnter)
  document.addEventListener('mouseleave', onMouseLeave)
  document.addEventListener('mouseover', onHoverStart)
  document.addEventListener('mouseout', onHoverEnd)

  initMagnetic()
})

onUnmounted(() => {
  document.documentElement.classList.remove('has-custom-cursor')
  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseenter', onMouseEnter)
  document.removeEventListener('mouseleave', onMouseLeave)
  document.removeEventListener('mouseover', onHoverStart)
  document.removeEventListener('mouseout', onHoverEnd)
  magneticEls.forEach(({ el, handler, reset }) => {
    el.removeEventListener('mousemove', handler)
    el.removeEventListener('mouseleave', reset)
    gsap.set(el, { x: 0, y: 0 })
  })
  magneticEls.length = 0
})
</script>

<template>
  <!-- Hidden on touch devices (pointer-type check via CSS) -->
  <div class="pointer-events-none fixed inset-0 z-[9999] hidden md:block" aria-hidden="true">
    <!-- Dot — fast follower -->
    <div
      ref="dotEl"
      :class="[
        'absolute -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-foreground transition-opacity duration-150',
        isVisible ? 'opacity-100' : 'opacity-0',
      ]"
    />

    <!-- Ring — slow follower -->
    <div
      ref="ringEl"
      :class="[
        'absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-foreground/40 transition-opacity duration-300 flex items-center justify-center',
        isVisible ? 'opacity-100' : 'opacity-0',
      ]"
    >
      <span
        v-if="hoverLabel"
        class="text-[9px] font-mono uppercase tracking-wider text-foreground whitespace-nowrap"
      >{{ hoverLabel }}</span>
    </div>
  </div>
</template>

<style>
/* The native cursor is hidden ONLY while the custom cursor is active. Under
   prefers-reduced-motion or on touch, `has-custom-cursor` is never added, so those
   users always keep a real cursor. Do NOT hard-code `cursor-none` on elements. */
html.has-custom-cursor,
html.has-custom-cursor * {
  cursor: none;
}
</style>
```

## Add to `app/layouts/default.vue`

```vue
<script setup lang="ts">
import AppCursor from '~/components/shared/AppCursor.vue'
import { useLenis } from '~/composables/useScrollMotion'
useLenis()
</script>

<template>
  <AppCursor />
  <slot />
</template>
```

## Opt-in attributes

| Attribute | Effect |
|---|---|
| `data-magnetic` | Element pulls cursor toward its centre on hover |
| `data-cursor="View"` | Ring expands and shows "View" label on hover |
| `data-cursor="Drag"` | Ring expands and shows "Drag" |
| `data-cursor=""` | Ring expands with no label (link hover) |

```vue
<!-- Magnetic CTA button -->
<button data-magnetic data-cursor="Let's Talk" class="btn-primary">
  Contact Us
</button>

<!-- Image that shows "View" on hover — the native cursor is hidden automatically
     while the custom cursor is active; do NOT add a static `cursor-none` class -->
<div data-cursor="View">
  <img data-media-id="project-preview" alt="Project preview" decoding="async" class="aspect-[4/3] w-full object-cover" />
</div>
```

## Non-negotiables

1. `AppCursor.vue` is rendered **once** in the default layout — never per-page or per-section
2. Use `gsap.quickTo` for dot position (fast, 0.1s) and ring position (lagged, 0.5s) — never `requestAnimationFrame` or Vue watchers
3. The cursor `<div>` must be `pointer-events-none` — clicking through it is essential
4. Hide on touch: check `usePointer().pointerType` and `@media (hover: none)` — never show on mobile
5. All `document` event listeners added in `onMounted` must be removed in `onUnmounted`
6. Magnetic effect: use `elastic.out(1, 0.5)` on the reset (mouse leave) for the bounce-back feel
7. Magnetic elements return to `{ x: 0, y: 0 }` in `onUnmounted` cleanup to avoid stuck transforms
8. `data-cursor` label is read from `closest('[data-cursor]')` — supports nested markup inside the trigger
9. Ring scale expansion uses CSS `transform: scale()` via GSAP — never change `width`/`height` which causes layout reflow
10. `z-[9999]` ensures the cursor is always above modals, overlays, and navigation
11. **Honor `prefers-reduced-motion` (and touch):** do not activate the custom cursor; return early in `onMounted`. Import `prefersReducedMotion` from `~/composables/useScrollMotion` (pre-installed).
12. **Never hard-code `cursor: none` / the `cursor-none` class on elements.** The native cursor must be hidden ONLY while the custom cursor is active — gate it behind `html.has-custom-cursor`, a class the component adds on activation and removes on unmount. Otherwise reduced-motion/touch users are left with no visible cursor.
