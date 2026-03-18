export type StatusType =
  | 'CREATED'
  | 'VIEWED'
  | 'PENDING'
  | 'AUTHORIZED'
  | 'CONFIRMED'
  | 'DETECTION'
  | 'RECOVERY'
  | 'CANCELED'
  | 'DENIED'
  | 'REFUNDED'
  | 'EXPIRED'
  | 'CHARGED_BACK'
  | 'MANUAL_CONFIRMED'
export const StatusTypeLabels: Record<StatusType, string> = {
  CREATED: 'Criado',
  VIEWED: 'Visualizado',
  PENDING: 'Pendente',
  AUTHORIZED: 'Autorizado',
  CONFIRMED: 'Confirmado',
  DETECTION: 'Detectado',
  RECOVERY: 'Recuperação',
  CANCELED: 'Cancelado',
  DENIED: 'Negado',
  REFUNDED: 'Estornado',
  EXPIRED: 'Expirado',
  CHARGED_BACK: 'Contestado',
  MANUAL_CONFIRMED: 'Confirmado Manual',
}
