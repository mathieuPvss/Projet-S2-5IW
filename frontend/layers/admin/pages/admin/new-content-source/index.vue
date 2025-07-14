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
              Gestion des Content Sources
            </h1>
            <p class="text-slate-600 dark:text-slate-300 mt-2">
              Créer, modifier et tester vos configurations de scraping
            </p>
          </div>
          <Button
            @click="openCreateModal"
            class="bg-blue-600 hover:bg-blue-700"
          >
            <Plus class="w-4 h-4 mr-2" />
            Nouvelle source
          </Button>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <!-- Sources existantes -->
      <div
        class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-8"
      >
        <div class="p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            Sources de contenu existantes
          </h2>
        </div>

        <div class="p-6">
          <ContentSourcesList
            @edit="handleEdit"
            @delete="handleDelete"
            @test="handleTest"
            :loading="sourcesLoading"
            :sources="contentSources"
          />
        </div>
      </div>
    </div>

    <!-- Modal de création/édition -->
    <Dialog v-model:open="modalOpen">
      <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {{ editingSource ? "Modifier" : "Créer" }} une source de contenu
          </DialogTitle>
          <DialogDescription>
            Configurez votre scraper avec des sélecteurs CSS personnalisés
          </DialogDescription>
        </DialogHeader>

        <ContentSourceForm
          :source="editingSource"
          @save="handleSave"
          @cancel="closeModal"
          @test="handleTestConfig"
        />
      </DialogContent>
    </Dialog>

    <!-- Modal de test -->
    <Dialog v-model:open="testModalOpen">
      <DialogContent class="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test de configuration</DialogTitle>
          <DialogDescription> Résultats du test de scraping </DialogDescription>
        </DialogHeader>

        <TestResults
          :results="testResults"
          :loading="testLoading"
          :error="testError"
          @close="closeTestModal"
        />
      </DialogContent>
    </Dialog>

    <!-- Modal de confirmation de suppression -->
    <AlertDialog v-model:open="deleteConfirmOpen">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir supprimer "{{ sourceToDelete?.name }}" ?
            Cette action est irréversible.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelDelete">Annuler</AlertDialogCancel>
          <AlertDialogAction
            @click="confirmDelete"
            class="bg-red-600 hover:bg-red-700"
          >
            Supprimer
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Button } from "@ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@ui/components/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@ui/components/alert-dialog";
import { toast } from "@ui/components/toast";
import { Plus } from "lucide-vue-next";
import ContentSourcesList from "./components/ContentSourcesList.vue";
import ContentSourceForm from "./components/ContentSourceForm.vue";
import TestResults from "./components/TestResults.vue";
import { Api } from "./components/api";

interface ContentSource {
  id: string;
  name: string;
  enabled: boolean;
  type: "scraper" | "api";
  config?: any;
}

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

// États
const modalOpen = ref(false);
const testModalOpen = ref(false);
const deleteConfirmOpen = ref(false);
const sourcesLoading = ref(false);
const testLoading = ref(false);

// Données
const contentSources = ref<any[]>([]);
const editingSource = ref<any>(null);
const sourceToDelete = ref<any>(null);
const testResults = ref<any>(null);
const testError = ref<string | null>(null);

// Fonctions
const loadSources = async () => {
  sourcesLoading.value = true;
  try {
    const sources = await Api.getContentSources();
    contentSources.value = sources.filter(
      (source) => source.type === "scraper",
    );
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: "Impossible de charger les sources de contenu.",
      variant: "destructive",
    });
  } finally {
    sourcesLoading.value = false;
  }
};

const openCreateModal = () => {
  editingSource.value = null;
  modalOpen.value = true;
};

const handleEdit = (source: ContentSource) => {
  editingSource.value = source;
  modalOpen.value = true;
};

const handleDelete = (source: ContentSource) => {
  sourceToDelete.value = source;
  deleteConfirmOpen.value = true;
};

const handleTest = async (source: ContentSource) => {
  await testConfiguration(source.config);
};

const handleSave = async (sourceData: any) => {
  try {
    if (editingSource.value) {
      await Api.updateContentSource(editingSource.value.id, sourceData);
      toast({
        title: "Source modifiée",
        description: "La source de contenu a été modifiée avec succès.",
        variant: "default",
      });
    } else {
      await Api.createContentSource(sourceData);
      toast({
        title: "Source créée",
        description: "La source de contenu a été créée avec succès.",
        variant: "default",
      });
    }

    closeModal();
    await loadSources();
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error.message || "Erreur lors de la sauvegarde.",
      variant: "destructive",
    });
  }
};

const handleTestConfig = async (config: any) => {
  await testConfiguration(config);
};

const testConfiguration = async (config: any) => {
  testLoading.value = true;
  testError.value = null;
  testResults.value = null;
  testModalOpen.value = true;

  try {
    const results = await Api.testScrapingConfig(config);
    testResults.value = results;
  } catch (error: any) {
    testError.value = error.message || "Erreur lors du test de configuration.";
  } finally {
    testLoading.value = false;
  }
};

const confirmDelete = async () => {
  if (!sourceToDelete.value) return;

  try {
    await Api.deleteContentSource(sourceToDelete.value.id);
    toast({
      title: "Source supprimée",
      description: "La source de contenu a été supprimée avec succès.",
      variant: "default",
    });

    cancelDelete();
    await loadSources();
  } catch (error: any) {
    toast({
      title: "Erreur",
      description: error.message || "Erreur lors de la suppression.",
      variant: "destructive",
    });
  }
};

const cancelDelete = () => {
  sourceToDelete.value = null;
  deleteConfirmOpen.value = false;
};

const closeModal = () => {
  modalOpen.value = false;
  editingSource.value = null;
};

const closeTestModal = () => {
  testModalOpen.value = false;
  testResults.value = null;
  testError.value = null;
};

// Initialisation
onMounted(async () => {
  await loadSources();
});
</script>
