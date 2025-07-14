<template>
  <ClientOnly>
    <Toaster />
  </ClientOnly>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
<script setup lang="ts">
import { useAuthStore } from "./stores/auth";
import { Toaster } from '@ui/components/toast'

const authStore = useAuthStore();

onMounted(() => {
  authStore.init();
});

useHead({
  link: [
    {
      rel: "stylesheet",
      href: "/output.css",
    },
  ],
  /*meta: [
    {
      name: 'viewport',
      content: 'user-scalable=0'
    },
  ]*/
});
</script>
