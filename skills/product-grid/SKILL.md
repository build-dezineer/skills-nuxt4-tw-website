---
name: product-grid
description: >-
  Shop and collection listing with a filterable, sortable responsive grid and a reusable
  `ProductCard` (image, price, sale/sold-out badges, quick-add), plus loading and empty
  states. Depends on `commerce-core` and `cart`. Use when building collection, category
  or shop-all pages.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "commerce, listing"
  stack: "nuxt4, vue3, tailwind4, lucide"
---

# Product Grid Skill

## When to use
The shop / collection listing — a filterable, sortable grid of products. Use for the `/shop` (or
`/collections/...`) page and for any "featured products" section on the home page. Depends on
**[commerce-core](../commerce-core/SKILL.md)** (generate `useCart`, `useProducts`, `useCartDrawer`, `commerce.ts` first). Reuses
the hardened motion layer for reveals.

## Architecture

Generate TWO files:

| File | Purpose |
|------|---------|
| `app/components/shared/ProductCard.vue` | One product tile — image, price, badges, quick-add. Reused by grid + PDP related rail |
| `app/components/sections/ProductGrid.vue` | Section: category filters + sort + responsive grid with loading/empty states |

The `/shop` page composes `ProductGrid`. A home "featured" section can render `ProductGrid` too (or map
`useProducts().products` filtered by `featured` through `ProductCard`).

## `app/components/shared/ProductCard.vue`

```vue
<script setup lang="ts">
import { computed } from 'vue'
import { ShoppingBag } from 'lucide-vue-next'
import { useCart } from '~/composables/useCart'
import { useCartDrawer } from '~/composables/useCartDrawer'
import type { Product } from '~/types/commerce'

const props = defineProps<{ product: Product }>()
const cart = useCart()
const drawer = useCartDrawer()

const onSale = computed(() =>
  !!props.product.compareAtPrice && props.product.compareAtPrice > props.product.price)
const soldOut = computed(() => props.product.inStock === false)
const hasVariants = computed(() => (props.product.variants?.length ?? 0) > 0)

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: props.product.currency ?? 'USD' }).format(n)
}

// Quick-add only for single-variant, in-stock products; variant products go to the PDP to choose.
function quickAdd() {
  if (soldOut.value || hasVariants.value) return
  cart.add(props.product)
  drawer.open()
}
</script>

<template>
  <div class="group relative flex flex-col">
    <NuxtLink :to="`/products/${product.slug}`" class="relative block aspect-[3/4] overflow-hidden rounded-xl bg-muted">
      <img
        :src="product.images?.[0]"
        :alt="product.name"
        loading="lazy"
        class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div class="absolute left-3 top-3 flex flex-col gap-1">
        <span v-if="onSale" class="rounded-full bg-primary px-2 py-1 text-[11px] font-semibold text-primary-foreground">Sale</span>
        <span
          v-for="b in product.badges ?? []"
          :key="b"
          class="rounded-full bg-background/90 px-2 py-1 text-[11px] font-medium text-foreground backdrop-blur"
        >{{ b }}</span>
      </div>
      <span
        v-if="soldOut"
        class="absolute inset-0 flex items-center justify-center bg-background/60 text-sm font-medium uppercase tracking-widest text-foreground"
      >Sold out</span>
      <button
        v-if="!soldOut && !hasVariants"
        class="absolute inset-x-3 bottom-3 flex translate-y-2 items-center justify-center gap-2 rounded-lg bg-foreground py-2.5 text-sm font-medium text-background opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100 focus-visible:outline-none"
        @click.prevent="quickAdd"
      >
        <ShoppingBag class="h-4 w-4" /> Quick add
      </button>
    </NuxtLink>

    <div class="mt-3 flex items-start justify-between gap-3">
      <div class="min-w-0">
        <NuxtLink
          :to="`/products/${product.slug}`"
          class="block truncate text-sm font-medium text-foreground transition-colors hover:text-primary"
        >{{ product.name }}</NuxtLink>
        <p v-if="product.category" class="mt-0.5 text-xs text-muted-foreground">{{ product.category }}</p>
      </div>
      <div class="shrink-0 text-right">
        <span class="text-sm font-semibold tabular-nums text-foreground">{{ fmt(product.price) }}</span>
        <span v-if="onSale" class="block text-xs tabular-nums text-muted-foreground line-through">{{ fmt(product.compareAtPrice!) }}</span>
      </div>
    </div>
  </div>
</template>
```

## `app/components/sections/ProductGrid.vue`

```vue
<script setup lang="ts">
import { ref, computed } from 'vue'
import { cn } from '~/utils/cn'
import { useProducts } from '~/composables/useProducts'
import { useScrollReveal } from '~/composables/useScrollMotion'
import ProductCard from '~/components/shared/ProductCard.vue'

const { products, loading, error, isEmpty, categories } = useProducts()

const activeCategory = ref<string>('all')
type Sort = 'featured' | 'price-asc' | 'price-desc'
const sort = ref<Sort>('featured')

const visible = computed(() => {
  let list = products.value
  if (activeCategory.value !== 'all') list = list.filter((p) => p.category === activeCategory.value)
  const arr = [...list]
  if (sort.value === 'price-asc') arr.sort((a, b) => a.price - b.price)
  else if (sort.value === 'price-desc') arr.sort((a, b) => b.price - a.price)
  else arr.sort((a, b) => Number(b.featured ?? false) - Number(a.featured ?? false))
  return arr
})

const gridRef = ref<HTMLElement | null>(null)
useScrollReveal(() => gridRef.value?.querySelectorAll('.product-card-item') ?? null, {
  intensity: 'polished',
  stagger: 0.06,
})
</script>

<template>
  <section class="bg-background py-20 md:py-28">
    <div class="container mx-auto px-6 md:px-10">
      <div class="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p class="mb-3 font-mono text-sm uppercase tracking-widest text-primary">Shop</p>
          <h2 class="font-heading text-4xl font-bold text-foreground md:text-5xl">All products</h2>
        </div>
        <div class="flex items-center gap-3">
          <label for="pg-sort" class="text-sm text-muted-foreground">Sort</label>
          <select
            id="pg-sort"
            v-model="sort"
            class="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus-visible:outline-2 focus-visible:outline-ring"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div v-if="categories.length" class="mb-10 flex flex-wrap gap-2">
        <button
          :class="cn('rounded-full px-4 py-2 text-sm font-medium transition-colors', activeCategory === 'all' ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground')"
          @click="activeCategory = 'all'"
        >All</button>
        <button
          v-for="c in categories"
          :key="c"
          :class="cn('rounded-full px-4 py-2 text-sm font-medium transition-colors', activeCategory === c ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground hover:text-foreground')"
          @click="activeCategory = c"
        >{{ c }}</button>
      </div>

      <!-- States, in priority order: loading → error → empty → data -->
      <div v-if="loading" class="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        <div v-for="n in 8" :key="n" class="animate-pulse">
          <div class="aspect-[3/4] rounded-xl bg-muted" />
          <div class="mt-3 h-4 w-2/3 rounded bg-muted" />
          <div class="mt-2 h-3 w-1/3 rounded bg-muted" />
        </div>
      </div>
      <div v-else-if="error" class="py-20 text-center text-muted-foreground">Couldn’t load products. Please try again.</div>
      <div v-else-if="isEmpty || !visible.length" class="py-20 text-center text-muted-foreground">No products found.</div>
      <div v-else ref="gridRef" class="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        <div v-for="p in visible" :key="p.id" class="product-card-item">
          <ProductCard :product="p" />
        </div>
      </div>
    </div>
  </section>
</template>
```

## Required imports
```ts
// ProductCard.vue
import { computed } from 'vue'
import { ShoppingBag } from 'lucide-vue-next'
import { useCart } from '~/composables/useCart'
import { useCartDrawer } from '~/composables/useCartDrawer'
import type { Product } from '~/types/commerce'
// ProductGrid.vue
import { ref, computed } from 'vue'
import { cn } from '~/utils/cn'
import { useProducts } from '~/composables/useProducts'
import { useScrollReveal } from '~/composables/useScrollMotion'
import ProductCard from '~/components/shared/ProductCard.vue'
```

## Non-negotiables

1. **Read products only through `useProducts()`** — never hardcode a product array in the component.
2. **Add-to-cart only through `useCart().add()`**, then `useCartDrawer().open()` — never local cart state.
3. **Quick-add is disabled for products with variants** (route to the PDP to choose) and for sold-out
   items. Variant products must pick options before adding.
4. Four states in priority order: **loading → error → empty → data** (skeletons on loading). Never show
   empty before checking error.
5. Prices via `Intl.NumberFormat` using `product.currency` (default USD); `tabular-nums` on every price;
   `compareAtPrice` renders as a `line-through` original when it's greater than `price`.
6. Product links go to `/products/${product.slug}`; images use a fixed `aspect-[3/4]` inside
   `overflow-hidden` with `group-hover:scale-105`.
7. Reveal the grid with `useScrollReveal` (staggered) — never a hand-rolled observer.
8. All colours via tokens (bg-background, text-foreground, bg-muted, text-primary, …) — never hex/rgb.
