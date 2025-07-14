<template>
  <div class="space-y-4">
    <!-- Loading state -->
    <div v-if="loading" class="flex items-center justify-center py-8">
      <div
        class="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"
      ></div>
      <span class="ml-3 text-slate-600 dark:text-slate-400"
        >Chargement des sources...</span
      >
    </div>

    <!-- Empty state -->
    <div v-else-if="sources.length === 0" class="text-center py-8">
      <Globe class="w-12 h-12 text-slate-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
        Aucune source de contenu
      </h3>
      <p class="text-slate-600 dark:text-slate-400">
        Créez votre première source de contenu pour commencer le scraping.
      </p>
    </div>

    <!-- Sources list -->
    <div v-else class="grid gap-4">
      <div
        v-for="source in sources"
        :key="source.id"
        class="bg-slate-50 dark:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-start justify-between">
          <!-- Source info -->
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3
                class="text-lg font-semibold text-slate-900 dark:text-slate-100"
              >
                {{ source.name }}
              </h3>
              <Badge :variant="source.enabled ? 'default' : 'secondary'">
                {{ source.enabled ? "Actif" : "Inactif" }}
              </Badge>
            </div>

            <div class="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <div class="flex items-center gap-2">
                <ExternalLink class="w-4 h-4" />
                <span class="truncate">{{
                  source.config?.startUrl || "URL non configurée"
                }}</span>
              </div>

              <div class="flex items-center gap-2">
                <Target class="w-4 h-4" />
                <span>
                  {{
                    Object.keys(source.config?.scrapeFields || {}).length
                  }}
                  champs à extraire
                </span>
              </div>

              <div
                v-if="source.config?.followLinks"
                class="flex items-center gap-2"
              >
                <Link class="w-4 h-4" />
                <span>
                  Suivi de liens (limite:
                  {{ source.config.followLinks.limit || 10 }})
                </span>
              </div>

              <div
                v-if="source.config?.nextPageSelector"
                class="flex items-center gap-2"
              >
                <ChevronRight class="w-4 h-4" />
                <span>
                  Pagination activée (max:
                  {{ source.config.maxPages || 5 }} pages)
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 ml-4">
            <Button
              @click="$emit('test', source)"
              variant="outline"
              size="sm"
              :disabled="!source.config?.startUrl"
            >
              <Play class="w-4 h-4 mr-1" />
              Tester
            </Button>

            <Button @click="$emit('edit', source)" variant="outline" size="sm">
              <Edit class="w-4 h-4 mr-1" />
              Modifier
            </Button>

            <Button
              @click="$emit('delete', source)"
              variant="outline"
              size="sm"
              class="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 class="w-4 h-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </div>

        <!-- Configuration preview -->
        <div
          v-if="source.config?.scrapeFields"
          class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600"
        >
          <h4
            class="text-sm font-medium text-slate-900 dark:text-slate-100 mb-2"
          >
            Champs configurés :
          </h4>
          <div class="flex flex-wrap gap-2">
            <code
              v-for="(selector, field) in source.config.scrapeFields"
              :key="field"
              class="inline-flex items-center px-2 py-1 rounded bg-slate-200 dark:bg-slate-600 text-xs font-mono text-slate-700 dark:text-slate-300"
            >
              <span class="font-semibold text-blue-600 dark:text-blue-400"
                >{{ field }}:</span
              >
              <span class="ml-1">{{ selector }}</span>
            </code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from "@ui/components/badge";
import { Button } from "@ui/components/button";
import {
  Globe,
  ExternalLink,
  Target,
  Link,
  ChevronRight,
  Play,
  Edit,
  Trash2,
} from "lucide-vue-next";

interface ContentSource {
  id: string;
  name: string;
  enabled: boolean;
  type: "scraper" | "api";
  config?: {
    startUrl?: string;
    followLinks?: {
      selector: string;
      limit?: number;
    };
    scrapeFields?: {
      [fieldName: string]: string;
    };
    nextPageSelector?: string;
    maxPages?: number;
  } | null;
}

defineProps<{
  sources: ContentSource[];
  loading: boolean;
}>();

defineEmits<{
  edit: [source: ContentSource];
  delete: [source: ContentSource];
  test: [source: ContentSource];
}>();
</script>
