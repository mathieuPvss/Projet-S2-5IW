<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <!-- Informations de base -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Informations générales
      </h3>

      <div class="grid grid-cols-2 gap-4">
        <div class="space-y-2">
          <Label for="name">Nom de la source</Label>
          <Input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="Ex: Documentation React"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="enabled">État</Label>
          <Select v-model="enabledString">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">Actif</SelectItem>
              <SelectItem value="false">Inactif</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>

    <!-- Configuration du scraping -->
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Configuration de scraping
      </h3>

      <!-- URL de départ -->
      <div class="space-y-2">
        <Label for="startUrl">URL de départ *</Label>
        <Input
          id="startUrl"
          v-model="formData.config.startUrl"
          type="url"
          placeholder="https://example.com/articles"
          required
        />
        <p class="text-xs text-slate-500 dark:text-slate-400">
          L'URL où commencer le scraping
        </p>
      </div>

      <!-- Champs à extraire -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <Label>Champs à extraire *</Label>
          <Button
            type="button"
            @click="addScrapeField"
            variant="outline"
            size="sm"
          >
            <Plus class="w-4 h-4 mr-1" />
            Ajouter un champ
          </Button>
        </div>

        <div class="space-y-3">
          <div
            v-for="(field, index) in scrapeFieldsList"
            :key="index"
            class="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg border border-slate-200 dark:border-slate-600"
          >
            <div class="grid grid-cols-5 gap-3 items-end">
              <div class="space-y-1">
                <Label :for="`field-name-${index}`" class="text-xs"
                  >Nom du champ</Label
                >
                <Input
                  :id="`field-name-${index}`"
                  v-model="field.name"
                  placeholder="title"
                  class="text-sm"
                />
              </div>

              <div class="space-y-1 col-span-3">
                <Label :for="`field-selector-${index}`" class="text-xs"
                  >Sélecteur CSS</Label
                >
                <div class="relative">
                  <Input
                    :id="`field-selector-${index}`"
                    v-model="field.selector"
                    placeholder="h1.title ou img.photo@src"
                    class="text-sm font-mono"
                  />
                </div>
              </div>

              <Button
                type="button"
                @click="removeScrapeField(index)"
                variant="outline"
                size="sm"
                class="text-red-600 hover:text-red-700"
              >
                <Trash2 class="w-4 h-4" />
              </Button>
            </div>

            <div class="mt-2 text-xs text-slate-500 dark:text-slate-400">
              <strong>Exemples :</strong>
              <code class="ml-1">h1.title</code> (texte),
              <code class="ml-1">img@src</code> (attribut),
              <code class="ml-1">.price</code> (classe)
            </div>
          </div>
        </div>

        <div
          v-if="scrapeFieldsList.length === 0"
          class="text-center py-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg"
        >
          <Target class="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Ajoutez au moins un champ à extraire
          </p>
        </div>
      </div>
    </div>

    <!-- Options avancées -->
    <div class="space-y-4">
      <div class="flex items-center gap-2">
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Options avancées
        </h3>
        <Button
          type="button"
          @click="showAdvanced = !showAdvanced"
          variant="ghost"
          size="sm"
        >
          <ChevronDown
            :class="[
              'w-4 h-4 transition-transform',
              showAdvanced ? 'rotate-180' : '',
            ]"
          />
        </Button>
      </div>

      <div
        v-show="showAdvanced"
        class="space-y-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg"
      >
        <!-- Suivi de liens -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <input
              id="followLinks"
              v-model="enableFollowLinks"
              type="checkbox"
              class="rounded border-slate-300 dark:border-slate-600"
            />
            <Label for="followLinks">Suivre les liens</Label>
          </div>

          <div v-show="enableFollowLinks" class="ml-6 space-y-3">
            <div class="space-y-2">
              <Label for="linkSelector">Sélecteur des liens à suivre</Label>
              <Input
                id="linkSelector"
                v-model="formData.config.followLinks.selector"
                placeholder="a[href*='/articles/']"
                class="font-mono text-sm"
              />
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Sélecteur CSS pour identifier les liens à suivre
              </p>
            </div>

            <div class="space-y-2">
              <Label for="linkLimit">Limite de liens</Label>
              <Input
                id="linkLimit"
                v-model.number="formData.config.followLinks.limit"
                type="number"
                min="1"
                max="100"
                placeholder="10"
              />
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <input
              id="enablePagination"
              v-model="enablePagination"
              type="checkbox"
              class="rounded border-slate-300 dark:border-slate-600"
            />
            <Label for="enablePagination">Pagination automatique</Label>
          </div>

          <div v-show="enablePagination" class="ml-6 space-y-3">
            <div class="space-y-2">
              <Label for="nextPageSelector"
                >Sélecteur du bouton "Suivant"</Label
              >
              <Input
                id="nextPageSelector"
                v-model="formData.config.nextPageSelector"
                placeholder=".next-page ou text:Suivant"
                class="font-mono text-sm"
              />
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Sélecteur CSS ou <code>text:Texte</code> pour le texte exact
              </p>
            </div>

            <div class="space-y-2">
              <Label for="maxPages">Nombre maximum de pages</Label>
              <Input
                id="maxPages"
                v-model.number="formData.config.maxPages"
                type="number"
                min="1"
                max="50"
                placeholder="5"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div
      class="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700"
    >
      <Button type="button" @click="$emit('cancel')" variant="outline">
        Annuler
      </Button>

      <div class="flex items-center gap-3">
        <Button
          type="button"
          @click="handleTest"
          variant="outline"
          :disabled="!canTest"
        >
          <Play class="w-4 h-4 mr-2" />
          Tester la configuration
        </Button>

        <Button type="submit" :disabled="!isFormValid">
          {{ source ? "Modifier" : "Créer" }}
        </Button>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/components/select";
import { Plus, Trash2, Target, ChevronDown, Play } from "lucide-vue-next";

interface ScrapeField {
  name: string;
  selector: string;
}

const props = defineProps<{
  source?: any;
}>();

const emit = defineEmits<{
  save: [data: any];
  cancel: [];
  test: [config: any];
}>();

// État du formulaire
const showAdvanced = ref(false);
const enableFollowLinks = ref(false);
const enablePagination = ref(false);

const formData = ref({
  name: "",
  enabled: true,
  type: "scraper" as const,
  config: {
    startUrl: "",
    followLinks: {
      selector: "",
      limit: 10,
    },
    scrapeFields: {} as Record<string, string>,
    nextPageSelector: "",
    maxPages: 5,
  },
});

const scrapeFieldsList = ref<ScrapeField[]>([]);
const enabledString = ref("true");

// Validation
const isFormValid = computed(() => {
  return (
    formData.value.name.trim() !== "" &&
    formData.value.config.startUrl.trim() !== "" &&
    scrapeFieldsList.value.length > 0 &&
    scrapeFieldsList.value.every(
      (field) => field.name.trim() !== "" && field.selector.trim() !== "",
    )
  );
});

const canTest = computed(() => {
  return (
    formData.value.config.startUrl.trim() !== "" &&
    scrapeFieldsList.value.length > 0 &&
    scrapeFieldsList.value.every(
      (field) => field.name.trim() !== "" && field.selector.trim() !== "",
    )
  );
});

// Fonctions
const addScrapeField = () => {
  scrapeFieldsList.value.push({ name: "", selector: "" });
};

const removeScrapeField = (index: number) => {
  scrapeFieldsList.value.splice(index, 1);
};

const updateScrapeFields = () => {
  formData.value.config.scrapeFields = {};
  scrapeFieldsList.value.forEach((field) => {
    if (field.name.trim() && field.selector.trim()) {
      formData.value.config.scrapeFields[field.name.trim()] =
        field.selector.trim();
    }
  });
};

const handleSubmit = () => {
  updateScrapeFields();

  const submitData = {
    name: formData.value.name.trim(),
    enabled: formData.value.enabled,
    type: formData.value.type,
    config: {
      startUrl: formData.value.config.startUrl.trim(),
      scrapeFields: formData.value.config.scrapeFields,
      ...(enableFollowLinks.value &&
        formData.value.config.followLinks.selector.trim() && {
          followLinks: {
            selector: formData.value.config.followLinks.selector.trim(),
            limit: formData.value.config.followLinks.limit,
          },
        }),
      ...(enablePagination.value &&
        formData.value.config.nextPageSelector?.trim() && {
          nextPageSelector: formData.value.config.nextPageSelector.trim(),
          maxPages: formData.value.config.maxPages,
        }),
    },
  };

  emit("save", submitData);
};

const handleTest = () => {
  updateScrapeFields();

  const testConfig = {
    startUrl: formData.value.config.startUrl.trim(),
    scrapeFields: formData.value.config.scrapeFields,
    ...(enableFollowLinks.value &&
      formData.value.config.followLinks.selector.trim() && {
        followLinks: {
          selector: formData.value.config.followLinks.selector.trim(),
          limit: formData.value.config.followLinks.limit,
        },
      }),
    ...(enablePagination.value &&
      formData.value.config.nextPageSelector?.trim() && {
        nextPageSelector: formData.value.config.nextPageSelector.trim(),
        maxPages: formData.value.config.maxPages,
      }),
  };

  emit("test", testConfig);
};

// Watchers
watch(enabledString, (value) => {
  formData.value.enabled = value === "true";
});

watch(
  () => formData.value.enabled,
  (value) => {
    enabledString.value = value ? "true" : "false";
  },
);

watch(enableFollowLinks, (enabled) => {
  if (!enabled) {
    formData.value.config.followLinks.selector = "";
    formData.value.config.followLinks.limit = 10;
  }
});

watch(enablePagination, (enabled) => {
  if (!enabled) {
    formData.value.config.nextPageSelector = "";
    formData.value.config.maxPages = 5;
  }
});

// Initialisation
onMounted(() => {
  if (props.source) {
    formData.value.name = props.source.name || "";
    formData.value.enabled = props.source.enabled ?? true;
    enabledString.value = formData.value.enabled ? "true" : "false";

    if (props.source.config) {
      formData.value.config.startUrl = props.source.config.startUrl || "";

      // Charger les champs de scraping
      if (props.source.config.scrapeFields) {
        scrapeFieldsList.value = Object.entries(
          props.source.config.scrapeFields,
        ).map(([name, selector]) => ({
          name,
          selector: selector as string,
        }));
      }

      // Charger la configuration de suivi de liens
      if (props.source.config.followLinks) {
        enableFollowLinks.value = true;
        formData.value.config.followLinks = {
          selector: props.source.config.followLinks.selector || "",
          limit: props.source.config.followLinks.limit || 10,
        };
      }

      // Charger la configuration de pagination
      if (props.source.config.nextPageSelector) {
        enablePagination.value = true;
        formData.value.config.nextPageSelector =
          props.source.config.nextPageSelector;
        formData.value.config.maxPages = props.source.config.maxPages || 5;
      }
    }
  } else {
    // Ajouter un champ par défaut pour les nouvelles sources
    addScrapeField();
  }
});
</script>
