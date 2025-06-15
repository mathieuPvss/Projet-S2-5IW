<template>
  <div ref="container" class="relative w-full h-full">
    <canvas ref="canvas" class="absolute inset-0 w-full h-full"></canvas>
    <div v-if="props.showGradient" class="absolute inset-0 bg-gradient-to-t dark:from-gray-950 to-[84%] from-gray-400"></div>
    <slot/>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
import * as THREE from 'three';
const props = defineProps({
  animationSpeed: {
    type: Number,
    default: 0.4,
  },
  showGradient: {
    type: Boolean,
    default: true,
  },
  dotSize: {
    type: Number,
    default: 3,
  },
  totalSize: {
    type: Number,
    default: 4,
  },
  colors: {
    type: Array,
    default: () => [[0, 255, 255]],
  },
});

const container = ref<Ref<HTMLDivElement| null>>(null);
const canvas = ref(null);
const opacities = [0.3, 0.3, 0.3, 0.5, 0.5, 0.5, 0.8, 0.8, 0.8, 1];

let renderer, camera, scene, material, mesh;
let animationId;

onMounted(() => {
  const width = container.value.clientWidth;
  const height = container.value.clientHeight;

  // Setup Three.js
  renderer = new THREE.WebGLRenderer({ canvas: canvas.value, alpha: true });
  renderer.setSize(width, height);
  camera = new THREE.Camera();
  scene = new THREE.Scene();

  // Uniforms
  const uniforms = {
    u_time: { value: 0 },
    u_opacities: { value: opacities },
    u_total_size: { value: props.totalSize },
    u_dot_size: { value: props.dotSize },
    u_resolution: { value: new THREE.Vector2(width * 2, height * 2) },
    u_colors: {
      value: Array(6).fill(props.colors[0].map(c => c / 255)).map(c => new THREE.Vector3(...c)),
    },
  };
  const shaderWithAnimation = `
      precision mediump float;
      uniform float u_time;
      uniform float u_opacities[10];
      uniform vec3 u_colors[6];
      uniform float u_total_size;
      uniform float u_dot_size;
      uniform vec2 u_resolution;
      float PHI = 1.61803398874989484820459;
      float random(vec2 xy) {
          return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
      }
      void main() {
        vec2 st = (gl_FragCoord.xy);
        st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
        st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));
        float opacity = step(0.0, st.x) * step(0.0, st.y);
        vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
        float show_offset = random(st2);
        float rand = random(st2 * floor((u_time / 5.0) + show_offset + 5.0) + 1.0);
        opacity *= u_opacities[int(rand * 10.0)];
        opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
        opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
        float animation_speed_factor = ${props.animationSpeed.toFixed(1)};
        float intro_offset = distance(u_resolution / 2.0 / u_total_size, st2) * 0.01 + (random(st2) * 0.15);
        opacity *= step(intro_offset, u_time * animation_speed_factor);
        opacity *= clamp((1.0 - step(intro_offset + 0.1, u_time * animation_speed_factor)) * 1.25, 1.0, 1.25);
        vec3 color = u_colors[int(show_offset * 6.0)];
        gl_FragColor = vec4(color * opacity, opacity);
      }
    `;
  const shaderWithoutAnimation = `
      precision mediump float;
      uniform float u_time;
      uniform float u_opacities[10];
      uniform vec3 u_colors[6];
      uniform float u_total_size;
      uniform float u_dot_size;
      uniform vec2 u_resolution;
      float PHI = 1.61803398874989484820459;
      float random(vec2 xy) {
          return fract(tan(distance(xy * PHI, xy) * 0.5) * xy.x);
      }
      void main() {
        vec2 st = (gl_FragCoord.xy);
        st.x -= abs(floor((mod(u_resolution.x, u_total_size) - u_dot_size) * 0.5));
        st.y -= abs(floor((mod(u_resolution.y, u_total_size) - u_dot_size) * 0.5));
        float opacity = step(0.0, st.x) * step(0.0, st.y);
        vec2 st2 = vec2(int(st.x / u_total_size), int(st.y / u_total_size));
        float show_offset = random(st2);
        float rand = random(st2 * floor((u_time / 5.0) + show_offset + 5.0) + 1.0);
        opacity *= u_opacities[int(rand * 10.0)];
        opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.x / u_total_size));
        opacity *= 1.0 - step(u_dot_size / u_total_size, fract(st.y / u_total_size));
        float animation_speed_factor = ${props.animationSpeed.toFixed(1)};
        vec3 color = u_colors[int(show_offset * 6.0)];
        gl_FragColor = vec4(color * opacity, opacity);
      }
    `

  // Shader Material
  material = new THREE.ShaderMaterial({
    uniforms,
    vertexShader: `
      void main() {
        gl_Position = vec4(position, 1.0);
      }
    `,
    fragmentShader: props.animationSpeed > 0 ? shaderWithAnimation : shaderWithoutAnimation,
    transparent: true,
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  let start = performance.now();
  const animate = () => {
    const now = performance.now();
    material.uniforms.u_time.value = (now - start) / 1000;
    renderer.render(scene, camera);
    animationId = requestAnimationFrame(animate);
  };
  animate();
});

onBeforeUnmount(() => {
  cancelAnimationFrame(animationId);
  renderer.dispose();
});
</script>

<style scoped>
canvas {
  display: block;
}
</style>
