<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
  src: string
  alt: string
}>()
</script>

<template>
  <div :class="cn('p-6 pb-0 w-full', props.class)">
    <div class="flex aspect-[3/2] overflow-clip rounded-md">
      <div class="flex-1">
        <figure class="relative h-full w-full origin-bottom transition duration-300 group-hover:scale-105">
          <img v-if="src" :src="src" :alt="alt" class="h-full w-full object-cover object-center" >
          <img v-else src="https://placehold.co/300x150" alt="placeholder" class="h-full w-full object-cover object-center" >
        </figure>
      </div>
    </div>
    <slot />
  </div>
</template>
