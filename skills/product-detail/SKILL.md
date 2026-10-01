---
name: product-detail
description: >-
  Product detail page at `app/pages/products/[slug].vue`: image gallery, variant/option
  selection with swatches, quantity, add-to-cart, details accordion, and related products.
  Depends on `commerce-core` and `cart` and reuses `ProductCard`. Use for any product
  page.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "commerce, product"
  stack: "nuxt4, vue3, tailwind4, radix-vue, lucide"
---

# Product Detail Skill

## When to use
The product detail page (PDP) at the dynamic route `/products/[slug]`. Depends on **[commerce-core](../commerce-core/SKILL.md)**
(`useProducts`, `useCart`, `useCartDrawer`, `commerce.ts`), and reuses `ProductCard` from
**[product-grid](../product-grid/SKILL.md)** for the related rail.

## Architecture

Generate ONE page (a dynamic route — the file MUST be at this bracketed path so Nuxt creates the param):

| File | Purpose |
|------|---------|
| `app/pages/products/[slug].vue` | Image gallery + variant selection + add-to-cart + details + related |

`useProducts().getBySlug(route.params.slug)` resolves the product. Show a loading skeleton while the
catalog is still loading and a graceful not-found state when the slug doesn't match.

## `app/pages/products/[slug].vue`

```vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from '#imports'
import { Minus, Plus, ShoppingBag, Check } from 'lucide-vue-next'
import {
  AccordionRoot, AccordionItem, AccordionHeader, AccordionTrigger, AccordionContent,
} from 'radix-vue'
import { cn } from '~/utils/cn'
import { useProducts } from '~/composables/useProducts'
import { useCart } from '~/composables/useCart'
import { useCartDrawer } from '~/composables/useCartDrawer'
import ProductCard from '~/components/shared/ProductCard.vue'
import type { ProductVariant } from '~/types/commerce'

definePageMeta({ layout: 'default' })

const route = useRoute()
const { getBySlug, related, loading } = useProducts()
const cart = useCart()
const drawer = useCartDrawer()

const product = computed(() => getBySlug(String(route.params.slug)))
const notFound = computed(() => !loading.value && !product.value)

// ── Variant selection ─────────────────────────────────────────────────────────
const selected = ref<Record<string, string>>({})
// Default each option to its first value once the product resolves.
watch(product, (p) => {
  if (!p) return
  const next: Record<string, string> = {}
  for (const opt of p.options ?? []) next[opt.name] = opt.values[0]?.value ?? ''
  selected.value = next
}, { immediate: true })

const hasVariants = computed(() => (product.value?.variants?.length ?? 0) > 0)
const selectedVariant = computed<ProductVariant | undefined>(() => {
  if (!product.value?.variants?.length) return undefined
  return product.value.variants.find((v) =>
    Object.entries(v.options).every(([k, val]) => selected.value[k] === val))
})

const price = computed(() => selectedVariant.value?.price ?? product.value?.price ?? 0)
const compareAt = computed(() => selectedVariant.value?.compareAtPrice ?? product.value?.compareAtPrice)
const onSale = computed(() => !!compareAt.value && compareAt.value > price.value)
const inStock = computed(() => {
  if (hasVariants.value) return selectedVariant.value?.inStock !== false && !!selectedVariant.value
  return product.value?.inStock !== false
})
const canAdd = computed(() => !!product.value && inStock.value && (!hasVariants.value || !!selectedVariant.value))

function fmt(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: product.value?.currency ?? 'USD' }).format(n)
}

// ── Gallery ───────────────────────────────────────────────────────────────────
const activeImage = ref(0)
const mainImage = computed(() =>
  selectedVariant.value?.image ?? product.value?.images?.[activeImage.value] ?? product.value?.images?.[0])

// ── Quantity + add ──────────────────────────────────────────────────────────────
const qty = ref(1)
function addToCart() {
  if (!product.value || !canAdd.value) return
  cart.add(product.value, selectedVariant.value, qty.value)
  drawer.open()
}

const relatedItems = computed(() => related(product.value, 4))
</script>

<template>
  <!-- Loading -->
  <div v-if="loading && !product" class="container mx-auto px-6 py-24 md:px-10">
    <div class="grid animate-pulse gap-12 md:grid-cols-2">
      <div class="aspect-[4/5] rounded-2xl bg-muted" />
      <div class="space-y-4">
        <div class="h-8 w-2/3 rounded bg-muted" />
        <div class="h-6 w-1/4 rounded bg-muted" />
        <div class="h-24 w-full rounded bg-muted" />
      </div>
    </div>
  </div>

  <!-- Not found -->
  <div v-else-if="notFound" class="container mx-auto px-6 py-32 text-center md:px-10">
    <h1 class="font-heading text-3xl font-bold text-foreground">Product not found</h1>
    <p class="mt-3 text-muted-foreground">The product you’re looking for doesn’t exist or was removed.</p>
    <NuxtLink to="/shop" class="mt-6 inline-flex rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110">
      Back to shop
    </NuxtLink>
  </div>

  <!-- Product -->
  <div v-else-if="product" class="container mx-auto px-6 py-12 md:px-10 md:py-20">
    <!-- Breadcrumb -->
    <nav class="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
      <NuxtLink to="/shop" class="transition-colors hover:text-foreground">Shop</NuxtLink>
      <span>/</span>
      <span class="text-foreground">{{ product.name }}</span>
    </nav>

    <div class="grid gap-10 md:grid-cols-2 md:gap-16">
      <!-- Gallery -->
      <div class="flex flex-col gap-4">
        <div class="aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
          <img :src="mainImage" :alt="product.name" class="h-full w-full object-cover" />
        </div>
        <div v-if="(product.images?.length ?? 0) > 1" class="flex gap-3">
          <button
            v-for="(img, i) in product.images"
            :key="img"
            :class="cn('aspect-square w-20 overflow-hidden rounded-lg border-2 transition-colors', activeImage === i ? 'border-foreground' : 'border-transparent hover:border-border')"
            @click="activeImage = i"
          >
            <img :src="img" :alt="`${product.name} view ${i + 1}`" class="h-full w-full object-cover" />
          </button>
        </div>
      </div>

      <!-- Info -->
      <div class="md:py-2">
        <p v-if="product.category" class="mb-2 font-mono text-xs uppercase tracking-widest text-primary">{{ product.category }}</p>
        <h1 class="font-heading text-3xl font-bold leading-tight text-foreground md:text-4xl">{{ product.name }}</h1>

        <div class="mt-4 flex items-center gap-3">
          <span class="text-2xl font-semibold tabular-nums text-foreground">{{ fmt(price) }}</span>
          <span v-if="onSale" class="text-lg tabular-nums text-muted-foreground line-through">{{ fmt(compareAt!) }}</span>
          <span v-if="onSale" class="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Sale</span>
        </div>

        <p v-if="product.description" class="mt-6 leading-relaxed text-muted-foreground">{{ product.description }}</p>

        <!-- Options -->
        <div v-for="opt in product.options ?? []" :key="opt.name" class="mt-8">
          <div class="mb-3 text-sm font-medium text-foreground">{{ opt.name }}</div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="val in opt.values"
              :key="val.value"
              :class="cn(
                'rounded-lg border px-4 py-2 text-sm transition-all',
                selected[opt.name] === val.value ? 'border-foreground bg-foreground text-background' : 'border-border text-foreground hover:border-foreground',
              )"
              @click="selected[opt.name] = val.value"
            >
              <span v-if="val.swatch" class="mr-2 inline-block h-3 w-3 rounded-full align-middle" :style="{ backgroundColor: val.swatch }" />
              {{ val.label }}
            </button>
          </div>
        </div>

        <!-- Quantity + Add -->
        <div class="mt-8 flex items-center gap-4">
          <div class="flex items-center rounded-lg border border-border">
            <button class="p-3 text-foreground transition-colors hover:text-primary disabled:opacity-40" :disabled="qty <= 1" aria-label="Decrease quantity" @click="qty = Math.max(1, qty - 1)"><Minus class="h-4 w-4" /></button>
            <span class="w-10 text-center text-sm tabular-nums text-foreground">{{ qty }}</span>
            <button class="p-3 text-foreground transition-colors hover:text-primary" aria-label="Increase quantity" @click="qty += 1"><Plus class="h-4 w-4" /></button>
          </div>
          <button
            :disabled="!canAdd"
            :class="cn(
              'flex flex-1 items-center justify-center gap-2 rounded-lg px-6 py-3.5 text-sm font-medium transition-all',
              canAdd ? 'bg-primary text-primary-foreground hover:brightness-110 active:scale-[0.99]' : 'cursor-not-allowed bg-muted text-muted-foreground',
            )"
            @click="addToCart"
          >
            <ShoppingBag class="h-4 w-4" />
            {{ inStock ? 'Add to cart' : 'Sold out' }}
          </button>
        </div>
        <p v-if="hasVariants && !selectedVariant" class="mt-2 text-xs text-muted-foreground">Select options to add to cart.</p>

        <!-- Details accordion -->
        <AccordionRoot type="single" collapsible class="mt-10 border-t border-border">
          <AccordionItem
            v-for="section in [
              { key: 'details', title: 'Details', body: product.description || 'Premium materials, considered construction.' },
              { key: 'shipping', title: 'Shipping & Returns', body: 'Free shipping over $75. 30-day returns.' },
            ]"
            :key="section.key"
            :value="section.key"
            class="border-b border-border"
          >
            <AccordionHeader>
              <AccordionTrigger class="flex w-full items-center justify-between py-4 text-left text-sm font-medium text-foreground group">
                {{ section.title }}
                <Plus class="h-4 w-4 transition-transform group-data-[state=open]:rotate-45" />
              </AccordionTrigger>
            </AccordionHeader>
            <AccordionContent class="pb-4 text-sm text-muted-foreground">
              {{ section.body }}
            </AccordionContent>
          </AccordionItem>
        </AccordionRoot>
      </div>
    </div>

    <!-- Related -->
    <section v-if="relatedItems.length" class="mt-24">
      <h2 class="mb-8 font-heading text-2xl font-bold text-foreground">You may also like</h2>
      <div class="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-4">
        <ProductCard v-for="p in relatedItems" :key="p.id" :product="p" />
      </div>
    </section>
  </div>
</template>
```

## Non-negotiables

1. **File path is exactly `app/pages/products/[slug].vue`** — the bracket makes the dynamic route.
   Resolve via `useProducts().getBySlug(route.params.slug)`.
2. **Three states: loading skeleton → not-found → product.** Never assume the product exists; the catalog
   loads async. Not-found offers a link back to `/shop`.
3. **Variant selection is required before add** when the product has variants — `canAdd` is false until a
   matching in-stock `selectedVariant` exists; the button reads "Sold out" when out of stock.
4. **Add-to-cart flows through `useCart().add(product, selectedVariant, qty)` then `useCartDrawer().open()`** —
   never local cart state.
5. Price/compareAt derive from the **selected variant** first, then the product. `Intl.NumberFormat` +
   `tabular-nums`.
6. Accordion uses Radix `AccordionRoot` (never a hand-rolled toggle). Colour swatches use the option
   value's `swatch`.
7. All colours via tokens; images in fixed aspect boxes with `overflow-hidden`.
