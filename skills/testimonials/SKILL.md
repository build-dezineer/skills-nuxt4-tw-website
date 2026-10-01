---
name: testimonials
description: >-
  Social proof sections in three layouts: Swiper slider (cards or coverflow), masonry
  grid, and a featured pull-quote with rotating selector. Includes star ratings and avatar
  images. Use for customer quotes, reviews, case-study proof, and testimonial walls.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "content, social-proof"
  stack: "nuxt4, vue3, tailwind4, swiper, lucide"
---

# Testimonials Skill

## When to use
Social proof sections — client quotes, reviews, case study snippets. Use when the SPEC includes a testimonials, reviews, or "what clients say" section.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/TestimonialsSection.vue` | Testimonials with layout variant |

## Layout variants

| Layout | Best for |
|---|---|
| `slider` | 2-6 quotes, featured Swiper carousel |
| `grid` | 3-9 quotes, masonry card grid |
| `featured` | 1 large pull-quote hero with rotating secondary quotes |

## Data structure

```ts
interface Testimonial {
  quote: string
  name: string
  title: string
  company: string
  avatar?: string   // omit for placeholder
  rating?: number   // 1-5, optional
}

const testimonials: Testimonial[] = [
  {
    quote: 'Working with this team fundamentally changed how we think about our digital presence. The results speak for themselves — conversion up 3x in the first month.',
    name: 'Sarah Chen',
    title: 'Head of Growth',
    company: 'Acme Corp',
    rating: 5,
  },
  {
    quote: 'They don\'t just build websites — they build experiences. Our new site has received more compliments in 6 weeks than our previous one did in 6 years.',
    name: 'Marcus Webb',
    title: 'Founder & CEO',
    company: 'Studio Arc',
    rating: 5,
  },
  {
    quote: 'The attention to detail is extraordinary. Every interaction, every transition, every pixel was considered. Worth every penny and then some.',
    name: 'Priya Patel',
    title: 'Creative Director',
    company: 'Horizon Media',
    rating: 5,
  },
]
```

## `slider` layout (Swiper)

```vue
<script setup lang="ts">
import { onMounted } from 'vue'
import { ref } from 'vue'
import { Quote, Star } from 'lucide-vue-next'
import { useScrollReveal } from '~/composables/useScrollMotion'
import Swiper from 'swiper'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'

const sectionEl = ref<HTMLElement | null>(null)
useScrollReveal(() => sectionEl.value, { intensity: 'polished' })

onMounted(() => {
  new Swiper('.testimonials-swiper', {
    modules: [Pagination, Autoplay],
    slidesPerView: 1,
    spaceBetween: 32,
    loop: true,
    autoplay: { delay: 6000, disableOnInteraction: true },
    pagination: { el: '.swiper-pagination', clickable: true },
    breakpoints: {
      768: { slidesPerView: 2 },
      1200: { slidesPerView: 3 },
    },
  })
})
</script>

<template>
  <section ref="sectionEl" class="py-24 bg-muted/30 overflow-hidden">
    <div class="container mx-auto px-6 md:px-10">
      <div class="mb-14">
        <p class="text-sm font-mono uppercase tracking-widest text-primary mb-4">Testimonials</p>
        <h2 class="text-4xl md:text-5xl font-heading font-bold text-foreground">What our clients say</h2>
      </div>

      <div class="swiper testimonials-swiper pb-14">
        <div class="swiper-wrapper items-stretch">
          <div v-for="t in testimonials" :key="t.name" class="swiper-slide h-auto">
            <div class="h-full flex flex-col gap-6 p-8 rounded-2xl border border-border bg-card">
              <!-- Rating -->
              <div v-if="t.rating" class="flex gap-1">
                <Star
                  v-for="i in 5" :key="i"
                  class="w-4 h-4"
                  :class="i <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'"
                />
              </div>

              <!-- Quote -->
              <Quote class="w-8 h-8 text-primary/30 shrink-0" />
              <p class="text-foreground leading-relaxed flex-1 text-base md:text-lg italic">
                "{{ t.quote }}"
              </p>

              <!-- Author -->
              <div class="flex items-center gap-3 pt-4 border-t border-border">
                <img
                  :alt="t.name"
                  data-media-id=""
                  width="48" height="48"
                  decoding="async"
                  class="w-12 h-12 aspect-square rounded-full shrink-0 object-cover"
                />
                <div>
                  <p class="font-semibold text-sm text-foreground">{{ t.name }}</p>
                  <p class="text-xs text-muted-foreground">{{ t.title }}, {{ t.company }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="swiper-pagination mt-4 [--swiper-pagination-color:theme(colors.primary)]" />
      </div>
    </div>
  </section>
</template>
```

## `grid` layout (masonry-style card grid)

```vue
<template>
  <section class="py-24 bg-background">
    <div class="container mx-auto px-6 md:px-10">
      <div class="mb-14">
        <p class="text-sm font-mono uppercase tracking-widest text-primary mb-4">What clients say</p>
        <h2 class="text-4xl font-heading font-bold text-foreground">Trusted by industry leaders</h2>
      </div>

      <div class="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
        <div
          v-for="t in testimonials"
          :key="t.name"
          class="break-inside-avoid rounded-2xl border border-border bg-card p-6 flex flex-col gap-4 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
        >
          <div v-if="t.rating" class="flex gap-1">
            <Star v-for="i in 5" :key="i" class="w-3.5 h-3.5" :class="i <= t.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'" />
          </div>
          <p class="text-foreground leading-relaxed italic">"{{ t.quote }}"</p>
          <div class="flex items-center gap-3 pt-3 border-t border-border">
            <img :alt="t.name" data-media-id="" width="40" height="40" decoding="async" class="w-10 h-10 aspect-square rounded-full shrink-0 object-cover" />
            <div>
              <p class="text-sm font-semibold text-foreground">{{ t.name }}</p>
              <p class="text-xs text-muted-foreground">{{ t.title }}, {{ t.company }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
```

## `featured` layout (large pull-quote)

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { Quote } from 'lucide-vue-next'

const activeIndex = ref(0)
const active = computed(() => testimonials[activeIndex.value])
</script>

<template>
  <section class="py-32 bg-background">
    <div class="container mx-auto px-6 md:px-10 max-w-5xl">
      <!-- Large quote -->
      <div class="mb-16">
        <Quote class="w-12 h-12 text-primary/20 mb-8" />
        <blockquote class="text-3xl md:text-4xl lg:text-5xl font-heading font-semibold text-foreground leading-tight">
          "{{ active.quote }}"
        </blockquote>
        <div class="mt-8 flex items-center gap-4">
          <img :alt="active.name" data-media-id="" width="56" height="56" decoding="async" class="w-14 h-14 aspect-square rounded-full object-cover" />
          <div>
            <p class="font-semibold text-foreground">{{ active.name }}</p>
            <p class="text-sm text-muted-foreground">{{ active.title }}, {{ active.company }}</p>
          </div>
        </div>
      </div>

      <!-- Secondary quote selectors -->
      <div class="flex flex-wrap gap-3">
        <button
          v-for="(t, i) in testimonials"
          :key="t.name"
          class="px-4 py-2 rounded-full text-sm font-medium transition-all"
          :class="i === activeIndex ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'"
          @click="activeIndex = i"
        >
          {{ t.name }}
        </button>
      </div>
    </div>
  </section>
</template>
```

## Required imports

```ts
import { ref, computed, onMounted } from 'vue'
import { Quote, Star } from 'lucide-vue-next'
import { useScrollReveal } from '~/composables/useScrollMotion'
import Swiper from 'swiper'
import { Pagination, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
```

## Non-negotiables

1. Swiper CSS imports are required: `'swiper/css'`, `'swiper/css/navigation'`, `'swiper/css/pagination'`
2. Avatar uses `<img data-media-id="...">` — always `w-12 h-12 rounded-full` (slider) or `w-10 h-10 rounded-full` (grid)
3. Quotes are wrapped in italic `<p>` with opening `"` and closing `"` typographic quotes — never `'`
4. `break-inside-avoid` on masonry cards — prevents cards from splitting across column breaks
5. Rating stars use `fill-yellow-400` on the filled stars — the `fill` variant colours the SVG path, not just the stroke
6. Swiper: `slidesPerView: 3` only at `1200px` breakpoint — always mobile-first with `slidesPerView: 1`
7. Card hover: `hover:-translate-y-1 hover:shadow-lg transition-all duration-300` (RULES.md)
8. `featured` layout selector buttons: active uses `bg-primary text-primary-foreground`, inactive uses `bg-muted` — never hardcoded colours
9. Swiper Pagination colour: `[--swiper-pagination-color:theme(colors.primary)]` via inline CSS variable — override Swiper's default blue
10. Testimonial data is defined as typed `Testimonial[]` array above `<template>` — never untyped object arrays
