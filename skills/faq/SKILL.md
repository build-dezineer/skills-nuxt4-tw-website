---
name: faq
description: >-
  Accessible FAQ accordion built on Radix Accordion with animated height keyframes, a
  plus/minus icon swap, and single- or two-column layouts. Ends with a contact prompt. Use
  when building support pages, pricing questions or Q&A sections.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "content, faq"
  stack: "nuxt4, vue3, tailwind4, radix-vue, lucide"
---

# FAQ Skill

## When to use
Frequently asked questions sections — anywhere the SPEC lists a FAQ, support, or Q&A section. Use Radix `Accordion` for accessible expand/collapse with smooth height animation.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/FaqSection.vue` | FAQ accordion |

## Layout variants

| Layout | Best for |
|---|---|
| `single-column` | Standard FAQ page / section (default) |
| `two-column` | Many questions (6+), split across two columns |
| `categorised` | Large FAQs with topic groupings using Radix Tabs |

## Data structure

```ts
interface FaqItem {
  question: string
  answer: string
  category?: string
}

const faqs: FaqItem[] = [
  {
    question: 'How long does a typical project take?',
    answer: 'Project timelines vary by scope, but most branding + website projects take 6-10 weeks from kickoff to launch. We\'ll give you a detailed timeline during our discovery session.',
    category: 'Process',
  },
  {
    question: 'Do you work with startups?',
    answer: 'Absolutely. We love working with early-stage teams who have big ambitions. We offer flexible engagement models that suit seed-stage budgets while still delivering flagship-quality work.',
    category: 'Working with us',
  },
  {
    question: 'What\'s included in the discovery phase?',
    answer: 'Discovery includes stakeholder interviews, competitive analysis, user journey mapping, and a comprehensive design brief. This phase typically runs 1-2 weeks and sets the foundation for everything that follows.',
    category: 'Process',
  },
  {
    question: 'Do you offer ongoing retainers?',
    answer: 'Yes. Many clients opt for a monthly retainer after their initial project — ongoing design support, feature development, and strategic guidance. Retainers start at 20 hours/month.',
    category: 'Working with us',
  },
  {
    question: 'Can you work with our existing tech stack?',
    answer: 'We\'re stack-agnostic by design. We work with React, Vue, Next.js, Nuxt, and headless CMS platforms like Contentful and Sanity. If you have an existing codebase, we\'ll audit it first.',
    category: 'Technical',
  },
  {
    question: 'What does the handoff process look like?',
    answer: 'We deliver production-ready code, comprehensive documentation, and a training session for your team. Post-launch, we offer a 30-day support window to address any issues that arise.',
    category: 'Process',
  },
]
```

## `single-column` layout (default)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from 'radix-vue'
import { Plus, Minus } from 'lucide-vue-next'
import { useScrollReveal } from '~/composables/useScrollMotion'

const sectionEl = ref<HTMLElement | null>(null)
useScrollReveal(() => sectionEl.value?.querySelectorAll('.faq-item') ?? null, {
  intensity: 'polished',
  stagger: 0.07,
})
</script>

<template>
  <section ref="sectionEl" class="py-24 bg-background">
    <div class="container mx-auto px-6 md:px-10 max-w-3xl">
      <!-- Header -->
      <div class="mb-16">
        <p class="text-sm font-mono uppercase tracking-widest text-primary mb-4">FAQ</p>
        <h2 class="text-4xl md:text-5xl font-heading font-bold text-foreground">
          Common questions
        </h2>
        <p class="mt-4 text-lg text-muted-foreground leading-relaxed">
          Everything you need to know before we start working together.
        </p>
      </div>

      <!-- Accordion -->
      <AccordionRoot type="single" collapsible class="flex flex-col divide-y divide-border">
        <AccordionItem
          v-for="(faq, i) in faqs"
          :key="faq.question"
          :value="`item-${i}`"
          class="faq-item group"
        >
          <AccordionHeader>
            <AccordionTrigger
              class="flex w-full items-center justify-between py-6 text-left gap-6 text-foreground font-medium hover:text-primary transition-colors focus-visible:outline-none focus-visible:text-primary"
            >
              <span class="text-lg">{{ faq.question }}</span>
              <Plus class="w-5 h-5 shrink-0 text-muted-foreground group-data-[state=open]:hidden transition-all" />
              <Minus class="w-5 h-5 shrink-0 text-primary hidden group-data-[state=open]:block transition-all" />
            </AccordionTrigger>
          </AccordionHeader>

          <AccordionContent
            class="overflow-hidden text-muted-foreground leading-relaxed data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"
          >
            <p class="pb-6">{{ faq.answer }}</p>
          </AccordionContent>
        </AccordionItem>
      </AccordionRoot>

      <!-- Contact prompt -->
      <div class="mt-16 text-center">
        <p class="text-muted-foreground">Still have questions?</p>
        <NuxtLink to="/contact" class="mt-3 inline-flex btn-primary px-8 py-3">
          Get in Touch
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
```

## `two-column` layout

```vue
<template>
  <section class="py-24 bg-muted/30">
    <div class="container mx-auto px-6 md:px-10">
      <h2 class="text-4xl font-heading font-bold text-foreground mb-14 max-w-xl">Frequently asked</h2>

      <div class="grid md:grid-cols-2 gap-x-16">
        <!-- Left column -->
        <AccordionRoot type="single" collapsible class="flex flex-col divide-y divide-border">
          <AccordionItem
            v-for="(faq, i) in faqs.filter((_, i) => i % 2 === 0)"
            :key="faq.question"
            :value="`left-${i}`"
          >
            <AccordionHeader>
              <AccordionTrigger class="flex w-full items-center justify-between py-5 text-left gap-4 text-foreground font-medium hover:text-primary transition-colors focus-visible:outline-none">
                <span>{{ faq.question }}</span>
                <Plus class="w-4 h-4 shrink-0 text-muted-foreground group-data-[state=open]:rotate-45 transition-transform" />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="overflow-hidden text-muted-foreground text-sm leading-relaxed data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <p class="pb-5">{{ faq.answer }}</p>
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>

        <!-- Right column -->
        <AccordionRoot type="single" collapsible class="flex flex-col divide-y divide-border">
          <AccordionItem
            v-for="(faq, i) in faqs.filter((_, i) => i % 2 === 1)"
            :key="faq.question"
            :value="`right-${i}`"
          >
            <AccordionHeader>
              <AccordionTrigger class="flex w-full items-center justify-between py-5 text-left gap-4 text-foreground font-medium hover:text-primary transition-colors focus-visible:outline-none">
                <span>{{ faq.question }}</span>
                <Plus class="w-4 h-4 shrink-0 text-muted-foreground group-data-[state=open]:rotate-45 transition-transform" />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="overflow-hidden text-muted-foreground text-sm leading-relaxed data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <p class="pb-5">{{ faq.answer }}</p>
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>
      </div>
    </div>
  </section>
</template>
```

## Required CSS in `app/assets/css/main.css`

The Radix Accordion height animation requires these keyframes:

```css
@keyframes accordion-down {
  from { height: 0; }
  to   { height: var(--radix-accordion-content-height); }
}
@keyframes accordion-up {
  from { height: var(--radix-accordion-content-height); }
  to   { height: 0; }
}
.animate-accordion-down { animation: accordion-down 200ms ease-out; }
.animate-accordion-up   { animation: accordion-up   200ms ease-in; }
```

## Required imports

```ts
import { ref } from 'vue'
import {
  AccordionRoot,
  AccordionItem,
  AccordionHeader,
  AccordionTrigger,
  AccordionContent,
} from 'radix-vue'
import { Plus, Minus } from 'lucide-vue-next'
import { useScrollReveal } from '~/composables/useScrollMotion'
```

## Non-negotiables

1. Always use Radix `AccordionRoot` + `AccordionItem` + `AccordionHeader` + `AccordionTrigger` + `AccordionContent` — never a manual `v-show` or CSS `max-height` accordion
2. `AccordionContent` must have `overflow-hidden` — without it, the height animation clips nothing and text jumps
3. Accordion keyframes must be in `main.css` — the `--radix-accordion-content-height` CSS variable is injected by Radix at runtime and must be referenced in a keyframe, not a Tailwind class
4. `AccordionTrigger` must have `focus-visible:outline-none` replaced with a visible focus ring alternative (e.g. `focus-visible:text-primary`) — never remove all focus indicators
5. `type="single"` with `collapsible` — allow one item open at a time, closable by clicking again. Use `type="multiple"` only when the SPEC explicitly calls for multiple open items
6. Plus/Minus icon swap: use `group-data-[state=open]:hidden` / `group-data-[state=open]:block` — Radix sets `data-state` on `AccordionItem` which the `group` class propagates
7. Contact prompt at the bottom — every FAQ section must end with a path for unanswered questions
8. `max-w-3xl` on single-column layout — FAQs are dense text and shouldn't span full desktop width
9. Answer text uses `text-muted-foreground` — never `text-foreground` (too prominent) or hardcoded colours
10. Two-column split: use `i % 2 === 0` / `i % 2 === 1` filter — never manually duplicate the FAQ data or hardcode which questions go in each column
