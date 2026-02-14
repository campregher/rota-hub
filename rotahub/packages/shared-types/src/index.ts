export type JobStatus =
  | 'OPEN'
  | 'ASSIGNED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'DISPUTE';

export type Marketplace = 'MERCADOLIVRE' | 'SHOPEE' | 'OTHER';
