import {ReportStatus} from "@/enums";

export interface UpdateReportsStatusDto {
  report_ids: string[];
  status: ReportStatus;
}
