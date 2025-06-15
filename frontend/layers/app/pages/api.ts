import { useAuthStore } from "@/stores/auth";

const Api = {
  listProjects: '/api/projects',
  listUsers: '/api/users',
}


export const getProjects = (params: string) => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl;

  return fetch(`${baseUrl}${Api.listProjects}?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export const getAllUsers = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl;

  return fetch(`${baseUrl}${Api.listUsers}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
}

export const addLikeOnProject = async (projectId: string) => {
  const auth = useAuthStore();
  const baseUrl = useRuntimeConfig().public.apiBaseUrl;
  return await fetch(`${baseUrl}${Api.listProjects}/like`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    },
    body: JSON.stringify(projectId),
  })
}

export const getAllTechnos = () => {

}

export const getAllSpecializations = () => {

}
