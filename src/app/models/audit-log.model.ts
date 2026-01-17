export interface AuditLog {
  id: number;
  timestamp: Date;
  user: string;
  action: string;
  entity: string;
  details: string;
}

