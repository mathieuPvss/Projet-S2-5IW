import { defineStore } from 'pinia'
import { jwtDecode } from "jwt-decode";
import type { DecodedToken } from "@/dto/decodedToken.dto";
import { toast } from "@ui/components/toast";

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
        localStorage.setItem('token', storageToken);
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
      localStorage.removeItem('token');
      await navigateTo('/');
    },
    init() {
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
