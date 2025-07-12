<template>
  <div class="relative">
    <Header/>
    <main>
      <slot/>
      <CookieConsent />
    </main>
  </div>
  <Footer/>
</template>
<script setup lang="ts">
import {Header} from "@ui/components/header";
import {Footer} from "@ui/components/footer";
import {CookieConsent} from "@ui/components/cookies";
</script>
