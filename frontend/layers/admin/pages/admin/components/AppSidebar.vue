<script setup lang="ts">
import NavMain from "@/layers/admin/pages/admin/components/NavMain.vue";
import NavUser from "@/layers/admin/pages/admin/components/NavUser.vue";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  type SidebarProps,
} from "@ui/components/sidebar";
import { Flag, Home, User, Database, Globe } from "lucide-vue-next";
import SiteIcon from "@/layers/base/components/SiteIcon.vue";

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: "inset",
});

const data = {
  navMain: [
    {
      title: "Accueil",
      url: "/admin",
      icon: Home,
      isActive: true,
    },
    {
      title: "Rapports",
      url: "/admin/reports",
      icon: Flag,
      isActive: true,
    },
    {
      title: "Users",
      url: "/admin/users",
      icon: User,
      isActive: true,
    },
    {
      title: "Source API",
      url: "/admin/source-api",
      icon: Database,
      isActive: true,
    },
    {
      title: "Content Sources",
      url: "/admin/new-content-source",
      icon: Globe,
      isActive: true,
    },
  ],
};
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <a href="/" @click="navigateTo('/')">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground"
              >
                <SiteIcon />
              </div>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">Query Forge Dev</span>
                <span class="truncate text-xs">Enterprise</span>
              </div>
            </a>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <NavMain :items="data.navMain" />
    </SidebarContent>
    <SidebarFooter>
      <NavUser />
    </SidebarFooter>
  </Sidebar>
</template>
