import { computed } from 'vue'

/**
 * Graduated post-processing level for the 3D scene, driven by the wizard's
 * `animationIntensity`: calm = none, polished = vignette, energetic = + bloom,
 * cinematic = + chromatic aberration. Returns visibility flags per effect so a
 * `<EffectComposer>` can conditionally render each pass.
 */
export type PostFXLevel = 'none' | 'vignette' | 'bloom' | 'full'

export function usePostFX(animationIntensity: string) {
  const level = computed<PostFXLevel>(() => {
    switch (animationIntensity) {
      case 'calm': return 'none'
      case 'polished': return 'vignette'
      case 'energetic': return 'bloom'
      default: return 'full' // cinematic
    }
  })

  const showVignette = computed(() => level.value !== 'none')
  const showBloom = computed(() => level.value === 'bloom' || level.value === 'full')
  const showChromaticAberration = computed(() => level.value === 'full')

  return { level, showVignette, showBloom, showChromaticAberration }
}
