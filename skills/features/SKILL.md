---
name: features
description: >-
  Feature sections in four layouts: icon-card grid (3-4 column), asymmetric bento,
  alternating full-width image + text rows, and a pinned horizontal-scroll track for
  cinematic intensity. Cards lift on hover and reveal with per-card stagger. Use when
  building product features, services, capabilities or benefits.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "content, features"
  stack: "nuxt4, vue3, tailwind4, lucide"
---

# Features Skill

## When to use
Any section that presents product features, service offerings, capabilities, or benefits in a grid or structured list. One of the most common sections on any website — always available.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/FeaturesSection.vue` | Feature section with layout prop |

## Layout variants

Choose layout based on content count and SPEC creative direction:

| Layout | Items | Best for |
|---|---|---|
| `grid` | 3-6 items | Standard features grid, icon + title + body |
| `bento` | 4-8 items | Asymmetric bento grid — some items span multiple columns |
| `alternating` | 2-4 items | Full-width alternating rows, image + text opposite sides |
| `horizontal-scroll` | 4-8 items | Cinematic pinned horizontal card track |

## `grid` layout (most common)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '~/utils/cn'
import { Zap, Shield, Globe, Users, TrendingUp, Code2 } from 'lucide-vue-next'
import { useScrollReveal } from '~/composables/useScrollMotion'

interface Feature {
  icon: Component
  title: string
  body: string
}

const features: Feature[] = [
  { icon: Zap,       title: 'Lightning Fast',       body: 'Optimised for Core Web Vitals. Pages load in under 1 second on modern connections.' },
  { icon: Shield,    title: 'Enterprise Security',   body: 'SOC 2 Type II certified infrastructure with end-to-end encryption across all data flows.' },
  { icon: Globe,     title: 'Global CDN',            body: 'Content served from 200+ edge locations ensuring sub-100ms latency worldwide.' },
  { icon: Users,     title: 'Team Collaboration',    body: 'Real-time multiplayer editing with role-based permissions and audit logs.' },
  { icon: TrendingUp, title: 'Analytics Built-in',  body: 'Privacy-first analytics with custom dashboards and automated reporting.' },
  { icon: Code2,     title: 'Developer API',         body: 'RESTful + GraphQL APIs with SDKs for all major languages and frameworks.' },
]

const gridEl = ref<HTMLElement | null>(null)
useScrollReveal(() => gridEl.value?.querySelectorAll('.feature-card') ?? null, {
  intensity: 'polished',
  stagger: 0.1,
})
</script>

<template>
  <section class="py-24 bg-background">
    <div class="container mx-auto px-6 md:px-10">
      <!-- Section header -->
      <div class="max-w-2xl mb-16">
        <p class="text-sm font-mono uppercase tracking-widest text-primary mb-4">Features</p>
        <h2 class="text-4xl md:text-5xl font-heading font-bold text-foreground leading-tight">
          Everything you need to build better
        </h2>
        <p class="mt-4 text-lg text-muted-foreground leading-relaxed">
          A complete toolkit designed to help teams ship faster without compromising on quality.
        </p>
      </div>

      <!-- Grid -->
      <div ref="gridEl" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="feat in features"
          :key="feat.title"
          class="feature-card group flex flex-col gap-4 p-6 rounded-2xl border border-border bg-card hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
        >
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <component :is="feat.icon" class="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 class="font-heading font-semibold text-foreground text-lg">{{ feat.title }}</h3>
            <p class="mt-2 text-sm text-muted-foreground leading-relaxed">{{ feat.body }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
```

## `bento` layout (asymmetric grid)

```vue
<template>
  <section class="py-24 bg-muted/30">
    <div class="container mx-auto px-6 md:px-10">
      <h2 class="text-4xl md:text-5xl font-heading font-bold text-foreground mb-12 max-w-lg">
        Designed for modern teams
      </h2>

      <!-- 12-column bento grid -->
      <div class="grid grid-cols-1 md:grid-cols-12 gap-4">
        <!-- Large feature — spans 7 cols -->
        <div class="md:col-span-7 rounded-2xl border border-border bg-card p-8 flex flex-col justify-between min-h-[300px] hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Zap class="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 class="text-2xl font-heading font-bold text-foreground">Lightning Performance</h3>
            <p class="mt-2 text-muted-foreground leading-relaxed">Built on modern infrastructure optimised for Core Web Vitals at every layer.</p>
          </div>
        </div>

        <!-- Small feature — spans 5 cols -->
        <div class="md:col-span-5 rounded-2xl border border-border bg-primary p-8 flex flex-col justify-between min-h-[300px]">
          <Shield class="w-8 h-8 text-primary-foreground/70" />
          <div>
            <h3 class="text-2xl font-heading font-bold text-primary-foreground">Enterprise Security</h3>
            <p class="mt-2 text-primary-foreground/70 leading-relaxed">SOC 2 certified. End-to-end encrypted.</p>
          </div>
        </div>

        <!-- Three equal columns -->
        <div v-for="feat in features.slice(2, 5)" :key="feat.title"
          class="md:col-span-4 rounded-2xl border border-border bg-card p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
          <component :is="feat.icon" class="w-6 h-6 text-primary mb-4" />
          <h3 class="font-heading font-semibold text-foreground">{{ feat.title }}</h3>
          <p class="mt-2 text-sm text-muted-foreground">{{ feat.body }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
```

## `alternating` layout (image + text rows)

```vue
<template>
  <section class="py-24 bg-background">
    <div class="container mx-auto px-6 md:px-10 space-y-24">
      <div
        v-for="(feat, i) in detailedFeatures"
        :key="feat.title"
        class="grid md:grid-cols-2 gap-12 md:gap-20 items-center"
        :class="i % 2 === 1 ? 'md:[&>*:first-child]:order-last' : ''"
      >
        <!-- Text -->
        <div class="flex flex-col gap-6">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <component :is="feat.icon" class="w-5 h-5 text-primary" />
          </div>
          <h3 class="text-3xl md:text-4xl font-heading font-bold text-foreground leading-tight">{{ feat.title }}</h3>
          <p class="text-lg text-muted-foreground leading-relaxed">{{ feat.body }}</p>
          <NuxtLink :to="feat.href" class="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all">
            Learn more <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <!-- Image -->
        <div class="overflow-hidden rounded-2xl">
          <img :alt="feat.title" data-media-id="" width="600" height="450" decoding="async" class="aspect-[4/3] w-full object-cover" />
        </div>
      </div>
    </div>
  </section>
</template>
```

## `horizontal-scroll` layout (cinematic intensity)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useHorizontalTrack } from '~/composables/useScrollMotion'

const wrapperEl = ref<HTMLElement | null>(null)
useHorizontalTrack(() => wrapperEl.value, { trackSelector: '.features-track' })
</script>

<template>
  <section ref="wrapperEl" class="overflow-hidden">
    <div class="features-track flex gap-6 px-10 py-24 w-max">
      <div
        v-for="feat in features"
        :key="feat.title"
        class="w-[340px] shrink-0 rounded-2xl border border-border bg-card p-8 flex flex-col gap-6"
      >
        <component :is="feat.icon" class="w-8 h-8 text-primary" />
        <div>
          <h3 class="text-xl font-heading font-bold text-foreground">{{ feat.title }}</h3>
          <p class="mt-2 text-sm text-muted-foreground leading-relaxed">{{ feat.body }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
```

## Required imports

```ts
import { ref } from 'vue'
import { cn } from '~/utils/cn'
import { ArrowRight } from 'lucide-vue-next'
// Feature icons — validate each against app/assets/lucide-icons.txt
import { Zap, Shield, Globe, Users, TrendingUp, Code2 } from 'lucide-vue-next'
import { useScrollReveal } from '~/composables/useScrollMotion'
// Cinematic horizontal scroll:
import { useHorizontalTrack } from '~/composables/useScrollMotion'
```

## Non-negotiables

1. Card hover: `hover:-translate-y-1 hover:shadow-lg transition-all duration-300` (RULES.md)
2. Icon container: `bg-primary/10` rounded square — never a raw icon without a container in grid/bento layouts
3. Bento grid: use `md:col-span-*` values that sum to 12 per row — always verify the column math
4. `alternating` odd/even flip: use `md:[&>*:first-child]:order-last` on odd-indexed rows — never duplicate the markup
5. `horizontal-scroll` variant only for `animationIntensity === 'cinematic'` — other intensities use grid
6. All icon imports validated against `app/assets/lucide-icons.txt` before use
7. Section header (`<p>` eyebrow + `<h2>` + `<p>` body) is always present — never a grid of cards without context
8. `useScrollReveal` targets individual cards (`.feature-card`) not the wrapper — enables per-card stagger
9. Alternating layout: the image is an `<img data-media-id="...">` managed by the [media skill](../media/SKILL.md) — emit it and let the pipeline inject `:src`; never an `<img>` with a hardcoded placeholder src
10. `bg-card` for feature cards, `bg-muted/30` or `bg-background` for section background — always CSS variables
