<template>
<Gallery :admin="true"/>      
</template>
<script setup lang="ts">

definePageMeta({
  layout: 'admin',
  middleware: ['admin'], 
})
</script>

