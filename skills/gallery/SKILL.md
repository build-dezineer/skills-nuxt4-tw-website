---
name: gallery
description: >-
  Portfolio and gallery in four layouts: masonry, bento, filtered (GSAP Flip on category
  change), and equal-cell grid, with a Radix fullscreen lightbox supporting keyboard
  navigation and hover overlays. Use when building portfolios, project showcases or image grids.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.1.0"
  tags: "content, gallery, portfolio"
  stack: "nuxt4, vue3, tailwind4, gsap, radix-vue, lucide"
---

# Gallery Skill

## When to use
Portfolio grids, photo galleries, project showcases, case study listings, image archives. Use when the SPEC includes a work, portfolio, gallery, or projects section.


> **Never call `context.selector()`.** It only exists on a *scoped* context and is `undefined` on `gsap.matchMedia()` / `gsap.context(fn)`, where calling it throws. Query through the section’s template ref instead: `sectionRef.value?.querySelectorAll('.item') ?? []`.

**Media contract:** every gallery item uses `<img data-media-id>` — an allocated id from the spec's Image Prompts, or `data-media-id=""` (the pipeline fills a real, replaceable image and injects `:src`). NEVER write an `<img>` with a hardcoded placeholder src or inline `data:image/svg` grey boxes — they render as dead, non-editable images.

## Architecture

Generate ONE or TWO files:

| File | When |
|------|------|
| `app/components/sections/GallerySection.vue` | Always |
| `app/components/shared/LightboxDialog.vue` | When lightbox is needed (default yes) |

## Layout variants

| Layout | Best for |
|---|---|
| `masonry` | Photography portfolios, varied-size images |
| `bento` | Creative agencies, asymmetric fixed-size grid |
| `filtered` | Project showcases with category filtering (GSAP Flip on reorder) |
| `grid` | Standard equal-size grid, simplest option |

## `masonry` layout

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { cn } from '~/utils/cn'
import LightboxDialog from '~/components/shared/LightboxDialog.vue'
import { useScrollReveal } from '~/composables/useScrollMotion'

interface GalleryItem {
  alt: string
  mediaId: string
  width: number
  height: number
  label?: string
  category?: string
}

const items: GalleryItem[] = [
  { alt: 'Brand identity project', mediaId: 'work-branding', width: 800, height: 600, category: 'Branding' },
  { alt: 'E-commerce redesign', mediaId: 'work-ecommerce', width: 800, height: 1000, category: 'Web' },
  { alt: 'Mobile app UI', mediaId: 'work-mobile', width: 800, height: 500, category: 'Product' },
  { alt: 'Annual report design', mediaId: 'work-report', width: 800, height: 700, category: 'Print' },
  { alt: 'Logo system exploration', mediaId: 'work-logo', width: 800, height: 600, category: 'Branding' },
  { alt: 'SaaS dashboard', mediaId: 'work-saas', width: 800, height: 900, category: 'Web' },
]

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

const gridEl = ref<HTMLElement | null>(null)
useScrollReveal(() => gridEl.value?.querySelectorAll('.gallery-item') ?? null, {
  intensity: 'polished',
  stagger: 0.07,
})
</script>

<template>
  <section class="py-24 bg-background">
    <div class="container mx-auto px-6 md:px-10">
      <div class="mb-14">
        <p class="text-sm font-mono uppercase tracking-widest text-primary mb-4">Work</p>
        <h2 class="text-4xl md:text-5xl font-heading font-bold text-foreground">Selected projects</h2>
      </div>

      <!-- Masonry grid -->
      <div ref="gridEl" class="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
        <div
          v-for="(item, i) in items"
          :key="item.alt"
          class="gallery-item break-inside-avoid group relative overflow-hidden rounded-2xl cursor-pointer"
          @click="openLightbox(i)"
          role="button"
          :aria-label="`View ${item.alt}`"
          tabindex="0"
          @keydown.enter="openLightbox(i)"
        >
          <img
            :alt="item.alt"
            :data-media-id="item.mediaId"
            :width="item.width"
            :height="item.height"
            decoding="async"
            class="w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <!-- Hover overlay -->
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-end p-5">
            <div class="translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              <span v-if="item.category" class="text-xs font-mono uppercase tracking-widest text-white/70">{{ item.category }}</span>
              <p class="text-white font-heading font-semibold mt-1">{{ item.alt }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Load more (optional) -->
      <div class="text-center mt-12">
        <button class="btn-ghost px-8 py-3">View All Projects</button>
      </div>
    </div>

    <!-- Lightbox -->
    <LightboxDialog
      v-model:open="lightboxOpen"
      :items="items"
      v-model:index="lightboxIndex"
    />
  </section>
</template>
```

## `filtered` layout (with GSAP Flip on category change)

```vue
<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import LightboxDialog from '~/components/shared/LightboxDialog.vue'

gsap.registerPlugin(Flip)

const activeCategory = ref('All')
const categories = ['All', 'Branding', 'Web', 'Product', 'Print']

const filteredItems = computed(() =>
  activeCategory.value === 'All'
    ? items
    : items.filter(i => i.category === activeCategory.value)
)

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

async function setCategory(cat: string) {
  const state = Flip.getState('.gallery-item')
  activeCategory.value = cat
  await nextTick()
  Flip.from(state, {
    duration: 0.5,
    ease: 'power2.inOut',
    stagger: 0.04,
    absolute: true,
    onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.4 }),
    onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.9, duration: 0.3 }),
  })
}
</script>

<template>
  <section class="py-24 bg-background">
    <div class="container mx-auto px-6 md:px-10">
      <!-- Filter tabs -->
      <div class="flex flex-wrap gap-2 mb-10">
        <button
          v-for="cat in categories"
          :key="cat"
          class="px-5 py-2 rounded-full text-sm font-medium transition-all"
          :class="activeCategory === cat ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground'"
          @click="setCategory(cat)"
        >
          {{ cat }}
        </button>
      </div>

      <!-- Grid with Flip animation -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div
          v-for="(item, i) in filteredItems"
          :key="item.alt"
          class="gallery-item group relative overflow-hidden rounded-2xl cursor-pointer aspect-[4/3]"
          role="button"
          :aria-label="`View ${item.alt}`"
          tabindex="0"
          @click="openLightbox(i)"
          @keydown.enter="openLightbox(i)"
        >
          <img :alt="item.alt" :data-media-id="item.mediaId" :width="item.width" :height="item.height" decoding="async" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <LightboxDialog
      v-model:open="lightboxOpen"
      :items="filteredItems"
      v-model:index="lightboxIndex"
    />
  </section>
</template>
```

## `LightboxDialog.vue` (shared component)

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogClose } from 'radix-vue'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'

interface LightboxItem { alt: string; mediaId: string; width: number; height: number }

interface Props {
  items: LightboxItem[]
}
const props = defineProps<Props>()

const open = defineModel<boolean>('open', { default: false })
const index = defineModel<number>('index', { default: 0 })

const current = computed(() => props.items[index.value])

function prev() { index.value = (index.value - 1 + props.items.length) % props.items.length }
function next() { index.value = (index.value + 1) % props.items.length }
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm" />
      <DialogContent
        class="fixed inset-0 z-[201] flex items-center justify-center p-4"
        @keydown.left="prev"
        @keydown.right="next"
      >
        <!-- Close -->
        <DialogClose
          class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          aria-label="Close lightbox"
        >
          <X class="w-5 h-5" />
        </DialogClose>

        <!-- Prev -->
        <button
          v-if="items.length > 1"
          class="absolute left-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          @click="prev"
          aria-label="Previous image"
        >
          <ChevronLeft class="w-5 h-5" />
        </button>

        <!-- Image -->
        <div class="max-w-5xl max-h-[90vh] w-full overflow-hidden rounded-xl">
          <img
            v-if="current"
            :alt="current.alt"
            :data-media-id="current.mediaId"
            :width="current.width"
            :height="current.height"
            decoding="async"
            class="w-full max-h-[90vh] object-contain"
          />
        </div>

        <!-- Next -->
        <button
          v-if="items.length > 1"
          class="absolute right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          @click="next"
          aria-label="Next image"
        >
          <ChevronRight class="w-5 h-5" />
        </button>

        <!-- Counter -->
        <p v-if="items.length > 1" class="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white/50 font-mono">
          {{ index + 1 }} / {{ items.length }}
        </p>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
```

## Required imports

```ts
import { ref, computed, nextTick } from 'vue'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogClose } from 'radix-vue'
import { X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import LightboxDialog from '~/components/shared/LightboxDialog.vue'
import { useScrollReveal } from '~/composables/useScrollMotion'
```

## Non-negotiables

1. `gsap.registerPlugin(Flip)` at module level — Flip is a GSAP plugin that must be registered before use
2. `Flip.getState('.gallery-item')` must be called **before** the reactive state change — it records positions before DOM update
3. `await nextTick()` between `getState` and `Flip.from` — DOM must update first so Flip can read new positions
4. Masonry: `break-inside-avoid` on every card — prevents column breaks inside a card
5. Image hover scale: `group-hover:scale-105` on the `<img>` inside `overflow-hidden` — never on the wrapper
6. Lightbox: keyboard `@keydown.left` / `@keydown.right` on `DialogContent` for arrow key navigation
7. Lightbox `DialogContent` `@click.self` is not needed — `DialogOverlay` click-to-close is handled by Radix automatically
8. `role="button"` + `tabindex="0"` + `@keydown.enter` on gallery items — makes them keyboard accessible when not a `<button>`
9. Filter tabs: active state is `bg-foreground text-background` — never `bg-primary` for filter tabs (they should contrast with primary CTAs)
10. `LightboxDialog.vue` in `app/components/shared/` — it is shared, not section-specific; import explicitly in the gallery section
11. **Honor `prefers-reduced-motion`:** the filter transition must resolve instantly to the final layout at full opacity — check `prefersReducedMotion()` from `~/composables/useScrollMotion` and skip `Flip.from` (and the `onEnter`/`onLeave` opacity/scale tweens), applying the final state directly. Filtered items must always end visible and correctly positioned.
