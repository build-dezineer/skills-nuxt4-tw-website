---
name: page-header
description: >-
  Inner-page header for non-home pages in five variants: minimal, centered, split with an
  oversized index number, image with parallax overlay, and editorial article metadata.
  Integrates text and scroll reveals and stays shorter than a hero. Use when building
  About, Services, Contact, Case Study or Article headers.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "layout, page-header"
  stack: "nuxt4, vue3, tailwind4"
---

# Page Header Skill

## When to use
Every inner page (any page that is NOT the home page) needs a page header. This is NOT the home-page hero — it is shorter, typographically-led, and never uses fullscreen height, 3D scenes, or ambient video. Generate one instance of `PageHeader.vue` per inner page and place it as the first section below `NavBar`.

Read the page type from SPEC to pick the correct variant:

| Page type | Recommended variant |
|---|---|
| About, Services, Work, Partnership | `minimal` or `split` |
| Contact, FAQ, Resources | `centered` |
| Case study, Project detail | `image` |
| Article, Blog post, Insight | `editorial` |
| Generic / unstyled | `minimal` |

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/PageHeader.vue` | Inner page header, variant driven by prop |

## Layout variants

| Variant | Height | Character |
|---|---|---|
| `minimal` | `py-24 md:py-32` | Left-aligned eyebrow + H1 + optional description. Clean, no background. |
| `centered` | `py-28 md:py-36` | All elements centred. Good for symmetric pages (contact, FAQ). |
| `split` | `min-h-[50vh]` | H1 left column, large decorative element right (number, stat, or pattern). |
| `image` | `min-h-[55vh]` | Background image with overlay + centred content. For case study/project pages. |
| `editorial` | `py-24 md:py-32` | Left-aligned, includes metadata row: date, author, category tag, read time. For articles. |

---

## `minimal` variant (most common inner page header)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTextReveal } from '~/composables/useTextMotion'
import { useScrollReveal } from '~/composables/useScrollMotion'
import { cn } from '~/utils/cn'

interface Breadcrumb { label: string; href?: string }

interface Props {
  variant?: 'minimal' | 'centered' | 'split' | 'image' | 'editorial'
  eyebrow?: string
  heading: string
  subtext?: string
  breadcrumbs?: Breadcrumb[]
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'minimal',
})

const headingEl = ref<HTMLElement | null>(null)
const subEl     = ref<HTMLElement | null>(null)

useTextReveal(() => headingEl.value, { mode: 'words', intensity: 'polished', delay: 0.1 })
useScrollReveal(() => subEl.value, { intensity: 'polished', delay: 0.35 })
</script>

<template>
  <section class="py-24 md:py-32 bg-background border-b border-border">
    <div class="container mx-auto px-6 md:px-10 max-w-5xl">

      <!-- Breadcrumb -->
      <nav v-if="breadcrumbs?.length" class="mb-8 flex items-center gap-2 text-xs font-mono text-muted-foreground" aria-label="Breadcrumb">
        <NuxtLink to="/" class="hover:text-foreground transition-colors">Home</NuxtLink>
        <template v-for="(crumb, i) in breadcrumbs" :key="crumb.label">
          <span>/</span>
          <component
            :is="crumb.href ? 'NuxtLink' : 'span'"
            :to="crumb.href"
            :class="cn('transition-colors', crumb.href ? 'hover:text-foreground' : 'text-foreground')"
          >{{ crumb.label }}</component>
        </template>
      </nav>

      <!-- Eyebrow -->
      <p v-if="eyebrow" class="text-sm font-mono uppercase tracking-[0.2em] text-primary mb-6">
        {{ eyebrow }}
      </p>

      <!-- H1 — text reveal runs on this element -->
      <h1
        ref="headingEl"
        class="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-foreground leading-[0.95] tracking-tight max-w-3xl"
      >
        {{ heading }}
      </h1>

      <!-- Subtext -->
      <p
        v-if="subtext"
        ref="subEl"
        class="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl"
      >
        {{ subtext }}
      </p>
    </div>
  </section>
</template>
```

---

## `centered` variant

```vue
<template>
  <section class="py-28 md:py-36 bg-background border-b border-border">
    <div class="container mx-auto px-6 md:px-10 text-center max-w-3xl">

      <p v-if="eyebrow" class="text-sm font-mono uppercase tracking-[0.2em] text-primary mb-6">
        {{ eyebrow }}
      </p>

      <h1
        ref="headingEl"
        class="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-foreground leading-[0.95] tracking-tight"
      >
        {{ heading }}
      </h1>

      <p
        v-if="subtext"
        ref="subEl"
        class="mt-6 text-lg text-muted-foreground leading-relaxed"
      >
        {{ subtext }}
      </p>
    </div>
  </section>
</template>
```

---

## `split` variant

Large decorative index number right — Awwward editorial device that adds visual weight to inner pages.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTextReveal } from '~/composables/useTextMotion'
import { useScrollReveal } from '~/composables/useScrollMotion'

interface Props {
  heading: string
  eyebrow?: string
  subtext?: string
  index?: string   // e.g. '01', '02' — shows as decorative large number on the right
}

const props = withDefaults(defineProps<Props>(), {
  index: '01',
})

const headingEl = ref<HTMLElement | null>(null)
const subEl     = ref<HTMLElement | null>(null)

useTextReveal(() => headingEl.value, { mode: 'words', intensity: 'polished', delay: 0.1 })
useScrollReveal(() => subEl.value, { intensity: 'polished', delay: 0.35 })
</script>

<template>
  <section class="min-h-[50vh] flex items-center border-b border-border bg-background overflow-hidden">
    <div class="container mx-auto px-6 md:px-10 py-24 w-full">
      <div class="grid md:grid-cols-[1fr_auto] items-end gap-12 md:gap-20">

        <!-- Left: text -->
        <div>
          <p v-if="eyebrow" class="text-sm font-mono uppercase tracking-[0.2em] text-primary mb-6">
            {{ eyebrow }}
          </p>
          <h1
            ref="headingEl"
            class="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-foreground leading-[0.95] tracking-tight"
          >
            {{ heading }}
          </h1>
          <p
            v-if="subtext"
            ref="subEl"
            class="mt-6 text-lg text-muted-foreground leading-relaxed max-w-xl"
          >
            {{ subtext }}
          </p>
        </div>

        <!-- Right: oversized index number — decorative, screen-reader hidden -->
        <div
          v-if="index"
          class="hidden md:block text-[clamp(6rem,15vw,14rem)] font-heading font-black leading-none tabular-nums text-border/60 select-none"
          aria-hidden="true"
        >
          {{ index }}
        </div>
      </div>

      <!-- Bottom divider line — design detail -->
      <div class="mt-16 h-px bg-border w-full" />
    </div>
  </section>
</template>
```

---

## `image` variant

For case studies, project pages, and any inner page that needs visual impact.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTextReveal } from '~/composables/useTextMotion'
import { useScrollReveal } from '~/composables/useScrollMotion'
import { useParallax } from '~/composables/useScrollMotion'

interface Props {
  heading: string
  eyebrow?: string
  subtext?: string
  category?: string
  overlay?: string   // Tailwind class, e.g. 'bg-black/50'. Default: 'bg-black/55'
}

const props = withDefaults(defineProps<Props>(), {
  overlay: 'bg-black/55',
})

const headingEl = ref<HTMLElement | null>(null)
const subEl     = ref<HTMLElement | null>(null)
const imageEl   = ref<HTMLElement | null>(null)

useTextReveal(() => headingEl.value, { mode: 'words', intensity: 'polished', delay: 0.1 })
useScrollReveal(() => subEl.value, { intensity: 'polished', delay: 0.35 })
useParallax(() => imageEl.value, { speed: 0.12 })
</script>

<template>
  <section class="relative min-h-[55vh] flex items-end overflow-hidden">

    <!-- Background image (parallax wrapper needs overflow-hidden on parent) -->
    <div class="absolute inset-[-8%]" ref="imageEl">
      <img
        data-media-id="page-header"
        alt="Page header background"
        width="1920" height="1080"
        loading="eager"
        decoding="async"
        class="aspect-video w-full h-full object-cover"
      />
    </div>

    <!-- Overlay -->
    <div class="absolute inset-0" :class="overlay" />

    <!-- Content -->
    <div class="relative z-10 container mx-auto px-6 md:px-10 pb-14 pt-32 w-full">

      <!-- Category tag -->
      <span
        v-if="category"
        class="inline-block mb-5 text-xs font-mono uppercase tracking-widest text-white/60 border border-white/20 rounded-full px-3 py-1"
      >
        {{ category }}
      </span>

      <h1
        ref="headingEl"
        class="text-4xl md:text-6xl lg:text-7xl font-heading font-black text-white leading-[0.95] tracking-tight max-w-4xl"
      >
        {{ heading }}
      </h1>

      <p
        v-if="subtext"
        ref="subEl"
        class="mt-5 text-lg text-white/70 leading-relaxed max-w-2xl"
      >
        {{ subtext }}
      </p>
    </div>
  </section>
</template>
```

---

## `editorial` variant

For articles, blog posts, and insights. Includes the metadata row common on premium editorial sites.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useTextReveal } from '~/composables/useTextMotion'
import { useScrollReveal } from '~/composables/useScrollMotion'

interface Props {
  heading: string
  eyebrow?: string      // e.g. category name: 'Case Study', 'Insight'
  subtext?: string
  author?: string
  authorAvatar?: string // URL or omit for placeholder
  date?: string         // e.g. 'June 12, 2026'
  readTime?: string     // e.g. '6 min read'
  tags?: string[]
}

const props = defineProps<Props>()

const headingEl  = ref<HTMLElement | null>(null)
const metaEl     = ref<HTMLElement | null>(null)

useTextReveal(() => headingEl.value, { mode: 'words', intensity: 'polished', delay: 0.1 })
useScrollReveal(() => metaEl.value, { intensity: 'polished', delay: 0.5 })
</script>

<template>
  <section class="py-24 md:py-32 bg-background border-b border-border">
    <div class="container mx-auto px-6 md:px-10 max-w-4xl">

      <!-- Category eyebrow -->
      <p v-if="eyebrow" class="text-sm font-mono uppercase tracking-[0.2em] text-primary mb-6">
        {{ eyebrow }}
      </p>

      <!-- Article title — text reveal -->
      <h1
        ref="headingEl"
        class="text-4xl md:text-6xl font-heading font-black text-foreground leading-[1.0] tracking-tight"
      >
        {{ heading }}
      </h1>

      <!-- Abstract / subtext -->
      <p
        v-if="subtext"
        class="mt-5 text-xl text-muted-foreground leading-relaxed font-light"
      >
        {{ subtext }}
      </p>

      <!-- Metadata row -->
      <div
        ref="metaEl"
        class="mt-10 pt-6 border-t border-border flex flex-wrap items-center gap-5 md:gap-8"
      >
        <!-- Author -->
        <div v-if="author" class="flex items-center gap-3">
          <img
            :alt="author"
            data-media-id=""
            width="40" height="40"
            decoding="async"
            class="w-10 h-10 aspect-square rounded-full shrink-0 object-cover"
          />
          <div>
            <p class="text-sm font-semibold text-foreground">{{ author }}</p>
          </div>
        </div>

        <!-- Divider (only on desktop when author is shown) -->
        <div v-if="author && (date || readTime)" class="hidden md:block h-8 w-px bg-border" />

        <!-- Date -->
        <time
          v-if="date"
          class="text-sm text-muted-foreground font-mono"
          :datetime="date"
        >{{ date }}</time>

        <!-- Read time -->
        <span v-if="readTime" class="text-sm text-muted-foreground font-mono">{{ readTime }}</span>

        <!-- Tags -->
        <div v-if="tags?.length" class="flex flex-wrap gap-2 ml-auto">
          <span
            v-for="tag in tags"
            :key="tag"
            class="text-xs font-mono uppercase tracking-wider text-primary border border-primary/30 rounded-full px-3 py-1"
          >{{ tag }}</span>
        </div>
      </div>
    </div>
  </section>
</template>
```

---

## Required imports

```ts
import { ref } from 'vue'
import { useTextReveal } from '~/composables/useTextMotion'
import { useScrollReveal } from '~/composables/useScrollMotion'
import { useParallax } from '~/composables/useScrollMotion'   // image variant only
import { cn } from '~/utils/cn'
```

## Usage examples

### Minimal (About page)

```vue
<PageHeader
  variant="minimal"
  eyebrow="Who we are"
  heading="A studio built on craft and conviction."
  subtext="We partner with ambitious brands to build digital products that outlast trends."
  :breadcrumbs="[{ label: 'About', href: '/about' }]"
/>
```

### Split (Services page)

```vue
<PageHeader
  variant="split"
  eyebrow="What we do"
  heading="Services built around your goals."
  subtext="From discovery to delivery — we handle the full stack."
  index="02"
/>
```

### Image (Case study)

```vue
<PageHeader
  variant="image"
  category="Case Study"
  heading="Redesigning the onboarding flow for 2M users."
  subtext="How a focused 6-week engagement cut drop-off by 40%."
  overlay="bg-black/60"
/>
```

### Editorial (Article)

```vue
<PageHeader
  variant="editorial"
  eyebrow="Insight"
  heading="Why AI-native teams ship 3× faster."
  subtext="A field report from 18 months of building alongside AI tools."
  author="James Okafor"
  date="June 12, 2026"
  read-time="8 min read"
  :tags="['AI', 'Process', 'Engineering']"
/>
```

## Non-negotiables

1. `<h1>` on the page heading — every inner page must have exactly one `<h1>`; never use `<h2>` or `<div>` for the page title
2. `useTextReveal` on the heading — the text entrance is the page header's signature moment; apply `mode: 'words'` (or `'chars'` for cinematic intensity)
3. `loading="eager"` on the `image` variant's background — it is above the fold and LCP; never `lazy`
4. Breadcrumbs: the last item (current page) has no `href` and renders as `<span>`, not a link — never make the current page a clickable link
5. `split` variant index number: `aria-hidden="true"` — it is a decorative device, not content
6. `editorial` variant `<time>` element uses `datetime` attribute — always a machine-readable ISO date or standard date string
7. `image` variant background image: wrapped in `absolute inset-[-8%]` inside `overflow-hidden` — the extra bleed provides parallax travel range
8. `centered` variant: use `max-w-3xl` on the container — headings that span full-width at large screens lose readability
9. Never show the home-page hero elements (scroll indicator, CTA buttons, 3D scene, video background) in a page header — those are reserved for the [hero skill](../hero/SKILL.md)
10. `editorial` tags: rendered as `border border-primary/30` pills — never filled background pills (they compete with category eyebrow colour)
11. The `split` variant's decorative number uses `text-border/60` — it should recede behind the title, never dominate it
12. All heading sizes use `leading-[0.95]` or `leading-[1.0]` — tighter leading at display sizes; never `leading-tight` (which is 1.25 and too loose for black-weight headings)
