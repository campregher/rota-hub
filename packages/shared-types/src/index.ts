export type UUID = string;

export type JobStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'DISPUTE';

export interface ApiError {
  message: string;
  error?: string;
  statusCode?: number;
}