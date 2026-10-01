---
name: commerce-core
description: >-
  Commerce foundation every storefront page depends on: `types/commerce.ts`, a `useCart()`
  persistent localStorage cart singleton, and `useProducts()` loading the mock catalog.
  Generate this first for any shop. Use when a project actually sells products and
  needs cart state or product data.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "commerce, foundation"
  stack: "nuxt4, vue3, tailwind4, vueuse"
---

# Commerce Core Skill

## When to use
The foundation for **any** storefront/commerce page — product grid, product detail, cart, checkout.
Every commerce skill ([product-grid](../product-grid/SKILL.md), [product-detail](../product-detail/SKILL.md), [cart](../cart/SKILL.md), [checkout](../checkout/SKILL.md)) depends on this one.
**Generate these files FIRST**, before building any commerce section. If they already exist in
the project, do not recreate them.

This skill is only relevant when the project actually sells products (the planner adds commerce pages
based on PRODUCT.md). Never generate it for a non-commerce site.

## Architecture

Generate these files **exactly as shown below** — they are the shared contract the whole storefront
relies on, so reproduce them verbatim and treat them as read-only afterwards:

| File | Purpose |
|------|---------|
| `app/types/commerce.ts` | Shared domain types (Product, variants, cart line) |
| `app/composables/useCart.ts` | Persistent client-side cart (localStorage singleton) |
| `app/composables/useProducts.ts` | Loads the mock catalog from `public/data/products.json` |
| `app/composables/useCartDrawer.ts` | Shared cart-drawer open/close state (used by product cards, PDP, cart) |
| `public/data/products.json` | **The mock catalog itself — you MUST create it** (see "Mock catalog data" below) |

**There is no separate data step — you generate `public/data/products.json` yourself as part of building
the store** (this builder ships a frontend with mock data). Details and schema are in the "Mock catalog
data" section below.

## `app/types/commerce.ts`

```ts
// ─────────────────────────────────────────────────────────────────────────────
// COMMERCE DOMAIN TYPES — generated from the commerce-core skill. DO NOT EDIT.
// Shared shape for the mock catalog (public/data/products.json), useProducts,
// useCart, and every storefront skill. Keep product data in this shape.
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductOptionValue {
  label: string            // display, e.g. "Small", "Midnight Black"
  value: string            // slug, e.g. "s", "black"
  swatch?: string          // CSS color for color swatches (optional)
  image?: string           // image shown when this value is selected (optional)
}

export interface ProductOption {
  name: string             // e.g. "Size", "Color"
  values: ProductOptionValue[]
}

export interface ProductVariant {
  id: string
  options: Record<string, string> // option name -> value, e.g. { Size: "s", Color: "black" }
  price?: number                   // overrides product.price when set
  compareAtPrice?: number
  sku?: string
  inStock?: boolean
  inventory?: number
  image?: string
}

export interface Product {
  id: string
  slug: string
  name: string
  price: number
  compareAtPrice?: number   // original price → renders as a strikethrough sale price
  currency?: string         // ISO code; defaults to 'USD'
  description?: string
  images: string[]          // at least one; images[0] is primary
  category?: string
  tags?: string[]
  options?: ProductOption[] // e.g. Size, Color — drives variant selection
  variants?: ProductVariant[]
  rating?: number           // 0..5
  reviewCount?: number
  inStock?: boolean         // defaults to true when omitted
  inventory?: number
  badges?: string[]         // e.g. ["New", "Bestseller"]
  featured?: boolean
}

export interface CartLine {
  id: string                // stable line id: `${productId}` or `${productId}:${variantId}`
  productId: string
  slug: string
  name: string
  image?: string
  price: number             // resolved unit price (variant price if any, else product price)
  currency: string
  quantity: number
  variantId?: string
  variantLabel?: string     // human-readable, e.g. "Size: S / Color: Black"
}

export interface Cart {
  lines: CartLine[]
  count: number
  subtotal: number
}
```

## `app/composables/useCart.ts`

```ts
// ─────────────────────────────────────────────────────────────────────────────
// SHOPPING CART — generated from commerce-core. DO NOT REIMPLEMENT.
// A single reactive cart shared across every page/component, persisted to
// localStorage so it survives refresh. Import { useCart } and call its actions.
// Add-to-cart everywhere MUST go through this — never keep cart state locally.
// ─────────────────────────────────────────────────────────────────────────────
import { computed } from 'vue'
import { useLocalStorage } from '@vueuse/core'
import type { Product, ProductVariant, CartLine } from '~/types/commerce'

const STORAGE_KEY = 'shop:cart:v1'

function isValidLine(l: unknown): l is CartLine {
  const x = l as Partial<CartLine>
  return !!x && typeof x.id === 'string' && typeof x.price === 'number'
    && typeof x.quantity === 'number' && x.quantity > 0
}

// Module-level singleton: one shared, persisted reactive store for the whole app.
// The serializer is defensive — corrupted/partial persisted JSON degrades to an
// empty cart instead of throwing and breaking the storefront.
const _lines = useLocalStorage<CartLine[]>(STORAGE_KEY, [], {
  serializer: {
    read: (raw: string) => {
      try {
        const parsed = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.filter(isValidLine) : []
      }
      catch { return [] }
    },
    write: (val: CartLine[]) => JSON.stringify(val),
  },
})

function lineId(product: Product, variant?: ProductVariant): string {
  return variant ? `${product.id}:${variant.id}` : product.id
}

function variantLabel(product: Product, variant?: ProductVariant): string | undefined {
  if (!variant?.options) return undefined
  return Object.entries(variant.options)
    .map(([name, value]) => {
      const opt = product.options?.find((o) => o.name === name)
      const val = opt?.values.find((v) => v.value === value)
      return `${name}: ${val?.label ?? value}`
    })
    .join(' / ')
}

export function useCart() {
  const lines = computed(() => _lines.value)
  const count = computed(() => _lines.value.reduce((n, l) => n + l.quantity, 0))
  const subtotal = computed(() => _lines.value.reduce((s, l) => s + l.price * l.quantity, 0))
  const isEmpty = computed(() => _lines.value.length === 0)

  function add(product: Product, variant?: ProductVariant, quantity = 1) {
    if (!product || quantity < 1) return
    const id = lineId(product, variant)
    if (_lines.value.some((l) => l.id === id)) {
      _lines.value = _lines.value.map((l) =>
        l.id === id ? { ...l, quantity: l.quantity + quantity } : l,
      )
      return
    }
    _lines.value = [
      ..._lines.value,
      {
        id,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: variant?.image ?? product.images?.[0],
        price: variant?.price ?? product.price,
        currency: product.currency ?? 'USD',
        quantity,
        variantId: variant?.id,
        variantLabel: variantLabel(product, variant),
      },
    ]
  }

  function setQty(id: string, quantity: number) {
    if (quantity < 1) { remove(id); return }
    _lines.value = _lines.value.map((l) => (l.id === id ? { ...l, quantity } : l))
  }

  function increment(id: string) {
    const l = _lines.value.find((x) => x.id === id)
    if (l) setQty(id, l.quantity + 1)
  }

  function decrement(id: string) {
    const l = _lines.value.find((x) => x.id === id)
    if (l) setQty(id, l.quantity - 1)
  }

  function remove(id: string) {
    _lines.value = _lines.value.filter((l) => l.id !== id)
  }

  function clear() {
    _lines.value = []
  }

  function has(productId: string) {
    return _lines.value.some((l) => l.productId === productId)
  }

  return { lines, count, subtotal, isEmpty, add, setQty, increment, decrement, remove, clear, has }
}
```

## `app/composables/useProducts.ts`

```ts
// ─────────────────────────────────────────────────────────────────────────────
// PRODUCT CATALOG — generated from commerce-core. DO NOT REIMPLEMENT.
// Loads the mock catalog from public/data/products.json into typed Product[],
// with loading/error/empty state and lookup helpers. Storefront skills MUST read
// products through this — do not hardcode a parallel catalog.
// ─────────────────────────────────────────────────────────────────────────────
import { ref, computed } from 'vue'
import type { Product } from '~/types/commerce'
import { withBase } from '~/utils/basePath'

// Root-absolute paths break under the builder preview's base path — always withBase().
const PRODUCTS_URL = '/data/products.json'

// Module-level singleton so every component shares one fetch + one reactive list.
const _products = ref<Product[]>([])
const _loading = ref(false)
const _error = ref<string | null>(null)
let _loaded = false
let _inflight: Promise<void> | null = null

async function load(): Promise<void> {
  if (_loaded) return
  if (_inflight) return _inflight
  _loading.value = true
  _error.value = null
  _inflight = fetch(withBase(PRODUCTS_URL))
    .then((r) => {
      if (!r.ok) throw new Error(`Failed to load products: ${r.status}`)
      const type = r.headers.get('content-type') || ''
      if (!type.includes('json')) throw new Error('Expected JSON but received HTML — check the asset base path')
      return r.json()
    })
    .then((data) => {
      // Accept either a bare array or { products: [...] }.
      const list = Array.isArray(data) ? data : Array.isArray(data?.products) ? data.products : []
      _products.value = list.filter((p: unknown) => {
        const x = p as Partial<Product>
        return !!x && typeof x.slug === 'string' && typeof x.name === 'string' && typeof x.price === 'number'
      })
      _loaded = true
    })
    .catch((e) => {
      // Graceful fallback — a missing/broken catalog must not crash the storefront.
      _error.value = e instanceof Error ? e.message : 'Failed to load products'
      _products.value = []
      _loaded = true
    })
    .finally(() => {
      _loading.value = false
      _inflight = null
    })
  return _inflight
}

export function useProducts() {
  if (typeof window !== 'undefined' && !_loaded) void load()

  const products = computed(() => _products.value)
  const loading = computed(() => _loading.value)
  const error = computed(() => _error.value)
  const isEmpty = computed(() => _loaded && _products.value.length === 0)
  const categories = computed(
    () => Array.from(new Set(_products.value.map((p) => p.category).filter(Boolean))) as string[],
  )

  function getBySlug(slug: string): Product | null {
    return _products.value.find((p) => p.slug === slug) ?? null
  }

  function byCategory(category: string): Product[] {
    return _products.value.filter((p) => p.category === category)
  }

  function related(product: Product | null, limit = 4): Product[] {
    if (!product) return []
    return _products.value
      .filter(
        (p) =>
          p.id !== product.id
          && (p.category === product.category
            || (p.tags ?? []).some((t) => (product.tags ?? []).includes(t))),
      )
      .slice(0, limit)
  }

  return { products, loading, error, isEmpty, categories, load, getBySlug, byCategory, related }
}
```

## `app/composables/useCartDrawer.ts`

Shared open/close state for the slide-in cart, so product cards, the PDP, and the cart can all open the
drawer without a cross-component dependency. (The [cart skill](../cart/SKILL.md) renders the `CartDrawer` component that
reads this state.)

```ts
import { ref } from 'vue'

// Module-level singleton — one shared drawer-open state for the whole app.
const _open = ref(false)

export function useCartDrawer() {
  return {
    isOpen: _open,
    open: () => { _open.value = true },
    close: () => { _open.value = false },
    toggle: () => { _open.value = !_open.value },
  }
}
```

## Mock catalog data — generate `public/data/products.json`

`useProducts` fetches `/data/products.json`. This builder generates a **frontend with mock data (no
backend)**, so YOU create this file as part of building the store — do not wait for any separate data
step. Generate **≥ 8 realistic products across ≥ 2 categories**, in this exact shape (matches `Product`
in `commerce.ts`):

```json
[
  {
    "id": "p-1",
    "slug": "merino-crew-sweater",
    "name": "Merino Crew Sweater",
    "price": 129,
    "compareAtPrice": 169,
    "currency": "USD",
    "description": "Full-sentence product copy, 1–3 sentences.",
    "images": ["https://images.unsplash.com/photo-...?w=900&h=1200&fit=crop", "..."],
    "category": "Knitwear",
    "tags": ["wool", "unisex"],
    "options": [
      { "name": "Size", "values": [
        { "label": "S", "value": "s" }, { "label": "M", "value": "m" }, { "label": "L", "value": "l" }
      ]},
      { "name": "Color", "values": [
        { "label": "Oat", "value": "oat", "swatch": "#e3d9c6" },
        { "label": "Charcoal", "value": "charcoal", "swatch": "#3a3a3a" }
      ]}
    ],
    "variants": [
      { "id": "p-1-s-oat", "options": { "Size": "s", "Color": "oat" }, "inStock": true },
      { "id": "p-1-m-charcoal", "options": { "Size": "m", "Color": "charcoal" }, "price": 139, "inStock": true }
    ],
    "rating": 4.6,
    "reviewCount": 87,
    "inStock": true,
    "badges": ["Bestseller"],
    "featured": true
  }
]
```
Rules:
- `id`, `slug` (kebab-case, unique — it drives `/products/[slug]`), `name`, `price`, and non-empty
  `images` are REQUIRED on every product.
- Include `options` + matching `variants` for apparel/multi-variant goods; omit both for single-variant goods.
- Put `compareAtPrice` (> price) on a few items so sale badges render; mark a couple `inStock: false`
  to exercise sold-out states.
- Portrait product images look best: Unsplash `?w=900&h=1200&fit=crop`.

## Non-negotiables

1. **Generate the composable/type files verbatim and treat them as read-only.** They are the shared
   contract every commerce section depends on — do not fork them or diverge from these signatures.
2. **You MUST create `public/data/products.json`** yourself (≥ 8 products, shape above) — there is no
   separate data-generation step, and `useProducts` fetches it at runtime. A store with no catalog file
   renders empty. This file is required, not optional.
3. **`useCart` is the ONLY source of cart state.** Every add-to-cart, quantity change, and cart display
   across the site reads/writes through `useCart()` — never a local `ref` or a second store.
4. **`useProducts` is the ONLY catalog source.** Product grids, detail pages, and related-product rails
   read through it — never hardcode a parallel product array in a component.
5. **`useCartDrawer` is the ONLY cart-drawer open/close state** — product cards, PDP, mini-cart, and the
   drawer all use it; never a second open-state ref.
6. **The cart persists** (localStorage) and survives refresh; do not disable the serializer.
6. Explicit imports only: `import { useCart } from '~/composables/useCart'`,
   `import type { Product } from '~/types/commerce'`.
7. `@vueuse/core` and Pinia are already installed — `useCart` uses `useLocalStorage` from `@vueuse/core`.
