<template>
  <div class="fixed top-0 left-0 z-50 flex h-screen w-full flex-col items-start justify-start gap-4 bg-background">
    <Matrix :animation-speed="0" :dot-size="1" :total-size="2" :colors="[[0, 150, 125]]">
      <nav class="relative w-full h-full">
        <header class="relative flex flex-col justify-center items-start gap-4 w-full mb-6">
          <MobileMenuHeader/>
          <div class="h-min absolute top-4 right-4 ">
            <Button variant="ghost" @click="handleToggleMenu" aria-label="Toggle menu" class="p-4 [&_svg]:size-12 h-full">
              <Icon icon="ic:round-close" class=""/>
            </Button>
          </div>
        </header>
        <ul class="w-full flex flex-col justify-center items-start gap-8 p-6">
          <template v-for="menuItem in menuItems" :key="menuItem.title">
            <template v-if="menuItem.hasOwnProperty('children')">
              <li v-if="hasPermission(menuItem)" class="w-full">
                <Collapsible>
                  <div class="flex items-center first-level-menu-item w-full">
                    <CollapsibleTrigger class="flex items-center justify-start gap-2 w-full px-4 py-2 hover:bg-background/40 rounded-md">
                      <Icon v-if="menuItem.icon" :icon="menuItem.icon" />
                      {{ menuItem.title }}
                      <Icon icon="ic:round-keyboard-arrow-down"/>
                    </CollapsibleTrigger>
                  </div>
                  <ul
                    class="flex flex-col gap-2 pl-4"
                  >
                    <template v-for="childItem in menuItem.children" :key="childItem.title">
                      <CollapsibleContent v-if="hasPermission(childItem)">
                        <li class="w-full">
                          <a
                            :href="childItem.href"
                            class="block w-full select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-background/40 hover:text-accent-foreground focus:bg-background/40 focus:text-accent-foreground"
                          >
                            <div class="text-sm font-medium leading-none">
                              <Icon
                                v-if="!!childItem.icon"
                                :icon="childItem.icon"
                                class="inline-block"
                              />
                              {{ childItem.title }}
                            </div>
                            <p
                              class="line-clamp-2 text-sm leading-snug text-muted-foreground"
                            >
                              {{ childItem.description }}
                            </p>
                          </a>
                        </li>
                      </CollapsibleContent>
                    </template>
                  </ul>
                </Collapsible>
              </li>
            </template>
            <template v-else>
              <li v-if="hasPermission(menuItem)" class="w-full">
                <a
                  class="flex items-center justify-start px-4 py-2 rounded-md hover:bg-background/40 bg-transparent first-level-menu-item w-full"
                  :href="menuItem.href"
                >
                  <Icon v-if="menuItem.icon" :icon="menuItem.icon" />&nbsp;
                  {{ menuItem.title }}
                </a>
              </li>
            </template>
          </template>
        </ul>
        <MobileMenuFooter/>
      </nav>
    </Matrix>

  </div>



</template>
<script lang="ts" setup>

import {menuItems} from "@ui/components/menu/data";
import { Icon } from "@iconify/vue";
import { useAuthStore } from "@/stores/auth";
import type { MenuItem } from "@/types/MenuItem";
import { MenuPermissionsEnum } from "@/enums";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@ui/components/collapsible";
import { MobileMenuHeader, MobileMenuFooter } from "@ui/components/menu";
import { Matrix } from "@ui/components/matrix";

const auth = useAuthStore();
const user = computed(() => auth.user ? auth.user : null);
const emit = defineEmits(['toggle']);

function hasPermission(menuItem: MenuItem) {
  if(!menuItem.permission || menuItem.permission === MenuPermissionsEnum.ALL)
    return true;
  if(!user.value)
    return false;
  if(menuItem.permission === MenuPermissionsEnum.ADMIN)
    return user.value.isAdmin;
}

function handleToggleMenu() {
  emit('toggle')
}
</script>
<style scoped>
.first-level-menu-item {
  @apply text-xl font-semibold
}
</style>
