# Navigation — Layout Variants

Read this file before writing `NavBar.vue` when `navLayout` is `classic`, `centered`,
`bottom`, or `overlay`. It contains the complete template for each variant, plus the
mobile drawer shared by `classic`, `centered`, and `bottom`.

- `classic` — left logo, right links + CTA
- `centered` — logo centre, links split left + right
- `bottom` — tab bar at viewport bottom
- Overlay nav (`overlay`) — `NavOverlay.vue`
- Mobile drawer (classic + centered + bottom)

## `classic` — Left logo, right links + CTA
```vue
<template>
  <!-- root element gets scroll-behavior class -->
  <nav :class="navClass" class="w-full z-50 px-6 md:px-10 h-16 flex items-center justify-between transition-all duration-300">
    <!-- Logo -->
    <NuxtLink to="/" class="shrink-0">
      <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="h-8 w-auto" />
      <span v-else class="text-xl font-heading font-bold text-foreground">{{ siteName }}</span>
    </NuxtLink>

    <!-- Desktop nav -->
    <ul class="hidden md:flex items-center gap-8">
      <li v-for="link in navLinks" :key="link.href">
        <NuxtLink
          :to="link.href"
          :class="cn('text-sm font-medium transition-colors', isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground')"
        >{{ link.label }}</NuxtLink>
      </li>
    </ul>

    <!-- Right actions -->
    <div class="flex items-center gap-3">
      <LanguageSwitcher v-if="showLanguageSwitcher" />
      <ThemeToggle v-if="showThemeToggle" />
      <NuxtLink v-if="ctaLabel" :to="ctaHref" class="hidden md:inline-flex btn-primary">
        {{ ctaLabel }}
      </NuxtLink>
      <!-- Mobile burger -->
      <button class="md:hidden text-foreground p-1" @click="mobileOpen = true" aria-label="Open menu">
        <Menu class="w-5 h-5" />
      </button>
    </div>
  </nav>
</template>
```

## `centered` — Logo centre, links split left + right
```vue
<template>
  <nav :class="navClass" class="w-full z-50 px-6 md:px-10 h-16 flex items-center transition-all duration-300">
    <!-- Left links -->
    <ul class="hidden md:flex flex-1 items-center gap-8">
      <li v-for="link in leftLinks" :key="link.href">
        <NuxtLink :to="link.href" :class="linkClass(link.href)">{{ link.label }}</NuxtLink>
      </li>
    </ul>

    <!-- Centre logo -->
    <NuxtLink to="/" class="shrink-0 absolute left-1/2 -translate-x-1/2">
      <img v-if="logoSrc" :src="logoSrc" alt="Logo" class="h-8 w-auto" />
      <span v-else class="text-xl font-heading font-bold">{{ siteName }}</span>
    </NuxtLink>

    <!-- Right links + actions -->
    <ul class="hidden md:flex flex-1 items-center justify-end gap-8">
      <li v-for="link in rightLinks" :key="link.href">
        <NuxtLink :to="link.href" :class="linkClass(link.href)">{{ link.label }}</NuxtLink>
      </li>
      <li><LanguageSwitcher v-if="showLanguageSwitcher" /></li>
      <li><ThemeToggle v-if="showThemeToggle" /></li>
    </ul>

    <!-- Mobile burger (far right) -->
    <button class="md:hidden ml-auto text-foreground p-1" @click="mobileOpen = true" aria-label="Open menu">
      <Menu class="w-5 h-5" />
    </button>
  </nav>
</template>
```

## `bottom` — Tab bar at viewport bottom
```vue
<template>
  <!-- Desktop: classic top nav | Mobile: bottom tab bar -->
  <nav :class="navClass" class="hidden md:flex w-full z-50 px-10 h-16 items-center justify-between transition-all duration-300">
    <!-- Same as classic desktop -->
  </nav>
  <nav class="md:hidden fixed bottom-0 inset-x-0 z-50 bg-background/95 backdrop-blur border-t border-border flex items-center justify-around h-16 safe-area-inset-bottom">
    <NuxtLink
      v-for="link in navLinks.slice(0, 5)"
      :key="link.href"
      :to="link.href"
      :class="cn('flex flex-col items-center gap-1 text-xs', isActive(link.href) ? 'text-primary' : 'text-muted-foreground')"
    >
      <component :is="link.icon" class="w-5 h-5" />
      {{ link.label }}
    </NuxtLink>
  </nav>
</template>
```

## Overlay nav (`navLayout === 'overlay'`): `NavOverlay.vue`

```vue
<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from '#imports'
import gsap from 'gsap'
import { X } from 'lucide-vue-next'
import { cn } from '~/utils/cn'

interface Props {
  open: boolean
  navLinks: { href: string; label: string }[]
}

const props = defineProps<Props>()
const emit = defineEmits<{ close: [] }>()
const overlayEl = ref<HTMLElement | null>(null)
const linksEl = ref<HTMLElement | null>(null)

watch(() => props.open, (val) => {
  if (!overlayEl.value) return
  if (val) {
    gsap.set(overlayEl.value, { display: 'flex' })
    gsap.fromTo(overlayEl.value, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power2.out' })
    gsap.fromTo(
      linksEl.value?.querySelectorAll('li') ?? [],
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out', delay: 0.1 },
    )
  } else {
    gsap.to(overlayEl.value, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => gsap.set(overlayEl.value, { display: 'none' }),
    })
  }
})
</script>

<template>
  <div
    ref="overlayEl"
    class="hidden fixed inset-0 z-[100] bg-background flex-col items-center justify-center"
    role="dialog"
    aria-modal="true"
  >
    <button
      class="absolute top-5 right-6 p-2 text-muted-foreground hover:text-foreground transition-colors"
      @click="emit('close')"
      aria-label="Close menu"
    >
      <X class="w-6 h-6" />
    </button>

    <ul ref="linksEl" class="flex flex-col items-center gap-6 text-center">
      <li v-for="link in navLinks" :key="link.href">
        <NuxtLink
          :to="link.href"
          class="text-4xl md:text-6xl font-heading font-bold text-foreground hover:text-primary transition-colors"
          @click="emit('close')"
        >
          {{ link.label }}
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
```

## Mobile drawer (for classic + centered + bottom layouts)

```vue
<!-- In NavBar.vue — Radix Dialog for mobile menu -->
<DialogRoot v-model:open="mobileOpen">
  <DialogPortal>
    <DialogOverlay class="fixed inset-0 z-[90] bg-background/80 backdrop-blur-sm" />
    <DialogContent class="fixed inset-y-0 right-0 z-[91] w-72 bg-background border-l border-border p-6 flex flex-col gap-8">
      <div class="flex items-center justify-between">
        <span class="font-heading font-bold text-foreground">{{ siteName }}</span>
        <DialogClose as-child>
          <button class="text-muted-foreground hover:text-foreground p-1" aria-label="Close menu">
            <X class="w-5 h-5" />
          </button>
        </DialogClose>
      </div>
      <ul class="flex flex-col gap-4">
        <li v-for="link in navLinks" :key="link.href">
          <NuxtLink
            :to="link.href"
            :class="cn('text-base font-medium block py-2', isActive(link.href) ? 'text-primary' : 'text-muted-foreground hover:text-foreground')"
            @click="mobileOpen = false"
          >{{ link.label }}</NuxtLink>
        </li>
      </ul>
      <div class="mt-auto">
        <NuxtLink v-if="ctaLabel" :to="ctaHref" class="btn-primary w-full text-center block">
          {{ ctaLabel }}
        </NuxtLink>
      </div>
    </DialogContent>
  </DialogPortal>
</DialogRoot>
```
