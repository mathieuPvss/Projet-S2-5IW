<template>
  <div v-if="user" class="flex flex-col justify-center items-center gap-4 p-2 w-full">
    <Avatar size="lg" class="mt-8 bg-background">
      <AvatarFallback class="rounded-lg">
        {{ user.firstname.charAt(0).toUpperCase() + user.firstname.charAt(1).toUpperCase() }}
      </AvatarFallback>
    </Avatar>
    <div class="grid flex-1 text-center text-sm leading-tight">
      <span class="truncate font-semibold text-2xl">{{ user.firstname }}</span>
      <span class="truncate text-xs">{{ user.email }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import {Avatar, AvatarFallback} from "@ui/components/avatar/index";
import {useAuthStore} from "@/stores/auth";

const auth = useAuthStore();
const user = computed(() => auth.user ? auth.user : null);
</script>
