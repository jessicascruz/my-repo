import { AcquirerEnum, PaymentStatusEnum } from '@/domain/aggregates/order'
import moment from 'moment'
import { useCallback } from 'react'
import { useRoles } from './useRoles'

interface ICanRefundParams {
  acquirerId?: number
  paymentApprovedAt?: string
  paymentStatus?: PaymentStatusEnum
  refundedAmount: number
  amount: number
}

export const useCanRefund = () => {
  const { hasRoles } = useRoles()

  const canRefundPayment = useCallback(
    ({
      acquirerId,
      paymentApprovedAt,
      paymentStatus,
      refundedAmount,
      amount,
    }: ICanRefundParams) => {
      const isGetNet = acquirerId === AcquirerEnum.GETNET
      const withinRefundDateRange = isGetNet
        ? true
        : moment(new Date()).diff(moment(paymentApprovedAt), 'days') <= 180

      let allowedRefundStatus = false

      if (paymentStatus === PaymentStatusEnum.REFUNDED) {
        // Se já está reembolsado, só permite se tiver valor pendente para reembolsar
        allowedRefundStatus = refundedAmount < amount
      } else {
        // Para outros status, verifica se é AUTHORIZED ou CONFIRMED
        allowedRefundStatus = paymentStatus
          ? [
              PaymentStatusEnum.AUTHORIZED,
              PaymentStatusEnum.CONFIRMED,
            ].includes(paymentStatus)
          : false
      }

      const allowedRefundRoles = hasRoles([
        'multipay:payment-refund',
        'multipay:admin',
      ])

      const allowedRefundAmount = refundedAmount < amount

      return (
        withinRefundDateRange &&
        allowedRefundStatus &&
        allowedRefundRoles &&
        allowedRefundAmount
      )
    },
    [hasRoles]
  )

  return { canRefundPayment }
}
