<template>
  <div class="container mx-auto px-4 py-8 max-w-2xl">
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div class="flex items-center mb-6">
        <div
          class="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold"
        >
          {{ userInitials }}
        </div>
        <div class="ml-4">
          <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
            Mon Profil
          </h1>
          <p class="text-gray-600 dark:text-gray-300">
            Gérez vos informations personnelles
          </p>
        </div>
      </div>

      <div class="space-y-6">
        <!-- Informations utilisateur -->
        <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Informations personnelles
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Adresse email
              </label>
              <p
                class="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
              >
                {{ auth.user?.email || "Non disponible" }}
              </p>
            </div>

            <div>
              <label
                class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Rôle
              </label>
              <p
                class="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded-lg"
              >
                <span
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="roleStyle"
                >
                  {{ roleLabel }}
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Sécurité -->
        <div class="border-b border-gray-200 dark:border-gray-700 pb-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Sécurité
          </h2>

          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-medium text-gray-900 dark:text-white">
                Mot de passe
              </h3>
              <p class="text-sm text-gray-600 dark:text-gray-300">
                Réinitialisez votre mot de passe pour sécuriser votre compte
              </p>
            </div>
            <Button
              @click="openResetPasswordDialog"
              variant="outline"
              class="ml-4"
            >
              <Key class="w-4 h-4 mr-2" />
              Réinitialiser
            </Button>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end">
          <Button @click="auth.logout()" variant="destructive">
            <LogOut class="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>

    <!-- Dialog pour reset password -->
    <Dialog :open="showResetDialog" @update:open="showResetDialog = $event">
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            Un email avec un lien de réinitialisation sera envoyé à votre
            adresse email.
          </DialogDescription>
        </DialogHeader>

        <div class="py-4">
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Êtes-vous sûr de vouloir réinitialiser votre mot de passe ?
          </p>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            @click="showResetDialog = false"
          >
            Annuler
          </Button>
          <Button
            type="button"
            @click="requestPasswordReset"
            :disabled="isLoading"
          >
            <Loader2 v-if="isLoading" class="w-4 h-4 mr-2 animate-spin" />
            Envoyer le lien
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});
import { ref, computed } from "vue";
import { useAuthStore } from "@/stores/auth";
import { Button } from "@ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@ui/components/dialog";
import { toast } from "@ui/components/toast";
import { Key, LogOut, Loader2 } from "lucide-vue-next";

const auth = useAuthStore();
const showResetDialog = ref(false);
const isLoading = ref(false);

const nestUrl = useRuntimeConfig().public.nestBaseUrl;

const userInitials = computed(() => {
  if (!auth.user?.email) return "?";
  return auth.user.email.split("@")[0].charAt(0).toUpperCase();
});

const roleLabel = computed(() => {
  return auth.user?.role === "admin" ? "Administrateur" : "Utilisateur";
});

const roleStyle = computed(() => {
  return auth.user?.role === "admin"
    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
});

const openResetPasswordDialog = () => {
  showResetDialog.value = true;
};

const requestPasswordReset = async () => {
  if (!auth.user?.email) return;

  isLoading.value = true;

  try {
    const response = await $fetch(
      `${nestUrl}/api/users/request-password-reset`,
      {
        method: "POST",
        body: {
          email: auth.user.email,
        },
      },
    );

    toast({
      title: "Email envoyé",
      description:
        "Un lien de réinitialisation a été envoyé à votre adresse email.",
      variant: "default",
    });

    showResetDialog.value = false;
  } catch (error) {
    toast({
      title: "Erreur",
      description: "Une erreur est survenue lors de l'envoi de l'email.",
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
