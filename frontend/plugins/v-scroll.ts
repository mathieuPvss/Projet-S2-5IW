import { useScroll } from '@vueuse/core';
import type { DirectiveBinding } from 'vue'

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive('scroll', {
    mounted(el, binding: DirectiveBinding) {
      const { x, y, arrivedState, isScrolling, directions } = useScroll(el)
      if (typeof binding.value === 'function') {
        watch([x, y], () => {
        binding.value({ x: x.value, y: y.value, arrivedState: arrivedState, isScrolling: isScrolling.value, directions: directions })
        })
      }
    },
  })
})
