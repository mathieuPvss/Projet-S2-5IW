import { useAuthStore} from "@/stores/auth";
const Api = {
  fetchProject: '/api/projects',
  fetchProjectComments: '/api/comments',
}

export const fetchProject = (id: string) => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl
  const auth = useAuthStore();
  return fetch(`${baseUrl}${Api.fetchProject}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    },
  })
}
export const fetchProjectComments = (ids: string) => {
  const baseUrl = useRuntimeConfig().public.apiBaseUrl
  const auth = useAuthStore();
  return fetch(`${baseUrl}${Api.fetchProjectComments}?commentIds=${ids}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    },
  })
}
