<template>
  <svg xmlns="http://www.w3.org/2000/svg" :width="props.width" :height="props.height" viewBox="0 0 136 76" fill="none" class="stroke-black dark:stroke-white" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
    <rect x="4" y="4" width="130" height="70" rx="12" ry="12" fill="none" class="stroke-black dark:stroke-white"></rect>
    <polyline points="40,50 30,40 40,30"></polyline>
    <polyline points="100,30 110,40 100,50"></polyline>
    <circle cx="66" cy="36" r="8"></circle>
    <line x1="62" y1="45" x2="60" y2="50"></line>
    <line x1="92" y1="30" x2="88" y2="50"></line>
  </svg>
</template>
<script setup lang="ts">
const props = defineProps({
  width: {
    type: String,
    default: '130',
  },
  height: {
    type: String,
    default: '70',
  },
  color: {
    type: String,
    default: 'black',
  },
})
</script>
