<template>
  <div class="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
    <p>© 2025 Query Forge Dev. Tous droits réservés.</p>
    <div class="flex items-center gap-4">
      <NuxtLink to="/privacy" class="flex items-center gap-1 hover:underline">
        <ShieldCheck class="w-4 h-4" />
        Politique de confidentialité
      </NuxtLink>
      <NuxtLink to="/terms" class="flex items-center gap-1 hover:underline">
        <FileText class="w-4 h-4" />
        Conditions d’utilisation
      </NuxtLink>
    </div>
  </div>
</template>
<script setup lang="ts">
import {FileText, ShieldCheck} from "lucide-vue-next";
</script>
