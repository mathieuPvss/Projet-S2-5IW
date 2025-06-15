import { useAuthStore } from '@/stores/auth';

const Api = {
  listProjects: '/api/projects',
  listUsers: '/api/users/all',
  listTechnos: '/api/technos/all',
  listSpecializations: '/api/specializations/all',
  createProject: '/api/projects',
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

export const getAllTechnos = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl;

  return fetch(`${baseUrl}${Api.listTechnos}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

export const getAllSpecializations = () => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl;
  return fetch(`${baseUrl}${Api.listSpecializations}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  });
}

export const createProject = (data: Record<string, string | string[]>) => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl;
  const auth = useAuthStore();
  return fetch(`${baseUrl}${Api.createProject}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    },
    body: JSON.stringify(data),
  });
}
export const editProject = (data: Record<string, string | string[]>, id: string) => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl;
  const auth = useAuthStore();
  return fetch(`${baseUrl}${Api.createProject}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    },
    body: JSON.stringify(data),
  });
}
