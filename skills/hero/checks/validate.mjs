/**
 * Hero capability checker — runs sandboxed after the hero section is generated.
 *
 * Verifies the hero actually uses the pre-built primitives its skill requires.
 * It reports nothing about structure or appearance — only capability.
 */
export default function validate(input) {
  const findings = []
  const visual = typeof input.facts.heroVisual === 'string' ? input.facts.heroVisual : ''

  for (const file of input.files) {
    if (!/hero/i.test(file.sectionName) && !/hero/i.test(file.path)) continue
    const source = file.content || ''

    if (!/useTextReveal/.test(source)) {
      findings.push({
        file: file.path,
        message: 'Use the pre-built useTextReveal composable from ~/composables/useTextMotion for the headline motion instead of hand-rolled timelines.',
      })
    }

    if (visual === '3d' && !/ThreeScene/.test(source)) {
      findings.push({
        file: file.path,
        message: 'The wizard chose a 3D hero visual: render <ThreeScene /> from ~/components/shared/ThreeScene.vue in the split visual column — never inline Three.js.',
      })
    }

    if ((visual === 'image' || visual === 'video') && !/data-media-id/.test(source)) {
      findings.push({
        file: file.path,
        message: 'The wizard chose a media hero visual: the visual must be an <img> or <video> with a data-media-id so the media pipeline can bake the real source.',
      })
    }
  }

  return { findings }
}
