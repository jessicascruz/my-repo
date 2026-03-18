import { reactQueryEnum } from '@/domain/seedWork/libs/reactQuery/reactQuery.enums'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import useLoaders from './useLoaders'
import { IApprovalManualPaymentParams, ManualPaymentRepository } from '@/infra/repositories/ManualPaymentRepository'

export const useApprovalManualPayment = () => {
  const queryClient = useQueryClient()
  const { startLoading, stopLoading } = useLoaders()

  return useMutation<void, Error, IApprovalManualPaymentParams>({
    mutationFn: async (params: IApprovalManualPaymentParams) => {
      return new ManualPaymentRepository().approvalManualPayment(params)
    },
    onMutate: () => {
      startLoading()
    },
    onSuccess: async (_, variables) => {
      const { orderId, isApproved } = variables

      await queryClient.invalidateQueries({
        queryKey: [reactQueryEnum.GET_ORDER_DETAILS, orderId],
      })

      await queryClient.invalidateQueries({
        queryKey: [reactQueryEnum.GET_MANUAL_PAYMENTS],
      })

      
      stopLoading()
    },
    onError: error => {
      console.error(error)
      toast.error('Ocorreu um erro ao realizar a ação no pagamento manual, por favor tente novamente.')
      stopLoading()
    },
  })
}
