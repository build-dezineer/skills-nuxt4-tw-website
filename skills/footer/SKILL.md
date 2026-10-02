---
name: footer
description: >-
  Site footer covering all `footerStyle` options: clean single row, magazine editorial
  columns with newsletter, links multi-column nav, and full-bleed statement type. Every
  variant includes back-to-top and accessible social links. Use when building or
  regenerating a website's footer.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.1.0"
  tags: "layout, footer"
  stack: "nuxt4, vue3, tailwind4, lucide"
---

# Footer Skill

## When to use
Every website project. Generate from `footerStyle` and `websiteFooterConfig` wizard answers in SPEC.md.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/layout/FooterSection.vue` | Complete footer for the chosen style variant |

## Wizard answer mapping

| `footerStyle` | Description |
|---|---|
| `clean` | Single row: logo + copyright + nav links + socials |
| `magazine` | Editorial: featured CTA + 3-4 link columns + newsletter input |
| `links` | Classic: logo column + 3-4 nav columns + legal bottom row |
| `statement` | Full-bleed closing statement in display type + minimal legal row |

## Shared data structure

Define nav links, socials, and site info as props or local constants:

```ts
interface FooterLink { label: string; href: string }
interface SocialLink { label: string; href: string; icon: Component }

// Defined locally or passed via props depending on project complexity
const navLinks: FooterLink[] = [
  { label: 'Work', href: '/work' },
  { label: 'About', href: '/about' },
  { label: 'Services', href: '/services' },
  { label: 'Contact', href: '/contact' },
]
const legalLinks: FooterLink[] = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
]
```

## `clean` style

```vue
<script setup lang="ts">
import { Github, Twitter, Linkedin, Instagram } from 'lucide-vue-next'
import ThemeToggle from '~/components/shared/ThemeToggle.vue'
</script>

<template>
  <footer class="w-full border-t border-border bg-background">
    <div class="container mx-auto px-6 md:px-10 h-16 flex flex-col sm:flex-row items-center justify-between gap-4 py-4 sm:py-0">
      <!-- Logo / brand -->
      <NuxtLink to="/" class="font-heading font-bold text-foreground">
        Brand Name
      </NuxtLink>

      <!-- Nav links -->
      <ul class="hidden sm:flex items-center gap-6">
        <li v-for="link in navLinks" :key="link.href">
          <NuxtLink :to="link.href" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
            {{ link.label }}
          </NuxtLink>
        </li>
      </ul>

      <!-- Right: socials + copyright -->
      <div class="flex items-center gap-4">
        <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter" class="text-muted-foreground hover:text-foreground transition-colors">
          <Twitter class="w-4 h-4" />
        </a>
        <a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn" class="text-muted-foreground hover:text-foreground transition-colors">
          <Linkedin class="w-4 h-4" />
        </a>
        <span class="text-xs text-muted-foreground">© {{ new Date().getFullYear() }}</span>
      </div>
    </div>
  </footer>
</template>
```

## `magazine` style

```vue
<template>
  <footer class="w-full bg-muted border-t border-border">
    <div class="container mx-auto px-6 md:px-10 py-16 md:py-24">
      <!-- Top: featured CTA + columns -->
      <div class="grid md:grid-cols-[1fr_auto_auto_auto] gap-12 lg:gap-16">
        <!-- Featured block -->
        <div class="flex flex-col gap-6">
          <NuxtLink to="/" class="inline-block">
            <span class="text-2xl font-heading font-black text-foreground">Brand</span>
          </NuxtLink>
          <p class="text-muted-foreground leading-relaxed max-w-xs">
            Short brand tagline or value statement that contextualises the site.
          </p>
          <!-- Newsletter -->
          <form class="flex gap-2 mt-2" @submit.prevent>
            <input
              type="email"
              placeholder="Your email"
              class="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <button type="submit" class="btn-primary px-5 py-2.5 text-sm shrink-0">
              Subscribe
            </button>
          </form>
        </div>

        <!-- Link column 1 -->
        <div class="flex flex-col gap-4">
          <h4 class="text-xs font-mono uppercase tracking-widest text-muted-foreground">Work</h4>
          <ul class="flex flex-col gap-3">
            <li v-for="link in workLinks" :key="link.href">
              <NuxtLink :to="link.href" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Link column 2 -->
        <div class="flex flex-col gap-4">
          <h4 class="text-xs font-mono uppercase tracking-widest text-muted-foreground">Company</h4>
          <ul class="flex flex-col gap-3">
            <li v-for="link in companyLinks" :key="link.href">
              <NuxtLink :to="link.href" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Link column 3 -->
        <div class="flex flex-col gap-4">
          <h4 class="text-xs font-mono uppercase tracking-widest text-muted-foreground">Contact</h4>
          <ul class="flex flex-col gap-3">
            <li><a href="mailto:hello@brand.com" class="text-sm text-muted-foreground hover:text-foreground transition-colors">hello@brand.com</a></li>
            <li><a href="tel:+1234567890" class="text-sm text-muted-foreground hover:text-foreground transition-colors">+1 234 567 890</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom bar -->
      <div class="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
        <p class="text-xs text-muted-foreground">© {{ new Date().getFullYear() }} Brand Name. All rights reserved.</p>
        <ul class="flex items-center gap-6">
          <li v-for="link in legalLinks" :key="link.href">
            <NuxtLink :to="link.href" class="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </div>
    </div>

    <!-- Back to top -->
    <button
      class="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
      aria-label="Back to top"
      @click="window.scrollTo({ top: 0, behavior: 'smooth' })"
    >
      <ArrowUp class="w-4 h-4" />
    </button>
  </footer>
</template>
```

## `links` style

```vue
<template>
  <footer class="w-full bg-background border-t border-border">
    <div class="container mx-auto px-6 md:px-10 py-16">
      <div class="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10">
        <!-- Brand column -->
        <div class="col-span-2 md:col-span-1 flex flex-col gap-4">
          <NuxtLink to="/">
            <span class="text-xl font-heading font-bold text-foreground">Brand Name</span>
          </NuxtLink>
          <p class="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Short brand description or tagline.
          </p>
          <!-- Socials -->
          <div class="flex items-center gap-3 mt-2">
            <a v-for="s in socials" :key="s.label" :href="s.href" :aria-label="s.label" target="_blank" rel="noopener"
              class="w-8 h-8 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground transition-colors">
              <component :is="s.icon" class="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <!-- Nav columns -->
        <div v-for="col in navColumns" :key="col.heading" class="flex flex-col gap-4">
          <h4 class="text-xs font-mono uppercase tracking-widest text-foreground">{{ col.heading }}</h4>
          <ul class="flex flex-col gap-3">
            <li v-for="link in col.links" :key="link.href">
              <NuxtLink :to="link.href" class="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {{ link.label }}
              </NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bottom -->
      <div class="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <p class="text-xs text-muted-foreground">© {{ new Date().getFullYear() }} Brand Name</p>
        <ul class="flex gap-4">
          <li v-for="link in legalLinks" :key="link.href">
            <NuxtLink :to="link.href" class="text-xs text-muted-foreground hover:text-foreground transition-colors">{{ link.label }}</NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
```

## `statement` style

```vue
<template>
  <footer class="w-full bg-foreground text-background">
    <!-- Big closing statement -->
    <div class="container mx-auto px-6 md:px-10 pt-24 pb-16">
      <p class="text-xs font-mono uppercase tracking-widest text-background/40 mb-8">Ready to start?</p>
      <h2 class="text-[clamp(2.5rem,8vw,7rem)] font-heading font-black leading-[0.9] tracking-tight mb-10">
        Let's Build<br/>
        Something<br/>
        <span class="text-primary">Unforgettable.</span>
      </h2>
      <NuxtLink to="/contact" class="inline-flex items-center gap-2 text-lg font-medium text-background hover:text-primary transition-colors group">
        Start a conversation
        <ArrowRight class="w-5 h-5 group-hover:translate-x-1 transition-transform" />
      </NuxtLink>
    </div>

    <!-- Divider -->
    <div class="border-t border-background/10" />

    <!-- Minimal legal bottom row -->
    <div class="container mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
      <span class="text-xs text-background/40">© {{ new Date().getFullYear() }} Brand Name</span>
      <div class="flex items-center gap-4">
        <a v-for="s in socials" :key="s.label" :href="s.href" :aria-label="s.label" target="_blank" rel="noopener"
          class="text-background/40 hover:text-background transition-colors">
          <component :is="s.icon" class="w-4 h-4" />
        </a>
      </div>
    </div>
  </footer>
</template>
```

## Required imports for FooterSection.vue

```ts
import { ArrowUp, ArrowRight, Github, Twitter, Linkedin, Instagram } from 'lucide-vue-next'
import ThemeToggle from '~/components/shared/ThemeToggle.vue'
// Validate all icon names against app/assets/lucide-icons.txt before use
```

## Back-to-top button

Include in `magazine`, `links`, and `statement` styles. Position `fixed bottom-6 right-6 z-40`. The `clean` style is too minimal for it.

```vue
<button
  class="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform"
  aria-label="Back to top"
  @click="window.scrollTo({ top: 0, behavior: 'smooth' })"
>
  <ArrowUp class="w-4 h-4" />
</button>
```

## Non-negotiables

1. Surface: `bg-background` for clean/links, `bg-muted` for magazine, `bg-foreground` for statement — always CSS-variable based
2. `© {{ new Date().getFullYear() }}` — always dynamic year, never hardcoded
3. All social links have `target="_blank"` + `rel="noopener"` + `aria-label`
4. Newsletter form: `@submit.prevent` on the `<form>` — never a bare `<form>` that reloads
5. `statement` footer uses `text-background` (inverted text on dark bg) — never `text-white` hardcoded
6. Back-to-top button: `fixed bottom-6 right-6` exactly (RULES.md spec)
7. The `statement` style heading uses `clamp()` for fluid sizing — never fixed breakpoint classes only
8. External links in nav columns: always use `<a>` with `target="_blank"` + `rel="noopener"` — NuxtLink is only for internal routes
9. `footerStyle` constant is read from SPEC.md and substituted by the planner — generate exactly one style, not a conditional block of all four
10. Magazine style newsletter input must have `type="email"` and accessible `placeholder` — no raw `<input>` without type
