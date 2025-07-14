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
              Gestion des Questions API
            </h1>
            <p class="text-slate-600 dark:text-slate-300 mt-2">
              Ajouter des questions pour l'interrogation des API et TikTok
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Formulaire individuel -->
        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Ajouter une question
          </h2>

          <QuestionForm @question-created="handleQuestionCreated" />
        </div>

        <!-- Upload CSV -->
        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
        >
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Importer depuis un CSV
          </h2>

          <CSVUploader @questions-imported="handleQuestionsImported" />
        </div>
      </div>

      <!-- Statistiques -->
      <div
        class="mt-8 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white mb-6">
          Statistiques
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="text-center">
            <div class="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {{ totalQuestions }}
            </div>
            <div class="text-sm text-slate-600 dark:text-slate-400">
              Questions totales
            </div>
          </div>

          <div class="text-center">
            <div class="text-3xl font-bold text-green-600 dark:text-green-400">
              {{ questionsCreatedToday }}
            </div>
            <div class="text-sm text-slate-600 dark:text-slate-400">
              Créées aujourd'hui
            </div>
          </div>

          <div class="text-center">
            <div
              class="text-3xl font-bold text-purple-600 dark:text-purple-400"
            >
              {{ totalUsages }}
            </div>
            <div class="text-sm text-slate-600 dark:text-slate-400">
              Usages créés
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import QuestionForm from "./components/QuestionForm.vue";
import CSVUploader from "./components/CSVUploader.vue";
import { toast } from "@ui/components/toast";
import { Api } from "./components/api";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

// Statistiques
const totalQuestions = ref(0);
const questionsCreatedToday = ref(0);
const totalUsages = ref(0);

// Handlers
const handleQuestionCreated = (result: {
  question: any;
  usagesCreated: number;
}) => {
  totalQuestions.value++;
  questionsCreatedToday.value++;
  totalUsages.value += result.usagesCreated;

  toast({
    title: "Question créée",
    description: `Question ajoutée avec succès. ${result.usagesCreated} usages créés.`,
    variant: "default",
  });
};

const handleQuestionsImported = (result: {
  questionsCreated: number;
  usagesCreated: number;
  errors: string[];
}) => {
  totalQuestions.value += result.questionsCreated;
  questionsCreatedToday.value += result.questionsCreated;
  totalUsages.value += result.usagesCreated;

  if (result.errors.length > 0) {
    toast({
      title: "Import terminé avec erreurs",
      description: `${result.questionsCreated} questions importées, ${result.errors.length} erreurs.`,
      variant: "destructive",
    });
  } else {
    toast({
      title: "Import réussi",
      description: `${result.questionsCreated} questions importées avec succès.`,
      variant: "default",
    });
  }
};

// Chargement des statistiques
const loadStatistics = async () => {
  try {
    const countResponse = await Api.getQuestionsCount();
    totalQuestions.value = countResponse.count;
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
    toast({
      title: "Erreur",
      description: "Impossible de charger les statistiques.",
      variant: "destructive",
    });
  }
};

// Initialisation
onMounted(async () => {
  await loadStatistics();
});
</script>
