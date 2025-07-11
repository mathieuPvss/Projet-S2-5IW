import type {CreateReportDto, UpdateReportsStatusDto} from "@/dto";

const baseUrl = 'http://localhost:3001';
export const Api = {
  getReports: async () => {
    const response = await fetch(baseUrl+'/reports');
    if (!response.ok) {
      throw new Error('Failed to fetch reports');
    }
    return response.json();
  },

  createReport: async (reportData: CreateReportDto) => {
    const response = await fetch(baseUrl+'/reports', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reportData),
    });
    if (!response.ok) {
      throw new Error('Failed to create report');
    }
    return response.json();
  },

  updateReportsStatus: async (reports: UpdateReportsStatusDto) => {
    const queryParams = new URLSearchParams({
      status: reports.status,
      report_ids: reports.report_ids.join(',')
    });
    const response = await fetch(baseUrl+`/reports?${queryParams}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error('Failed to update report');
    }
    return response.json();
  },

  deleteReport: async (id: string) => {
    const response = await fetch(baseUrl+`/reports/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('Failed to delete report');
    }
  },

  getUser: async (userId: string) => {
    const response = await fetch(baseUrl+`/users/id/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    return response.json();
  },

  getSource: async (sourceId: string) => {
    const response = await fetch(baseUrl+`/reports/source/${sourceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch source');
    }
    return response.json();
  },
}
