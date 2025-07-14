import { useAuthStore } from "@/stores/auth";
import type {CreateReportDto} from "@/dto";

const Api = {
  listUsers: '/api/users',
  invoke: '/app/translateForElk/invoke',
}

export const getAllUsers = () => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.nestBaseUrl;

  return fetch(`${baseUrl}${Api.listUsers}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
}

export const invokeAgent = async (message: string, threadId?: string) => {
  const auth = useAuthStore();
  const config = useRuntimeConfig();
  const agentServiceUrl = config.public.aiApiUrl || 'http://localhost:8088';

  return fetch(`${agentServiceUrl}${Api.invoke}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    },
    body: JSON.stringify({
      message,
      thread_id: threadId,
    }),
  });
}

export const createReport = async (reportData: CreateReportDto) => {
  const config = useRuntimeConfig();
  const baseUrl = config.public.nestBaseUrl;
  console.log('Base url:', baseUrl);
  const auth = useAuthStore();
  return await fetch(baseUrl+'/api/reports', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${auth.token}`,
    },
    body: JSON.stringify(reportData),
  });
}
