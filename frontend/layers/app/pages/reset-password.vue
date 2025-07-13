<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="w-full max-w-md space-y-8">
      <div>
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary"
        >
          <Key class="h-6 w-6 text-white" />
        </div>
        <h2
          class="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-white"
        >
          Réinitialiser votre mot de passe
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Entrez votre nouveau mot de passe ci-dessous
        </p>
      </div>

      <div v-if="!tokenValid" class="text-center">
        <div
          class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
        >
          <AlertCircle class="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 class="mt-4 text-lg font-medium text-gray-900 dark:text-white">
          Lien expiré ou invalide
        </h3>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Ce lien de réinitialisation a expiré ou n'est plus valide.
        </p>
        <div class="mt-6">
          <Button @click="$router.push('/authentication')" variant="outline">
            Retour à la connexion
          </Button>
        </div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label
              for="password"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Nouveau mot de passe
            </label>
            <div class="mt-1">
              <Input
                id="password"
                v-model="password"
                type="password"
                autocomplete="new-password"
                required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Entrez votre nouveau mot de passe"
              />
            </div>
          </div>

          <div>
            <label
              for="confirmPassword"
              class="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirmer le mot de passe
            </label>
            <div class="mt-1">
              <Input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                autocomplete="new-password"
                required
                class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Confirmez votre nouveau mot de passe"
              />
            </div>
          </div>
        </div>

        <div
          v-if="password && confirmPassword && password !== confirmPassword"
          class="text-sm text-red-600 dark:text-red-400"
        >
          Les mots de passe ne correspondent pas
        </div>

        <div
          v-if="password && password.length < 6"
          class="text-sm text-red-600 dark:text-red-400"
        >
          Le mot de passe doit contenir au moins 6 caractères
        </div>

        <div>
          <Button
            type="submit"
            :disabled="!isFormValid || isLoading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <span
              v-if="isLoading"
              class="absolute left-0 inset-y-0 flex items-center pl-3"
            >
              <Loader2 class="h-5 w-5 animate-spin" />
            </span>
            {{
              isLoading
                ? "Réinitialisation..."
                : "Réinitialiser le mot de passe"
            }}
          </Button>
        </div>

        <div class="text-center">
          <NuxtLink
            to="/authentication"
            class="font-medium text-primary hover:text-primary/90"
          >
            Retour à la connexion
          </NuxtLink>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { toast } from "@ui/components/toast";
import { Key, AlertCircle, Loader2 } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();

const password = ref("");
const confirmPassword = ref("");
const isLoading = ref(false);
const tokenValid = ref(true);

const token = computed(() => route.query.token as string);

const nestUrl = useRuntimeConfig().public.nestBaseUrl;

const isFormValid = computed(() => {
  return (
    password.value &&
    confirmPassword.value &&
    password.value === confirmPassword.value &&
    password.value.length >= 6
  );
});

onMounted(() => {
  if (!token.value) {
    tokenValid.value = false;
    toast({
      title: "Erreur",
      description: "Token manquant dans l'URL.",
      variant: "destructive",
    });
  }
});

const handleSubmit = async () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  try {
    await $fetch(`${nestUrl}/api/users/reset-password`, {
      method: "POST",
      body: {
        token: token.value,
        newPassword: password.value,
      },
    });

    toast({
      title: "Succès",
      description: "Votre mot de passe a été réinitialisé avec succès.",
      variant: "default",
    });

    // Rediriger vers la page de connexion
    setTimeout(() => {
      router.push("/authentication");
    }, 1500);
  } catch (error: any) {
    console.error("Reset password error:", error);

    if (error.status === 400) {
      tokenValid.value = false;
      toast({
        title: "Erreur",
        description:
          "Le lien de réinitialisation a expiré ou n'est plus valide.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la réinitialisation du mot de passe.",
        variant: "destructive",
      });
    }
  } finally {
    isLoading.value = false;
  }
};
</script>
