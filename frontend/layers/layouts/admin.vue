<template>
  <SidebarProvider>
    <AppSidebar />
    <SidebarInset>
      <header class="flex h-16 shrink-0 items-center gap-2 w-full">
        <div class="flex items-center gap-2 px-4">
          <SidebarTrigger class="-ml-1" />
        </div>
      </header>
      <div class="flex flex-1 flex-col gap-4 p-4 pt-0 w-full">
        <slot />
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
<script setup lang="ts">
import AppSidebar from "@/layers/admin/pages/admin/components/AppSidebar.vue";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@ui/components/sidebar";
</script>
