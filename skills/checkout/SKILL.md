---
name: checkout
description: >-
  Checkout flow with a contact to shipping to mock-payment page and sticky order summary,
  plus an order-confirmation page that clears the cart and shows a mock order number.
  Design-only, no real payment. Depends on `commerce-core`. Use when building checkout
  or order-confirmation screens.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "commerce, checkout"
  stack: "nuxt4, vue3, tailwind4, lucide"
---

# Checkout Skill

## When to use
The checkout flow for a storefront: a checkout page (contact → shipping → payment → review) with a live
order summary, and an order-confirmation page. Depends on **[commerce-core](../commerce-core/SKILL.md)** (`useCart`).

**This is a design/frontend build with mock data — there is NO real payment processing.** The payment
fields are UI only; "Place order" clears the cart and shows a mock confirmation. Make that honest (a
small "Demo checkout — no real payment" note), never collect real card data.

## Architecture

Generate TWO pages:

| File | Purpose |
|------|---------|
| `app/pages/checkout.vue` | Contact + shipping + (mock) payment form, with a sticky order summary |
| `app/pages/order-confirmation.vue` | Success screen with a mock order number; clears no state |

## `app/pages/checkout.vue`

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from '#imports'
import { Lock, ChevronLeft } from 'lucide-vue-next'
import { cn } from '~/utils/cn'
import { useCart } from '~/composables/useCart'

definePageMeta({ layout: 'default' })

const cart = useCart()
const router = useRouter()

function fmt(n: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n) }

const SHIPPING = 0 // free shipping (mock)
const taxRate = 0.08
const tax = computed(() => cart.subtotal.value * taxRate)
const total = computed(() => cart.subtotal.value + SHIPPING + tax.value)

const form = ref({
  email: '', firstName: '', lastName: '', address: '', city: '', zip: '', country: 'United States',
  card: '', expiry: '', cvc: '',
})
const submitting = ref(false)
const errors = ref<Record<string, boolean>>({})

const required = ['email', 'firstName', 'lastName', 'address', 'city', 'zip', 'card', 'expiry', 'cvc'] as const

function validate() {
  const e: Record<string, boolean> = {}
  for (const k of required) if (!String(form.value[k]).trim()) e[k] = true
  if (form.value.email && !/^\S+@\S+\.\S+$/.test(form.value.email)) e.email = true
  errors.value = e
  return Object.keys(e).length === 0
}

function placeOrder() {
  if (cart.isEmpty.value || !validate()) return
  submitting.value = true
  // Mock order — no real payment. Generate a human order number, clear the cart, confirm.
  const orderNumber = `#${Math.floor(10000 + Math.random() * 89999)}`
  cart.clear()
  router.push({ path: '/order-confirmation', query: { order: orderNumber } })
}

const inputClass = (k: string) =>
  cn('w-full rounded-lg border bg-card px-3 py-2.5 text-sm text-foreground transition-colors focus-visible:outline-2 focus-visible:outline-ring',
    errors.value[k] ? 'border-destructive' : 'border-border')
</script>

<template>
  <div class="container mx-auto px-6 py-12 md:px-10 md:py-16">
    <NuxtLink to="/shop" class="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
      <ChevronLeft class="h-4 w-4" /> Continue shopping
    </NuxtLink>

    <!-- Empty cart guard -->
    <div v-if="cart.isEmpty.value" class="py-24 text-center">
      <h1 class="font-heading text-3xl font-bold text-foreground">Your cart is empty</h1>
      <NuxtLink to="/shop" class="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110">Browse products</NuxtLink>
    </div>

    <div v-else class="grid gap-12 lg:grid-cols-[1fr_400px]">
      <!-- Form -->
      <form class="space-y-10" @submit.prevent="placeOrder">
        <section>
          <h2 class="mb-4 font-heading text-xl font-bold text-foreground">Contact</h2>
          <input v-model="form.email" type="email" placeholder="Email" :class="inputClass('email')" />
        </section>

        <section>
          <h2 class="mb-4 font-heading text-xl font-bold text-foreground">Shipping address</h2>
          <div class="grid gap-3 sm:grid-cols-2">
            <input v-model="form.firstName" placeholder="First name" :class="inputClass('firstName')" />
            <input v-model="form.lastName" placeholder="Last name" :class="inputClass('lastName')" />
            <input v-model="form.address" placeholder="Address" class="sm:col-span-2" :class="inputClass('address')" />
            <input v-model="form.city" placeholder="City" :class="inputClass('city')" />
            <input v-model="form.zip" placeholder="ZIP / Postal code" :class="inputClass('zip')" />
          </div>
        </section>

        <section>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-heading text-xl font-bold text-foreground">Payment</h2>
            <span class="flex items-center gap-1 text-xs text-muted-foreground"><Lock class="h-3 w-3" /> Demo checkout — no real payment</span>
          </div>
          <div class="grid gap-3 sm:grid-cols-2">
            <input v-model="form.card" placeholder="Card number" class="sm:col-span-2" :class="inputClass('card')" inputmode="numeric" autocomplete="off" />
            <input v-model="form.expiry" placeholder="MM / YY" :class="inputClass('expiry')" autocomplete="off" />
            <input v-model="form.cvc" placeholder="CVC" :class="inputClass('cvc')" inputmode="numeric" autocomplete="off" />
          </div>
        </section>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full rounded-lg bg-primary py-4 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
        >
          {{ submitting ? 'Placing order…' : `Pay ${fmt(total)}` }}
        </button>
      </form>

      <!-- Order summary -->
      <aside class="lg:sticky lg:top-24 lg:h-fit">
        <div class="rounded-2xl border border-border bg-card p-6">
          <h2 class="mb-4 font-heading text-lg font-bold text-foreground">Order summary</h2>
          <div class="space-y-4">
            <div v-for="line in cart.lines.value" :key="line.id" class="flex gap-3">
              <div class="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                <img v-if="line.image" :src="line.image" :alt="line.name" class="h-full w-full object-cover" />
                <span class="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-semibold tabular-nums text-background">{{ line.quantity }}</span>
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-foreground">{{ line.name }}</p>
                <p v-if="line.variantLabel" class="text-xs text-muted-foreground">{{ line.variantLabel }}</p>
              </div>
              <span class="text-sm tabular-nums text-foreground">{{ fmt(line.price * line.quantity) }}</span>
            </div>
          </div>
          <div class="mt-6 space-y-2 border-t border-border pt-4 text-sm">
            <div class="flex justify-between text-muted-foreground"><span>Subtotal</span><span class="tabular-nums text-foreground">{{ fmt(cart.subtotal.value) }}</span></div>
            <div class="flex justify-between text-muted-foreground"><span>Shipping</span><span class="tabular-nums text-foreground">{{ SHIPPING === 0 ? 'Free' : fmt(SHIPPING) }}</span></div>
            <div class="flex justify-between text-muted-foreground"><span>Tax</span><span class="tabular-nums text-foreground">{{ fmt(tax) }}</span></div>
            <div class="flex justify-between border-t border-border pt-2 text-base font-semibold text-foreground"><span>Total</span><span class="tabular-nums">{{ fmt(total) }}</span></div>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>
```

## `app/pages/order-confirmation.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from '#imports'
import { CheckCircle } from 'lucide-vue-next'

definePageMeta({ layout: 'default' })

const route = useRoute()
const orderNumber = computed(() => (route.query.order as string) || '#00000')
</script>

<template>
  <div class="container mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center px-6 py-24 text-center">
    <CheckCircle class="h-14 w-14 text-primary" />
    <h1 class="mt-6 font-heading text-3xl font-bold text-foreground md:text-4xl">Thank you for your order</h1>
    <p class="mt-3 text-muted-foreground">
      Your order <span class="font-semibold text-foreground">{{ orderNumber }}</span> is confirmed. A receipt
      has been sent to your email. <span class="block text-xs">(Demo order — no payment was processed.)</span>
    </p>
    <NuxtLink to="/shop" class="mt-8 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110">
      Continue shopping
    </NuxtLink>
  </div>
</template>
```

## Non-negotiables

1. **No real payment.** Payment fields are UI only; show an honest "Demo checkout — no real payment"
   note. Never wire a real gateway or collect real card data.
2. **`placeOrder` clears the cart via `cart.clear()`** and routes to `/order-confirmation` with a mock
   order number in the query. The order summary reads live from `useCart()`.
3. **Guard the empty cart** — if `cart.isEmpty`, show an empty state and a link to `/shop` instead of the
   form.
4. Basic required-field validation before placing the order; invalid fields get `border-destructive`.
5. Totals: subtotal from `useCart().subtotal`, plus (mock) shipping + tax; all money via
   `Intl.NumberFormat` + `tabular-nums`.
6. Order summary is sticky on desktop (`lg:sticky lg:top-24`); single column on mobile.
7. All colours via tokens (including `border-destructive` for errors) — never hex/rgb.
