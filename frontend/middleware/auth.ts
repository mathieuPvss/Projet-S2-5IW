import { useAuthStore } from "@/stores/auth";

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();

  // Côté client, attendre que le store soit initialisé
  if (process.client) {
    // Attendre que l'initialisation soit terminée
    while (!auth.isInitialized) {
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
  }

  // Côté serveur, on ne peut pas vérifier le localStorage
  // donc on laisse passer et on laisse le plugin client gérer
  if (process.server) {
    return;
  }

  // Check if user is authenticated and token is valid (not expired)
  if (!auth.isAuthenticated) {
    // If token exists but is expired, handle it properly
    if (auth.token && auth.isTokenExpired) {
      await auth.handleExpiredToken();
    }
    return navigateTo("/authentication");
  }
});
