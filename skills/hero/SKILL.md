---
name: hero
description: >-
  Complete hero / above-the-fold section covering all heroLayout x heroVisual
  combinations: fullscreen, split, stacked, and typographic layouts with image (parallax),
  video, carousel (Swiper), 3D (`ThreeScene`), gradient, or colour visuals. Use when
  building or regenerating a website's hero section.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "layout, hero, above-the-fold"
  stack: "nuxt4, vue3, tailwind4, swiper, lucide"
---

# Hero Skill

## When to use
Every website project has a hero section. Generate it from the `heroLayout` and `heroVisual` wizard answers in SPEC.md.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/HeroSection.vue` | Complete hero with layout + visual combination |

Use `<img data-media-id="...">` and `<video data-media-id="...">` elements ([media skill](../media/SKILL.md) — the pipeline injects `:src`), `AnimatedGradient` (shared), and optionally Swiper or the `ThreeScene` component based on `heroVisual`.

## Wizard answer mapping

This is the authoritative layout×visual matrix — the wizard only ever sends a valid pairing, so
you never need to handle an unsupported combination. Implement exactly the visual you are given.

| `heroLayout` | supported `heroVisual` | Description |
|---|---|---|
| `fullscreen` | image, video, 3d, color, gradient | 100dvh, content centered or left-aligned |
| `split` | image, video, 3d, color, gradient | 50/50 grid — text one side, visual the other |
| `stacked` | image, video, carousel, color, gradient | Text above, full-width visual below |
| `typographic` | color, gradient | Oversized type; visual is only a subtle backdrop |

- `color` → a static token gradient div (see fullscreen example).
- `gradient` → `<AnimatedGradient />` from `~/components/shared/AnimatedGradient.vue` (animated,
  on-brand, `prefers-reduced-motion`-safe). Use it exactly where the `color` background div would go.
- `3d` → `<ThreeScene preset="…" />` from `~/components/shared/ThreeScene.vue` (see the [3d-scene
  skill](../3d-scene/SKILL.md) for preset choice) — it is SSR-safe and already built; never inline Three.js.

## `fullscreen` layout patterns

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '~/utils/cn'
import AnimatedGradient from '~/components/shared/AnimatedGradient.vue'
import ThreeScene from '~/components/shared/ThreeScene.vue'
import { useTextReveal } from '~/composables/useTextMotion'
import { useScrollReveal, useParallax } from '~/composables/useScrollMotion'

// From SPEC:
const HERO_VISUAL: 'image' | 'video' | '3d' | 'color' | 'gradient' = 'image'

const headingEl = ref<HTMLElement | null>(null)
const subEl = ref<HTMLElement | null>(null)
const ctaEl = ref<HTMLElement | null>(null)
const imageEl = ref<HTMLElement | null>(null)

useTextReveal(() => headingEl.value, { mode: 'words', intensity: 'cinematic', delay: 0.3 })
useScrollReveal(() => subEl.value, { intensity: 'polished', delay: 0.7 })
useScrollReveal(() => ctaEl.value, { intensity: 'polished', delay: 0.9 })
// Subtle parallax on bg image for depth
useParallax(() => imageEl.value, { speed: 0.15 })
</script>

<template>
  <section class="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden">

    <!-- Background visual -->
    <!-- image -->
    <div v-if="HERO_VISUAL === 'image'" class="absolute inset-0 overflow-hidden">
      <div ref="imageEl" class="absolute inset-[-10%]">
        <img
          data-media-id="hero-section"
          alt="Hero background"
          width="1920" height="1080"
          loading="eager"
          decoding="async"
          class="aspect-video w-full h-full object-cover"
        />
      </div>
      <div class="absolute inset-0 bg-black/50" />
    </div>

    <!-- video -->
    <div v-else-if="HERO_VISUAL === 'video'" class="absolute inset-0 overflow-hidden">
      <video
        data-media-id=""
        autoplay muted loop playsinline
        class="absolute inset-0 aspect-video w-full h-full object-cover"
        title="Hero background video"
      ></video>
      <div class="absolute inset-0 bg-black/50" />
    </div>

    <!-- color (static token gradient) -->
    <div v-else-if="HERO_VISUAL === 'color'" class="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/10" />

    <!-- gradient (animated, on-brand, reduced-motion safe) -->
    <AnimatedGradient v-else-if="HERO_VISUAL === 'gradient'" />

    <!-- 3d (interactive scene) -->
    <ThreeScene v-else-if="HERO_VISUAL === '3d'" preset="particles" :mouse-track="true" animation-intensity="cinematic" class="absolute inset-0" />

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-6 text-center max-w-5xl">
      <h1 ref="headingEl" class="text-5xl md:text-7xl lg:text-8xl font-heading font-black leading-[0.9] tracking-tight text-hero-overlay-foreground">
        Headline That Changes Everything
      </h1>
      <p ref="subEl" class="mt-6 text-lg md:text-xl text-hero-overlay-foreground/70 max-w-2xl mx-auto leading-relaxed">
        Supporting subheading that contextualises the headline and leads the visitor forward.
      </p>
      <div ref="ctaEl" class="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink to="#contact" class="btn-primary px-8 py-4 text-base">
          Get Started
        </NuxtLink>
        <NuxtLink to="#work" class="btn-ghost px-8 py-4 text-base text-hero-overlay-foreground border-hero-overlay-foreground/30 hover:border-hero-overlay-foreground/60">
          See Our Work
        </NuxtLink>
      </div>
    </div>

    <!-- Scroll indicator -->
    <div class="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-hero-overlay-foreground/50 animate-bounce">
      <span class="text-xs font-mono uppercase tracking-widest">Scroll</span>
      <ChevronDown class="w-4 h-4" />
    </div>
  </section>
</template>
```

## `split` layout pattern (image right, text left)

```vue
<template>
  <section class="w-full min-h-screen grid md:grid-cols-2">
    <!-- Text side -->
    <div class="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-24 md:py-0">
      <p class="text-sm font-mono uppercase tracking-widest text-primary mb-6">
        Eyebrow Label
      </p>
      <h1 ref="headingEl" class="text-5xl lg:text-7xl font-heading font-black leading-[0.95] tracking-tight text-foreground">
        Bold Headline Here
      </h1>
      <p ref="subEl" class="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
        Supporting copy that explains the value proposition with clarity and depth.
      </p>
      <div ref="ctaEl" class="mt-10 flex flex-wrap gap-4">
        <NuxtLink to="#contact" class="btn-primary px-8 py-3.5">Start a Project</NuxtLink>
        <NuxtLink to="#work" class="btn-ghost px-8 py-3.5">View Work</NuxtLink>
      </div>
    </div>

    <!-- Visual side — clips on scroll for a reveal effect -->
    <div class="relative overflow-hidden hidden md:block">
      <!-- image -->
      <div v-if="HERO_VISUAL === 'image'" ref="imageEl" class="absolute inset-[-8%]">
        <img
          data-media-id="hero-section"
          alt="Hero image"
          width="960" height="1080"
          loading="eager"
          decoding="async"
          class="w-full h-full object-cover"
        />
      </div>

      <!-- video -->
      <video
        v-else-if="HERO_VISUAL === 'video'"
        data-media-id=""
        autoplay muted loop playsinline
        class="w-full h-full object-cover"
        title="Hero video"
      ></video>

      <!-- 3d -->
      <ThreeScene v-else-if="HERO_VISUAL === '3d'" preset="particles" :mouse-track="true" animation-intensity="cinematic" class="w-full h-full" />

      <!-- color -->
      <div v-else-if="HERO_VISUAL === 'color'" class="w-full h-full bg-gradient-to-br from-primary/20 to-background" />

      <!-- gradient -->
      <AnimatedGradient v-else-if="HERO_VISUAL === 'gradient'" class="w-full h-full" />
    </div>
  </section>
</template>
```

## `stacked` layout pattern

```vue
<template>
  <section class="w-full">
    <!-- Text block -->
    <div class="px-6 md:px-16 lg:px-24 pt-32 pb-16 max-w-5xl">
      <h1 ref="headingEl" class="text-5xl md:text-7xl font-heading font-black leading-[0.9] tracking-tight text-foreground">
        Ideas That Move the World
      </h1>
      <div class="mt-8 flex flex-col sm:flex-row gap-4">
        <NuxtLink to="#contact" class="btn-primary px-8 py-3.5">Work With Us</NuxtLink>
      </div>
    </div>

    <!-- Full-width visual -->
    <div class="relative w-full overflow-hidden">
      <!-- Carousel variant -->
      <div v-if="HERO_VISUAL === 'carousel'" class="swiper hero-swiper w-full aspect-[16/7]">
        <div class="swiper-wrapper">
          <div v-for="i in 5" :key="i" class="swiper-slide">
            <img :alt="`Slide ${i}`" data-media-id="" width="1920" height="810" decoding="async" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- image -->
      <img
        v-else-if="HERO_VISUAL === 'image'"
        data-media-id="hero-section"
        alt="Hero visual"
        width="1920" height="810"
        loading="eager"
        decoding="async"
        class="w-full aspect-[21/9] object-cover"
      />

      <!-- video -->
      <video
        v-else-if="HERO_VISUAL === 'video'"
        data-media-id=""
        autoplay muted loop playsinline
        class="w-full aspect-[21/9] object-cover"
        title="Hero video"
      ></video>

      <!-- color -->
      <div v-else-if="HERO_VISUAL === 'color'" class="w-full aspect-[21/9] bg-gradient-to-br from-primary/20 to-background" />

      <!-- gradient -->
      <AnimatedGradient v-else-if="HERO_VISUAL === 'gradient'" class="w-full aspect-[21/9]" />
    </div>
  </section>
</template>
```

## `typographic` layout pattern

```vue
<template>
  <section class="relative w-full min-h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 overflow-hidden">
    <!-- Subtle backdrop -->
    <div v-if="HERO_VISUAL === 'color'" class="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5" />
    <AnimatedGradient v-else-if="HERO_VISUAL === 'gradient'" class="absolute inset-0" />

    <!-- Large decorative number or eyebrow -->
    <p class="relative z-10 text-sm font-mono uppercase tracking-[0.3em] text-muted-foreground mb-8">
      Est. 2019 · Studio
    </p>

    <!-- Display heading — very large, drives the visual impact -->
    <h1 ref="headingEl" class="relative z-10 text-[clamp(3rem,12vw,10rem)] font-heading font-black leading-[0.85] tracking-tight text-foreground">
      We Make<br/>
      <span class="italic text-primary">Bold</span><br/>
      Digital Things
    </h1>

    <!-- Bottom row with description + CTA -->
    <div class="relative z-10 mt-16 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
      <p ref="subEl" class="text-lg text-muted-foreground max-w-sm leading-relaxed">
        A design studio crafting experiences that sit at the intersection of art and engineering.
      </p>
      <div ref="ctaEl" class="flex gap-4">
        <NuxtLink to="#work" class="btn-primary px-8 py-3.5">See Our Work</NuxtLink>
      </div>
    </div>

    <!-- Decorative horizontal rule -->
    <div class="relative z-10 mt-16 h-px bg-border" />
  </section>
</template>
```

## Swiper carousel setup (heroVisual === 'carousel' or stacked)

```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import Swiper from 'swiper'
import { Autoplay, EffectFade } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/effect-fade'

let heroSwiper: Swiper | null = null

onMounted(() => {
  heroSwiper = new Swiper('.hero-swiper', {
    modules: [Autoplay, EffectFade],
    effect: 'fade',
    loop: true,
    autoplay: { delay: 5000, disableOnInteraction: false },
    speed: 1200,
  })
})

onUnmounted(() => {
  heroSwiper?.destroy()
  heroSwiper = null
})
</script>
```

## 3D scene (heroVisual === '3d')

Use the pre-built `ThreeScene.vue` (already in the scaffold, SSR-safe). The `fullscreen` and
`split` examples above already have an inline `v-else-if="HERO_VISUAL === '3d'"` branch.

Choose the `preset` from the SPEC's creative direction — see the [3d-scene skill](../3d-scene/SKILL.md)'s selection
guide. Never reconstruct the component or inline Three.js.

## Optional background layer (`heroBackground`)

When `heroBackground` is set (available in `split`, `stacked`, and `typographic` layouts — NOT
`fullscreen`), the hero gets a subtle full-section backdrop layer **behind** the primary visual,
the text column, and any grid/block wrapper.

| `heroBackground` | Implementation |
|---|---|
| `'none'` | No backdrop — the page background shows through; default |
| `'gradient'` | `<AnimatedGradient />` in `<div class="absolute inset-0 -z-10">` — reuses the existing `AnimatedGradient.vue` |
| `'image'` | `<img data-media-id="hero-bg" class="absolute inset-0 size-full object-cover" loading="eager" decoding="async" />` inside `<div class="absolute inset-0 -z-10 overflow-hidden">` |

The background layer MUST be `-z-10` so it sits behind every other hero element. Do NOT
give it a higher z-index than the overlay or content.

For `split` layout, the background layer spans the full section behind the two-column grid —
it is NOT confined to the visual side. For `stacked` and `typographic`, it spans the full section.

The background MUST NOT animate in a way that competes with the primary visual. Use subtle
CSS transitions (fade-in, slow crossfade) rather than prominent GSAP timelines. If using
`AnimatedGradient`, prefer slow color cycles (`duration-5000` or longer).

### Background non-negotiable

When `heroBackground` is `'image'`, the AI must generate a distinct `image_prompts` entry for
the background texture/pattern (a separate `data-media-id` from the primary hero visual's
prompt). The planner prompt already handles this — verify the plan has 2 media prompts for
the hero when `heroBackground` is image.

## Non-negotiables

1. `loading="eager"` on all above-the-fold hero images — never `lazy` for the first visible image
2. Overlay `bg-black/50` is required on image and video backgrounds so text remains readable — adjust opacity in SPEC
3. Parallax images must be `absolute inset-[-8% to -10%]` inside `overflow-hidden` — the extra size is needed for the parallax travel range
4. `h-[100dvh]` not `h-screen` — `dvh` accounts for mobile browser chrome correctly
5. Scroll indicator uses `animate-bounce` CSS class (built into Tailwind) — not a GSAP animation
6. `useTextReveal` with `mode: 'words'` or `'chars'` on the main `<h1>` — heading animation is the hero's signature moment
7. Split layout: the parent `<section>` has `grid md:grid-cols-2` — the grid is on the section wrapper, not the text-side child. Never use absolute positioning for the two halves.
8. Typographic hero: heading size uses `clamp()` for fluid typography — never fixed `text-{n}xl` classes alone
9. Stacked carousel: Swiper is initialized in `onMounted`, never in `<script>` root — DOM must exist first
10. For `heroVisual === '3d'`, delegate to `ThreeScene.vue` from the [3d-scene skill](../3d-scene/SKILL.md) — never inline Three.js in HeroSection.vue
11. The visual in `split`/`stacked` layouts occupies ONLY its designated column/block — never `absolute inset-0` spanning the full hero section. Full-bleed `absolute inset-0` backgrounds are exclusive to `fullscreen` and `typographic`'s subtle backdrop.
12. The background layer (`heroBackground`) uses `-z-10` — never a higher z-index that would overlay section content. Use `absolute inset-0` with `overflow-hidden`.
13. A background `<video data-media-id>` is **ambient**: always `autoplay muted loop playsinline` with no `controls` attribute — never show the control bar on an ambient hero video, and never use `preload="none"` on the hero's background video.
