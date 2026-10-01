---
name: navigation
description: >-
  Full navigation skill covering every navLayout x navScroll combination: `NavBar.vue` for
  classic, centered, overlay, minimal-overlay, and bottom layouts with sticky, float,
  reveal, or static scroll behavior. The minimal-overlay variant is the always-burger
  signature pattern with a GSAP morph and a choreographed `NavFullOverlay`. Use for any
  site header, mobile drawer, or dropdown menu.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "layout, navigation"
  stack: "nuxt4, vue3, tailwind4, gsap, radix-vue, lucide"
---

# Navigation Skill

## When to use
Every website project. The `NavBar.vue` is always generated from the `navLayout` and `navScroll` wizard answers. Read these from SPEC.md and generate the appropriate variant.


> **Guard your refs before animating.** `sectionRef.value` can be null when `onMounted` runs; a tween with no targets fails silently and the section never animates. Start motion setup with `if (!sectionRef.value) return`.


> **Never call `context.selector()`.** It only exists on a *scoped* context and is `undefined` on `gsap.matchMedia()` / `gsap.context(fn)`, where calling it throws. Query through the section’s template ref instead: `sectionRef.value?.querySelectorAll('.item') ?? []`.

## Architecture

Generate ONE or TWO files depending on layout:

| File | When |
|------|------|
| `app/components/layout/NavBar.vue` | Always |
| `app/components/layout/NavOverlay.vue` | Only when `navLayout === 'overlay'` |
| `app/components/layout/NavFullOverlay.vue` | Only when `navLayout === 'minimal-overlay'` |

## Wizard answer mapping

Read from SPEC.md:
- `navLayout`: `classic` | `centered` | `overlay` | `minimal-overlay` | `bottom`
- `navScroll`: `sticky` | `float` | `reveal` | `static`
- `navConfig.items`: array of enabled elements

## Choosing what to read

| `navLayout` | Read before writing |
|---|---|
| `classic`, `centered`, `bottom` | [references/variants.md](references/variants.md) — layout templates |
| `overlay` | [references/variants.md](references/variants.md) — the `NavOverlay.vue` section |
| `minimal-overlay` | [references/overlay.md](references/overlay.md) — full bar + overlay choreography |

`classic`, `centered`, and `bottom` also use the mobile drawer template in
`references/variants.md`. Every layout uses the scroll behavior classes, required
imports, dropdown, and non-negotiables on this page.

## Scroll behavior classes

Implement using a computed `navClass` that reacts to a `scrolled` ref:

```vue
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#imports'
import { cn } from '~/utils/cn'
import { Menu, X } from 'lucide-vue-next'
import ThemeToggle from '~/components/shared/ThemeToggle.vue'
import LanguageSwitcher from '~/components/shared/LanguageSwitcher.vue'

// From SPEC.md — substituted by planner
const NAV_SCROLL: 'sticky' | 'float' | 'reveal' | 'static' = 'float'
const NAV_LAYOUT: 'classic' | 'centered' | 'overlay' | 'bottom' = 'classic'

const scrolled = ref(false)
const mobileOpen = ref(false)
const lastScrollY = ref(0)
const revealed = ref(true)   // for 'reveal' behavior

const route = useRoute()

function isActive(href: string) {
  return route.path === href || (href !== '/' && route.path.startsWith(href))
}

function linkClass(href: string) {
  return cn(
    'text-sm font-medium transition-colors',
    isActive(href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
  )
}

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

// Close mobile menu on route change
watch(() => route.path, () => { mobileOpen.value = false })

const navClass = computed(() => {
  if (NAV_SCROLL === 'static') return 'relative bg-background'

  if (NAV_SCROLL === 'sticky') {
    return cn(
      'sticky top-0',
      scrolled.value ? 'bg-background/95 backdrop-blur shadow-sm border-b border-border/50' : 'bg-background',
    )
  }

  if (NAV_SCROLL === 'float') {
    return cn(
      'fixed',
      scrolled.value
        ? 'inset-x-4 top-3 rounded-2xl bg-background/90 backdrop-blur shadow-lg border border-border/30'
        : 'top-0 inset-x-0 bg-transparent',
    )
  }

  if (NAV_SCROLL === 'reveal') {
    return cn(
      'fixed top-0 inset-x-0 transition-transform duration-300',
      'bg-background/95 backdrop-blur border-b border-border/50',
      revealed.value ? 'translate-y-0' : '-translate-y-full',
    )
  }

  return 'fixed top-0 inset-x-0'
})
</script>
```

## Required imports for NavBar.vue

```ts
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from '#imports'
import { Menu, X } from 'lucide-vue-next'
import { cn } from '~/utils/cn'
import ThemeToggle from '~/components/shared/ThemeToggle.vue'
import LanguageSwitcher from '~/components/shared/LanguageSwitcher.vue'
// If overlay layout:
import NavOverlay from '~/components/layout/NavOverlay.vue'
// If mobile drawer:
import {
  DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogClose,
} from 'radix-vue'
```

## Dropdown (Radix DropdownMenu)

For nav links with sub-items, use Radix DropdownMenuRoot:

```vue
<DropdownMenuRoot>
  <DropdownMenuTrigger as-child>
    <button :class="linkClass(item.href)" class="flex items-center gap-1">
      {{ item.label }}
      <ChevronDown class="w-3.5 h-3.5 transition-transform group-data-[state=open]:rotate-180" />
    </button>
  </DropdownMenuTrigger>
  <DropdownMenuPortal>
    <DropdownMenuContent
      class="z-50 min-w-48 rounded-xl bg-card border border-border shadow-xl p-2 animate-in fade-in-0 zoom-in-95"
      :side-offset="8"
    >
      <DropdownMenuItem
        v-for="sub in item.children"
        :key="sub.href"
        as-child
      >
        <NuxtLink :to="sub.href" class="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors">
          {{ sub.label }}
        </NuxtLink>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenuPortal>
</DropdownMenuRoot>
```

## Non-negotiables

1. `mobileOpen` / `open` ref is defined in `NavBar.vue` and passed to the overlay — never manage open state inside the overlay component itself
2. `watch(() => route.path, () => { open.value = false })` — always close menu on route change
3. Scroll listener uses `{ passive: true }` — never block the scroll thread
4. `float` variant: use `inset-x-4 top-3 rounded-2xl` when scrolled — `inset-x-4` positions the pill (no `mx-4`/`mt-3` on a fixed element)
5. `reveal` variant: use `transition-transform duration-300` with `translate-y-0` / `-translate-y-full` — never `display:none`
6. Active state is `text-primary` — never `border-b-2` or background underline decorations (RULES.md)
7. ThemeToggle, LanguageSwitcher, Lucide icons, Radix components — all explicitly imported, no Nuxt auto-imports
8. `navClass` computed reads from `NAV_SCROLL` constant — the planner substitutes the actual value from SPEC during generation
9. **`minimal-overlay` variant: the burger is NEVER `md:hidden`** — it is always visible on all breakpoints; no inline links are ever shown
10. **`minimal-overlay` overlay: nav bar height (`h-[72px]`) must match exactly in both `NavBar.vue` and `NavFullOverlay.vue`** — mismatched heights cause a visual jump on open
11. **`minimal-overlay` link text: wrap in a `<span class="overflow-hidden block">` clip container** — without the overflow wrapper the clip-path reveal animation peeks below the baseline
12. **`minimal-overlay` GSAP timeline: `panelEl` scaleY uses `transformOrigin: 'bottom center'`** on open, `'top center'` on close — the panel feels like it grows from/collapses into the bar
13. **`minimal-overlay` link size: `clamp(2.2rem, 7vw, 5.5rem)` with `leading-[0.9]`** — fluid sizing fills the space; fixed sizes either overflow on mobile or look sparse on desktop
14. **`minimal-overlay` current page indicator: uses Vue `<Transition>` with `v-if="currentPage && !open"`** — hides during open (overlay takes its place) and transitions between pages with a small fade+slide
15. **`minimal-overlay` burger morph: two `<span>` bars animated with GSAP `rotation` + `y`** — never CSS-only transition for the morph (GSAP gives precise control over timing relative to the overlay open sequence)
16. **Do NOT add a back-to-top button to FooterSection or any footer component** — the back-to-top button is pre-installed in `default.vue` (wrapped in `@guard:back-to-top`). Only one should exist on the page.
17. **Every NavBar layout MUST include a visible desktop CTA button alongside the theme toggle** — the CTA lives in `@guard:desktop-cta`. The mobile overlay CTA is in addition to, not instead of, the desktop one.
18. **The open animation MUST reset (via `gsap.set`) every element the close animation hides.** The `minimal-overlay` close fades the `<li>` items to `opacity:0, y:-10`, but the open sequence only animates their *children*. Reopening therefore leaves the parents invisible unless the open explicitly resets them — this is the single most common overlay-nav bug ("shows once, blank on the second open"). Always begin the open sequence with `tl.set([footerEl.value, ...itemEls.value], { opacity: 1, y: 0 }, 0)`.
19. **`fromTo` is only self-correcting when the SAME element is hidden and shown.** `NavOverlay.vue` (simple `overlay` variant) is safe because it `fromTo`s the *same* `<li>` links on every open. The bug arises only when close hides element A (the `<li>`) and open animates a different element B (the child `.link-text`). If close and open target different elements, the open MUST reset A.
20. **Honor `prefers-reduced-motion` in the overlay:** open/close instantly with no scale/clip/stagger, but the reduced-motion open path MUST leave the overlay fully usable — `display:flex`, `pointerEvents:auto`, panel `scaleY:1`, and all items/footer at `opacity:1, y:0`. Import the shared `prefersReducedMotion` from `~/composables/useScrollMotion` (pre-installed).
21. **Never rely on an element retaining animation state across open/close cycles.** A menu can be opened and closed any number of times; each open must produce the correct visible result independent of how the previous close left the DOM. The pre-installed `motion-failsafe` plugin is a backstop, not a substitute for a correct reset.
22. **LanguageSwitcher is visual-only** — it does not translate page content, change routing, or persist anything. Use it exactly as exported (`~/components/shared/LanguageSwitcher.vue`); never modify it or wire it to real i18n.
