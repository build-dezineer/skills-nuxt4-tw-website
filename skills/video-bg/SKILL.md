---
name: video-bg
description: >-
  Ambient full-bleed background video component: lazy-loads on intersection, pauses
  off-screen, respects `prefers-reduced-motion` with a poster fallback, cross-fades on
  `canplay`, and layers slot content with configurable overlay colour and opacity. Use
  when a section needs a cinematic background.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "visual, video, background"
  stack: "nuxt4, vue3, tailwind4"
---

# Video Background Skill

## When to use
When `heroVisual === 'video'` or any section needs an ambient looping video as a background (e.g. a `cta` section with a video background).

## What to do

**Do NOT generate a `VideoBg.vue` component — it does not exist in this project and must never be created.** Emit an ambient `<video data-media-id="...">` element directly (see the [media skill](../media/SKILL.md)) and let the pipeline inject the real `:src` after downloading the asset. Never write a `<video>` with a hardcoded placeholder src for background use.

The `<video data-media-id>` element is **pipeline-managed** — never add `src` yourself. Ambient video attributes: `autoplay muted loop playsinline`; omit `controls`. An ambient video must never render the control bar.

## Usage in hero section (background layer)

```vue
<template>
  <section class="relative w-full h-[100dvh] overflow-hidden">
    <!-- Ambient background video layer -->
    <div class="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <video
        data-media-id=""
        autoplay
        muted
        loop
        playsinline
        class="absolute inset-0 w-full h-full object-cover"
        title="Background video"
      ></video>
    </div>
    <!-- Overlay for text readability -->
    <div class="absolute inset-0 -z-10 bg-black/50" aria-hidden="true" />

    <!-- Hero content layered above -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full text-center px-6">
      <h1 class="text-7xl font-heading font-black text-white">We Create</h1>
      <p class="mt-4 text-xl text-white/70">Award-worthy digital experiences.</p>
      <NuxtLink to="#contact" class="mt-8 btn-primary">Get in Touch</NuxtLink>
    </div>
  </section>
</template>
```

## Usage in CTA section

```vue
<template>
  <section class="relative w-full overflow-hidden">
    <div class="absolute inset-0 overflow-hidden" aria-hidden="true">
      <video
        data-media-id=""
        autoplay
        muted
        loop
        playsinline
        class="absolute inset-0 w-full h-full object-cover"
        title="Background video"
      ></video>
      <div class="absolute inset-0 bg-background/70" aria-hidden="true" />
    </div>
    <div class="relative z-10 flex flex-col items-center justify-center py-24 text-center px-6">
      <h2 class="text-5xl font-heading font-bold text-foreground">Ready to Start?</h2>
      <NuxtLink to="/contact" class="mt-8 btn-primary px-10 py-4">Let's Talk</NuxtLink>
    </div>
  </section>
</template>
```

## Non-negotiables

1. **Never create `VideoBg.vue`** — it does not exist. Emit the `<video data-media-id>` element directly in ambient mode; the pipeline injects the real `:src`
2. Ambient = `autoplay muted loop playsinline` with no `controls` attribute — the control bar must never render on a background video
3. The background video layer is `absolute inset-0` (or `-z-10`) inside an `overflow-hidden` section — content sits in a `relative z-10` container above it
4. An overlay (e.g. `bg-black/50`) is required so text stays readable — adjust opacity from SPEC
5. `preload="none"` must NOT be set on the hero's background video — leave it unset (ambient videos preload for immediate autoplay); `preload="none"` is only for user-triggered players
6. `aria-hidden="true"` on the video layer wrapper — ambient background video has no informational content for screen readers
7. The section must still work when the video is missing: never rely on the video alone for layout height — give the section its own `h-[100dvh]` / `py-*` sizing
8. `data-media-id` comes from the page spec's Image Prompts (or `""` when none is allocated — the pipeline fills it)
