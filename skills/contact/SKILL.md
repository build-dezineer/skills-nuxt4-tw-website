---
name: contact
description: >-
  Contact form section in split (info + form) or centered layouts, with name, email,
  company, budget select, and message fields, client-side validation, animated submit, and
  a success state. Use when building contact, inquiry or get-in-touch pages.
license: Apache-2.0
compatibility: >-
  Requires a Dezineer-scaffolded Nuxt 4 project (Tailwind v4 design tokens, shared
  components, media pipeline). Guidance targets Dezineer's generator; patterns may
  transfer to a plain Nuxt project with those primitives.
metadata:
  version: "1.0.0"
  tags: "content, forms, contact"
  stack: "nuxt4, vue3, tailwind4, lucide"
---

# Contact Skill

## When to use
Contact, inquiry, or get-in-touch sections. Use when SPEC includes a contact, reach out, or hire-us section. Provides a validated form with animated submit state.

## Architecture

Generate ONE file:

| File | Purpose |
|------|---------|
| `app/components/sections/ContactSection.vue` | Contact form with side info column |

## Layout variants

| Layout | Best for |
|---|---|
| `split` | Form left/right + contact info column (default) |
| `centered` | Full-width centered form, simpler layout |
| `minimal` | Just the form fields, no decorative info panel |

## `split` layout (default)

```vue
<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { Component } from 'vue'
import { Send, CheckCircle2, MapPin, Mail, Phone } from 'lucide-vue-next'
import { cn } from '~/utils/cn'

interface ContactForm {
  name: string
  email: string
  company: string
  budget: string
  message: string
}

const form = reactive<ContactForm>({
  name: '',
  email: '',
  company: '',
  budget: '',
  message: '',
})

const errors = reactive<Partial<Record<keyof ContactForm, string>>>({})
const submitting = ref(false)
const submitted = ref(false)

const budgetOptions = [
  'Under $10k',
  '$10k – $25k',
  '$25k – $50k',
  '$50k – $100k',
  '$100k+',
]

function validate(): boolean {
  Object.keys(errors).forEach(k => delete (errors as any)[k])

  if (!form.name.trim()) errors.name = 'Name is required'
  if (!form.email.trim()) errors.email = 'Email is required'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Enter a valid email address'
  if (!form.message.trim()) errors.message = 'Tell us about your project'

  return Object.keys(errors).length === 0
}

async function handleSubmit() {
  if (!validate() || submitting.value) return

  submitting.value = true
  try {
    // Replace with real API call: await $fetch('/api/contact', { method: 'POST', body: form })
    await new Promise(r => setTimeout(r, 1200))
    submitted.value = true
  } catch {
    errors.message = 'Something went wrong. Please try again.'
  } finally {
    submitting.value = false
  }
}

interface ContactInfoItem {
  icon: Component
  label: string
  value: string
  href?: string
}

const contactInfo: ContactInfoItem[] = [
  { icon: Mail,   label: 'Email',    value: 'hello@studio.com',  href: 'mailto:hello@studio.com' },
  { icon: Phone,  label: 'Phone',    value: '+1 (555) 000-0000', href: 'tel:+15550000000' },
  { icon: MapPin, label: 'Location', value: 'New York, NY' },
]
</script>

<template>
  <section class="py-24 bg-background">
    <div class="container mx-auto px-6 md:px-10">
      <div class="grid md:grid-cols-[1fr_2fr] gap-16 lg:gap-24">

        <!-- Left: Info column -->
        <div class="flex flex-col gap-10">
          <div>
            <p class="text-sm font-mono uppercase tracking-widest text-primary mb-4">Contact</p>
            <h2 class="text-4xl font-heading font-bold text-foreground leading-tight">
              Let's start a conversation.
            </h2>
            <p class="mt-4 text-muted-foreground leading-relaxed">
              Tell us about your project. We respond to every inquiry within one business day.
            </p>
          </div>

          <ul class="flex flex-col gap-5">
            <li v-for="info in contactInfo" :key="info.label" class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                <component :is="info.icon" class="w-4 h-4 text-primary" />
              </div>
              <div>
                <p class="text-xs font-mono uppercase tracking-widest text-muted-foreground">{{ info.label }}</p>
                <component :is="info.href ? 'a' : 'p'"
                  :href="info.href"
                  :class="cn('text-foreground font-medium mt-0.5', info.href && 'hover:text-primary transition-colors')"
                >{{ info.value }}</component>
              </div>
            </li>
          </ul>

          <!-- Social links or trust signals -->
          <div class="pt-6 border-t border-border">
            <p class="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Average response</p>
            <p class="text-2xl font-heading font-bold text-foreground">Under 4 hours</p>
          </div>
        </div>

        <!-- Right: Form -->
        <div>
          <!-- Success state -->
          <Transition name="fade" mode="out-in">
            <div
              v-if="submitted"
              key="success"
              class="flex flex-col items-center justify-center text-center gap-5 py-24"
            >
              <div class="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center">
                <CheckCircle2 class="w-8 h-8 text-secondary" />
              </div>
              <div>
                <h3 class="text-2xl font-heading font-bold text-foreground">Message sent!</h3>
                <p class="mt-2 text-muted-foreground">We'll be in touch within one business day.</p>
              </div>
              <button
                class="text-sm text-primary hover:underline"
                @click="submitted = false"
              >
                Send another message
              </button>
            </div>

            <!-- Form -->
            <form
              v-else
              key="form"
              class="flex flex-col gap-5"
              @submit.prevent="handleSubmit"
              novalidate
            >
              <!-- Name + Email row -->
              <div class="grid sm:grid-cols-2 gap-5">
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-foreground" for="contact-name">Name <span class="text-destructive">*</span></label>
                  <input
                    id="contact-name"
                    v-model="form.name"
                    type="text"
                    autocomplete="name"
                    placeholder="Alex Johnson"
                    :class="cn(
                      'w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all',
                      errors.name ? 'border-destructive focus:ring-destructive/30' : 'border-border focus:ring-primary/30'
                    )"
                  />
                  <p v-if="errors.name" class="text-xs text-destructive">{{ errors.name }}</p>
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="text-sm font-medium text-foreground" for="contact-email">Email <span class="text-destructive">*</span></label>
                  <input
                    id="contact-email"
                    v-model="form.email"
                    type="email"
                    autocomplete="email"
                    placeholder="alex@company.com"
                    :class="cn(
                      'w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all',
                      errors.email ? 'border-destructive focus:ring-destructive/30' : 'border-border focus:ring-primary/30'
                    )"
                  />
                  <p v-if="errors.email" class="text-xs text-destructive">{{ errors.email }}</p>
                </div>
              </div>

              <!-- Company -->
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-foreground" for="contact-company">Company</label>
                <input
                  id="contact-company"
                  v-model="form.company"
                  type="text"
                  autocomplete="organization"
                  placeholder="Your company name"
                  class="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                />
              </div>

              <!-- Budget select -->
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-foreground" for="contact-budget">Project budget</label>
                <select
                  id="contact-budget"
                  v-model="form.budget"
                  class="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Select a range</option>
                  <option v-for="opt in budgetOptions" :key="opt" :value="opt">{{ opt }}</option>
                </select>
              </div>

              <!-- Message -->
              <div class="flex flex-col gap-1.5">
                <label class="text-sm font-medium text-foreground" for="contact-message">About your project <span class="text-destructive">*</span></label>
                <textarea
                  id="contact-message"
                  v-model="form.message"
                  rows="5"
                  placeholder="Tell us what you're building, your timeline, and any specific challenges you're facing…"
                  :class="cn(
                    'w-full rounded-xl border bg-background px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all resize-y',
                    errors.message ? 'border-destructive focus:ring-destructive/30' : 'border-border focus:ring-primary/30'
                  )"
                />
                <p v-if="errors.message" class="text-xs text-destructive">{{ errors.message }}</p>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                :disabled="submitting"
                class="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all self-start"
              >
                <span v-if="submitting">Sending…</span>
                <span v-else class="flex items-center gap-2">Send message <Send class="w-4 h-4" /></span>
              </button>
            </form>
          </Transition>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active { transition: opacity 0.25s ease, transform 0.25s ease; }
.fade-enter-from   { opacity: 0; transform: translateY(8px); }
.fade-leave-to     { opacity: 0; transform: translateY(-8px); }
</style>
```

## Required imports

```ts
import { ref, reactive } from 'vue'
import type { Component } from 'vue'
import { Send, CheckCircle2, MapPin, Mail, Phone } from 'lucide-vue-next'
import { cn } from '~/utils/cn'
// Validate all icon names against app/assets/lucide-icons.txt
```

## Non-negotiables

1. `validate()` runs client-side before submission — check name, email (regex), message at minimum
2. Email regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` — simple but catches the most common invalid formats
3. Error display: `text-xs text-destructive` below the field, border changes to `border-destructive focus:ring-destructive/30`
4. `<form novalidate>` — disables browser default validation UI so custom errors show instead
5. Submit button: `disabled` while `submitting.value` is true — prevents double-submission
6. Success state: `<Transition name="fade" mode="out-in">` wraps form/success swap — smooth transition between states
7. `<label for="...">` linked to `id="..."` on every input — always accessible, never skip labels
8. `autocomplete` attributes on name, email, company — improves UX on mobile
9. Textarea: `resize-y` — allow vertical resize but not horizontal (prevents layout breaks)
10. Real API call replaces the `setTimeout` stub — always include a comment `// Replace with real API call` above the stub
