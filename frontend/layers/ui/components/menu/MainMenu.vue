<template>
  <NavigationMenu>
    <NavigationMenuList>
      <template v-for="menuItem in menuItems" :key="menuItem.title">
        <template v-if="menuItem.hasOwnProperty('children')">
          <NavigationMenuItem v-if="hasPermission(menuItem)">
            <NavigationMenuTrigger class="bg-transparent">
              <Icon v-if="menuItem.icon" :icon="menuItem.icon" />&nbsp;
              {{ menuItem.title }}
            </NavigationMenuTrigger>
            <NavigationMenuContent class="animate-fade-left">
              <ul
                class="grid w-[300px] gap-3 p-4 md:w-[400px] md:grid-cols-2 lg:w-[500px] xl:w-[600px] xl:grid-cols-3 "
              >
                <li v-for="childItem in menuItem.children" :key="childItem.title">
                  <NavigationMenuLink v-if="hasPermission(childItem)" as-child>
                    <a
                      :href="childItem.href"
                      class="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
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
                  </NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </template>
        <template v-else>
          <NavigationMenuItem v-if="hasPermission(menuItem)">
            <NavigationMenuLink
              :class="navigationMenuTriggerStyle() + ' bg-transparent'"
              :href="menuItem.href"
            >
              <Icon v-if="menuItem.icon" :icon="menuItem.icon" />&nbsp;
              {{ menuItem.title }}
            </NavigationMenuLink>
          </NavigationMenuItem>
        </template>
      </template>
    </NavigationMenuList>
  </NavigationMenu>
  <AccountMenu/>
</template>
<script lang="ts" setup>
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@ui/components/navigation-menu";
import { Icon } from "@iconify/vue";
import { menuItems } from "@ui/components/menu/data";
import { useAuthStore} from "@/stores/auth";
import { MenuPermissions} from "@/enum/MenuPermissions";
import type {MenuItem} from "@/types/MenuItem";
import { AccountMenu } from "@ui/components/menu/index";

const auth = useAuthStore();
const user = computed(() => auth.user ? auth.user : null);

function hasPermission(menuItem: MenuItem) {
  if(!menuItem.permission || menuItem.permission === MenuPermissions.ALL)
    return true;
  if(!user.value)
    return false;
  if(menuItem.permission === MenuPermissions.ADMIN)
    return user.value.isAdmin;
}

</script>
