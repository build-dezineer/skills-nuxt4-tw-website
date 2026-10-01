---
name: pricing
description: >-
  Pricing section with a monthly/annual billing toggle (Radix Switch plus an animated
  number transition), a highlighted popular plan with inverted colours and elevation,
  feature lists with check/x icons, enterprise custom pricing, and a free-trial callout.
  Use when a page needs pricing tiers or plan comparison.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "content, pricing, commerce"
  stack: "nuxt4, vue3, tailwind4, radix-vue, lucide"
---

# Pricing Skill

## When to use
Any pricing, plans, or packages section. Generates a pricing table with optional billing period toggle (monthly/annual). Use when SPEC includes a pricing or subscription section.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/PricingSection.vue` | Pricing cards with toggle and feature list |

## Layout variants

| Layout | Best for |
|---|---|
| `cards` | 2-4 plans, card-per-plan, one highlighted as popular |
| `table` | 5+ plans or many features needing row-by-row comparison |

## `cards` layout (most common)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { Check, X, Zap } from 'lucide-vue-next'
import { SwitchRoot, SwitchThumb } from 'radix-vue'
import { cn } from '~/utils/cn'
import { useScrollReveal } from '~/composables/useScrollMotion'

type Period = 'monthly' | 'annual'

interface PlanFeature {
  text: string
  included: boolean
}

interface Plan {
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  currency?: string
  popular?: boolean
  cta: string
  ctaHref: string
  features: PlanFeature[]
}

const period = ref<Period>('monthly')
const annualSaving = 20  // % saving shown when annual selected

const plans: Plan[] = [
  {
    name: 'Starter',
    description: 'Perfect for indie makers and small teams just getting started.',
    monthlyPrice: 19,
    annualPrice: 15,
    cta: 'Get Started',
    ctaHref: '/signup',
    features: [
      { text: 'Up to 3 projects', included: true },
      { text: '10 GB storage', included: true },
      { text: 'Basic analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Custom domain', included: false },
      { text: 'Priority support', included: false },
    ],
  },
  {
    name: 'Pro',
    description: 'For growing teams that need more power and collaboration.',
    monthlyPrice: 49,
    annualPrice: 39,
    popular: true,
    cta: 'Start Free Trial',
    ctaHref: '/signup?plan=pro',
    features: [
      { text: 'Unlimited projects', included: true },
      { text: '100 GB storage', included: true },
      { text: 'Advanced analytics', included: true },
      { text: 'Priority support', included: true },
      { text: 'Custom domain', included: true },
      { text: 'Team collaboration', included: true },
    ],
  },
  {
    name: 'Enterprise',
    description: 'Tailored solutions for large organisations with complex needs.',
    monthlyPrice: 0,
    annualPrice: 0,
    cta: 'Contact Sales',
    ctaHref: '/contact',
    features: [
      { text: 'Everything in Pro', included: true },
      { text: 'Unlimited storage', included: true },
      { text: 'Dedicated support', included: true },
      { text: 'SLA guarantee', included: true },
      { text: 'Custom integrations', included: true },
      { text: 'SSO / SAML', included: true },
    ],
  },
]

function displayPrice(plan: Plan): string {
  if (plan.monthlyPrice === 0) return 'Custom'
  const p = period.value === 'annual' ? plan.annualPrice : plan.monthlyPrice
  return `$${p}`
}

const cardsRef = ref<HTMLElement | null>(null)
useScrollReveal(() => cardsRef.value?.querySelectorAll('.pricing-card') ?? null, {
  intensity: 'polished',
  stagger: 0.12,
})
</script>

<template>
  <section class="py-24 bg-background">
    <div class="container mx-auto px-6 md:px-10">
      <!-- Header -->
      <div class="text-center max-w-2xl mx-auto mb-16">
        <p class="text-sm font-mono uppercase tracking-widest text-primary mb-4">Pricing</p>
        <h2 class="text-4xl md:text-5xl font-heading font-bold text-foreground">Simple, transparent pricing</h2>
        <p class="mt-4 text-lg text-muted-foreground">No hidden fees. Cancel anytime.</p>

        <!-- Billing toggle -->
        <div class="mt-8 inline-flex items-center gap-3 bg-muted rounded-full px-4 py-2">
          <span :class="cn('text-sm font-medium transition-colors', period === 'monthly' ? 'text-foreground' : 'text-muted-foreground')">Monthly</span>
          <SwitchRoot
            :checked="period === 'annual'"
            class="relative w-10 h-6 rounded-full bg-muted-foreground/30 data-[state=checked]:bg-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary cursor-pointer"
            @update:checked="period = $event ? 'annual' : 'monthly'"
          >
            <SwitchThumb class="block w-4 h-4 rounded-full bg-white shadow-sm translate-x-1 transition-transform data-[state=checked]:translate-x-5" />
          </SwitchRoot>
          <span :class="cn('text-sm font-medium transition-colors', period === 'annual' ? 'text-foreground' : 'text-muted-foreground')">
            Annual
            <span class="ml-1 text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold">Save {{ annualSaving }}%</span>
          </span>
        </div>
      </div>

      <!-- Plans grid -->
      <div ref="cardsRef" class="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">
        <div
          v-for="plan in plans"
          :key="plan.name"
          :class="cn(
            'pricing-card relative flex flex-col rounded-2xl border p-8 transition-all duration-300',
            plan.popular
              ? 'border-primary bg-primary text-primary-foreground shadow-xl shadow-primary/20 scale-[1.02]'
              : 'border-border bg-card hover:-translate-y-1 hover:shadow-lg',
          )"
        >
          <!-- Popular badge -->
          <div
            v-if="plan.popular"
            class="absolute -top-3.5 left-1/2 -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full bg-foreground text-background text-xs font-semibold"
          >
            <Zap class="w-3 h-3" /> Most Popular
          </div>

          <!-- Plan info -->
          <div class="mb-6">
            <h3 :class="cn('text-xl font-heading font-bold', plan.popular ? 'text-primary-foreground' : 'text-foreground')">{{ plan.name }}</h3>
            <p :class="cn('mt-1 text-sm leading-relaxed', plan.popular ? 'text-primary-foreground/70' : 'text-muted-foreground')">{{ plan.description }}</p>
          </div>

          <!-- Price -->
          <div class="mb-8">
            <div class="flex items-end gap-1">
              <span :class="cn('text-5xl font-heading font-black tabular-nums', plan.popular ? 'text-primary-foreground' : 'text-foreground')">
                {{ displayPrice(plan) }}
              </span>
              <span v-if="plan.monthlyPrice > 0" :class="cn('text-sm mb-2', plan.popular ? 'text-primary-foreground/60' : 'text-muted-foreground')">/mo</span>
            </div>
            <p v-if="period === 'annual' && plan.annualPrice > 0" :class="cn('text-xs mt-1', plan.popular ? 'text-primary-foreground/60' : 'text-muted-foreground')">
              Billed annually (${{ plan.annualPrice * 12 }}/yr)
            </p>
          </div>

          <!-- Features -->
          <ul class="flex flex-col gap-3 mb-8 flex-1">
            <li
              v-for="feat in plan.features"
              :key="feat.text"
              class="flex items-center gap-3 text-sm"
              :class="plan.popular ? (feat.included ? 'text-primary-foreground' : 'text-primary-foreground/40') : (feat.included ? 'text-foreground' : 'text-muted-foreground/50')"
            >
              <Check v-if="feat.included" class="w-4 h-4 shrink-0 text-secondary" />
              <X v-else class="w-4 h-4 shrink-0 opacity-40" />
              {{ feat.text }}
            </li>
          </ul>

          <!-- CTA -->
          <NuxtLink
            :to="plan.ctaHref"
            :class="cn(
              'text-center py-3 px-6 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]',
              plan.popular
                ? 'bg-primary-foreground text-primary hover:bg-primary-foreground/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90',
            )"
          >
            {{ plan.cta }}
          </NuxtLink>
        </div>
      </div>

      <!-- Footer note -->
      <p class="text-center text-sm text-muted-foreground mt-10">
        All plans include a 14-day free trial. No credit card required.
      </p>
    </div>
  </section>
</template>
```

## Required imports

```ts
import { ref } from 'vue'
import { Check, X, Zap } from 'lucide-vue-next'
import { SwitchRoot, SwitchThumb } from 'radix-vue'
import { cn } from '~/utils/cn'
import { useScrollReveal } from '~/composables/useScrollMotion'
```

## Non-negotiables

1. Billing toggle uses Radix `SwitchRoot` + `SwitchThumb` — never a custom `<button>` with manual state
2. Popular card: `scale-[1.02]` + `shadow-xl shadow-primary/20` — always visually elevated vs peer cards
3. Popular card: inverted colours (`bg-primary text-primary-foreground`) — CTA button reverses back to `bg-primary-foreground text-primary`
4. Price display: `tabular-nums` on the number — prevents layout shift when the digit count changes between periods
5. `displayPrice()` returns `'Custom'` for enterprise (price 0) — never shows `$0`
6. Annual savings badge: inline `bg-primary/10 text-primary` pill next to the "Annual" label — always shows the % saving
7. Features list: `Check` + `text-secondary` for included, `X` + `opacity-40` for excluded — never green/red hardcoded colours
8. Toggle `@update:checked` updates `period` ref — Radix emits `update:checked`, not `change`
9. Card hover state only on non-popular cards — popular card is already elevated with `scale-[1.02]`; hover transforms would be redundant
10. `max-w-5xl mx-auto` on the plans grid — constrains the three cards on large screens; never full-width pricing cards
