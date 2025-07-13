import type {CreateReportDto, UpdateReportsStatusDto} from "@/dto";
import { useAuthStore } from "@/stores/auth";

export const Api = {
  getReports: async () => {
    const config = useRuntimeConfig();
    const baseUrl = config.public.nestApiUrl || 'http://localhost:3000';
    const auth = useAuthStore();
    
    const response = await fetch(baseUrl+'/api/reports', {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  },

  createReport: async (reportData: CreateReportDto) => {
    const config = useRuntimeConfig();
    const baseUrl = config.public.nestApiUrl || 'http://localhost:3000';
    const auth = useAuthStore();
    
    const response = await fetch(baseUrl+'/api/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
      body: JSON.stringify(reportData),
    });
    if (!response.ok) {
      throw new Error('Failed to create report');
    }
    return response.json();
  },

  updateReportsStatus: async (reports: UpdateReportsStatusDto) => {
    const config = useRuntimeConfig();
    const baseUrl = config.public.nestApiUrl || 'http://localhost:3000';
    const auth = useAuthStore();
    
    const queryParams = new URLSearchParams({
      status: reports.status,
      report_ids: reports.report_ids.join(',')
    });
    const response = await fetch(baseUrl+`/api/reports?${queryParams}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to update report');
    }
    return response.json();
  },

  deleteReport: async (id: string) => {
    const config = useRuntimeConfig();
    const baseUrl = config.public.nestApiUrl || 'http://localhost:3000';
    const auth = useAuthStore();
    
    const response = await fetch(baseUrl+`/api/reports/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to delete report');
    }
  },

  getUser: async (userId: string) => {
    const config = useRuntimeConfig();
    const baseUrl = config.public.nestApiUrl || 'http://localhost:3000';
    const auth = useAuthStore();
    
    const response = await fetch(baseUrl+`/api/users/id/${userId}`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  getSource: async (sourceId: string) => {
    const config = useRuntimeConfig();
    const baseUrl = config.public.nestApiUrl || 'http://localhost:3000';
    const auth = useAuthStore();
    
    const response = await fetch(baseUrl+`/api/reports/source/${sourceId}`, {
      headers: {
        'Authorization': `Bearer ${auth.token}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch source');
    }
    return response.json();
  },
}
