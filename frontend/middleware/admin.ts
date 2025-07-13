import { useAuthStore } from "@/stores/auth";
import { toast } from "@ui/components/toast";
import { defineNuxtRouteMiddleware, navigateTo } from "nuxt/app";

export default defineNuxtRouteMiddleware(async (to, from) => {
  if (!process.client) {
    return;
  }

  const auth = useAuthStore();

  // Attendre que l'initialisation soit terminée
  while (!auth.isInitialized) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }

  if (!auth.token) {
    toast({
      title: "Accès refusé",
      description: "Veuillez vous connecter pour accéder à cette page.",
      variant: "destructive",
    });
    return navigateTo("/authentication");
  }

  if (!auth.user?.role || auth.user.role !== "admin") {
    toast({
      title: "Accès interdit",
      description:
        "Vous n'avez pas les droits nécessaires pour accéder à cette page.",
      variant: "destructive",
    });
    return navigateTo("/");
  }
});
