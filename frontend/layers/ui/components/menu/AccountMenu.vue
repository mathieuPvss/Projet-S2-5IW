<template>
  <NavigationMenu>
    <NavigationMenuItem v-if="user">
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost">
            <User />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56 animate-fade-left">
          <DropdownMenuGroup>
            <DropdownMenuItem @click="navigateTo('/profile')">
              <User class="mr-2 h-4 w-4" />
              <span>Profile</span>
              <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Button
              class="w-full flex gap-2 items-center"
              variant="destructive"
              @click="auth.logout()"
            >
              <LogOut class="mr-2 h-4 w-4" />
              <span>Log out</span>
              <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </NavigationMenuItem>
    <NavigationMenuItem v-else>
      <NuxtLink v-slot="{ href, navigate }" to="/authentication" custom>
        <NavigationMenuLink
          :href
          :class="cn(navigationMenuTriggerStyle(), 'bg-transparent')"
          @click="navigate"
        >
          <LogIn class="h-4 w-4" alt="S'identifier" />
        </NavigationMenuLink>
      </NuxtLink>
    </NavigationMenuItem>
    <NavigationMenuItem>
      <DarkMode />
    </NavigationMenuItem>
  </NavigationMenu>
</template>
<script lang="ts" setup>
import { Button } from "@ui/components/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  navigationMenuTriggerStyle,
} from "@ui/components/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuGroup,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
} from "@ui/components/dropdown-menu";
import { LogIn, LogOut, User } from "lucide-vue-next";
import { DarkMode } from "@ui/components/dark-mode";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@lib/utils";

const auth = useAuthStore();
const user = computed(() => (auth.user ? auth.user : null));
</script>
