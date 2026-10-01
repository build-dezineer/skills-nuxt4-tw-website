---
name: 3d-scene
description: >-
  TresJS Three.js scenes via the pre-built `ThreeScene.vue`: six presets (particles,
  object, abstract, galaxy, ribbon, morph) for atmospheric backgrounds and product
  showcases, with post-processing that scales with `animationIntensity`. Use when a
  section needs a 3D background or object - never hand-roll Three.js.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "visual, 3d"
  stack: "nuxt4, vue3, tailwind4, tresjs, three, vueuse"
---

# 3D Scene Skill

## When to use
When `heroVisual === '3d'`, or when the SPEC calls for a Three.js/TresJS 3D element — hero
backgrounds, decorative sections, product showcases, interactive 3D illustrations.

## Use the pre-built component — do NOT reconstruct it

`ThreeScene.vue` and `usePostFX.ts` already exist in the scaffold, fully implemented, tested,
and **SSR-safe**. You almost never write Three.js by hand. Just render the component and pick a
`preset`:

```vue
<script setup lang="ts">
import ThreeScene from '~/components/shared/ThreeScene.vue'
</script>

<template>
  <section class="relative w-full h-[100dvh] overflow-hidden">
    <div class="absolute inset-0">
      <ThreeScene preset="particles" :mouse-track="true" animation-intensity="energetic" />
    </div>
    <div class="absolute inset-0 bg-black/40" /> <!-- overlay for text readability -->
    <div class="relative z-10 container mx-auto flex h-full flex-col items-center justify-center text-center">
      <h1 class="text-7xl font-heading font-black text-white">3D Hero</h1>
    </div>
  </section>
</template>
```

### Props
| Prop | Values | Notes |
|------|--------|-------|
| `preset` | `particles` `object` `abstract` `galaxy` `ribbon` `morph` | required — see selection guide |
| `mouseTrack` | boolean (default `true`) | Presets honoring mouse parallax: `particles`, `abstract`, `morph`, `ribbon`. `galaxy` is intentionally still (reads better undisturbed). `object` has its own drag-to-rotate via `OrbitControls`. |
| `color` | Three colour or CSS var (`'--primary'`) | particles colour; re-resolves on theme toggle |
| `animationIntensity` | `calm` `polished` `energetic` `cinematic` | drives post-processing level |
| `fallbackVariant` | `aurora` `linear` | the gradient shown when WebGL/motion is unavailable |

## Preset selection guide

### Fill-frame presets — edge-to-edge canvas coverage
| Preset | Character | Good for |
|--------|-----------|----------|
| `particles` | Drifting starfield with mouse parallax | Most heroes; tech / SaaS / general |
| `galaxy` | Spiral point field, warm→cool gradient | Space / data / ambitious brands |
| `ribbon` | Flowing animated line curves | Elegant / editorial / motion-led |

These fill the entire canvas. Use a `bg-black/40`–`/50` overlay for hero text readability.

### Focal/centered presets — single object on transparent canvas
| Preset | Character | Good for |
|--------|-----------|----------|
| `object` | Centred metallic torus-knot with environment reflections | Product / brand-forward |
| `abstract` | Noise-displaced morphing blob (shader) | Creative / experimental |
| `morph` | Geometry morphing sphere↔cube↔star | Playful / dynamic |

These are small centered objects surrounded by transparency — most of the canvas is empty.
Best suited to a contained panel or showcase area. If used as a full hero background, use a
much lighter overlay (`bg-black/10`–`/20`) or a side scrim behind text only — never a uniform
40–50% tint, or the object gets visually lost against the muted backdrop.

Pick from the SPEC's creative direction and brand personality.

## Post-processing
`usePostFX(animationIntensity)` is pre-built and returns `showVignette` / `showBloom` /
`showChromaticAberration` (calm = none → cinematic = all). `ThreeScene` accepts an optional
`#post-processing` slot if a page wants to add an `<EffectComposer>`; most pages don't need to.

## Non-negotiables
1. **Use the pre-built `ThreeScene.vue`** — never re-implement TresJS/Three.js from scratch, never
   inline `new THREE.*` in a page component.
2. **SSR safety is already handled** inside `ThreeScene` (`<ClientOnly>` + a static
   `AnimatedGradient` fallback, WebGL + `prefers-reduced-motion` guards). Do not remove the
   wrapping `<div class="absolute inset-0">` that gives the canvas its size.
3. The parent element MUST have explicit dimensions (`w-full h-full`, or `absolute inset-0`) —
   `TresCanvas` sizes to its parent.
4. Overlay choice depends on the preset type:
   - **Fill-frame presets** (`particles`, `galaxy`, `ribbon`): `bg-black/40`–`/50` for hero text readability.
   - **Focal presets** (`object`, `abstract`, `morph`): use a lighter overlay (`bg-black/10`–`/20`) or a side scrim behind text only — a heavy uniform tint over the mostly-transparent canvas mutes the object into a gray block.
5. Do NOT import `TresCanvas` from `@tresjs/core` in page code — the component handles rendering.
