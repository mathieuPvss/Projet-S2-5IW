import type { User } from "@/entities";
import { useAuthStore } from "@/stores/auth";

export interface CreateUserDto {
  email: string;
  password: string;
  role: "user" | "admin";
}

export interface AdminUpdateUserDto {
  password?: string;
  role?: "user" | "admin";
  verified?: boolean;
}

export const Api = {
  getUsers: async (): Promise<User[]> => {
    const nestUrl = useRuntimeConfig().public.nestBaseUrl;
    //add token to headers
    const auth = useAuthStore();
    const response = await fetch(nestUrl + "/api/users", {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch users");
    }
    return response.json();
  },

  createUser: async (userData: CreateUserDto): Promise<User> => {
    const nestUrl = useRuntimeConfig().public.nestBaseUrl;
    const auth = useAuthStore();
    const response = await fetch(nestUrl + "/api/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error("Failed to create user");
    }
    return response.json();
  },

  updateUser: async (
    id: string,
    userData: AdminUpdateUserDto,
  ): Promise<User> => {
    console.log(userData);
    const nestUrl = useRuntimeConfig().public.nestBaseUrl;
    const auth = useAuthStore();
    const response = await fetch(nestUrl + `/api/users/admin/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      throw new Error("Failed to update user");
    }
    return response.json();
  },

  deleteUser: async (id: string): Promise<void> => {
    const nestUrl = useRuntimeConfig().public.nestBaseUrl;
    const auth = useAuthStore();
    const response = await fetch(nestUrl + `/api/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to delete user");
    }
  },

  getUser: async (userId: string): Promise<User> => {
    const nestUrl = useRuntimeConfig().public.nestBaseUrl;
    const auth = useAuthStore();
    const response = await fetch(nestUrl + `/api/users/id/${userId}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch user");
    }
    return response.json();
  },
};
