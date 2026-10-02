/**
 * Gallery capability checker — runs sandboxed after a gallery/portfolio section
 * is generated. Verifies the pre-built lightbox is actually wired in; reports
 * capability only, never layout or styling.
 */
export default function validate(input) {
  const findings = []

  for (const file of input.files) {
    if (!/(gallery|case.?stud|portfolio|showcase)/i.test(file.sectionName)) continue
    const source = file.content || ''

    if (!/LightboxDialog/.test(source)) {
      findings.push({
        file: file.path,
        message: 'Import and render the pre-built LightboxDialog from ~/components/shared/LightboxDialog.vue so gallery items open fullscreen with keyboard navigation.',
      })
    }
  }

  return { findings }
}
