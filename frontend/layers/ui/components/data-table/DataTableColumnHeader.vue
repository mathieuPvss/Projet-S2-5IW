<script setup lang="ts" generic="TData, TValue">
import type { Column } from '@tanstack/vue-table';
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ArrowUpDownIcon,
  EyeOff,
} from 'lucide-vue-next';

import { cn } from '@lib/utils';
import { Button } from '@ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@ui/components/dropdown-menu';

interface DataTableColumnHeaderProps {
  column: Column<TData, TValue>;
  title: string;
}

defineProps<DataTableColumnHeaderProps>();
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div v-if="column.getCanSort()" :class="cn('flex items-center space-x-2', $attrs.class ?? '')">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button
          variant="ghost"
          size="sm"
          class="-ml-3 h-8 data-[state=open]:bg-accent"
        >
          <span>{{ title }}</span>
          <ArrowDownIcon v-if="column.getIsSorted() === 'desc'" class="w-4 h-4 ml-2" />
          <ArrowUpIcon v-else-if=" column.getIsSorted() === 'asc'" class="w-4 h-4 ml-2" />
          <ArrowUpDownIcon v-else class="w-4 h-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem @click="column.toggleSorting(false)">
          <ArrowUpIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Asc
        </DropdownMenuItem>
        <DropdownMenuItem @click="column.toggleSorting(true)">
          <ArrowDownIcon class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Desc
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="column.toggleVisibility(false)">
          <EyeOff class="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
          Hide
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <div v-else :class="$attrs.class">
    {{ title }}
  </div>
</template>
