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
      <DropdownMenuItem @click="copy(rowData.id)">
        Copy Source ID
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem @click="handleViewUser(rowData.user.id)">View user</DropdownMenuItem>
      <DropdownMenuItem @click="handleViewSource(rowData.id, rowData.document_id)">View source details</DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
<script setup lang="ts">
import { MoreHorizontal } from 'lucide-vue-next';
import { Button } from '@ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@ui/components/dropdown-menu';
import type { Report } from '@/entities';

interface Props {
  rowData: Report;
  onViewUser?: (userId: string) => void;
  onViewSource?: (reportId: string, sourceId: string) => void;
}

const props = defineProps<Props>();

function copy(id: string) {
  navigator.clipboard.writeText(id);
}
function handleViewUser(userId: string) {
  props.onViewUser?.(userId);
}
function handleViewSource(reportId: string, sourceId: string) {
  props.onViewSource?.(reportId, sourceId);
}
</script>
