<script setup lang="ts">
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@ui/components/sidebar";
import { ChevronRight, type LucideIcon } from "lucide-vue-next";

defineProps<{
  items: {
    title: string;
    url: string;
    icon: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}>();
</script>

<template>
  <SidebarGroup>
    <SidebarMenu>
      <Collapsible
        v-for="item in items"
        :key="item.title"
        as-child
        :default-open="item.isActive"
      >
        <SidebarMenuItem>
          <SidebarMenuButton as-child :tooltip="item.title">
            <a :href="item.url">
              <component :is="item.icon" />
              <span>{{ item.title }}</span>
            </a>
          </SidebarMenuButton>
          <template v-if="item.items?.length">
            <CollapsibleTrigger as-child>
              <SidebarMenuAction class="data-[state=open]:rotate-90">
                <ChevronRight />
                <span class="sr-only">Toggle</span>
              </SidebarMenuAction>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem
                  v-for="subItem in item.items"
                  :key="subItem.title"
                >
                  <SidebarMenuSubButton as-child>
                    <a :href="subItem.url">
                      <span>{{ subItem.title }}</span>
                    </a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </template>
        </SidebarMenuItem>
      </Collapsible>
    </SidebarMenu>
  </SidebarGroup>
</template>
