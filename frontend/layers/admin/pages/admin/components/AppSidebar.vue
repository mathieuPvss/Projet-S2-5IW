<script setup lang="ts">
import NavMain from '@/layers/admin/pages/admin/components/NavMain.vue'
import NavSecondary from '@/layers/admin/pages/admin/components/NavSecondary.vue'
import NavUser from '@/layers/admin/pages/admin/components/NavUser.vue'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProps,
} from '@ui/components/sidebar'
import {
  Home,
  SquareTerminal,
} from 'lucide-vue-next'
import SiteIcon from "@/layers/base/components/SiteIcon.vue";

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'inset',
})

const data = {
  navMain: [
    {
      title: 'Projects',
      url: '/admin',
      icon: SquareTerminal,
      isActive: true,
    },
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: SquareTerminal,
      isActive: true,
    }
  ],
  navSecondary: [
    {
      title: 'Home',
      url: '/',
      icon: Home,
    },
  ]
}
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="#">
              <div class="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
                <SiteIcon />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Gogole Inc</span>
                <span class="truncate text-xs">Enterprise</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
      <NavSecondary :items="data.navSecondary" class="mt-auto" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser/>
    </SidebarFooter>
  </Sidebar>
</template>

