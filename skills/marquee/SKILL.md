---
name: marquee
description: >-
  Infinite horizontal ticker via `MarqueeTrack.vue`, with a CSS-animation mode (default,
  best performance) and a GSAP mode, plus configurable speed, direction, gap, and
  pause-on-hover. Use for logo clouds, quote strips, tag tickers, and announcement bars.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "motion, marquee"
  stack: "nuxt4, vue3, tailwind4, gsap"
---

# Marquee Skill

## When to use
Infinite horizontal ticker strips — used for logo clouds, testimonial quotes, skill tags, announcement bars, or accent text between sections. A single `MarqueeTrack.vue` component handles all cases via props.


> **Guard your refs before animating.** `sectionRef.value` can be null when `onMounted` runs; a tween with no targets fails silently and the section never animates. Start motion setup with `if (!sectionRef.value) return`.


> **Never call `context.selector()`.** It only exists on a *scoped* context and is `undefined` on `gsap.matchMedia()` / `gsap.context(fn)`, where calling it throws. Query through the section’s template ref instead: `sectionRef.value?.querySelectorAll('.item') ?? []`.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/shared/MarqueeTrack.vue` | Infinite scroll ticker, CSS-only or GSAP-enhanced |

## Required imports

```ts
import { ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
```

## Component: `app/components/shared/MarqueeTrack.vue`

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { cn } from '~/utils/cn'

interface Props {
  speed?: number         // px/s. Default: 60
  direction?: 'left' | 'right'
  pauseOnHover?: boolean // Default: true
  gap?: number           // Gap between items in rem. Default: 4
  duplicates?: number    // How many times to clone the slot content. Default: 2
  gsapMode?: boolean     // false = CSS animation (better perf for simple strips); true = GSAP ticker
}

const props = withDefaults(defineProps<Props>(), {
  speed: 60,
  direction: 'left',
  pauseOnHover: true,
  gap: 4,
  duplicates: 2,
  gsapMode: false,
})

const trackEl = ref<HTMLElement | null>(null)
const isPaused = ref(false)

// CSS animation approach (default — best for simple logo clouds)
const animationDuration = computed(() => {
  if (!trackEl.value || props.gsapMode) return '20s'
  const width = trackEl.value.scrollWidth / (props.duplicates + 1)
  return `${width / props.speed}s`
})

const cssVars = computed(() => ({
  '--marquee-duration': animationDuration.value,
  '--marquee-gap': `${props.gap}rem`,
  '--marquee-clones': String(props.duplicates + 1),
}))

// GSAP ticker approach (for pauseOnHover with smooth resume, speed control at runtime)
let tween: gsap.core.Tween | null = null

function initGsap() {
  if (!trackEl.value || !props.gsapMode) return
  const totalWidth = (trackEl.value.scrollWidth / (props.duplicates + 1))
  const startX = props.direction === 'left' ? 0 : -totalWidth

  gsap.set(trackEl.value, { x: startX })
  tween = gsap.to(trackEl.value, {
    x: props.direction === 'left' ? -totalWidth : 0,
    duration: totalWidth / props.speed,
    ease: 'none',
    repeat: -1,
    modifiers: {
      x: gsap.utils.unitize((x: number) => {
        return ((parseFloat(x) % totalWidth) + totalWidth) % totalWidth * (props.direction === 'left' ? -1 : 1)
      }),
    },
  })
}

function pause() {
  if (!props.pauseOnHover) return
  if (props.gsapMode) tween?.pause()
  else isPaused.value = true
}

function resume() {
  if (!props.pauseOnHover) return
  if (props.gsapMode) tween?.resume()
  else isPaused.value = false
}

onMounted(() => {
  if (props.gsapMode) initGsap()
})

onUnmounted(() => {
  tween?.kill()
  tween = null
})
</script>

<template>
  <div
    class="overflow-hidden w-full"
    @mouseenter="pause"
    @mouseleave="resume"
  >
    <div
      ref="trackEl"
      :class="cn(
        'flex whitespace-nowrap w-max',
        !gsapMode && 'animate-marquee',
        !gsapMode && isPaused && '[animation-play-state:paused]',
        direction === 'right' && !gsapMode && 'animate-marquee-reverse',
      )"
      :style="cssVars"
    >
      <!-- Original slot -->
      <div :class="`flex shrink-0 items-center gap-[var(--marquee-gap)]`">
        <slot />
      </div>

      <!-- Clones for seamless loop -->
      <div
        v-for="i in duplicates"
        :key="i"
        :class="`flex shrink-0 items-center gap-[var(--marquee-gap)] ml-[var(--marquee-gap)]`"
        aria-hidden="true"
      >
        <slot />
      </div>
    </div>
  </div>
</template>
```

## Required CSS in `app/assets/css/main.css`

Add inside the `@layer utilities` block (or after the `@theme` block):

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(calc(-100% / var(--marquee-clones, 3))); }
}
@keyframes marquee-reverse {
  from { transform: translateX(calc(-100% / var(--marquee-clones, 3))); }
  to   { transform: translateX(0); }
}
.animate-marquee {
  animation: marquee var(--marquee-duration, 20s) linear infinite;
}
.animate-marquee-reverse {
  animation: marquee-reverse var(--marquee-duration, 20s) linear infinite;
}
```

## Usage examples

### Logo cloud marquee
```vue
<template>
  <section class="py-12 border-y border-border">
    <MarqueeTrack :speed="50" :gap="8" :pauseOnHover="true">
      <!-- Placeholder ids — replace with real client logo ids from the spec when allocated -->
      <img
        v-for="i in 6"
        :key="i"
        :alt="`Client ${i} logo`"
        data-media-id=""
        width="120"
        height="48"
        decoding="async"
        class="w-24 aspect-[5/2] object-contain opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0"
      />
    </MarqueeTrack>
  </section>
</template>
```

### Quote strip
```vue
<template>
  <div class="py-6 bg-primary text-primary-foreground overflow-hidden">
    <MarqueeTrack :speed="40" :gap="6" :duplicates="3">
      <span
        v-for="phrase in ['Award-winning', '✦', 'Digital experiences', '✦', 'Made to inspire', '✦']"
        :key="phrase"
        class="text-sm font-mono uppercase tracking-widest shrink-0"
      >{{ phrase }}</span>
    </MarqueeTrack>
  </div>
</template>
```

### Two-row counter-rotating marquee
```vue
<template>
  <section class="py-16 overflow-hidden space-y-4">
    <MarqueeTrack direction="left" :speed="60">
      <SkillTag v-for="tag in tagsRow1" :key="tag" :label="tag" />
    </MarqueeTrack>
    <MarqueeTrack direction="right" :speed="50">
      <SkillTag v-for="tag in tagsRow2" :key="tag" :label="tag" />
    </MarqueeTrack>
  </section>
</template>
```

## Non-negotiables

1. Always import `MarqueeTrack` explicitly: `import MarqueeTrack from '~/components/shared/MarqueeTrack.vue'`
2. The outer container must have `overflow-hidden` — the track `width: max-content` overflows intentionally
3. CSS mode (`gsapMode: false`) is the default and is more performant — use GSAP mode only when runtime speed changes or fine-tuned pause/resume are needed
4. `duplicates: 2` is the minimum for a seamless loop — increase to 3 or 4 for very fast speeds or very few items
5. Each slot item should be `shrink-0` — flex layout must not compress items
6. Add `aria-hidden="true"` to all cloned groups — only the first (slot) group is meaningful to screen readers
7. `pauseOnHover` is `true` by default — only disable it for non-interactive ambient strips (e.g. announcement bars)
8. The CSS keyframe must be placed in `main.css` inside `@layer utilities` so Tailwind v4 purge does not strip it
9. Never hardcode speeds — read the project's preferred pace from SPEC or use the default (60px/s for logos, 40px/s for text)
10. Keep items inside the slot as `shrink-0 inline-flex` — block elements break the horizontal flow
11. **Honor `prefers-reduced-motion`:** render the strip static (no scrolling) while keeping all content visible and laid out. CSS mode — apply the keyframe only inside `@media (prefers-reduced-motion: no-preference)` (or add `motion-reduce:[animation:none]`); GSAP mode — check `prefersReducedMotion()` from `~/composables/useScrollMotion` and skip the loop tween. Never leave content clipped/off-screen when static.
