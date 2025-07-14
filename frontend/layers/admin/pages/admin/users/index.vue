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
              Gestion des Utilisateurs
            </h1>
            <p class="text-slate-600 dark:text-slate-300 mt-2">
              Administrez les comptes utilisateurs et leurs permissions
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Statistics Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div class="flex items-center gap-3">
            <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Users class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Total Utilisateurs
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
          <div class="flex items-center gap-3">
            <div class="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <Shield class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Administrateurs
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ data.filter((u) => u.role === "admin").length }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <div class="flex items-center gap-3">
            <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <UserCheck class="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Utilisateurs Standard
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ data.filter((u) => u.role === "user").length }}
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
                <Button variant="outline" @click="openCreateModal" class="h-8">
                  <Icon icon="ic:outline-add" />
                  Ajouter un utilisateur
                </Button>
                <Button
                  v-if="selectedRows.length > 0"
                  variant="destructive"
                  @click="handleBatchDelete"
                  class="h-8"
                  :disabled="selectedRows.some((user) => user.role === 'admin')"
                >
                  <Icon icon="ic:outline-delete" />
                  Supprimer ({{ selectedRows.length }})
                </Button>
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
                  tableRef.table.getColumn('role')?.getFilterValue() as string
                "
                @update:model-value="
                  tableRef.table.getColumn('role')?.setFilterValue($event)
                "
              >
                <SelectTrigger class="w-[280px] h-8">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Icon
                icon="ic:outline-close"
                class="absolute right-8 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted hover:text-foreground"
                @click="tableRef.table.getColumn('role')?.setFilterValue('')"
              />
            </div>
          </template>
        </DataTable>
      </div>
    </div>

    <UserModal
      v-model:is-open="userModalOpen"
      :user="selectedUser"
      @user-saved="handleUserSaved"
    />

    <AlertDialog v-model:open="deleteConfirmOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmation de suppression</AlertDialogTitle>
          <AlertDialogDescription class="leading-relaxed">
            Êtes-vous sûr de vouloir supprimer
            {{
              userToDelete
                ? `l'utilisateur "${userToDelete.email}"`
                : "les utilisateurs sélectionnés"
            }}?<br />
            Cette action ne peut pas être annulée.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction @click="confirmDelete"
            >Supprimer</AlertDialogAction
          >
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { User } from "@/entities";
import { getColumns } from "./components/data";
import { DataTable } from "@ui/components/data-table";
import { Api } from "./components/api";
import { Icon } from "@iconify/vue";
import { Button } from "@ui/components/button";
import { Users, Shield, UserCheck } from "lucide-vue-next";
import UserModal from "./components/UserModal.vue";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ui/components/alert-dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select";
import { toast } from "@ui/components/toast";

definePageMeta({
  layout: "admin",
});

const tableRef = ref();
const loading = ref(false);
const data = ref<User[]>([]);
const selectedRows = ref<User[]>([]);

// User modal state
const userModalOpen = ref(false);
const selectedUser = ref<User | null>(null);

// Delete confirmation state
const deleteConfirmOpen = ref(false);
const userToDelete = ref<User | null>(null);

const columns = getColumns({
  onEditUser: handleEditUser,
  onDeleteUser: handleDeleteUser,
});

async function getData(): Promise<User[]> {
  return await Api.getUsers();
}

async function loadData() {
  loading.value = true;
  data.value = [];
  try {
    data.value = await getData();
  } catch (error) {
    console.error("Error loading data:", error);
    toast({
      title: "Erreur",
      description: "Erreur lors du chargement des utilisateurs",
      variant: "destructive",
    });
  } finally {
    loading.value = false;
  }
}

function handleSelectChange(rowSelection: User[]) {
  selectedRows.value = rowSelection || [];
}

function openCreateModal() {
  selectedUser.value = null;
  userModalOpen.value = true;
}

function handleEditUser(user: User) {
  selectedUser.value = user;
  userModalOpen.value = true;
}

function handleDeleteUser(user: User) {
  userToDelete.value = user;
  deleteConfirmOpen.value = true;
}

function handleBatchDelete() {
  userToDelete.value = null;
  deleteConfirmOpen.value = true;
}

async function confirmDelete() {
  try {
    if (userToDelete.value) {
      // Single user deletion
      await Api.deleteUser(userToDelete.value.id);
      toast({
        title: "Succès",
        description: "Utilisateur supprimé avec succès",
      });
    } else {
      // Batch deletion
      const usersToDelete = selectedRows.value.filter(
        (user) => user.role !== "admin",
      );
      await Promise.all(usersToDelete.map((user) => Api.deleteUser(user.id)));
      toast({
        title: "Succès",
        description: `${usersToDelete.length} utilisateur(s) supprimé(s) avec succès`,
      });
    }

    await loadData();
    selectedRows.value = [];
    tableRef.value?.table.resetRowSelection();
  } catch (error) {
    console.error("Error deleting user(s):", error);
    toast({
      title: "Erreur",
      description: "Erreur lors de la suppression",
      variant: "destructive",
    });
  } finally {
    deleteConfirmOpen.value = false;
    userToDelete.value = null;
  }
}

async function handleUserSaved() {
  await loadData();
  selectedUser.value = null;
}

onMounted(async () => {
  await loadData();
});
</script>
