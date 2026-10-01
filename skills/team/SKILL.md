---
name: team
description: >-
  Team member sections in grid (hover overlay reveals bio and socials) and portrait (large
  alternating image + text rows) layouts, with 3:4 photos and accessible social links. Use
  when building team pages, about sections or people grids.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "content, team"
  stack: "nuxt4, vue3, tailwind4, lucide"
---

# Team Skill

## When to use
Any section showcasing team members, founders, leadership, or contributors. Use when SPEC includes a team, about, or people section.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/TeamSection.vue` | Team grid with hover interactions |

## Layout variants

| Layout | Best for |
|---|---|
| `grid` | 3-12 people, card grid with hover overlay |
| `portrait` | 2-4 people, large portrait photos with text |
| `list` | Long team lists, horizontal row per person |

## `grid` layout (most common)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Linkedin, Twitter } from 'lucide-vue-next'
import { useScrollReveal } from '~/composables/useScrollMotion'
import { cn } from '~/utils/cn'

interface TeamMember {
  name: string
  title: string
  bio?: string
  avatar?: string
  socials?: { platform: 'linkedin' | 'twitter'; href: string }[]
}

const team: TeamMember[] = [
  {
    name: 'Alexandra Reid',
    title: 'Chief Executive Officer',
    bio: 'Former engineering lead at Stripe with 12 years building financial infrastructure at scale.',
    socials: [{ platform: 'linkedin', href: 'https://linkedin.com' }],
  },
  {
    name: 'James Okafor',
    title: 'Head of Design',
    bio: 'Award-winning product designer. Previously led design at Figma and Notion.',
    socials: [{ platform: 'twitter', href: 'https://twitter.com' }, { platform: 'linkedin', href: 'https://linkedin.com' }],
  },
  {
    name: 'Sofia Mendes',
    title: 'Chief Technology Officer',
    bio: 'Open source contributor and architect of distributed systems. Speaker at QCon and SREcon.',
    socials: [{ platform: 'linkedin', href: 'https://linkedin.com' }],
  },
  {
    name: 'David Park',
    title: 'VP of Engineering',
    bio: 'Loves Rust and zero-allocation code. Previously Staff Engineer at Cloudflare.',
    socials: [{ platform: 'twitter', href: 'https://twitter.com' }],
  },
  {
    name: 'Chloe Laurent',
    title: 'Head of Marketing',
    bio: 'Growth strategist who took two startups from 0 to Series B through content and community.',
    socials: [{ platform: 'linkedin', href: 'https://linkedin.com' }],
  },
  {
    name: 'Raj Patel',
    title: 'Head of Customer Success',
    bio: 'Passionate about turning customers into champions. 99% CSAT across all accounts.',
    socials: [{ platform: 'linkedin', href: 'https://linkedin.com' }],
  },
]

const gridEl = ref<HTMLElement | null>(null)
useScrollReveal(() => gridEl.value?.querySelectorAll('.team-card') ?? null, {
  intensity: 'polished',
  stagger: 0.09,
})
</script>

<template>
  <section class="py-24 bg-background">
    <div class="container mx-auto px-6 md:px-10">
      <!-- Header -->
      <div class="max-w-2xl mb-16">
        <p class="text-sm font-mono uppercase tracking-widest text-primary mb-4">The Team</p>
        <h2 class="text-4xl md:text-5xl font-heading font-bold text-foreground">
          The people behind the work
        </h2>
        <p class="mt-4 text-lg text-muted-foreground leading-relaxed">
          A diverse group of designers, engineers, and strategists united by craft and curiosity.
        </p>
      </div>

      <!-- Grid -->
      <div ref="gridEl" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <div
          v-for="member in team"
          :key="member.name"
          class="team-card group relative overflow-hidden rounded-2xl"
        >
          <!-- Photo -->
          <div class="aspect-[3/4] overflow-hidden">
            <img
              :alt="member.name"
              data-media-id=""
              width="400"
              height="533"
              decoding="async"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          <!-- Hover overlay with bio -->
          <div class="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/80 transition-colors duration-300 flex flex-col justify-end p-6">
            <!-- Always-visible name bar -->
            <div class="translate-y-0">
              <p class="font-heading font-bold text-background text-lg group-hover:text-background opacity-0 group-hover:opacity-100 transition-all duration-300 delay-75">
                {{ member.bio }}
              </p>
            </div>

            <!-- Social icons -->
            <div
              v-if="member.socials"
              class="flex gap-3 mt-4 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 delay-100"
            >
              <a
                v-for="s in member.socials"
                :key="s.platform"
                :href="s.href"
                target="_blank"
                rel="noopener"
                :aria-label="`${member.name} on ${s.platform}`"
                class="w-8 h-8 rounded-full bg-background/20 hover:bg-background/40 flex items-center justify-center text-background transition-colors"
              >
                <Linkedin v-if="s.platform === 'linkedin'" class="w-3.5 h-3.5" />
                <Twitter v-else class="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <!-- Name + title (below image, always visible) -->
          <div class="p-5 bg-card border border-t-0 border-border rounded-b-2xl">
            <p class="font-heading font-bold text-foreground">{{ member.name }}</p>
            <p class="text-sm text-muted-foreground mt-0.5">{{ member.title }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
```

## `portrait` layout (large format, 2-4 people)

```vue
<template>
  <section class="py-24 bg-muted/30">
    <div class="container mx-auto px-6 md:px-10">
      <h2 class="text-4xl font-heading font-bold text-foreground mb-16 max-w-md">Meet the founders</h2>

      <div class="space-y-24">
        <div
          v-for="(member, i) in team.slice(0, 3)"
          :key="member.name"
          class="grid md:grid-cols-2 gap-12 items-center"
          :class="i % 2 === 1 ? 'md:[&>*:first-child]:order-last' : ''"
        >
          <!-- Portrait -->
          <div class="overflow-hidden rounded-2xl aspect-[3/4]">
            <img :alt="member.name" data-media-id="" width="600" height="800" decoding="async" class="w-full h-full object-cover" />
          </div>

          <!-- Info -->
          <div class="flex flex-col gap-6">
            <div>
              <p class="text-sm font-mono uppercase tracking-widest text-primary">{{ member.title }}</p>
              <h3 class="mt-2 text-4xl font-heading font-black text-foreground">{{ member.name }}</h3>
            </div>
            <p class="text-lg text-muted-foreground leading-relaxed">{{ member.bio }}</p>
            <div v-if="member.socials" class="flex gap-3">
              <a
                v-for="s in member.socials"
                :key="s.platform"
                :href="s.href"
                target="_blank"
                rel="noopener"
                :aria-label="`${member.name} on ${s.platform}`"
                class="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors"
              >
                <Linkedin v-if="s.platform === 'linkedin'" class="w-4 h-4" />
                <Twitter v-else class="w-4 h-4" />
              </a>
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
import { ref } from 'vue'
import { Linkedin, Twitter } from 'lucide-vue-next'
import { useScrollReveal } from '~/composables/useScrollMotion'
import { cn } from '~/utils/cn'
// Validate Linkedin and Twitter against app/assets/lucide-icons.txt
```

## Non-negotiables

1. Photo: always an `<img data-media-id="...">` (allocated id or `""` — the pipeline fills it and injects `:src`) — never an `<img>` with a hardcoded placeholder src. Team member avatars may use `:src` with REAL external mock URLs only.
2. Grid card: `aspect-[3/4]` on the photo wrapper, `overflow-hidden` on the same element — portrait ratio for team photos
3. Hover overlay: CSS transition `group-hover:` — never GSAP for simple hover state changes (CSS transitions are more performant)
4. Social links: `target="_blank"` + `rel="noopener"` + `aria-label` — all three required
5. Social icon selection: only render `<Linkedin>` for `'linkedin'` and `<Twitter>` for `'twitter'` — validate icon names against `lucide-icons.txt`
6. Portrait layout: alternating direction with `md:[&>*:first-child]:order-last` on odd-indexed items — never duplicate the two-column markup
7. Card hover scale: `group-hover:scale-105` on the inner `<img>` — the wrapper has `overflow-hidden` to clip it
8. Card base: `rounded-2xl` with `border border-t-0 border-border rounded-b-2xl` on the name bar — creates a unified card with photo + text
9. `useScrollReveal` with `.team-card` selector — stagger each card in individually
10. `TeamMember` interface is typed with optional `?` fields — never non-optional `bio` or `socials` since not all team listings have both
