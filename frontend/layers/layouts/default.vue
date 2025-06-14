<template>
  <div class="relative">
    <Header/>
    <main>
      <slot/>
    </main>
  </div>
  <Footer/>
</template>
<script setup lang="ts">
import {Header} from "@ui/components/header";
import {Footer} from "@ui/components/footer";
</script>
