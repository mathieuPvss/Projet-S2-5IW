<template>
  <div
    class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800"
  >
    <!-- Header de bienvenue -->
    <div
      class="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700 mb-8"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
              Tableau de bord Admin
            </h1>
            <p class="text-slate-600 dark:text-slate-300 mt-2">
              Bienvenue dans l'interface d'administration
            </p>
          </div>
          <div class="flex items-center space-x-4">
            <div
              class="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium"
            >
              En ligne
            </div>
            <div class="text-sm text-slate-600 dark:text-slate-400">
              {{
                new Date().toLocaleDateString("fr-FR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Statistiques rapides -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- Carte statistique 1 -->
        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Utilisateurs
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ usersCount }}
              </p>
            </div>
            <div class="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
              <Users class="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div class="mt-4 flex items-center">
            <span class="text-green-600 dark:text-green-400 text-sm font-medium"
              >+12%</span
            >
            <span class="text-slate-600 dark:text-slate-400 text-sm ml-2"
              >ce mois</span
            >
          </div>
        </div>

        <!-- Carte statistique 2 -->
        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Questions source API
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ questionsCount }}
              </p>
            </div>
            <div class="bg-green-100 dark:bg-green-900 p-3 rounded-full">
              <MessageCircle
                class="w-6 h-6 text-green-600 dark:text-green-400"
              />
            </div>
          </div>
          <div class="mt-4 flex items-center">
            <span class="text-blue-600 dark:text-blue-400 text-sm font-medium"
              >Total</span
            >
            <span class="text-slate-600 dark:text-slate-400 text-sm ml-2"
              >en base</span
            >
          </div>
        </div>

        <!-- Carte statistique 3 -->
        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Sources de contenu
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ contentSourcesStats.total }}
              </p>
            </div>
            <div class="bg-purple-100 dark:bg-purple-900 p-3 rounded-full">
              <FileText class="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div class="mt-4 flex items-center">
            <span class="text-blue-600 dark:text-blue-400 text-sm font-medium"
              >{{ contentSourcesStats.api }} API</span
            >
            <span class="text-slate-600 dark:text-slate-400 text-sm mx-2"
              >•</span
            >
            <span class="text-green-600 dark:text-green-400 text-sm font-medium"
              >{{ contentSourcesStats.scraper }} Scraper</span
            >
          </div>
        </div>

        <!-- Carte statistique 4 -->
        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
        >
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-slate-600 dark:text-slate-400">
                Sources actives
              </p>
              <p class="text-2xl font-bold text-slate-900 dark:text-white">
                {{ contentSourcesStats.enabled }}
              </p>
            </div>
            <div class="bg-red-100 dark:bg-red-900 p-3 rounded-full">
              <Heart class="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div class="mt-4 flex items-center">
            <span class="text-slate-600 dark:text-slate-400 text-sm font-medium"
              >{{ contentSourcesStats.disabled }} inactives</span
            >
            <span class="text-slate-600 dark:text-slate-400 text-sm ml-2"
              >sources</span
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Section principale avec la galerie -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div
        class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            Gestion des contenus
          </h2>
          <div class="flex items-center space-x-3">
            <button
              class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Nouveau contenu
            </button>
            <button
              class="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors text-sm font-medium"
            >
              Filtrer
            </button>
          </div>
        </div>

        <!-- Composant Gallery -->
        <div class="min-h-[400px] bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
          <Gallery :admin="true" />
        </div>
      </div>
    </div>

    <!-- Section d'actions rapides -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pb-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="navigateToUsers"
        >
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Gestion des utilisateurs
          </h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Gérer les comptes utilisateurs et leurs permissions
          </p>
          <div class="text-blue-600 dark:text-blue-400 text-sm font-medium">
            Accéder →
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
        >
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Gestion des rapports des utilisateurs
          </h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Consulter et gérer les rapports soumis par les utilisateurs
          </p>
          <div class="text-blue-600 dark:text-blue-400 text-sm font-medium">
            Accéder →
          </div>
        </div>

        <div
          class="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow cursor-pointer"
          @click="navigateToSourceApi"
        >
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Questions source API
          </h3>
          <p class="text-slate-600 dark:text-slate-400 text-sm mb-4">
            Gérer les questions pour les API et TikTok •
            {{ questionsCount }} questions
          </p>
          <div class="text-blue-600 dark:text-blue-400 text-sm font-medium">
            Accéder →
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Heart,
  Calendar,
  MessageCircle,
  Users,
  FileText,
} from "lucide-vue-next";
import Gallery from "@/layers/app/components/Gallery.vue";
import { Api } from "@/layers/admin/pages/admin/users/components/api";
import { Api as QuestionsApi } from "@/layers/admin/pages/admin/source-api/components/api";

definePageMeta({
  layout: "admin",
  middleware: ["admin"],
});

// Récupérer le nombre d'utilisateurs réel
const usersCount = ref<number>(0);

// Récupérer le nombre de questions réel
const questionsCount = ref<number>(0);

// Récupérer les statistiques des sources de contenu
const contentSourcesStats = ref({
  total: 0,
  api: 0,
  scraper: 0,
  enabled: 0,
  disabled: 0,
});

onMounted(async () => {
  try {
    // Charger les utilisateurs
    const users = await Api.getUsers();
    usersCount.value = users.length;

    // Charger le nombre de questions
    const questionsResponse = await QuestionsApi.getQuestionsCount();
    questionsCount.value = questionsResponse.count;

    // Charger les statistiques des sources de contenu
    const sourcesStats = await QuestionsApi.getContentSourcesStats();
    contentSourcesStats.value = sourcesStats;
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
    usersCount.value = 0;
    questionsCount.value = 0;
    contentSourcesStats.value = {
      total: 0,
      api: 0,
      scraper: 0,
      enabled: 0,
      disabled: 0,
    };
  }
});

// Navigation
const router = useRouter();
const navigateToUsers = () => {
  router.push("/admin/users");
};

const navigateToSourceApi = () => {
  router.push("/admin/source-api");
};
</script>
