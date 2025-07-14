<template>
  <footer class="absolute bottom-0 left-0 w-full border-t border-border p-4 flex justify-center items-center gap-2">
    <DarkMode />
    <Button v-if="auth.user" variant="outline" @click="auth.logout()">
      <LogOut class="h-4 w-4" />
    </Button>
  </footer>
</template>
<script setup lang="ts">
import { LogOut } from "lucide-vue-next";
import { Button } from "@ui/components/button";
import { useAuthStore } from "@/stores/auth";
import { DarkMode } from "@ui/components/dark-mode";
const auth = useAuthStore();
</script>
