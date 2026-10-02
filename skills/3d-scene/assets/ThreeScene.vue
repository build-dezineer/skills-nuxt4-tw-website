<template>
  <div ref="canvasRef" class="w-full h-full">
    <ClientOnly>
      <!-- No WebGL, or the visitor prefers reduced motion → static gradient instead of a canvas -->
      <AnimatedGradient v-if="!webglOK || reducedMotion" :variant="fallbackVariant" />

      <TresCanvas
        v-else
        alpha
        clear-color="transparent"
        :antialias="wantsAntialias"
        :shadows="wantsShadows"
        power-preference="high-performance"
      >
        <TresPerspectiveCamera :position="cameraPos" :fov="fov" />

        <!-- particles -->
        <template v-if="preset === 'particles'">
          <TresGroup ref="groupRef">
            <TresPoints>
              <TresBufferGeometry :position="[positions, 3]" />
              <TresPointsMaterial :color="resolvedColor" :size="0.025" :size-attenuation="true" :transparent="true" :opacity="0.7" />
            </TresPoints>
          </TresGroup>
          <TresAmbientLight :intensity="0.6" />
          <TresDirectionalLight :position="dirLightParticles" :intensity="1.2" />
        </template>

        <!-- galaxy -->
        <template v-else-if="preset === 'galaxy'">
          <TresGroup ref="groupRef">
            <TresPoints>
              <TresBufferGeometry :position="[positions, 3]" :color="[colors, 3]" />
              <TresPointsMaterial :size="0.035" :size-attenuation="true" :vertex-colors="true" :transparent="true" :opacity="0.9" />
            </TresPoints>
          </TresGroup>
        </template>

        <!-- ribbon (group populated imperatively) -->
        <template v-else-if="preset === 'ribbon'">
          <TresGroup ref="groupRef" />
          <TresAmbientLight :intensity="0.5" />
        </template>

        <!-- object -->
        <template v-else-if="preset === 'object'">
          <OrbitControls :enable-zoom="false" :auto-rotate="false" :enable-pan="false" />
          <Environment preset="city" />
          <TresMesh ref="meshRef" :cast-shadow="true">
            <TresTorusKnotGeometry :args="[1, 0.3, 128, 32]" />
            <TresMeshStandardMaterial color="#ffffff" :metalness="0.9" :roughness="0.1" :env-map-intensity="1.5" />
          </TresMesh>
          <TresAmbientLight :intensity="0.3" />
        </template>

        <!-- abstract (noise-displaced sphere) -->
        <template v-else-if="preset === 'abstract'">
          <TresAmbientLight :intensity="0.5" />
          <TresDirectionalLight :position="dirLightAbstract" :intensity="2" />
          <TresMesh ref="meshRef">
            <TresSphereGeometry :args="[1.5, 128, 128]" />
            <TresShaderMaterial :vertex-shader="vertexShader" :fragment-shader="fragmentShader" :uniforms="uniforms" :transparent="true" :side="2" />
          </TresMesh>
        </template>

        <!-- morph -->
        <template v-else-if="preset === 'morph'">
          <TresAmbientLight :intensity="0.4" />
          <TresDirectionalLight :position="dirLightMorph" :intensity="2" :cast-shadow="true" />
          <TresPointLight :position="pointLightMorph" :intensity="1" color="#8855ff" />
          <TresMesh ref="meshRef" :geometry="baseGeo" :cast-shadow="true">
            <TresMeshStandardMaterial color="#8855ff" :metalness="0.3" :roughness="0.4" :morph-targets="true" :morph-normals="true" />
          </TresMesh>
        </template>

        <slot name="post-processing" />
      </TresCanvas>

      <!-- Pre-hydration / SSR fallback: never a blank canvas -->
      <template #fallback>
        <AnimatedGradient :variant="fallbackVariant" />
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ref, shallowRef, computed, watch, onMounted, onUnmounted } from 'vue'
import { OrbitControls, Environment } from '@tresjs/cientos'
import { useMouseInElement, useRafFn } from '@vueuse/core'
import * as THREE from 'three'
import AnimatedGradient from '~/components/shared/AnimatedGradient.vue'

type Preset = 'particles' | 'object' | 'abstract' | 'galaxy' | 'ribbon' | 'morph'

interface Props {
  preset?: Preset
  count?: number
  mouseTrack?: boolean
  color?: string          // Three color OR CSS var (e.g. '--primary' / 'var(--primary)')
  animationIntensity?: string
  fallbackVariant?: 'aurora' | 'linear'
}

const props = withDefaults(defineProps<Props>(), {
  preset: 'particles',
  count: 3000,
  mouseTrack: true,
  color: 'white',
  animationIntensity: 'energetic',
  fallbackVariant: 'aurora',
})

// ── SSR / capability guards ──────────────────────────────────────────────────
const canvasRef = ref<HTMLElement | null>(null)
const webglOK = ref(true)
const reducedMotion = ref(
  import.meta.client && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
)

function detectWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')))
  } catch { return false }
}

// ── Per-preset camera / canvas settings ──────────────────────────────────────
// TresJS's declared prop types for `position` want a real THREE.Vector3 (array shorthand
// works at runtime but not in vue-tsc's types) — use Vector3 instances everywhere to stay
// both runtime- and type-correct, rather than casting/suppressing the mismatch.
const CAMERA_POSITIONS: Record<Preset, [number, number, number]> = {
  particles: [0, 0, 8], object: [0, 0, 5], abstract: [0, 0, 4],
  galaxy: [0, 4, 10], ribbon: [0, 0, 10], morph: [0, 0, 5],
}
const cameraPos = computed(() => new THREE.Vector3(...CAMERA_POSITIONS[props.preset]))
const fov = computed(() => (props.preset === 'particles' || props.preset === 'galaxy' || props.preset === 'ribbon' ? 60 : 55))
const wantsAntialias = computed(() => props.preset === 'object' || props.preset === 'abstract' || props.preset === 'morph')
const wantsShadows = computed(() => props.preset === 'object' || props.preset === 'morph')

// Static light positions (per preset) — plain Vector3 constants, never reactive.
const dirLightParticles = new THREE.Vector3(3, 5, 3)
const dirLightAbstract = new THREE.Vector3(2, 4, 2)
const dirLightMorph = new THREE.Vector3(4, 6, 4)
const pointLightMorph = new THREE.Vector3(-4, -3, -4)

// ── Scene refs ───────────────────────────────────────────────────────────────
const groupRef = shallowRef<THREE.Group | null>(null)
const meshRef = shallowRef<THREE.Mesh | null>(null)

// ── Preset data (built only for the active preset) ───────────────────────────
let positions: Float32Array = new Float32Array(0)
let colors: Float32Array = new Float32Array(0)
// Non-nullable (empty until the 'morph' branch below populates it) so the :geometry
// binding on TresMesh always satisfies TresJS's non-optional BufferGeometry prop type.
let baseGeo: THREE.BufferGeometry = new THREE.BufferGeometry()
const uniforms = { uTime: { value: 0 } }
const clock = new THREE.Clock()

const vertexShader = `
  uniform float uTime;
  varying vec3 vNormal;
  void main() {
    vNormal = normal;
    float noise = sin(position.x * 3.0 + uTime) * 0.15
                + sin(position.y * 3.5 + uTime * 0.8) * 0.1
                + sin(position.z * 4.0 + uTime * 1.2) * 0.08;
    vec3 displaced = position + normal * noise;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
  }
`
const fragmentShader = `
  uniform float uTime;
  varying vec3 vNormal;
  void main() {
    vec3 col = mix(vec3(0.2, 0.5, 1.0), vec3(0.8, 0.2, 0.9), vNormal.y * 0.5 + 0.5);
    gl_FragColor = vec4(col, 0.9);
  }
`

if (props.preset === 'particles') {
  positions = new Float32Array(props.count * 3)
  for (let i = 0; i < props.count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }
} else if (props.preset === 'galaxy') {
  const count = 6000, arms = 3
  positions = new Float32Array(count * 3)
  colors = new Float32Array(count * 3)
  const innerColor = new THREE.Color('#ff8c00')
  const outerColor = new THREE.Color('#6080ff')
  for (let i = 0; i < count; i++) {
    const t = i / count
    const radius = Math.pow(t, 0.5) * 6
    const angle = (i % arms) * (Math.PI * 2 / arms) + radius * 0.45 + (Math.random() - 0.5) * 1.2 * (1 - t * 0.6)
    positions[i * 3] = Math.cos(angle) * radius
    positions[i * 3 + 1] = (Math.random() - 0.5) * 0.5 * (1 - t * 0.7)
    positions[i * 3 + 2] = Math.sin(angle) * radius
    const col = innerColor.clone().lerp(outerColor, t)
    colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b
  }
} else if (props.preset === 'morph') {
  const morph = (base: THREE.BufferGeometry, fn: (v: THREE.Vector3) => void): Float32Array => {
    const src = base.attributes.position as THREE.BufferAttribute
    const out = new Float32Array(src.array.length)
    const v = new THREE.Vector3()
    for (let i = 0; i < src.count; i++) { v.fromBufferAttribute(src, i); fn(v); out[i * 3] = v.x; out[i * 3 + 1] = v.y; out[i * 3 + 2] = v.z }
    return out
  }
  baseGeo = new THREE.SphereGeometry(1.5, 48, 24)
  const targetCube = morph(baseGeo, (v) => { const max = Math.max(Math.abs(v.x), Math.abs(v.y), Math.abs(v.z)); if (max > 0) v.multiplyScalar(v.length() / max) })
  const targetStar = morph(baseGeo, (v) => { v.multiplyScalar(1 + Math.sin(v.x * 4) * Math.cos(v.y * 4) * Math.sin(v.z * 4) * 0.45) })
  baseGeo.morphAttributes.position = [new THREE.BufferAttribute(targetCube, 3), new THREE.BufferAttribute(targetStar, 3)]
}

// ── Particle colour resolution (re-resolve on theme toggle) ──────────────────
function resolveColorValue(raw: string): string {
  let v = raw
  if (v.startsWith('var(')) v = v.slice(4, -1).trim()
  if (v.startsWith('--')) {
    const val = getComputedStyle(document.documentElement).getPropertyValue(v).trim()
    if (!val) return raw
    return (val.startsWith('hsl(') || val.startsWith('rgb(') || val.startsWith('color(')) ? val : `hsl(${val})`
  }
  return raw
}
const resolvedColor = ref(props.color)
let themeObserver: MutationObserver | null = null

// ── Ribbon (imperative lines) ────────────────────────────────────────────────
const lineGeos: THREE.BufferGeometry[] = []
const lineMats: THREE.LineBasicMaterial[] = []
let ribbonTime = 0
const ribbonSegments = 120
const ribbonLines = 6
function updateLines() {
  lineGeos.forEach((geo, li) => {
    const pos = geo.attributes.position as THREE.BufferAttribute
    const phase = li * (Math.PI * 2 / ribbonLines)
    for (let s = 0; s < ribbonSegments; s++) {
      const t = s / (ribbonSegments - 1)
      pos.setXYZ(s, (t - 0.5) * 14, Math.sin(t * Math.PI * 3 + ribbonTime + phase) * (1.5 - li * 0.08), Math.cos(t * Math.PI * 2 + ribbonTime * 0.7 + phase) * 2.0)
    }
    pos.needsUpdate = true
    geo.computeBoundingSphere()
  })
}
function buildRibbon(group: THREE.Group) {
  for (let li = 0; li < ribbonLines; li++) {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(ribbonSegments * 3), 3))
    const mat = new THREE.LineBasicMaterial({ color: new THREE.Color().setHSL(li / ribbonLines * 0.4 + 0.55, 0.7, 0.7), transparent: true, opacity: 0.55 + li * 0.04 })
    lineGeos.push(geo); lineMats.push(mat)
    group.add(new THREE.Line(geo, mat))
  }
  updateLines()
}
// Build ribbon lines once the TresGroup ref is available (client-only, post-hydration).
watch(groupRef, (g) => { if (g && props.preset === 'ribbon' && lineGeos.length === 0) buildRibbon(g) })

// ── Mouse parallax (particles) ───────────────────────────────────────────────
const { elementX, elementY, elementWidth, elementHeight } = useMouseInElement(canvasRef)

// ── Single render loop, dispatched by preset ─────────────────────────────────
const raf = useRafFn(({ delta }) => {
  switch (props.preset) {
    case 'particles': {
      const g = groupRef.value; if (!g) return
      g.rotation.y += delta * 0.08
      if (props.mouseTrack && elementWidth.value > 0) {
        const nx = (elementX.value / elementWidth.value - 0.5) * 2
        const ny = (elementY.value / elementHeight.value - 0.5) * 2
        g.rotation.x += (ny * -0.15 - g.rotation.x) * 0.05
        g.rotation.y += (nx * 0.15 - g.rotation.y) * 0.05
      }
      break
    }
    case 'galaxy': { if (groupRef.value) groupRef.value.rotation.y += delta * 0.06; break }
    case 'ribbon': {
      ribbonTime += delta
      if (lineGeos.length) updateLines()
      const g = groupRef.value
      if (g && props.mouseTrack && elementWidth.value > 0) {
        const nx = (elementX.value / elementWidth.value - 0.5) * 2
        const ny = (elementY.value / elementHeight.value - 0.5) * 2
        g.rotation.x += (ny * -0.08 - g.rotation.x) * 0.03
        g.rotation.y += (nx * 0.08 - g.rotation.y) * 0.03
      }
      break
    }
    case 'object': { const m = meshRef.value; if (m) { m.rotation.y += delta * 0.3; m.rotation.x += delta * 0.1 } break }
    case 'abstract': {
      uniforms.uTime.value = clock.getElapsedTime()
      const m = meshRef.value; if (!m) break
      m.rotation.y = uniforms.uTime.value * 0.1
      if (props.mouseTrack && elementWidth.value > 0) {
        const ny = (elementY.value / elementHeight.value - 0.5) * 2
        m.rotation.x += (ny * -0.05 - m.rotation.x) * 0.03
      }
      break
    }
    case 'morph': {
      const m = meshRef.value
      if (!m?.morphTargetInfluences) break
      const c = clock.getElapsedTime()
      m.morphTargetInfluences[0] = Math.max(0, Math.sin(c * 0.4) * 0.5 + 0.5)
      m.morphTargetInfluences[1] = Math.max(0, Math.sin(c * 0.4 - (Math.PI * 2) / 3) * 0.5 + 0.5)
      m.rotation.y += delta * 0.15
      m.rotation.x += delta * 0.05
      if (props.mouseTrack && elementWidth.value > 0) {
        const nx = (elementX.value / elementWidth.value - 0.5) * 2
        const ny = (elementY.value / elementHeight.value - 0.5) * 2
        m.rotation.x += (ny * -0.08 - m.rotation.x) * 0.04
        m.rotation.y += (nx * 0.08 - m.rotation.y) * 0.04
      }
      break
    }
  }
}, { immediate: false })

onMounted(() => {
  webglOK.value = detectWebGL()
  if (props.preset === 'particles' && (props.color.startsWith('var(') || props.color.startsWith('--'))) {
    resolvedColor.value = resolveColorValue(props.color)
    themeObserver = new MutationObserver(() => { resolvedColor.value = resolveColorValue(props.color) })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  }
  if (webglOK.value && !reducedMotion.value) raf.resume()
})

onUnmounted(() => {
  raf.pause()
  themeObserver?.disconnect()
  lineGeos.forEach(g => g.dispose()); lineMats.forEach(m => m.dispose())
  lineGeos.length = 0; lineMats.length = 0
  groupRef.value?.clear()
  baseGeo.dispose()
})
</script>
