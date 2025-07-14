import { useAuthStore } from "@/stores/auth";

export default defineNuxtPlugin(() => {
  const auth = useAuthStore();

  // Initialiser le store auth côté client
  if (process.client) {
    auth.init();
  }
});
