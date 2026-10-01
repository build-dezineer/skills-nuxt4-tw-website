---
name: timeline
description: >-
  Vertical timeline with a GSAP draw-line scrub animation and a horizontal numbered
  process layout. The vertical variant alternates left/right entries with decorative
  oversized year numbers. Use when building process explanations, roadmaps, company
  history or milestone sequences.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "content, timeline"
  stack: "nuxt4, vue3, tailwind4, gsap"
---

# Timeline Skill

## When to use
History, process, roadmap, or journey sections where events are presented in chronological order. Use when SPEC includes an "our story", process steps, roadmap, or milestones section.


> **Guard your refs before animating.** `sectionRef.value` can be null when `onMounted` runs; a tween with no targets fails silently and the section never animates. Start motion setup with `if (!sectionRef.value) return`.


> **Motion targets must be guarded.** A tween whose target list resolves to nothing plays silently and never animates. Rules: (1) resolve the section root via a template ref, falling back to a known-good element (`headlineRef.value?.closest('section')`) — never assume the root ref is populated; (2) pass targets as a lazy function `() => root.value?.querySelectorAll('.item') ?? []` so GSAP resolves them at render time; (3) early-bail when the ref is null: `if (!root.value) { console.warn('motion: section ref unresolved'); return }`. Empty targets are now a build failure (motion-target-watch), so guard them.


> **Never call `context.selector()`.** It only exists on a *scoped* context and is `undefined` on `gsap.matchMedia()` / `gsap.context(fn)`, where calling it throws. Query through the section’s template ref instead: `sectionRef.value?.querySelectorAll('.item') ?? []`.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/TimelineSection.vue` | Timeline with vertical or horizontal variant |

## Layout variants

| Layout | Best for |
|---|---|
| `vertical` | Company history, multi-year journey (most common) |
| `horizontal` | Process steps, 3-6 numbered phases |

## `vertical` layout with GSAP draw-line effect

```vue
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollReveal } from '~/composables/useScrollMotion'

gsap.registerPlugin(ScrollTrigger)

interface TimelineEvent {
  year: string
  title: string
  body: string
  tag?: string
}

const events: TimelineEvent[] = [
  {
    year: '2019',
    title: 'The Beginning',
    body: 'Founded in a small studio in Lisbon by two designers who believed the web deserved better. First client signed within the week.',
    tag: 'Founded',
  },
  {
    year: '2020',
    title: 'First Award',
    body: 'Named one of Europe\'s top emerging digital studios by Awwwards. Team grew to 8 people as word spread.',
    tag: 'Recognition',
  },
  {
    year: '2021',
    title: 'Global Expansion',
    body: 'Opened offices in New York and Singapore. Client base expanded across 20 countries. Launched our open-source design system.',
    tag: 'Growth',
  },
  {
    year: '2022',
    title: 'Series A',
    body: 'Raised $12M to accelerate product development and double the team. Crossed 100 client milestone.',
    tag: 'Milestone',
  },
  {
    year: '2023',
    title: 'Platform Launch',
    body: 'Launched our SaaS platform, bringing our studio methodology to teams everywhere. 10,000 users in the first month.',
    tag: 'Launch',
  },
  {
    year: '2024',
    title: 'Today',
    body: 'Serving 200+ clients across 40 countries with a team of 60. Still obsessed with the details.',
    tag: 'Now',
  },
]

const lineEl = ref<HTMLElement | null>(null)
const sectionEl = ref<HTMLElement | null>(null)
let ctx: gsap.Context | null = null

onMounted(() => {
  ctx = gsap.context(() => {
    // Animate the vertical line drawing down
    if (lineEl.value) {
      gsap.fromTo(
        lineEl.value,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: sectionEl.value,
            start: 'top 70%',
            end: 'bottom 80%',
            scrub: true,
          },
        },
      )
    }
  })
})

onUnmounted(() => {
  ctx?.revert()
})

useScrollReveal(
  () => sectionEl.value?.querySelectorAll('.timeline-item') ?? null,
  { intensity: 'polished', stagger: 0.15 },
)
</script>

<template>
  <section ref="sectionEl" class="py-24 bg-background">
    <div class="container mx-auto px-6 md:px-10">
      <!-- Header -->
      <div class="max-w-2xl mb-20">
        <p class="text-sm font-mono uppercase tracking-widest text-primary mb-4">Our Story</p>
        <h2 class="text-4xl md:text-5xl font-heading font-bold text-foreground">How we got here</h2>
      </div>

      <!-- Timeline -->
      <div class="relative">
        <!-- Vertical line -->
        <div
          ref="lineEl"
          class="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2"
        />

        <!-- Events -->
        <div class="flex flex-col gap-16">
          <div
            v-for="(event, i) in events"
            :key="event.year"
            class="timeline-item relative grid md:grid-cols-2 gap-8 md:gap-16"
          >
            <!-- Left column (even items: content; odd items: empty) -->
            <div
              :class="[
                'flex flex-col gap-3 pl-16 md:pl-0',
                i % 2 === 0 ? 'md:text-right md:pr-16' : 'md:order-last md:pl-16',
              ]"
            >
              <span class="inline-block px-3 py-1 rounded-full text-xs font-mono font-semibold bg-primary/10 text-primary w-fit" :class="i % 2 === 0 ? 'md:ml-auto' : ''">
                {{ event.tag ?? event.year }}
              </span>
              <h3 class="text-xl font-heading font-bold text-foreground">{{ event.title }}</h3>
              <p class="text-muted-foreground leading-relaxed">{{ event.body }}</p>
            </div>

            <!-- Dot on the line -->
            <div class="absolute left-6 md:left-1/2 top-1 -translate-x-1/2 w-3 h-3 rounded-full bg-primary border-2 border-background z-10" />

            <!-- Year label on right/left alternating -->
            <div :class="['hidden md:flex items-start', i % 2 === 0 ? 'pl-16' : 'pr-16 justify-end order-first']">
              <span class="text-5xl font-heading font-black text-muted/20 select-none tabular-nums">{{ event.year }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
```

## `horizontal` layout (process steps)

```vue
<script setup lang="ts">
interface ProcessStep {
  number: string
  title: string
  body: string
}

const steps: ProcessStep[] = [
  { number: '01', title: 'Discovery',   body: 'We start by deeply understanding your goals, users, and competitive landscape through research and stakeholder interviews.' },
  { number: '02', title: 'Strategy',    body: 'From discovery insights, we craft a clear strategic direction, defining what to build and why before a single pixel is designed.' },
  { number: '03', title: 'Design',      body: 'Iterative design sprints produce high-fidelity prototypes validated with real users. We move fast but never skip the details.' },
  { number: '04', title: 'Development', body: 'Our engineering team builds with the same obsession for quality. Clean code, comprehensive tests, zero compromise on performance.' },
  { number: '05', title: 'Launch',      body: 'Go-live day is just the beginning. We monitor, iterate, and optimise based on real usage data in the weeks after launch.' },
]
</script>

<template>
  <section class="py-24 bg-muted/30">
    <div class="container mx-auto px-6 md:px-10">
      <div class="max-w-2xl mb-16">
        <p class="text-sm font-mono uppercase tracking-widest text-primary mb-4">Process</p>
        <h2 class="text-4xl font-heading font-bold text-foreground">How we work</h2>
      </div>

      <!-- Horizontal step list -->
      <div class="relative">
        <!-- Connecting line -->
        <div class="hidden md:block absolute top-8 left-8 right-8 h-px bg-border" />

        <div class="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div
            v-for="step in steps"
            :key="step.number"
            class="flex flex-col gap-4 relative"
          >
            <!-- Number circle -->
            <div class="w-16 h-16 rounded-full border-2 border-primary bg-background flex items-center justify-center shrink-0 z-10">
              <span class="text-sm font-mono font-bold text-primary">{{ step.number }}</span>
            </div>

            <div class="flex flex-col gap-2">
              <h3 class="font-heading font-bold text-foreground">{{ step.title }}</h3>
              <p class="text-sm text-muted-foreground leading-relaxed">{{ step.body }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
```

## Required imports

```ts
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useScrollReveal } from '~/composables/useScrollMotion'
```

## Non-negotiables

1. `gsap.registerPlugin(ScrollTrigger)` at module level — not inside `onMounted`
2. The draw-line animation uses `scaleY: 0 → 1` with `transformOrigin: 'top center'` + `scrub: true` — this ties line growth to scroll position, not a one-shot animation
3. `gsap.Context` in `onMounted` with `ctx.revert()` in `onUnmounted` — required for ScrollTrigger cleanup
4. Vertical timeline: alternating left/right layout uses CSS order only — never two separate template branches
5. Dot on the line: `z-10` so it renders above the line; `border-2 border-background` creates the separation gap from the line
6. Year number: `text-muted/20` (very faint) and `select-none` — purely decorative, not interactive
7. Horizontal process: connecting line is `absolute top-8` (matching the circle centre) — must be positioned to bisect the circles
8. `ProcessStep.number` is a string (`'01'`, `'02'`) not a number — preserves leading zero in template
9. `useScrollReveal` for individual `.timeline-item` elements with a stagger — never one reveal for the whole section
10. `tabular-nums` on the year display — prevents layout shift as the year digit changes
11. **Honor `prefers-reduced-motion`:** the line-draw effect resolves to fully drawn (`scaleY: 1`, no scrub) — check `prefersReducedMotion()` from `~/composables/useScrollMotion` and set the final state directly. Item reveals via `useScrollReveal` already handle reduced motion inside the pre-installed composable, so the whole timeline degrades to a static, fully-visible state.
