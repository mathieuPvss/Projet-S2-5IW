import { defineStore } from "pinia";
import { jwtDecode } from "jwt-decode";
import type { DecodedToken } from "@/dto";
import { toast } from "@ui/components/toast";
import { navigateTo } from "nuxt/app";

// Utility function to check if a token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) {
      return true;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch {
    return true;
  }
}

// Utility function to get time until token expires
export function getTimeUntilExpiration(token: string): number {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    if (!decoded.exp) {
      return 0;
    }
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  } catch {
    return 0;
  }
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    user: null as DecodedToken | null,
    isInitialized: false,
  }),
  getters: {
    // Check if token is expired
    isTokenExpired(): boolean {
      if (!this.user || !this.user.exp) {
        return true;
      }
      // exp is in seconds, Date.now() is in milliseconds
      const currentTime = Math.floor(Date.now() / 1000);
      return this.user.exp < currentTime;
    },

    // Check if user is authenticated and token is valid
    isAuthenticated(): boolean {
      return !!this.token && !!this.user && !this.isTokenExpired;
    },

    // Get time until token expires (in seconds)
    timeUntilExpiration(): number {
      if (!this.user || !this.user.exp) {
        return 0;
      }
      const currentTime = Math.floor(Date.now() / 1000);
      return Math.max(0, this.user.exp - currentTime);
    }
  },
  actions: {
    login(storageToken: string) {
      if (typeof storageToken !== "string") {
        toast({
          title: "Erreur",
          description: "Token invalide.",
          variant: "destructive",
        });
        return;
      }
      try {
        this.token = storageToken;
        this.user = jwtDecode(storageToken);

        // Check if token is expired immediately after decoding
        if (this.isTokenExpired) {
          toast({
            title: "Token expiré",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            variant: "destructive",
          });
          this.logout();
          return;
        }

        if (process.client) {
          localStorage.setItem("token", storageToken);
        }
      } catch (error) {
        this.logout();
      }
    },

    async logout(isExpired = false) {
      const title = isExpired ? "Session expirée" : "Déconnexion réussie";
      const description = isExpired ? "Votre session a expiré. Veuillez vous reconnecter." : "Vous avez été déconnecté avec succès.";
      toast?.({
        title: title,
        description: description,
        variant: "default",
      });
      this.token = null;
      this.user = null;
      if (process.client) {
        localStorage.removeItem("token");
      }
      await navigateTo("/authentication");
    },

    // Handle expired token
    async handleExpiredToken() {
      toast({
        title: "Session expirée",
        description: "Votre session a expiré. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      await this.logout(true);
    },

    // Check token validity and handle expiration
    async checkTokenValidity(): Promise<boolean> {
      if (!this.token || !this.user) {
        return false;
      }

      return !this.isTokenExpired;
    },

    // Refresh token (placeholder for future implementation)
    async refreshToken(): Promise<boolean> {
      // This is a placeholder for token refresh functionality
      // You can implement this when your backend supports token refresh
      console.log("Token refresh not implemented yet");
      return false;
    },

    init() {
      if (!process.client) return; // on ne fait rien côté serveur

      const storageToken = localStorage.getItem("token");
      if (storageToken && typeof storageToken === "string") {
        try {
          this.token = storageToken;
          this.user = jwtDecode(storageToken);

          // Check if token is expired during initialization
          if (this.isTokenExpired) {
            console.log("Token expired during initialization, logging out");
            this.logout();
            return;
          }
        } catch (e) {
          this.logout();
        }
      }
      this.isInitialized = true;
    },
  },
});
