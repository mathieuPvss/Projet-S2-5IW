<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <!-- Technologie -->
    <div class="space-y-2">
      <Label for="technologie">Technologie</Label>
      <Input
        id="technologie"
        v-model="formData.technologie"
        type="text"
        placeholder="ex: JavaScript, Python, React..."
        :disabled="isSubmitting"
        required
      />
    </div>

    <!-- Catégorie -->
    <div class="space-y-2">
      <Label for="category">Catégorie</Label>
      <Input
        id="category"
        v-model="formData.category"
        type="text"
        placeholder="ex: Frontend, Backend, DevOps..."
        :disabled="isSubmitting"
        required
      />
    </div>

    <!-- Contenu -->
    <div class="space-y-2">
      <Label for="content">Question</Label>
      <Textarea
        id="content"
        v-model="formData.content"
        placeholder="Saisissez votre question ici..."
        :disabled="isSubmitting"
        required
        rows="4"
      />
    </div>

    <!-- Options -->
    <div class="space-y-2">
      <div class="flex items-center space-x-2">
        <input
          id="createUsages"
          v-model="formData.createUsages"
          type="checkbox"
          class="rounded border-slate-300 dark:border-slate-600"
          :disabled="isSubmitting"
        />
        <Label for="createUsages" class="text-sm">
          Créer automatiquement les usages pour les sources API
        </Label>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Si activé, des entrées question_usage seront créées pour chaque source
        de contenu de type API.
      </p>
    </div>

    <!-- Submit button -->
    <div class="flex justify-end">
      <Button
        type="submit"
        :disabled="isSubmitting || !isFormValid"
        class="min-w-[120px]"
      >
        <span v-if="isSubmitting" class="flex items-center">
          <div
            class="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"
          ></div>
          Création...
        </span>
        <span v-else> Créer la question </span>
      </Button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import { toast } from "@ui/components/toast";
import { Api } from "./api";

// Définition des émissions
const emit = defineEmits<{
  questionCreated: [result: { question: any; usagesCreated: number }];
}>();

// État du formulaire
const formData = ref({
  technologie: "",
  category: "",
  content: "",
  createUsages: true,
});

const isSubmitting = ref(false);

// Validation du formulaire
const isFormValid = computed(() => {
  return (
    formData.value.technologie.trim() !== "" &&
    formData.value.category.trim() !== "" &&
    formData.value.content.trim() !== ""
  );
});

// Fonction de soumission
const submitForm = async () => {
  if (!isFormValid.value) {
    toast({
      title: "Formulaire invalide",
      description: "Veuillez remplir tous les champs obligatoires.",
      variant: "destructive",
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const result = await Api.createQuestionWithUsages({
      technologie: formData.value.technologie.trim(),
      category: formData.value.category.trim(),
      content: formData.value.content.trim(),
      createUsages: formData.value.createUsages,
    });

    // Réinitialiser le formulaire
    formData.value = {
      technologie: "",
      category: "",
      content: "",
      createUsages: true,
    };

    // Émettre l'événement
    emit("questionCreated", result);
  } catch (error: any) {
    console.error("Erreur lors de la création de la question:", error);

    toast({
      title: "Erreur",
      description:
        error.message || "Erreur lors de la création de la question.",
      variant: "destructive",
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>
