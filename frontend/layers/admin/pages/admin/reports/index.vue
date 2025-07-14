<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
  >
    <!-- Header -->
    <div
      class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 mb-8"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
              Gestion des Signalements
            </h1>
            <p class="text-slate-600 dark:text-slate-300 mt-2">
              Administrez et modérez les signalements de contenu
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div class="flex items-center gap-3 h-full w-full">
            <div class="bg-orange-100 dark:bg-orange-900 p-3 rounded-full">
              <FileText class="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div class="flex flex-col justify-center items-start h-full w-full">
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Total Signalements
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ data.length }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div class="flex items-center gap-3 h-full w-full">
            <div class="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-full">
              <Clock class="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div class="flex flex-col justify-center items-start h-full w-full">
              <p class="text-sm text-slate-600 dark:text-slate-400">
                En Attente
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ data.filter((r) => r.status === "pending").length }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div class="flex items-center gap-3 h-full w-full">
            <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <CheckCircle class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div class="flex flex-col justify-center items-start h-full w-full">
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Approuvés
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ data.filter((r) => r.status === "approved").length }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div class="flex items-center gap-3 h-full w-full">
            <div class="bg-red-100 dark:bg-red-900 p-3 rounded-full">
              <XCircle class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div class="flex flex-col justify-center items-start h-full w-full">
              <p class="text-sm text-slate-600 dark:text-slate-400">Rejetés</p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ data.filter((r) => r.status === "rejected").length }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Data Table Container -->
      <div
        class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <DataTable
          :columns="columns"
          :data="data"
          ref="tableRef"
          :loading="loading"
          @update:row-selection="handleSelectChange"
        >
          <template #header>
            <nav class="flex items-center justify-between w-full">
              <div class="flex items-center justify-start gap-4">
                <Select
                  v-if="selectedRows.length > 0"
                  class="h-8"
                  @update:model-value="handleSelectEditStatus"
                  v-model:model-value="editStatus"
                >
                  <SelectTrigger class="w-[280px]">
                    <SelectValue placeholder="Changer le status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem
                        v-for="status in ReportStatus"
                        :key="status"
                        :value="status"
                      >
                        {{ status }}
                      </SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline" @click="loadData" class="h-8">
                <Icon icon="ic:outline-refresh" />
              </Button>
            </nav>
          </template>
          <template #search>
            <div class="flex items-center relative" v-if="tableRef">
              <Select
                :model-value="
                  tableRef.table.getColumn('status')?.getFilterValue() as string
                "
                @update:model-value="
                  tableRef.table.getColumn('status')?.setFilterValue($event)
                "
              >
                <SelectTrigger class="w-[280px] h-8">
                  <SelectValue placeholder="Filter par status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem
                      v-for="status in ReportStatus"
                      :key="status"
                      :value="status"
                    >
                      {{ status }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>

                <Icon
                  icon="ic:outline-close"
                  class="absolute right-8 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted hover:text-foreground"
                  @click="
                    tableRef.table.getColumn('status')?.setFilterValue('')
                  "
                />
              </Select>
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <UserModal :user-id="selectedUserId" v-model:is-open="userModalOpen" />

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
            Êtes-vous sûr de vouloir changer le status du ou des
            signalements?<br />
            Cette action ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction @click="handleBatchEditStatus"
            >Continuer</AlertDialogAction
          >
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Report } from "@/entities";
import { getColumns } from "./components/data";
import { DataTable } from "@ui/components/data-table";
import { Api } from "./components/api";
import { Icon } from "@iconify/vue";
import { Button } from "@ui/components/button";
import { FileText, Clock, CheckCircle, XCircle } from "lucide-vue-next";
import { ReportStatus } from "@/enums";
import UserModal from "./components/User.modal.vue";
import SourceModal from "./components/Source.modal.vue";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel
} from "@ui/components/alert-dialog";
import type { CreateReportDto, UpdateReportsStatusDto } from "@/dto";
import { toast } from "@ui/components/toast";

definePageMeta({
  layout: "admin",
});

const tableRef = ref();
const loading = ref(false);
const data = ref<Report[]>([]);
const selectedRows = ref<Report[]>([]);
const editStatus = ref<ReportStatus | null>(null);
const reportId = ref<string>("");

// User modal state
const selectedUserId = ref<string>("");
const userModalOpen = ref(false);

// Source modal state
const selectedSourceId = ref<string>("");
const sourceModalOpen = ref(false);

const confirmOpen = ref(false);

const columns = getColumns({
  onViewSource: handleViewSource,
  onViewUser: handleViewUser,
});

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
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
    reportId.value = "";
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
  if (!rowSelection || rowSelection.length === 0) {
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
async function handleEditStatus({
  id,
  status,
}: {
  id: string;
  status: ReportStatus;
}) {
  sourceModalOpen.value = false;
  confirmOpen.value = true;
  reportId.value = id;
  tableRef.value.table.resetRowSelection();
  selectedRows.value = [];
  editStatus.value = status;
}

async function handleBatchEditStatus() {
  if (
    !editStatus.value ||
    (selectedRows.value.length === 0 && reportId.value === "")
  ) {
    toast({
      title: "Aucune action effectuée",
      description: `Veuillez sélectionner au moins un signalement ou une source.`,
      variant: "destructive",
    });
    return;
  }
  const report_ids =
    reportId.value === ""
      ? selectedRows.value.map((row) => row.id)
      : [reportId.value];
  const params: UpdateReportsStatusDto = {
    status: editStatus.value,
    report_ids,
  };
  await Api.updateReportsStatus(params)
    .then(async () => {
      toast({
        title: "Mis à jour réussie",
        description: `Le status des signalements sélectionnés a été mis à jour avec succès.`,
        variant: "default",
      });
    })
    .catch((error) => {
      console.error("Error updating reports status:", error);
    })
    .finally(async () => {
      confirmOpen.value = false;
      await loadData();
      selectedRows.value = [];
      editStatus.value = null;
      tableRef.value.table.resetRowSelection();
      selectedSourceId.value = "";
    });
}

onMounted(async () => {
  await loadData();
});
</script>
