<script setup lang="ts">
import { cn } from '@lib/utils'
import { TabsTrigger, type TabsTriggerProps, useForwardProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<TabsTriggerProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <TabsTrigger
    v-bind="forwardedProps"
    :class="cn(
      'tabs-trigger inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ' +
       'ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ' +
       'data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm',
      props.class,
    )"
  >
<!--    <span class="truncate">-->
      <slot />
<!--    </span>-->
  </TabsTrigger>
</template>
<style>
.tabs-trigger {
  &:hover * {
    @apply scale-110 transition duration-300 ease-in-out;
  }
  &:hover svg {
    @apply scale-125 rotate-12;
  }
}
</style>
