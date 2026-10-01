# Navigation — minimal-overlay Choreography

Read this file before writing either component when `navLayout === 'minimal-overlay'`.
It contains the complete always-burger bar and the layered `NavFullOverlay` open/close
animation.

- Architecture for this variant
- Bar layout
- `NavBar.vue` (minimal-overlay variant)
- `NavFullOverlay.vue` — layered animation sequence
- Proportions and sizing rationale
- Required imports for this variant

## `minimal-overlay` — Always-burger nav with current page + layered overlay animation

This is the most Awwward-characteristic navigation pattern. The bar is stripped to three elements only — logo, current page name, and a hamburger that is **always visible on every viewport** (no inline links, ever). On click, a full-screen overlay opens with a coordinated multi-layer animation sequence.

### Architecture for this variant

Generate TWO files:
- `app/components/layout/NavBar.vue` — the minimal always-burger bar
- `app/components/layout/NavFullOverlay.vue` — the full-screen menu with premium animation

### Bar layout

```
[ Logo ]   [ Current Page Name ]          [ 01 / 06 ]   [ Menu ☰ ]
```

The burger morphs into an ✕ using two `<span>` bars animated with GSAP.

### `NavBar.vue` (minimal-overlay variant)

```vue
<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#imports'
import gsap from 'gsap'
import { cn } from '~/utils/cn'
import NavFullOverlay from '~/components/layout/NavFullOverlay.vue'

const navLinks = [
  { href: '/',         label: 'Home' },
  { href: '/work',     label: 'Work' },
  { href: '/about',    label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/journal',  label: 'Journal' },
  { href: '/contact',  label: 'Contact' },
]

const NAV_SCROLL: 'sticky' | 'float' | 'reveal' | 'static' = 'float'

const route = useRoute()
const open = ref(false)
const scrolled = ref(false)
const lastScrollY = ref(0)
const revealed = ref(true)

// Burger icon refs — two bars that morph to ✕
const bar1 = ref<HTMLElement | null>(null)
const bar2 = ref<HTMLElement | null>(null)

// Current page label from navLinks
const currentPage = computed(() => {
  const match = navLinks.find(l =>
    l.href === route.path || (l.href !== '/' && route.path.startsWith(l.href))
  )
  return match?.label ?? ''
})

// Current page index (e.g. "02 / 06")
const currentIndex = computed(() => {
  const i = navLinks.findIndex(l =>
    l.href === route.path || (l.href !== '/' && route.path.startsWith(l.href))
  )
  if (i < 0) return ''
  return `${String(i + 1).padStart(2, '0')} / ${String(navLinks.length).padStart(2, '0')}`
})

// Burger ↔ ✕ morph
watch(open, (val) => {
  if (!bar1.value || !bar2.value) return
  if (val) {
    gsap.to(bar1.value, { rotation: 45,  y: 4,  duration: 0.35, ease: 'power3.inOut' })
    gsap.to(bar2.value, { rotation: -45, y: -4, duration: 0.35, ease: 'power3.inOut' })
  } else {
    gsap.to(bar1.value, { rotation: 0, y: 0, duration: 0.3, ease: 'power3.inOut' })
    gsap.to(bar2.value, { rotation: 0, y: 0, duration: 0.3, ease: 'power3.inOut' })
  }
})

// Close on route change
watch(() => route.path, () => { open.value = false })

function onScroll() {
  const y = window.scrollY
  scrolled.value = y > 20
  if (NAV_SCROLL === 'reveal') {
    revealed.value = y < lastScrollY.value || y < 100
    lastScrollY.value = y
  }
}

onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const navClass = computed(() => {
  const base = 'w-full z-[90] h-[72px] flex items-center px-6 md:px-10 transition-all duration-500'
  if (NAV_SCROLL === 'static')  return `${base} relative bg-background`
  if (NAV_SCROLL === 'sticky')  return cn(base, 'sticky top-0', scrolled.value ? 'bg-background/95 backdrop-blur shadow-sm' : 'bg-transparent')
  if (NAV_SCROLL === 'float')   return cn(base, 'fixed', scrolled.value ? 'inset-x-4 top-3 rounded-2xl bg-background/90 backdrop-blur shadow-lg border border-border/20 px-6' : 'top-0 inset-x-0 bg-transparent')
  if (NAV_SCROLL === 'reveal')  return cn(base, 'fixed top-0 inset-x-0 bg-background/95 backdrop-blur', revealed.value ? 'translate-y-0' : '-translate-y-full')
  return base
})
</script>

<template>
  <!-- The bar -->
  <nav :class="navClass" aria-label="Main navigation">
    <!-- Logo -->
    <NuxtLink to="/" class="shrink-0 group" aria-label="Home">
      <span class="text-lg font-heading font-black tracking-tight text-foreground group-hover:text-primary transition-colors">
        Studio
      </span>
    </NuxtLink>

    <!-- Current page name — appears once nav closes, fades between pages -->
    <Transition name="page-label">
      <span
        v-if="currentPage && !open"
        :key="currentPage"
        class="ml-5 text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground"
      >
        {{ currentPage }}
      </span>
    </Transition>

    <!-- Spacer -->
    <div class="flex-1" />

    <!-- Page index counter (desktop only) -->
    <span
      v-if="currentIndex"
      class="hidden md:block text-xs font-mono text-muted-foreground/50 mr-8 tabular-nums"
    >
      {{ currentIndex }}
    </span>

    <!-- Hamburger button — always visible, desktop AND mobile -->
    <button
      class="relative flex flex-col items-end justify-center gap-[6px] w-10 h-10 shrink-0 focus-visible:outline-none group"
      :aria-label="open ? 'Close menu' : 'Open menu'"
      :aria-expanded="open"
      @click="open = !open"
    >
      <!-- Bar 1 -->
      <span
        ref="bar1"
        class="block h-px bg-foreground origin-center transition-[width] duration-300"
        :class="open ? 'w-5' : 'w-5 group-hover:w-7'"
      />
      <!-- Bar 2 -->
      <span
        ref="bar2"
        class="block h-px bg-foreground origin-center w-5"
      />
    </button>
  </nav>

  <!-- Full-screen overlay -->
  <NavFullOverlay
    :open="open"
    :nav-links="navLinks"
    @close="open = false"
  />
</template>

<style scoped>
.page-label-enter-active,
.page-label-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-label-enter-from   { opacity: 0; transform: translateY(4px); }
.page-label-leave-to     { opacity: 0; transform: translateY(-4px); }
</style>
```

### `NavFullOverlay.vue` — layered animation sequence

The overlay opens in **four choreographed layers**:

1. **Background panel** — `scaleY` from bottom edge, 0 → 1, `expo.inOut`, 0.65s
2. **Divider line** — `scaleX` 0 → 1, left to right, 0.4s, starts at 0.4s
3. **Nav links** — clip-path `inset(0 0 100% 0)` → `inset(0 0 0% 0)` (text rises from below mask), staggered 0.08s, starts at 0.5s
4. **Index numbers** — fade + translate-x, slightly before their sibling link text
5. **Bottom footer row** — translate-y 20px → 0, starts at 0.7s

On close: everything reverses quickly in 0.25s with `power3.in`.

```vue
<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useRoute } from '#imports'
import { cn } from '~/utils/cn'
import { prefersReducedMotion } from '~/composables/useScrollMotion'

interface NavLink { href: string; label: string }

const props = defineProps<{ open: boolean; navLinks: NavLink[] }>()
const emit = defineEmits<{ close: [] }>()

const route = useRoute()

const overlayEl  = ref<HTMLElement | null>(null)
const panelEl    = ref<HTMLElement | null>(null)
const lineEl     = ref<HTMLElement | null>(null)
const itemEls    = ref<HTMLElement[]>([])
const footerEl   = ref<HTMLElement | null>(null)

let currentTl: gsap.core.Timeline | null = null

function setItemRef(el: HTMLElement | null, i: number) {
  if (el) itemEls.value[i] = el
}

// ─── Open animation ───────────────────────────────────────────────────────────
function animateOpen() {
  currentTl?.kill()

  // Reduced motion: open instantly to a fully visible, usable overlay — no scale,
  // clip or stagger. Every animated element is set to its final visible state.
  if (prefersReducedMotion()) {
    gsap.set(overlayEl.value, { display: 'flex', pointerEvents: 'auto' })
    gsap.set(panelEl.value, { scaleY: 1 })
    gsap.set(lineEl.value, { scaleX: 1 })
    gsap.set([footerEl.value, ...itemEls.value], { opacity: 1, y: 0 })
    itemEls.value.forEach((item) => {
      const idx = item.querySelector('.link-index')
      const text = item.querySelector('.link-text')
      if (idx) gsap.set(idx, { opacity: 1, x: 0 })
      if (text) gsap.set(text, { clipPath: 'inset(0 0 0% 0)', y: 0 })
    })
    return
  }

  const tl = gsap.timeline()
  currentTl = tl

  // Show overlay wrapper (pointer events on)
  tl.set(overlayEl.value, { display: 'flex', pointerEvents: 'auto' })

  // Reset everything the close animation may have left hidden. The close fades the
  // <li> items (and footer) to opacity:0 / y:-10, while the open sequence only
  // animates their *children* (.link-index / .link-text). Without this reset the
  // parent <li>s stay at opacity:0 and the links are invisible on the second open.
  tl.set([footerEl.value, ...itemEls.value], { opacity: 1, y: 0 }, 0)

  // 1. Panel slides up from bottom
  tl.fromTo(panelEl.value,
    { scaleY: 0, transformOrigin: 'bottom center' },
    { scaleY: 1, duration: 0.65, ease: 'expo.inOut' },
    0,
  )

  // 2. Divider line draws across
  tl.fromTo(lineEl.value,
    { scaleX: 0, transformOrigin: 'left center' },
    { scaleX: 1, duration: 0.4, ease: 'expo.out' },
    0.35,
  )

  // 3. Index numbers + link text rise from clip-path mask
  itemEls.value.forEach((item, i) => {
    const idx  = item.querySelector('.link-index')
    const text = item.querySelector('.link-text')

    // Index: fade + slide from left
    tl.fromTo(idx,
      { opacity: 0, x: -12 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power3.out' },
      0.45 + i * 0.06,
    )

    // Text: clip-path reveal (rises from behind a mask at the baseline)
    tl.fromTo(text,
      { clipPath: 'inset(0 0 100% 0)', y: 20 },
      { clipPath: 'inset(0 0 0% 0)', y: 0, duration: 0.55, ease: 'expo.out' },
      0.48 + i * 0.06,
    )
  })

  // 4. Footer row rises up
  tl.fromTo(footerEl.value,
    { opacity: 0, y: 16 },
    { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' },
    0.7,
  )
}

// ─── Close animation ──────────────────────────────────────────────────────────
function animateClose() {
  currentTl?.kill()

  // Reduced motion: close instantly.
  if (prefersReducedMotion()) {
    gsap.set(overlayEl.value, { display: 'none', pointerEvents: 'none' })
    return
  }

  const tl = gsap.timeline({
    onComplete: () => {
      gsap.set(overlayEl.value, { display: 'none', pointerEvents: 'none' })
    },
  })
  currentTl = tl

  tl.to([footerEl.value, ...itemEls.value], {
    opacity: 0,
    y: -10,
    duration: 0.2,
    ease: 'power2.in',
    stagger: { each: 0.03, from: 'end' },
  }, 0)

  tl.to(panelEl.value,
    { scaleY: 0, transformOrigin: 'top center', duration: 0.45, ease: 'expo.inOut' },
    0.1,
  )
}

watch(() => props.open, (val) => {
  if (val) animateOpen()
  else     animateClose()
})

onUnmounted(() => { currentTl?.kill() })

// Close on route change
watch(() => route.path, () => emit('close'))

function isActive(href: string) {
  return route.path === href || (href !== '/' && route.path.startsWith(href))
}
</script>

<template>
  <!--
    Overlay: hidden by default (display:none set by GSAP on init).
    z-[100] sits above the nav bar (z-[90]).
  -->
  <div
    ref="overlayEl"
    class="hidden fixed inset-0 z-[100] flex-col pointer-events-none"
    role="dialog"
    aria-modal="true"
    aria-label="Navigation menu"
  >
    <!-- Background panel — GSAP scales this in -->
    <div
      ref="panelEl"
      class="absolute inset-0 bg-background"
    />

    <!-- Content sits above panel (z-10) -->
    <div class="relative z-10 flex flex-col h-full px-6 md:px-10">

      <!-- Top bar mirrors NavBar layout so there's no jump -->
      <div class="h-[72px] flex items-center justify-between shrink-0">
        <NuxtLink to="/" class="text-lg font-heading font-black tracking-tight text-foreground" @click="emit('close')">
          Studio
        </NuxtLink>
        <!-- Close button (same position as burger) -->
        <button
          class="w-10 h-10 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close menu"
          @click="emit('close')"
        >
          <!-- Static ✕ — the GSAP morph lives in NavBar; here we just show ✕ -->
          <span class="text-xl font-light leading-none select-none">✕</span>
        </button>
      </div>

      <!-- Divider line -->
      <div ref="lineEl" class="h-px bg-border/40 shrink-0" style="transform-origin: left center; transform: scaleX(0)" />

      <!-- Nav links — main content -->
      <nav class="flex-1 flex flex-col justify-center py-12">
        <ul class="flex flex-col gap-1 md:gap-2">
          <li
            v-for="(link, i) in navLinks"
            :key="link.href"
            :ref="(el) => setItemRef(el instanceof HTMLElement ? el : null, i)"
            class="flex items-baseline gap-5 md:gap-8 group cursor-pointer"
          >
            <!-- Index number -->
            <span class="link-index text-[11px] font-mono text-muted-foreground/50 w-6 tabular-nums shrink-0 pt-1">
              {{ String(i + 1).padStart(2, '0') }}
            </span>

            <!-- Link text — the clip-path animation target -->
            <span class="link-text overflow-hidden block">
              <NuxtLink
                :to="link.href"
                :class="cn(
                  'block text-[clamp(2.2rem,7vw,5.5rem)] font-heading font-black leading-[0.9] tracking-tight transition-colors duration-200',
                  isActive(link.href)
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary',
                )"
                @click="emit('close')"
              >
                {{ link.label }}
              </NuxtLink>
            </span>

            <!-- Arrow that slides in on hover -->
            <span class="hidden md:block text-2xl text-primary opacity-0 group-hover:opacity-100 translate-x-[-8px] group-hover:translate-x-0 transition-all duration-200 ml-auto self-center">
              →
            </span>
          </li>
        </ul>
      </nav>

      <!-- Footer row: social + contact -->
      <div
        ref="footerEl"
        class="h-16 flex items-center justify-between border-t border-border/30 shrink-0 gap-6"
      >
        <!-- Social links -->
        <div class="flex items-center gap-6">
          <a
            v-for="s in [{ label: 'Instagram', href: 'https://instagram.com' }, { label: 'Twitter', href: 'https://twitter.com' }, { label: 'LinkedIn', href: 'https://linkedin.com' }]"
            :key="s.label"
            :href="s.href"
            target="_blank"
            rel="noopener"
            :aria-label="s.label"
            class="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
          >
            {{ s.label }}
          </a>
        </div>

        <!-- Contact -->
        <a
          href="mailto:hello@studio.com"
          class="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors hidden sm:block"
        >
          hello@studio.com
        </a>
      </div>

    </div>
  </div>
</template>
```

### Proportions and sizing rationale

| Element | Size | Why |
|---|---|---|
| Nav bar height | `h-[72px]` | Matches overlay top bar — no visual jump on open |
| Link font size | `clamp(2.2rem, 7vw, 5.5rem)` | Fluid — fills the screen on desktop without overflowing on mobile |
| Index numbers | `text-[11px] w-6` | Small enough to be secondary, wide enough to stay tabular |
| Gap between index + text | `gap-5 md:gap-8` | Enough breathing room; `md:gap-8` gives desktop room for the index to breathe |
| Line height | `leading-[0.9]` | Tightly stacked — overlapping baselines look intentional at display sizes |
| Footer row | `h-16` | Same as the nav bar — creates symmetry top + bottom |

### Required imports for this variant

```ts
// NavBar.vue
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#imports'
import gsap from 'gsap'
import { cn } from '~/utils/cn'
import NavFullOverlay from '~/components/layout/NavFullOverlay.vue'

// NavFullOverlay.vue
import { ref, watch, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useRoute } from '#imports'
import { cn } from '~/utils/cn'
```

No Radix, no Lucide icons needed for this pattern — the ✕ is a Unicode character and all interactions are custom.
