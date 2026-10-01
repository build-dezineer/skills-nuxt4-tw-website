---
name: cart
description: >-
  Cart surface: `useCartDrawer()` plus a Radix Dialog `CartDrawer` mounted once, a
  mini-cart nav badge, and a `/cart` page with line items, quantity steppers, subtotal,
  empty state, and checkout CTA. Depends on `commerce-core`. Use for cart drawers and the
  cart page.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "commerce, cart"
  stack: "nuxt4, vue3, tailwind4, radix-vue, lucide"
---

# Cart Skill

## When to use
The shopping cart surface for a storefront: a slide-in drawer (opened after add-to-cart), a mini-cart
button with a count badge for the nav, and a full `/cart` page. Depends on **[commerce-core](../commerce-core/SKILL.md)**
(`useCart`, `commerce.ts`).

## Architecture

Generate THREE files (the `useCartDrawer` composable is provided by **[commerce-core](../commerce-core/SKILL.md)** — do not
recreate it; just import it):

| File | Purpose |
|------|---------|
| `app/components/shared/CartDrawer.vue` | Radix Dialog slide-in cart; **mount once in `app/layouts/default.vue`** |
| `app/components/shared/MiniCart.vue` | Nav button with live item count; opens the drawer |
| `app/pages/cart.vue` | Full cart page (line items + summary) |

Mount `<CartDrawer />` once in `default.vue`. Place `<MiniCart />` in `NavBar.vue` beside the theme
toggle. Product/PDP add-to-cart calls `useCart().add(...)` then `useCartDrawer().open()` (both from
[commerce-core](../commerce-core/SKILL.md)).

## `app/components/shared/CartDrawer.vue`

Uses Radix `DialogRoot` bound to the shared state. Slide + fade are CSS transitions keyed off Radix
`data-[state]` — Radix keeps the element mounted until the transition finishes, so open/close are always
symmetric (no manual timeline to get wrong).

```vue
<script setup lang="ts">
import {
  DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose,
} from 'radix-vue'
import { X, Minus, Plus, ShoppingBag } from 'lucide-vue-next'
import { useCart } from '~/composables/useCart'
import { useCartDrawer } from '~/composables/useCartDrawer'

const cart = useCart()
const drawer = useCartDrawer()

function fmt(n: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(n)
}
</script>

<template>
  <DialogRoot :open="drawer.isOpen.value" @update:open="(v) => (v ? drawer.open() : drawer.close())">
    <DialogPortal>
      <DialogOverlay
        class="fixed inset-0 z-[95] bg-background/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
      />
      <DialogContent
        class="fixed inset-y-0 right-0 z-[96] flex w-full max-w-md flex-col bg-card shadow-2xl duration-300 ease-out data-[state=open]:animate-in data-[state=open]:slide-in-from-right data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right focus:outline-none"
      >
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-border px-6 py-4">
          <DialogTitle class="font-heading text-lg font-bold text-foreground">
            Cart <span class="text-muted-foreground">({{ cart.count.value }})</span>
          </DialogTitle>
          <DialogClose class="p-1 text-muted-foreground transition-colors hover:text-foreground" aria-label="Close cart">
            <X class="h-5 w-5" />
          </DialogClose>
        </div>

        <!-- Empty -->
        <div v-if="cart.isEmpty.value" class="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <ShoppingBag class="h-10 w-10 text-muted-foreground/50" />
          <p class="text-muted-foreground">Your cart is empty.</p>
          <DialogClose as-child>
            <NuxtLink to="/shop" class="rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110">
              Continue shopping
            </NuxtLink>
          </DialogClose>
        </div>

        <!-- Lines -->
        <template v-else>
          <div class="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div v-for="line in cart.lines.value" :key="line.id" class="flex gap-4">
              <NuxtLink :to="`/products/${line.slug}`" class="h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-muted" @click="drawer.close()">
                <img v-if="line.image" :src="line.image" :alt="line.name" class="h-full w-full object-cover" />
              </NuxtLink>
              <div class="flex min-w-0 flex-1 flex-col">
                <div class="flex items-start justify-between gap-2">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-foreground">{{ line.name }}</p>
                    <p v-if="line.variantLabel" class="mt-0.5 text-xs text-muted-foreground">{{ line.variantLabel }}</p>
                  </div>
                  <button class="text-muted-foreground transition-colors hover:text-foreground" aria-label="Remove item" @click="cart.remove(line.id)">
                    <X class="h-4 w-4" />
                  </button>
                </div>
                <div class="mt-auto flex items-center justify-between pt-2">
                  <div class="flex items-center rounded-lg border border-border">
                    <button class="p-1.5 text-foreground hover:text-primary" aria-label="Decrease" @click="cart.decrement(line.id)"><Minus class="h-3.5 w-3.5" /></button>
                    <span class="w-8 text-center text-sm tabular-nums text-foreground">{{ line.quantity }}</span>
                    <button class="p-1.5 text-foreground hover:text-primary" aria-label="Increase" @click="cart.increment(line.id)"><Plus class="h-3.5 w-3.5" /></button>
                  </div>
                  <span class="text-sm font-semibold tabular-nums text-foreground">{{ fmt(line.price * line.quantity, line.currency) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Footer -->
          <div class="border-t border-border px-6 py-5">
            <div class="mb-4 flex items-center justify-between">
              <span class="text-sm text-muted-foreground">Subtotal</span>
              <span class="text-lg font-semibold tabular-nums text-foreground">{{ fmt(cart.subtotal.value) }}</span>
            </div>
            <p class="mb-4 text-xs text-muted-foreground">Shipping & taxes calculated at checkout.</p>
            <DialogClose as-child>
              <NuxtLink to="/checkout" class="block rounded-lg bg-primary py-3.5 text-center text-sm font-medium text-primary-foreground transition-all hover:brightness-110 active:scale-[0.99]">
                Checkout
              </NuxtLink>
            </DialogClose>
          </div>
        </template>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
```

## `app/components/shared/MiniCart.vue`

```vue
<script setup lang="ts">
import { ShoppingBag } from 'lucide-vue-next'
import { useCart } from '~/composables/useCart'
import { useCartDrawer } from '~/composables/useCartDrawer'

const cart = useCart()
const drawer = useCartDrawer()
</script>

<template>
  <button class="relative p-2 text-foreground transition-colors hover:text-primary" aria-label="Open cart" @click="drawer.open()">
    <ShoppingBag class="h-5 w-5" />
    <span
      v-if="cart.count.value > 0"
      class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold tabular-nums text-primary-foreground"
    >{{ cart.count.value }}</span>
  </button>
</template>
```

## `app/pages/cart.vue`
Full-page version — same line-item + summary logic, laid out as a two-column page (lines left, order
summary right) with an empty state and a "Checkout" link to `/checkout`. Reuse `useCart`; do not
duplicate cart logic. (Structure mirrors the drawer's line rows and summary.)

## Wiring into the layout / nav

- `app/layouts/default.vue`: import and mount `<CartDrawer />` once (alongside the existing content).
- `NavBar.vue`: import `<MiniCart />` and place it beside the theme toggle / CTA.

## Non-negotiables

1. **All cart reads/writes go through `useCart()`**; drawer open state through `useCartDrawer()`. No local
   cart arrays, no second store.
2. **`CartDrawer` is mounted exactly once** (in `default.vue`) — never per page. `MiniCart` may appear in
   nav and mobile menu.
3. **Use Radix `DialogRoot`/`DialogContent`** for the drawer with CSS **animations** (`data-[state=open]:animate-in
   data-[state=open]:slide-in-from-right`, `data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right`;
   overlay uses `fade-in-0`/`fade-out-0`). These keyframes are pre-defined in `main.css` (`@guard:motion-system`).
   Do NOT use `transition-*` for the open/close — radix-vue's `Presence` only waits for CSS *animations* on
   exit, so a transition would make the drawer vanish instantly instead of sliding out. Never hand-roll a
   GSAP open/close timeline here (that's the class of bug that leaves the panel blank on reopen).
4. **Empty state is mandatory** (icon + "continue shopping" → `/shop`).
5. Quantity steppers call `cart.increment/decrement`; remove calls `cart.remove`; decrementing below 1
   removes the line (handled in `useCart`).
6. Money via `Intl.NumberFormat` with the line/cart currency; `tabular-nums` everywhere.
7. Checkout CTA links to `/checkout`; closing the drawer on navigation uses `DialogClose as-child`.
8. All colours via tokens; `z-[96]` drawer / `z-[95]` overlay sit above page content, below the custom
   cursor if present.
