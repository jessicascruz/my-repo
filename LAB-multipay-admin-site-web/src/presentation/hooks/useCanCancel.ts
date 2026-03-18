import { StatusType } from '@/domain/aggregates/status'
import { useCallback } from 'react'
import { useRoles } from './useRoles'

interface ICanCancelParams {
  orderStatus?: StatusType
}

export const useCanCancel = () => {
  const { hasRoles } = useRoles()

  const canCancelOrder = useCallback(
    ({ orderStatus }: ICanCancelParams) => {
      // Verifica se o status da ordem está entre os permitidos
      const allowedCancelStatus = orderStatus
        ? ['CREATED', 'VIEWED', 'RECOVERY'].includes(orderStatus)
        : false

      // Verifica se o usuário tem a role necessária
      const allowedCancelRoles = hasRoles([
        'multipay:admin',
        'multipay:single-receivable-order-status-update',
      ])

      return allowedCancelStatus && allowedCancelRoles
    },
    [hasRoles]
  )

  return { canCancelOrder }
}