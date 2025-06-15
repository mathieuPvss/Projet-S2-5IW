<script setup lang="ts">
import { Button } from '@ui/components/button'
import { Icon } from '@iconify/vue'

const colorMode = useColorMode()

const changeTheme = () => {
  if (colorMode.preference === 'dark') {
    colorMode.preference = 'light'
  } else {
    colorMode.preference = 'dark'
  }
}
</script>

<template>
    <Button variant="ghost" class="w-9" @click="changeTheme">
      <Icon v-if="colorMode.preference === 'dark'" icon="radix-icons:sun" class="h-[1.2rem] w-[1.2rem] rotate-90 transition-all dark:rotate-0 dark:scale-100 text-white" />
      <Icon v-else icon="radix-icons:moon" class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
    </Button>
</template>
