<template>
  <div class="container py-10 mx-auto">
    <DataTable :columns="columns" :data="data" ref="tableRef" :loading="loading" @update:row-selection="handleSelectChange">
      <template #header>
        <nav class="flex items-center justify-between w-full">
          <div class="flex items-center justify-start gap-4">
            <Select v-if="selectedRows.length > 0" class="h-8" @update:model-value="handleSelectEditStatus" v-model:model-value="editStatus">
              <SelectTrigger class="w-[280px]">
                <SelectValue placeholder="Changer le status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem v-for="status in ReportStatus" :key="status" :value="status">
                    {{ status }}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" @click="loadData" class="h-8">
            <Icon icon="ic:outline-refresh"/>
          </Button>
        </nav>
      </template>
      <template #search>
        <div class="flex items-center relative" v-if="tableRef">
          <Select :model-value="tableRef.table.getColumn('status')?.getFilterValue() as string"
                  @update:model-value="tableRef.table.getColumn('status')?.setFilterValue($event)">
            <SelectTrigger class="w-[280px] h-8">
              <SelectValue placeholder="Filter par status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem v-for="status in ReportStatus" :key="status" :value="status">
                  {{ status }}
                </SelectItem>
              </SelectGroup>
            </SelectContent>

            <Icon icon="ic:outline-close"
                  class="absolute right-8 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted hover:text-foreground"
                  @click="tableRef.table.getColumn('status')?.setFilterValue('')"/>
          </Select>
        </div>
      </template>
    </DataTable>

    <UserModal
      :user-id="selectedUserId"
      v-model:is-open="userModalOpen"
    />

    <SourceModal
      :source-id="selectedSourceId"
      :id="reportId"
      v-model:is-open="sourceModalOpen"
      @treat-report="handleEditStatus"
    />

    <AlertDialog v-model:open="confirmOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmation</AlertDialogTitle>
          <AlertDialogDescription class="leading-relaxed">
            Êtes-vous sûr de vouloir changer le status du ou des signalements?<br/>
            Cette action ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction @click="handleBatchEditStatus">Continuer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

  </div>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import type {Report} from '@/entities';
import { getColumns } from './components/data';
import { DataTable } from '@ui/components/data-table';
import { Api } from './components/api';
import { Icon } from '@iconify/vue';
import { Button } from "@ui/components/button";
import { ReportStatus } from "@/enums";
import UserModal from './components/User.modal.vue';
import SourceModal from './components/Source.modal.vue';
import {AlertDialog} from "@ui/components/alert-dialog";
import type {CreateReportDto, UpdateReportsStatusDto} from "@/dto";
import { toast } from "@ui/components/toast";

definePageMeta(
  {
    layout: 'admin',
  }
);

const tableRef = ref();
const loading = ref(false);
const data = ref<Report[]>([]);
const selectedRows = ref<Report[]>([]);
const editStatus = ref<ReportStatus | null>(null);
const reportId = ref<string>('');

// User modal state
const selectedUserId = ref<string>('');
const userModalOpen = ref(false);

// Source modal state
const selectedSourceId = ref<string>('');
const sourceModalOpen = ref(false);

const confirmOpen = ref(false);

const columns = getColumns(
  {
    onViewSource: handleViewSource,
    onViewUser: handleViewUser,
  },
);

async function getData(): Promise<Report[]> {
  return await Api.getReports();
}

async function loadData() {
  loading.value = true;
  data.value = [];
  editStatus.value = null;
  try {
    data.value = await getData();
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    loading.value = false;
    reportId.value = '';
  }
}

function handleViewSource(id: string, sourceId: string) {
  reportId.value = id;
  selectedSourceId.value = sourceId;
  sourceModalOpen.value = true;
}
function handleViewUser(userId: string) {
  selectedUserId.value = userId;
  userModalOpen.value = true;
}
function handleSelectChange(rowSelection: Report[]) {
  if( !rowSelection || rowSelection.length === 0) {
    selectedRows.value = [];
    editStatus.value = null;
    return;
  }
  selectedRows.value = rowSelection;
}
function handleSelectEditStatus(status: ReportStatus) {
  editStatus.value = status;
  confirmOpen.value = true;
}
async function handleEditStatus({id, status} : {id: string, status: ReportStatus}) {
  sourceModalOpen.value = false;
  confirmOpen.value = true;
  reportId.value = id;
  tableRef.value.table.resetRowSelection();
  selectedRows.value = [];
  editStatus.value = status;
}

async function handleBatchEditStatus() {
  if (!editStatus.value || (selectedRows.value.length === 0 && reportId.value === '')) {
    toast({
      title: 'Aucune action effectuée',
      description: `Veuillez sélectionner au moins un signalement ou une source.`,
      variant: 'destructive',
    });
    return;
  }
  const report_ids = reportId.value === ''
    ? selectedRows.value.map(row => row.id)
    : [reportId.value];
  const params: UpdateReportsStatusDto = {
    status: editStatus.value,
    report_ids,
  }
  await Api.updateReportsStatus(params).then( async () => {
    toast({
      title: 'Mis à jour réussie',
      description: `Le status des signalements sélectionnés a été mis à jour avec succès.`,
      variant: 'default',
    });
  }).catch((error) => {
    console.error('Error updating reports status:', error);
  }).finally(async () => {
    confirmOpen.value = false;
    await loadData();
    selectedRows.value = [];
    editStatus.value = null;
    tableRef.value.table.resetRowSelection();
    selectedSourceId.value = '';
  });
}

onMounted(async () => {
  await loadData();
});
</script>
