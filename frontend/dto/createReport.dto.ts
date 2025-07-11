import type { ReportStatus } from "@/enums/ReportStatus.enum";

export interface CreateReportDto {
  document_id: string;
  user_id: string;
  description: string;
  status: ReportStatus;
}
