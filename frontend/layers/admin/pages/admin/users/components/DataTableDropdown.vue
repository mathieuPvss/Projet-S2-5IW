<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button variant="ghost" class="w-8 h-8 p-0">
        <span class="sr-only">Open menu</span>
        <MoreHorizontal class="w-4 h-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuLabel>Actions</DropdownMenuLabel>
      <DropdownMenuItem @click="copy(userData.id)">
        Copier l'ID
      </DropdownMenuItem>
      <DropdownMenuItem @click="copy(userData.email)">
        Copier l'email
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        @click="handleEditUser"
        :disabled="isAdmin"
        :class="{ 'opacity-50 cursor-not-allowed': isAdmin }"
      >
        Modifier
      </DropdownMenuItem>
      <DropdownMenuItem
        @click="handleDeleteUser"
        :disabled="isAdmin"
        :class="{
          'opacity-50 cursor-not-allowed': isAdmin,
          'text-red-600': !isAdmin,
        }"
      >
        Supprimer
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { MoreHorizontal } from "lucide-vue-next";
import { Button } from "@ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@ui/components/dropdown-menu";
import type { User } from "@/entities";

interface Props {
  userData: User;
  isAdmin: boolean;
  onEditUser?: () => void;
  onDeleteUser?: () => void;
}

const props = defineProps<Props>();

function copy(text: string) {
  navigator.clipboard.writeText(text);
}

function handleEditUser() {
  if (!props.isAdmin) {
    props.onEditUser?.();
  }
}

function handleDeleteUser() {
  if (!props.isAdmin) {
    props.onDeleteUser?.();
  }
}
</script>
