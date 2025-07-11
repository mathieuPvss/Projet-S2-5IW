import { defineStore } from 'pinia'
import { jwtDecode } from "jwt-decode";
import type { DecodedToken } from "@/dto";
import { toast } from "@ui/components/toast";
import { navigateTo } from 'nuxt/app';
export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as DecodedToken | null,
  }),
  actions: {
    login(storageToken: string) {
      if (typeof storageToken !== 'string') {
        toast({
          title: 'Erreur',
          description: 'Token invalide.',
          variant: 'destructive',
        });
        return;
      }
      try {
        this.token = storageToken;
        this.user = jwtDecode(storageToken);
        if (process.client) {
          localStorage.setItem('token', storageToken);
        }
      } catch (error) {
        this.logout();
      }
    },
    async logout() {
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès.",
        variant: "default",
      });
      this.token = null;
      this.user = null;
      if (process.client) {
        localStorage.removeItem('token');
      }
      await navigateTo('/authentication');
    },
    init() {
      if (!process.client) return; // on ne fait rien côté serveur

      const storageToken = localStorage.getItem('token');
      if (storageToken && typeof storageToken === 'string') {
        try {
          this.token = storageToken;
          this.user = jwtDecode(storageToken);
        } catch (e) {
          this.logout();
        }
      }
    },
  },
});
