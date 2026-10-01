---
name: cta
description: >-
  Conversion call-to-action bands in four layouts: full-bleed inverted, split with
  newsletter capture, video background, and minimal text + button. Forms include loading
  and success states. Use for sign-ups, demo requests, and closing page sections.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "content, cta, conversion"
  stack: "nuxt4, vue3, tailwind4, lucide"
---

# CTA Skill

## When to use
Call-to-action sections that drive a conversion — sign-up, demo request, contact, newsletter, or any primary site goal. Use when SPEC includes a bottom CTA, banner, or conversion section. Often placed near the footer.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/CtaSection.vue` | CTA section with layout variant |

## Layout variants

| Layout | Best for |
|---|---|
| `full-bleed` | Solid or gradient colour block, centred headline + CTA button |
| `split` | Text left + decorative visual or email input right |
| `video-bg` | Ambient video behind CTA (uses the [video-bg skill](../video-bg/SKILL.md)'s `VideoBg.vue`) |
| `minimal` | Simple text + button row, no background |

## `full-bleed` layout (most common)

```vue
<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'
import { useScrollReveal } from '~/composables/useScrollMotion'
import { ref } from 'vue'

const sectionEl = ref<HTMLElement | null>(null)
useScrollReveal(() => sectionEl.value?.querySelectorAll('.cta-reveal') ?? null, {
  intensity: 'polished',
  stagger: 0.12,
})
</script>

<template>
  <section ref="sectionEl" class="py-32 bg-primary">
    <div class="container mx-auto px-6 md:px-10 text-center max-w-3xl">
      <p class="cta-reveal text-sm font-mono uppercase tracking-widest text-primary-foreground/60 mb-6">
        Ready to begin?
      </p>
      <h2 class="cta-reveal text-4xl md:text-6xl font-heading font-black text-primary-foreground leading-tight">
        Let's build something remarkable together.
      </h2>
      <p class="cta-reveal mt-6 text-lg text-primary-foreground/70 leading-relaxed max-w-xl mx-auto">
        Whether you're starting from scratch or reinventing an existing product, we're here to help you get it right.
      </p>
      <div class="cta-reveal mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <NuxtLink
          to="/contact"
          class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-foreground text-primary font-semibold text-base hover:bg-primary-foreground/90 hover:scale-[1.02] active:scale-[0.98] transition-all"
        >
          Start a project
          <ArrowRight class="w-4 h-4" />
        </NuxtLink>
        <NuxtLink
          to="/work"
          class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-primary-foreground/30 text-primary-foreground hover:border-primary-foreground/60 transition-all"
        >
          See our work
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
```

## `split` layout (text + email capture)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { ArrowRight } from 'lucide-vue-next'

const email = ref('')
const submitted = ref(false)
const submitting = ref(false)

async function submit() {
  if (!email.value || submitting.value) return
  submitting.value = true
  // Replace with real API call
  await new Promise(r => setTimeout(r, 800))
  submitted.value = true
  submitting.value = false
}
</script>

<template>
  <section class="py-24 bg-muted/30 border-y border-border">
    <div class="container mx-auto px-6 md:px-10">
      <div class="grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <!-- Text -->
        <div class="flex flex-col gap-5">
          <p class="text-sm font-mono uppercase tracking-widest text-primary">Newsletter</p>
          <h2 class="text-3xl md:text-4xl font-heading font-bold text-foreground leading-tight">
            Stay ahead of the curve.
          </h2>
          <p class="text-muted-foreground leading-relaxed">
            Monthly insights on design, technology, and building products that matter. No spam, ever.
          </p>
        </div>

        <!-- Form -->
        <div class="flex flex-col gap-4">
          <Transition name="fade" mode="out-in">
            <div v-if="!submitted" key="form">
              <form class="flex flex-col sm:flex-row gap-3" @submit.prevent="submit">
                <input
                  v-model="email"
                  type="email"
                  placeholder="your@email.com"
                  required
                  class="flex-1 rounded-xl border border-border bg-background px-5 py-3.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
                <button
                  type="submit"
                  :disabled="submitting"
                  class="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 transition-all shrink-0"
                >
                  <span v-if="submitting">Subscribing…</span>
                  <span v-else class="flex items-center gap-2">Subscribe <ArrowRight class="w-4 h-4" /></span>
                </button>
              </form>
              <p class="text-xs text-muted-foreground mt-3">Join 5,000+ readers. Unsubscribe anytime.</p>
            </div>
            <div v-else key="success" class="flex items-center gap-3 py-3">
              <div class="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                <Check class="w-4 h-4 text-secondary" />
              </div>
              <div>
                <p class="font-semibold text-foreground">You're in!</p>
                <p class="text-sm text-muted-foreground">First edition lands next month.</p>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-enter-from   { opacity: 0; transform: translateY(8px); }
.fade-leave-to     { opacity: 0; transform: translateY(-8px); }
</style>
```

## `video-bg` layout

```vue
<script setup lang="ts">
import VideoBg from '~/components/shared/VideoBg.vue'
import { ArrowRight } from 'lucide-vue-next'
</script>

<template>
  <section class="w-full">
    <VideoBg overlay="bg-black/60" class="w-full min-h-[60vh]">
      <div class="flex flex-col items-center justify-center min-h-[60vh] text-center px-6 py-24">
        <h2 class="text-4xl md:text-6xl font-heading font-black text-white leading-tight max-w-3xl">
          Let's create something the world hasn't seen.
        </h2>
        <p class="mt-6 text-lg text-white/70 max-w-xl">
          Start with a conversation. No commitment, no pressure.
        </p>
        <div class="mt-10 flex gap-4 flex-wrap justify-center">
          <NuxtLink to="/contact"
            class="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-foreground font-semibold hover:bg-white/90 hover:scale-[1.02] transition-all">
            Get in touch <ArrowRight class="w-4 h-4" />
          </NuxtLink>
        </div>
      </div>
    </VideoBg>
  </section>
</template>
```

## `minimal` layout

```vue
<template>
  <section class="py-20 bg-background border-t border-border">
    <div class="container mx-auto px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-8">
      <div>
        <h2 class="text-2xl md:text-3xl font-heading font-bold text-foreground">
          Ready to start your project?
        </h2>
        <p class="mt-2 text-muted-foreground">Let's talk about what you're building.</p>
      </div>
      <NuxtLink to="/contact"
        class="shrink-0 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] transition-all">
        Contact us <ArrowRight class="w-4 h-4" />
      </NuxtLink>
    </div>
  </section>
</template>
```

## Required imports

```ts
import { ref } from 'vue'
import { ArrowRight, Check } from 'lucide-vue-next'
import { useScrollReveal } from '~/composables/useScrollMotion'
import VideoBg from '~/components/shared/VideoBg.vue'  // video-bg layout only
```

## Non-negotiables

1. `full-bleed` CTA: uses `bg-primary text-primary-foreground` — the primary action deserves the brand colour; never `bg-foreground` here
2. Primary CTA button in `full-bleed`: inverted colours `bg-primary-foreground text-primary` — the button must contrast against the primary background
3. Email input: `type="email"` + `required` — always validated; never `type="text"` for email fields
4. Form: `@submit.prevent` on `<form>` — never a raw button that triggers page reload
5. Success state: uses `<Transition name="fade" mode="out-in">` with `v-if` / `v-else` — smooth swap, not a `v-show` flicker
6. Video-bg CTA: `min-h-[60vh]` on the content wrapper inside `VideoBg` — never a hardcoded pixel height
7. `video-bg` layout requires the [video-bg skill](../video-bg/SKILL.md)'s `VideoBg.vue` — explicitly import it
8. Minimal CTA: `flex flex-col md:flex-row` + `items-center justify-between` — text left, button right on desktop, stacked on mobile
9. CTA text: headline is concise (1-2 lines), subtext is brief (1 sentence) — never long paragraphs in a CTA section
10. All CTA buttons: `hover:scale-[1.02] active:scale-[0.98] transition-all` — interactive feedback on CTA buttons (RULES.md)
