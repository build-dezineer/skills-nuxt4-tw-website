/**
 * Footer capability checker — runs sandboxed after the footer is generated.
 * The layout shell already ships the one back-to-top button; adding another is
 * a duplicated control. Reports capability only, never layout or styling.
 */
export default function validate(input) {
  const findings = []

  for (const file of input.files) {
    if (!/footer/i.test(file.sectionName) && !/footer/i.test(file.path)) continue
    const source = file.content || ''

    if (/aria-label="back to top"/i.test(source) || /scrollTo\(\{\s*top:\s*0/.test(source)) {
      findings.push({
        file: file.path,
        message: 'Do not add a back-to-top button to the footer — one is pre-installed in the layout shell (default.vue), and only one should exist on the page.',
      })
    }
  }

  return { findings }
}
