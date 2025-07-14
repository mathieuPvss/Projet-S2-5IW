<template>
  <div class="space-y-6">
    <!-- Instructions -->
    <div
      class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
    >
      <h3 class="font-medium text-blue-900 dark:text-blue-100 mb-2">
        Format CSV requis
      </h3>
      <p class="text-sm text-blue-700 dark:text-blue-300 mb-3">
        Le fichier CSV doit contenir exactement 3 colonnes dans cet ordre :
      </p>
      <div class="bg-white dark:bg-slate-800 rounded p-3 font-mono text-sm">
        <div class="font-bold text-slate-900 dark:text-slate-100">
          technologie,category,content
        </div>
        <div class="text-slate-600 dark:text-slate-400">
          JavaScript,Frontend,Comment utiliser les hooks ?
        </div>
        <div class="text-slate-600 dark:text-slate-400">
          Python,Backend,Qu'est-ce que FastAPI ?
        </div>
      </div>
    </div>

    <!-- Zone de drag & drop -->
    <div
      class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center transition-colors"
      :class="{
        'border-blue-500 bg-blue-50 dark:bg-blue-900/20': isDragOver,
        'border-green-500 bg-green-50 dark:bg-green-900/20':
          file && !validationError,
        'border-red-500 bg-red-50 dark:bg-red-900/20': validationError,
      }"
      @dragover.prevent="handleDragOver"
      @dragleave.prevent="handleDragLeave"
      @drop.prevent="handleDrop"
    >
      <div v-if="!file" class="space-y-4">
        <div class="text-4xl text-slate-400">📁</div>
        <div>
          <p
            class="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2"
          >
            Glissez votre fichier CSV ici
          </p>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-4">
            ou cliquez pour sélectionner un fichier
          </p>
          <Button
            variant="outline"
            @click="openFileDialog"
            :disabled="isProcessing"
          >
            Sélectionner un fichier
          </Button>
        </div>
      </div>

      <div v-else class="space-y-4">
        <div class="text-4xl">
          {{ validationError ? "❌" : "✅" }}
        </div>
        <div>
          <p
            class="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2"
          >
            {{ file.name }}
          </p>
          <p class="text-sm text-slate-600 dark:text-slate-400 mb-2">
            {{ formatFileSize(file.size) }} • {{ previewData.length }} lignes
          </p>

          <div
            v-if="validationError"
            class="text-red-600 dark:text-red-400 text-sm mb-4"
          >
            {{ validationError }}
          </div>

          <div class="flex justify-center space-x-2">
            <Button
              variant="outline"
              @click="clearFile"
              :disabled="isProcessing"
            >
              Changer de fichier
            </Button>
            <Button
              @click="uploadFile"
              :disabled="isProcessing || !!validationError"
            >
              <span v-if="isProcessing" class="flex items-center">
                <div
                  class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                ></div>
                Import...
              </span>
              <span v-else> Importer {{ previewData.length }} questions </span>
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Aperçu des données -->
    <div
      v-if="file && !validationError && previewData.length > 0"
      class="space-y-4"
    >
      <h3 class="font-medium text-slate-900 dark:text-slate-100">
        Aperçu des données ({{ Math.min(5, previewData.length) }} premières
        lignes)
      </h3>

      <div class="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-700">
              <th
                class="text-left p-2 font-medium text-slate-900 dark:text-slate-100"
              >
                Technologie
              </th>
              <th
                class="text-left p-2 font-medium text-slate-900 dark:text-slate-100"
              >
                Catégorie
              </th>
              <th
                class="text-left p-2 font-medium text-slate-900 dark:text-slate-100"
              >
                Question
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(row, index) in previewData.slice(0, 5)"
              :key="index"
              class="border-b border-slate-200 dark:border-slate-700"
            >
              <td class="p-2 text-slate-700 dark:text-slate-300">
                {{ row.technologie }}
              </td>
              <td class="p-2 text-slate-700 dark:text-slate-300">
                {{ row.category }}
              </td>
              <td class="p-2 text-slate-700 dark:text-slate-300">
                {{ truncateText(row.content, 50) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Input file caché -->
    <input
      ref="fileInput"
      type="file"
      accept=".csv"
      @change="handleFileSelect"
      class="hidden"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import { Button } from "@ui/components/button";
import { toast } from "@ui/components/toast";
import { Api } from "./api";

// Définition des émissions
const emit = defineEmits<{
  questionsImported: [
    result: {
      questionsCreated: number;
      usagesCreated: number;
      errors: string[];
    },
  ];
}>();

// État du composant
const file = ref<File | null>(null);
const fileInput = ref<HTMLInputElement | null>(null);
const isDragOver = ref(false);
const isProcessing = ref(false);
const validationError = ref<string | null>(null);
const previewData = ref<
  Array<{ technologie: string; category: string; content: string }>
>([]);

// Fonctions utilitaires
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Validation du CSV
const validateCSV = async (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const lines = content.split("\n").filter((line) => line.trim() !== "");

        if (lines.length === 0) {
          validationError.value = "Le fichier CSV est vide";
          resolve(false);
          return;
        }

        // Vérifier l'en-tête
        const header = lines[0].split(",").map((col) => col.trim());
        const expectedColumns = ["technologie", "category", "content"];

        if (header.length !== expectedColumns.length) {
          validationError.value = `Le CSV doit contenir exactement 3 colonnes. Trouvé: ${header.length}`;
          resolve(false);
          return;
        }

        // Vérifier les noms des colonnes
        const missingColumns = expectedColumns.filter(
          (col) => !header.includes(col),
        );
        if (missingColumns.length > 0) {
          validationError.value = `Colonnes manquantes: ${missingColumns.join(", ")}`;
          resolve(false);
          return;
        }

        const extraColumns = header.filter(
          (col) => !expectedColumns.includes(col),
        );
        if (extraColumns.length > 0) {
          validationError.value = `Colonnes supplémentaires non autorisées: ${extraColumns.join(", ")}`;
          resolve(false);
          return;
        }

        // Vérifier que les colonnes sont dans le bon ordre
        const correctOrder = expectedColumns.every(
          (col, index) => header[index] === col,
        );
        if (!correctOrder) {
          validationError.value = `Les colonnes doivent être dans l'ordre: ${expectedColumns.join(", ")}`;
          resolve(false);
          return;
        }

        // Parser les données pour l'aperçu
        const dataRows = lines.slice(1);
        const parsedData = dataRows
          .map((line, index) => {
            const columns = line.split(",").map((col) => col.trim());

            if (columns.length !== 3) {
              validationError.value = `Ligne ${index + 2}: nombre de colonnes incorrect (${columns.length} au lieu de 3)`;
              return null;
            }

            if (!columns[0] || !columns[1] || !columns[2]) {
              validationError.value = `Ligne ${index + 2}: tous les champs sont obligatoires`;
              return null;
            }

            return {
              technologie: columns[0],
              category: columns[1],
              content: columns[2],
            };
          })
          .filter((row) => row !== null);

        if (validationError.value) {
          resolve(false);
          return;
        }

        previewData.value = parsedData as Array<{
          technologie: string;
          category: string;
          content: string;
        }>;
        validationError.value = null;
        resolve(true);
      } catch (error) {
        validationError.value = "Erreur lors de la lecture du fichier CSV";
        resolve(false);
      }
    };

    reader.onerror = () => {
      validationError.value = "Erreur lors de la lecture du fichier";
      resolve(false);
    };

    reader.readAsText(file);
  });
};

// Gestionnaires d'événements
const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = true;
};

const handleDragLeave = () => {
  isDragOver.value = false;
};

const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  isDragOver.value = false;

  const files = event.dataTransfer?.files;
  if (files && files.length > 0) {
    const selectedFile = files[0];
    if (
      selectedFile.type === "text/csv" ||
      selectedFile.name.endsWith(".csv")
    ) {
      await processFile(selectedFile);
    } else {
      toast({
        title: "Format incorrect",
        description: "Veuillez sélectionner un fichier CSV.",
        variant: "destructive",
      });
    }
  }
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    await processFile(target.files[0]);
  }
};

const processFile = async (selectedFile: File) => {
  file.value = selectedFile;
  isProcessing.value = true;

  try {
    await validateCSV(selectedFile);
  } catch (error) {
    console.error("Erreur de validation:", error);
    validationError.value = "Erreur lors de la validation du fichier";
  } finally {
    isProcessing.value = false;
  }
};

const openFileDialog = () => {
  fileInput.value?.click();
};

const clearFile = () => {
  file.value = null;
  validationError.value = null;
  previewData.value = [];
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const uploadFile = async () => {
  if (!file.value || validationError.value) return;

  isProcessing.value = true;

  try {
    const result = await Api.importQuestionsFromCSV(file.value);

    // Réinitialiser le composant
    clearFile();

    // Émettre l'événement
    emit("questionsImported", result);
  } catch (error: any) {
    console.error("Erreur lors de l'upload:", error);

    toast({
      title: "Erreur d'import",
      description: error.message || "Erreur lors de l'import du fichier CSV.",
      variant: "destructive",
    });
  } finally {
    isProcessing.value = false;
  }
};
</script>
