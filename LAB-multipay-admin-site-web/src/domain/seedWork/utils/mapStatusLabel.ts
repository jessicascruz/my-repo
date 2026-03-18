import { PaymentStatusEnum } from '@/domain/aggregates/order'

const mapStatusLabel = (status: PaymentStatusEnum) => {
  const statusLabel = {
    PENDING: 'Pendente',
    AUTHORIZED: 'Autorizado',
    CONFIRMED: 'Confirmado',
    CANCELED: 'Cancelado',
    DENIED: 'Negado',
    CHARGED_BACK: 'Estornado',
    REJECTED: 'Rejeitado',
    ERROR: 'Erro',
    REFUNDED: 'Reembolsado',
    PARTIALLY_REFUNDED: 'Parcialmente reembolsado',
    MANUAL_CONFIRMED: 'Confirmado Manual',
  }

  return statusLabel[status as keyof typeof statusLabel]
}

export default mapStatusLabel
