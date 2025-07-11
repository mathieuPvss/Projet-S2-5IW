import type { ReportStatus } from '@/enums/ReportStatus.enum';

export interface UpdateReportDto {
  status?: ReportStatus;
  description?: string;
}
