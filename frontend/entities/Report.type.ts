import type { User } from './';
import { ReportStatus } from '@/enums/ReportStatus.enum';
export interface Report {
  id: string;
  user: User;
  document_id: string;
  description: string;
  status: ReportStatus;
}
