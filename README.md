# Nuxt 4 + Tailwind Website Skills

[![Validate skills](https://github.com/build-dezineer/skills-nuxt4-tw-website/actions/workflows/validate.yml/badge.svg)](https://github.com/build-dezineer/skills-nuxt4-tw-website/actions/workflows/validate.yml)

A library of [Agent Skills](https://agentskills.io) for building production-quality
website sections on a **Nuxt 4 + Tailwind CSS v4** stack. The skills are the design
guidance behind Dezineer's website generator: each one tells an agent how to build a
coherent piece of a marketing site — hero, navigation, pricing, commerce, motion — to a
quality floor, using the stack's pre-built primitives instead of reinventing them.

Skills follow the open Agent Skills format, so they work in any compatible client
(Claude Code, Codex, OpenCode, Dezineer, and others) — install once, use everywhere.

## Skills

| Skill | Builds |
|---|---|
| [`navigation`](skills/navigation/SKILL.md) | Nav bar + overlay for every layout — sticky, transparent, overlay, mega menu |
| [`hero`](skills/hero/SKILL.md) | Above-the-fold hero: fullscreen, split, stacked, typographic; image, video, 3D, gradient, color |
| [`footer`](skills/footer/SKILL.md) | Site footer with link columns, newsletter, socials and legal row |
| [`page-header`](skills/page-header/SKILL.md) | Inner-page header/banner with breadcrumb, title and media |
| [`features`](skills/features/SKILL.md) | Feature grids and structured capability lists |
| [`testimonials`](skills/testimonials/SKILL.md) | Social-proof quotes, carousels and logo walls |
| [`pricing`](skills/pricing/SKILL.md) | Pricing tables with tiers, billing toggle and comparison |
| [`gallery`](skills/gallery/SKILL.md) | Portfolio and image galleries with lightbox |
| [`stats`](skills/stats/SKILL.md) | Animated metric/stat bands |
| [`team`](skills/team/SKILL.md) | Team and people grids |
| [`timeline`](skills/timeline/SKILL.md) | Process, roadmap and history timelines |
| [`faq`](skills/faq/SKILL.md) | Accessible accordion FAQs |
| [`logo-cloud`](skills/logo-cloud/SKILL.md) | Client logo walls, static or marquee |
| [`cta`](skills/cta/SKILL.md) | Conversion call-to-action bands |
| [`contact`](skills/contact/SKILL.md) | Contact sections with validated forms |
| [`scroll-motion`](skills/scroll-motion/SKILL.md) | Lenis smooth scroll, reveal, parallax, horizontal tracks |
| [`text-motion`](skills/text-motion/SKILL.md) | Split-text reveals and animated counters |
| [`cursor`](skills/cursor/SKILL.md) | Custom cursor overlays with magnetic and label effects |
| [`marquee`](skills/marquee/SKILL.md) | Infinite marquee tracks |
| [`page-transitions`](skills/page-transitions/SKILL.md) | Route transition choreography |
| [`media`](skills/media/SKILL.md) | Placeholder-aware image/video contract for the media pipeline |
| [`video-bg`](skills/video-bg/SKILL.md) | Full-bleed background video sections |
| [`3d-scene`](skills/3d-scene/SKILL.md) | TresJS Three.js scenes via the pre-built `ThreeScene.vue` |
| [`commerce-core`](skills/commerce-core/SKILL.md) | Commerce foundation: types, `useCart`, product data shape |
| [`product-grid`](skills/product-grid/SKILL.md) | Product listing grids with filters and sorting |
| [`product-detail`](skills/product-detail/SKILL.md) | Product detail pages with gallery, options and add-to-cart |
| [`cart`](skills/cart/SKILL.md) | Cart drawer, mini-cart and cart page |
| [`checkout`](skills/checkout/SKILL.md) | Checkout and order-confirmation flow with mock payment |

## Install

Each skill is a folder containing a `SKILL.md` plus optional `references/`,
`assets/`, and `evals/`. Copy or symlink the skill folders into your client's skills
directory.

**skills CLI** — installs into any detected agent (Claude Code, Codex, OpenCode,
Cursor, and [many more](https://github.com/vercel-labs/skills#supported-agents)):

```bash
npx skills add build-dezineer/skills-nuxt4-tw-website
```

Use `--list` to preview the skills first, or `--skill hero` to install one.

**Dezineer** — Settings → **Skills** → install from GitHub with:

```
https://github.com/build-dezineer/skills-nuxt4-tw-website
```

**Claude Code** — personal (`~/.claude/skills/`) or project (`.claude/skills/`):

```bash
git clone --depth 1 https://github.com/build-dezineer/skills-nuxt4-tw-website.git
mkdir -p ~/.claude/skills
cp -R skills-nuxt4-tw-website/skills/*/ ~/.claude/skills/
```

Claude Code also accepts symlinked skill folders, which keeps `git pull` as the update
mechanism:

```bash
ln -s "$PWD/skills-nuxt4-tw-website/skills/hero" ~/.claude/skills/hero
```

**Codex** — `~/.agents/skills/` (all projects) or `.agents/skills/` (project):

```bash
mkdir -p ~/.agents/skills
cp -R skills-nuxt4-tw-website/skills/*/ ~/.agents/skills/
```

**OpenCode** — global (`~/.config/opencode/skills/`) or project
(`.opencode/skills/`). OpenCode also reads the Claude- and agents-compatible
directories above:

```bash
mkdir -p ~/.config/opencode/skills
cp -R skills-nuxt4-tw-website/skills/*/ ~/.config/opencode/skills/
```

**Any other Agent Skills client** — copy the skill folders into its skills directory.
The format is portable; only the discovery path changes.

## Compatibility

The guidance targets a **Dezineer-scaffolded Nuxt 4 project**: Tailwind v4 design
tokens, shared components (`AnimatedGradient`, `ThreeScene`, `MarqueeTrack`,
`DataTable`, …), and the `data-media-id` media pipeline. `compatibility` and
`metadata.stack` on each skill declare this. Patterns may transfer to a plain Nuxt 4
project that provides the same primitives.

Each skill folder is self-contained; you can install only the skills relevant to a
project. The pack itself is labeled in the generated catalog (`appType: website`), so
Dezineer only offers it to website projects. A single skill can override that default
with its own `metadata.app-type`.

## Repository structure

```
skills/<name>/SKILL.md      # required: frontmatter + instructions
skills/<name>/references/   # optional: detail loaded only when the skill says to
skills/<name>/assets/       # optional: static files the skill references
skills/<name>/checks/       # optional: checks/validate.mjs capability checker
skills/<name>/evals/        # optional: evals/evals.json test cases
package.json                # repository identity and install description
skills/index.json           # generated catalog (description, app-type + name, files, version)
scripts/                    # repo tooling (validation, index build)
```

## Validate

Requires Node.js 20+ and, for the spec validator, [uv](https://docs.astral.sh/uv/).

```bash
npm ci
npm run validate        # repo checks: frontmatter, links, index inputs
npm run validate:spec   # official skills-ref validation (agentskills.io)
npm run index:check     # committed index.json is up to date
```

CI runs all three on every push and pull request.

## Versioning

Every skill starts at `1.0.0` in `metadata.version`. Content edits bump patch or
minor; a change to a skill's inputs or section contract bumps major. Repo tags
(`v1.0.0`) pin snapshots for consumers that vendor the library.

## Evals

Skills with objectively verifiable output ship test cases in `evals/evals.json`
(currently `hero` and `navigation`). Run them with Anthropic's
[`skill-creator`](https://github.com/anthropics/skills/tree/main/skills/skill-creator),
or manually by running each prompt with and without the skill and comparing outputs.
Eval workspaces are local and gitignored.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the authoring contract — frontmatter
fields, description formula, body guidelines, versioning, and evals.

## License

[Apache-2.0](LICENSE) © Dezineer
