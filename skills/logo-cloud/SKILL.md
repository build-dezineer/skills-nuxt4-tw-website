---
name: logo-cloud
description: >-
  Client and partner logo sections in grid, marquee (`MarqueeTrack`), and press layouts.
  Logos render grayscale at half opacity and full colour on hover, all through the media
  pipeline. Use for trust bars, integration lists, and publication mentions.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "content, social-proof, logos"
  stack: "nuxt4, vue3, tailwind4"
---

# Logo Cloud Skill

## When to use
Client logos, partner badges, press mentions, or "as seen in" sections. Use when SPEC includes a trust bar, clients section, or partner logos.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/LogoCloudSection.vue` | Static grid or marquee logo display |

Import `MarqueeTrack` from the [marquee skill](../marquee/SKILL.md) for the scrolling variant.

## Layout variants

| Layout | Best for |
|---|---|
| `grid` | 4-12 logos, static display, grayscale with hover colour |
| `marquee` | 6+ logos, continuously scrolling — uses `MarqueeTrack` component |
| `press` | "As featured in" with publication names instead of just logos |

## `grid` layout

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useScrollReveal } from '~/composables/useScrollMotion'

interface LogoItem {
  name: string
  width?: number
  height?: number
}

const logos: LogoItem[] = [
  { name: 'Acme Inc',     width: 120, height: 40 },
  { name: 'Globex Corp',  width: 100, height: 40 },
  { name: 'Initech',      width: 110, height: 40 },
  { name: 'Umbrella',     width: 130, height: 40 },
  { name: 'Massive Dyn',  width: 140, height: 40 },
  { name: 'Weyland-Yutani', width: 120, height: 40 },
]

const sectionEl = ref<HTMLElement | null>(null)
useScrollReveal(() => sectionEl.value?.querySelectorAll('.logo-item') ?? null, {
  intensity: 'calm',
  stagger: 0.08,
})
</script>

<template>
  <section ref="sectionEl" class="py-16 bg-background border-y border-border">
    <div class="container mx-auto px-6 md:px-10">
      <!-- Optional eyebrow -->
      <p class="text-center text-xs font-mono uppercase tracking-widest text-muted-foreground mb-10">
        Trusted by leading companies
      </p>

      <!-- Logo grid -->
      <div class="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
        <div
          v-for="logo in logos"
          :key="logo.name"
          class="logo-item flex items-center justify-center"
        >
          <img
            :alt="logo.name"
            data-media-id=""
            :width="logo.width ?? 120"
            :height="logo.height ?? 40"
            decoding="async"
            class="h-8 w-auto object-contain grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
          />
        </div>
      </div>
    </div>
  </section>
</template>
```

## `marquee` layout (uses MarqueeTrack)

```vue
<script setup lang="ts">
import MarqueeTrack from '~/components/shared/MarqueeTrack.vue'

interface LogoItem {
  name: string
}

const logos: LogoItem[] = [
  { name: 'Acme Inc' },
  { name: 'Globex Corp' },
  { name: 'Initech' },
  { name: 'Umbrella' },
  { name: 'Massive Dyn' },
  { name: 'Weyland-Yutani' },
  { name: 'Aperture Science' },
  { name: 'Black Mesa' },
]
</script>

<template>
  <section class="py-14 bg-background border-y border-border overflow-hidden">
    <p class="text-center text-xs font-mono uppercase tracking-widest text-muted-foreground mb-8">
      Trusted by 200+ companies worldwide
    </p>

    <MarqueeTrack :speed="55" :gap="10" :pause-on-hover="true">
      <div
        v-for="logo in logos"
        :key="logo.name"
        class="shrink-0 flex items-center justify-center px-4"
      >
        <img
          :alt="logo.name"
          data-media-id=""
          width="120"
          height="40"
          decoding="async"
          class="h-8 w-auto object-contain grayscale hover:grayscale-0 opacity-50 hover:opacity-100 transition-all duration-300"
        />
      </div>
    </MarqueeTrack>
  </section>
</template>
```

## `press` layout (publication names with text logos)

```vue
<script setup lang="ts">
interface PressItem {
  name: string
  quote?: string
  src?: string
}

const pressItems: PressItem[] = [
  { name: 'TechCrunch',   quote: '"The team to watch in 2024"' },
  { name: 'Forbes',       quote: '"Top 50 design studios globally"' },
  { name: 'Wired',        quote: '"Redefining what\'s possible on the web"' },
  { name: 'Fast Company', quote: '"Innovation at its finest"' },
]
</script>

<template>
  <section class="py-16 bg-muted/30">
    <div class="container mx-auto px-6 md:px-10">
      <p class="text-center text-xs font-mono uppercase tracking-widest text-muted-foreground mb-12">
        As featured in
      </p>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
        <div
          v-for="press in pressItems"
          :key="press.name"
          class="flex flex-col items-center gap-3 group"
        >
          <!-- Logo (real external mock URL) or text fallback -->
          <div v-if="press.src">
            <img :alt="press.name" :src="press.src" width="120" height="36" decoding="async" class="h-9 w-auto object-contain grayscale group-hover:grayscale-0 opacity-50 group-hover:opacity-100 transition-all duration-300" />
          </div>
          <span v-else class="text-xl font-heading font-bold text-muted-foreground/40 group-hover:text-muted-foreground transition-colors duration-300">
            {{ press.name }}
          </span>

          <p v-if="press.quote" class="text-xs text-muted-foreground text-center italic leading-relaxed hidden md:block">
            {{ press.quote }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
```

## Required imports

```ts
import { ref } from 'vue'
import MarqueeTrack from '~/components/shared/MarqueeTrack.vue'  // marquee layout only
import { useScrollReveal } from '~/composables/useScrollMotion'
```

## Non-negotiables

1. All logos: `grayscale` by default, `hover:grayscale-0` on hover — never coloured by default
2. All logos: `opacity-50 hover:opacity-100` — adds further de-emphasis. Both `grayscale` and `opacity` together create the canonical "trust bar" look
3. `object-contain` on the logo `<img>` — logos must never be cropped; contain fits them in their box
4. Grid: `flex-wrap items-center justify-center` — allows logos to wrap naturally on small screens
5. Marquee: logo items must be `shrink-0` — flex layout must not compress logos
6. `MarqueeTrack` is imported from `~/components/shared/MarqueeTrack.vue` — requires the [marquee skill](../marquee/SKILL.md) to be included in this project
7. Static client logos are `<img data-media-id="...">` elements — the pipeline injects the real src; real logos provided as external URLs may use `:src` with a REAL mock URL only; if not, the alt text is the company name
8. `border-y border-border` on the section — the trust bar is visually separated from surrounding sections with top and bottom borders
9. Press layout: text fallback (`<span>` with company name) when no `src` is provided — never a broken image
10. `useScrollReveal` with `intensity: 'calm'` for logo grids — logos are secondary content; subtle reveal is appropriate
