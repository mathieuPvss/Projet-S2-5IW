<template>
  <div class="space-y-6">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Résultats du test
      </h3>
      <Button @click="$emit('close')" variant="outline" size="sm">
        Fermer
      </Button>
    </div>

    <!-- État de chargement -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div
          class="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"
        ></div>
        <p class="text-slate-600 dark:text-slate-400">Test en cours...</p>
        <p class="text-sm text-slate-500 dark:text-slate-500 mt-2">
          Cela peut prendre quelques secondes selon la complexité du site.
        </p>
      </div>
    </div>

    <!-- Erreur -->
    <div v-else-if="error" class="space-y-4">
      <div
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
      >
        <div class="flex items-center gap-3">
          <AlertCircle class="w-5 h-5 text-red-600 dark:text-red-400" />
          <h4 class="font-medium text-red-900 dark:text-red-100">
            Erreur lors du test
          </h4>
        </div>
        <p class="text-red-700 dark:text-red-300 mt-2">
          {{ error }}
        </p>
      </div>

      <div
        class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
      >
        <h4 class="font-medium text-blue-900 dark:text-blue-100 mb-2">
          Conseils pour résoudre le problème :
        </h4>
        <ul
          class="text-blue-700 dark:text-blue-300 text-sm space-y-1 list-disc list-inside"
        >
          <li>Vérifiez que l'URL est accessible et valide</li>
          <li>Assurez-vous que les sélecteurs CSS sont corrects</li>
          <li>
            Testez vos sélecteurs dans les outils de développement du navigateur
          </li>
          <li>Vérifiez que le site ne bloque pas les robots/scrapers</li>
        </ul>
      </div>
    </div>

    <!-- Résultats -->
    <div v-else-if="results" class="space-y-6">
      <!-- Statistiques -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          class="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
        >
          <div class="flex items-center gap-3">
            <CheckCircle class="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <p class="font-medium text-green-900 dark:text-green-100">
                Test réussi
              </p>
              <p class="text-sm text-green-700 dark:text-green-300">
                {{ results.totalResults }} éléments extraits
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
        >
          <div class="flex items-center gap-3">
            <Globe class="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <p class="font-medium text-blue-900 dark:text-blue-100">
                URL testée
              </p>
              <p class="text-sm text-blue-700 dark:text-blue-300 truncate">
                {{ results.startUrl }}
              </p>
            </div>
          </div>
        </div>

        <div
          class="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4"
        >
          <div class="flex items-center gap-3">
            <Clock class="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <div>
              <p class="font-medium text-purple-900 dark:text-purple-100">
                Timestamp
              </p>
              <p class="text-sm text-purple-700 dark:text-purple-300">
                {{ formatDate(results.timestamp) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Données extraites -->
      <div class="space-y-4">
        <h4 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Données extraites ({{ results.results.length }} éléments)
        </h4>

        <!-- Aperçu limité -->
        <div class="space-y-3">
          <div
            v-for="(item, index) in results.results.slice(0, maxDisplayItems)"
            :key="index"
            class="bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-4"
          >
            <div class="flex items-center justify-between mb-3">
              <span
                class="text-sm font-medium text-slate-600 dark:text-slate-400"
              >
                Élément {{ index + 1 }}
              </span>
              <a
                v-if="item.url"
                :href="item.url"
                target="_blank"
                class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <ExternalLink class="w-3 h-3" />
                Voir la source
              </a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="(value, field) in item"
                :key="field"
                class="space-y-1"
              >
                <label
                  class="text-xs font-medium text-slate-600 dark:text-slate-400"
                >
                  {{ field }}
                </label>
                <div class="text-sm text-slate-900 dark:text-slate-100">
                  <template v-if="Array.isArray(value)">
                    <div class="space-y-1">
                      <span
                        v-for="(val, idx) in value.slice(0, 3)"
                        :key="idx"
                        class="block truncate"
                      >
                        {{ val }}
                      </span>
                      <span
                        v-if="value.length > 3"
                        class="text-xs text-slate-500"
                      >
                        +{{ value.length - 3 }} autres...
                      </span>
                    </div>
                  </template>
                  <template v-else-if="String(field) === 'url'">
                    <code class="text-xs break-all">{{ value }}</code>
                  </template>
                  <template
                    v-else-if="
                      typeof value === 'string' && value.startsWith('http')
                    "
                  >
                    <img
                      v-if="isImageUrl(value)"
                      :src="value"
                      :alt="String(field)"
                      class="max-w-20 max-h-20 object-cover rounded border"
                      @error="
                        ($event.target as HTMLImageElement).style.display =
                          'none'
                      "
                    />
                    <a
                      v-else
                      :href="value"
                      target="_blank"
                      class="text-blue-600 dark:text-blue-400 hover:underline text-xs break-all"
                    >
                      {{ value }}
                    </a>
                  </template>
                  <template v-else>
                    <span class="break-words">{{ value || "N/A" }}</span>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination des résultats -->
        <div
          v-if="results.results.length > maxDisplayItems"
          class="flex items-center justify-between"
        >
          <p class="text-sm text-slate-600 dark:text-slate-400">
            Affichage de {{ maxDisplayItems }} sur
            {{ results.results.length }} éléments
          </p>
          <div class="flex items-center gap-2">
            <Button
              @click="
                maxDisplayItems = Math.min(
                  maxDisplayItems + 5,
                  results.results.length,
                )
              "
              variant="outline"
              size="sm"
              :disabled="maxDisplayItems >= results.results.length"
            >
              Afficher plus
            </Button>
            <Button
              @click="maxDisplayItems = results.results.length"
              variant="outline"
              size="sm"
              :disabled="maxDisplayItems >= results.results.length"
            >
              Tout afficher
            </Button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div
        class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700"
      >
        <div class="text-sm text-slate-600 dark:text-slate-400">
          Les données ont été extraites avec succès. Vous pouvez maintenant
          sauvegarder cette configuration.
        </div>
        <Button @click="$emit('close')" variant="outline"> Fermer </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Button } from "@ui/components/button";
import {
  CheckCircle,
  AlertCircle,
  Globe,
  Clock,
  ExternalLink,
} from "lucide-vue-next";

interface TestResults {
  success: boolean;
  startUrl: string;
  totalResults: number;
  results: any[];
  timestamp: string;
}

defineProps<{
  results?: TestResults | null;
  loading: boolean;
  error?: string | null;
}>();

defineEmits<{
  close: [];
}>();

const maxDisplayItems = ref(5);

const formatDate = (timestamp: string) => {
  return new Date(timestamp).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const isImageUrl = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(url);
};
</script>
