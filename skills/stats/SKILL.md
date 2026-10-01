---
name: stats
description: >-
  Animated stat counter sections using `useCounter()` from the text-motion skill, in row,
  card-grid, and oversized hero layouts that count from zero on scroll enter. Use for
  metrics bands, results sections, and headline numbers.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "content, stats"
  stack: "nuxt4, vue3, tailwind4"
---

# Stats Skill

## When to use
Sections that present key metrics, social proof numbers, or KPIs — "100+ clients", "98% satisfaction", "5M+ users". Use whenever SPEC includes a numbers, metrics, or by-the-numbers section.


> **Never call `context.selector()`.** It only exists on a *scoped* context and is `undefined` on `gsap.matchMedia()` / `gsap.context(fn)`, where calling it throws. Query through the section’s template ref instead: `sectionRef.value?.querySelectorAll('.item') ?? []`.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/StatsSection.vue` | Animated stat counters with supporting copy |

## Layout variants

| Layout | Best for |
|---|---|
| `row` | 3-5 stats in a horizontal divider row (most common) |
| `cards` | 4-8 stats in metric cards with delta badges |
| `hero` | 2-3 oversized stats as the section's visual centrepiece |

## `row` layout (most common)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useCounter } from '~/composables/useTextMotion'
import { useScrollReveal } from '~/composables/useScrollMotion'

interface Stat {
  value: number
  suffix?: string
  prefix?: string
  label: string
  description?: string
  formatter?: (v: number) => string
}

const stats: Stat[] = [
  { value: 200, suffix: '+', label: 'Clients worldwide', description: 'Across 40 countries' },
  { value: 98,  suffix: '%', label: 'Client satisfaction', description: 'Based on annual survey' },
  { value: 12,  suffix: 'M', label: 'Users reached',       description: 'Through our platforms' },
  { value: 5,   suffix: '+', label: 'Years of experience',  description: 'Delivering excellence' },
]

// Create refs and hook up counters for each stat
const statRefs = stats.map(() => ref<HTMLElement | null>(null))

statRefs.forEach((elRef, i) => {
  const stat = stats[i]!
  useCounter(
    () => elRef.value,
    stat.value,
    {
      duration: 2,
      ease: 'power2.out',
      formatter: stat.formatter
        ?? ((v) => {
          const rounded = Math.round(v)
          return `${stat.prefix ?? ''}${rounded.toLocaleString()}${stat.suffix ?? ''}`
        }),
    },
  )
})

const sectionEl = ref<HTMLElement | null>(null)
useScrollReveal(() => sectionEl.value?.querySelectorAll('.stat-item') ?? null, {
  intensity: 'polished',
  stagger: 0.1,
})
</script>

<template>
  <section ref="sectionEl" class="py-24 bg-background border-y border-border">
    <div class="container mx-auto px-6 md:px-10">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-border">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="stat-item flex flex-col gap-2 py-6 md:py-0 md:px-8 first:pl-0 last:pr-0"
        >
          <!-- Animated number -->
          <span
            :ref="(el) => { statRefs[i].value = el instanceof HTMLElement ? el : null }"
            class="text-4xl md:text-5xl font-heading font-black tabular-nums text-foreground"
          >
            {{ stat.prefix ?? '' }}0{{ stat.suffix ?? '' }}
          </span>
          <p class="font-semibold text-foreground text-sm md:text-base">{{ stat.label }}</p>
          <p v-if="stat.description" class="text-xs text-muted-foreground">{{ stat.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
```

## `cards` layout

```vue
<template>
  <section class="py-24 bg-muted/30">
    <div class="container mx-auto px-6 md:px-10">
      <div class="mb-14 max-w-xl">
        <h2 class="text-4xl font-heading font-bold text-foreground">By the numbers</h2>
        <p class="mt-3 text-muted-foreground">Results that speak for themselves.</p>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div
          v-for="(stat, i) in stats"
          :key="stat.label"
          class="stat-item rounded-2xl border border-border bg-card p-6 flex flex-col gap-2 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
        >
          <span
            :ref="(el) => { statRefs[i].value = el instanceof HTMLElement ? el : null }"
            class="text-3xl md:text-4xl font-heading font-black tabular-nums text-primary"
          >{{ stat.prefix ?? '' }}0{{ stat.suffix ?? '' }}</span>
          <p class="font-semibold text-foreground text-sm">{{ stat.label }}</p>
          <p v-if="stat.description" class="text-xs text-muted-foreground">{{ stat.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
```

## `hero` layout (oversized centrepiece)

```vue
<template>
  <section class="py-32 bg-background">
    <div class="container mx-auto px-6 md:px-10">
      <div class="grid md:grid-cols-3 gap-16 text-center">
        <div
          v-for="(stat, i) in stats.slice(0, 3)"
          :key="stat.label"
          class="stat-item flex flex-col items-center gap-3"
        >
          <span
            :ref="(el) => { statRefs[i].value = el instanceof HTMLElement ? el : null }"
            class="text-[clamp(3rem,10vw,7rem)] font-heading font-black tabular-nums text-foreground leading-none"
          >{{ stat.prefix ?? '' }}0{{ stat.suffix ?? '' }}</span>
          <p class="text-xl font-medium text-muted-foreground">{{ stat.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
```

## Required imports

```ts
import { ref } from 'vue'
import { useCounter } from '~/composables/useTextMotion'
import { useScrollReveal } from '~/composables/useScrollMotion'
```

## Non-negotiables

1. Initial display value in the template must match `formatter(from)` — set `el.textContent` to the formatted `0` value so there is no flash of the final number before the counter starts
2. `tabular-nums` on every counter element — prevents layout shift as digits change width
3. `useCounter` formatter must include suffix and prefix — the counter animates the raw number, the formatter wraps it: `${prefix}${round(v).toLocaleString()}${suffix}`
4. Row layout: `divide-x divide-border` on the grid + `md:px-8` on items — never `border-r` on individual items (breaks at last item)
5. Row layout: use `grid-cols-2 md:grid-cols-4` — two columns on mobile, four on desktop
6. Hero layout: heading size uses `clamp()` — fluid typography for the oversized numbers
7. Card hover: `hover:-translate-y-1 hover:shadow-lg transition-all duration-300` (RULES.md)
8. `useCounter` and `useScrollReveal` must have matching `onUnmounted` cleanup — both use `gsap.Context` internally
9. Stat data is typed `Stat[]` — never plain JS object array
10. `useCounter` is from `~/composables/useTextMotion` — not from `~/composables/useScrollMotion`
11. **Reduced motion is already handled** by the pre-installed composables: `useCounter` snaps to its final value and `useScrollReveal` shows content instantly when `prefers-reduced-motion` is set. Do not add a competing count-up or hide the numbers behind a custom animation — the final value must always be readable.
