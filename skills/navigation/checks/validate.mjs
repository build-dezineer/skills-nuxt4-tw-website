/**
 * Navigation capability checker — runs sandboxed after the header/nav is
 * generated. Combines the wizard's shell selections with the file content:
 * selected features must use their pre-built primitives, and internal links
 * must use NuxtLink. Reports capability only, never layout or styling.
 */
export default function validate(input) {
  const findings = []
  const enabled = Array.isArray(input.facts.navConfig && input.facts.navConfig.enabled)
    ? input.facts.navConfig.enabled
    : []

  for (const file of input.files) {
    if (!/nav/i.test(file.sectionName) && !/nav/i.test(file.path)) continue
    const source = file.content || ''

    if (enabled.includes('dropdown') && !/DropdownMenuRoot/.test(source)) {
      findings.push({
        file: file.path,
        message: 'The wizard enabled a nav dropdown: use the Radix DropdownMenuRoot primitives from radix-vue (with NuxtLink items) instead of a hand-rolled menu.',
      })
    }

    if (enabled.includes('mobileHamburger') && !/(DialogRoot|DrawerRoot)/.test(source)) {
      findings.push({
        file: file.path,
        message: 'The wizard enabled the mobile hamburger: use the Radix DialogRoot primitives from radix-vue for the drawer instead of a hand-rolled toggle panel.',
      })
    }

    if (/<a\b[\s\S]{0,300}?href="\/[^"]*"/.test(source)) {
      findings.push({
        file: file.path,
        message: 'Internal navigation must use <NuxtLink to="..."> — plain <a href="/..."> links cause full page reloads and violate the project rules.',
      })
    }
  }

  return { findings }
}
