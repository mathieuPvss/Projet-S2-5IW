<template>
  <div class="container py-10 mx-auto">
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
