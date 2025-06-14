<script setup lang="ts">
import { cn } from '@lib/utils'
import { TabsList, type TabsListProps } from 'reka-ui'
import { computed, type HTMLAttributes } from 'vue'

const props = defineProps<TabsListProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props

  return delegated
})
</script>

<template>
  <Transition name="fade" mode="out-in">
  <TabsList
    v-bind="delegatedProps"
    :class="cn(
      'inline-flex items-center justify-center rounded bg-muted p-1 text-muted-foreground border border-border',
      props.class,
    )"
  >
    <slot />
  </TabsList>
  </Transition>
</template>
<style>

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
