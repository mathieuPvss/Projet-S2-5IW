<template>
  <div
    class="flex min-h-svh w-full flex-col items-center justify-center gap-6 p-6 md:p-10 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800"
  >
    <div class="w-full max-w-md">
      <!-- Logo et titre -->
      <div class="text-center mb-8">
        <div
          class="flex h-16 w-16 mx-auto mb-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
        >
          <SiteIcon color="white" class="h-8 w-8" />
        </div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          Confirmation de votre compte
        </h1>
        <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Query Forge Dev
        </p>
      </div>

      <!-- Carte de confirmation -->
      <Card
        class="shadow-xl border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
      >
        <CardContent class="p-8">
          <!-- État de chargement -->
          <div v-if="isLoading" class="text-center space-y-4">
            <div class="flex justify-center">
              <div
                class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"
              ></div>
            </div>
            <p class="text-gray-600 dark:text-gray-400">
              Confirmation en cours...
            </p>
          </div>

          <!-- Succès -->
          <div
            v-else-if="confirmationStatus === 'success'"
            class="text-center space-y-4"
          >
            <div class="flex justify-center">
              <div
                class="h-16 w-16 mx-auto flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
              >
                <Icon icon="mdi:check-circle" class="h-8 w-8 text-green-500" />
              </div>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Email confirmé ! ✅
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Votre compte a été activé avec succès. Vous pouvez maintenant vous
              connecter et profiter de toutes les fonctionnalités de Query
              Forge.
            </p>
            <div class="pt-4">
              <Button @click="goToLogin" class="w-full">
                <Icon icon="mdi:login" class="mr-2 h-4 w-4" />
                Se connecter
              </Button>
            </div>
          </div>

          <!-- Déjà confirmé -->
          <div
            v-else-if="confirmationStatus === 'already-confirmed'"
            class="text-center space-y-4"
          >
            <div class="flex justify-center">
              <div
                class="h-16 w-16 mx-auto flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
              >
                <Icon icon="mdi:information" class="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Compte déjà confirmé 📧
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              Votre compte est déjà activé. Vous pouvez vous connecter dès
              maintenant.
            </p>
            <div class="pt-4">
              <Button @click="goToLogin" class="w-full">
                <Icon icon="mdi:login" class="mr-2 h-4 w-4" />
                Se connecter
              </Button>
            </div>
          </div>

          <!-- Erreur -->
          <div
            v-else-if="confirmationStatus === 'error'"
            class="text-center space-y-4"
          >
            <div class="flex justify-center">
              <div
                class="h-16 w-16 mx-auto flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900"
              >
                <Icon icon="mdi:alert-circle" class="h-8 w-8 text-red-500" />
              </div>
            </div>
            <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
              Erreur de confirmation ❌
            </h2>
            <p class="text-gray-600 dark:text-gray-400">
              {{
                errorMessage ||
                "Le lien de confirmation est invalide ou a expiré. Veuillez vous réinscrire ou contactez le support."
              }}
            </p>
            <div class="pt-4 space-y-2">
              <Button @click="goToRegister" variant="outline" class="w-full">
                <Icon icon="mdi:account-plus" class="mr-2 h-4 w-4" />
                S'inscrire à nouveau
              </Button>
              <Button @click="goToLogin" variant="ghost" class="w-full">
                <Icon icon="mdi:login" class="mr-2 h-4 w-4" />
                Se connecter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <!-- Footer -->
      <div class="text-center mt-8">
        <p class="text-xs text-gray-500 dark:text-gray-400">
          Besoin d'aide ?
          <a
            href="mailto:support@queryforge.dev"
            class="text-primary hover:underline"
          >
            Contactez le support
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { toast } from "@ui/components/toast";
import SiteIcon from "@/layers/base/components/SiteIcon.vue";

definePageMeta({
  layout: false, // Pas de layout par défaut pour cette page
});

const route = useRoute();
const baseUrl = useRuntimeConfig().public.authBaseUrl;

const isLoading = ref(true);
const confirmationStatus = ref<
  "success" | "already-confirmed" | "error" | null
>(null);
const errorMessage = ref("");

const confirmEmail = async (token: string) => {
  try {
    const response = await fetch(`${baseUrl}/auth/confirm?token=${token}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (response.ok) {
      if (data.message?.includes("déjà confirmé")) {
        confirmationStatus.value = "already-confirmed";
      } else {
        confirmationStatus.value = "success";
        toast({
          title: "Compte confirmé !",
          description: "Votre email a été confirmé avec succès.",
          variant: "default",
        });
      }
    } else {
      confirmationStatus.value = "error";
      errorMessage.value = data.message || "Erreur lors de la confirmation";
      toast({
        title: "Erreur",
        description: data.message || "Erreur lors de la confirmation",
        variant: "destructive",
      });
    }
  } catch (error) {
    confirmationStatus.value = "error";
    errorMessage.value = "Erreur de connexion au serveur";
    toast({
      title: "Erreur",
      description: "Erreur de connexion au serveur",
      variant: "destructive",
    });
  } finally {
    isLoading.value = false;
  }
};

const goToLogin = () => {
  navigateTo("/authentication");
};

const goToRegister = () => {
  navigateTo("/authentication");
};

onMounted(() => {
  const token = route.query.token as string;

  if (!token) {
    confirmationStatus.value = "error";
    errorMessage.value = "Token de confirmation manquant";
    isLoading.value = false;
    return;
  }

  confirmEmail(token);
});
</script>
