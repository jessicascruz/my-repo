import { reactQueryEnum } from '@/domain/seedWork/libs/reactQuery/reactQuery.enums'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import useLoaders from './useLoaders'
import { ManualPaymentRepository, ICreateManualPaymentParams } from '@/infra/repositories/ManualPaymentRepository'

export const useCreateManualPayment = () => {
  const queryClient = useQueryClient()
  const { startLoading, stopLoading } = useLoaders()

  return useMutation<void, Error, ICreateManualPaymentParams>({
    mutationFn: async (params: ICreateManualPaymentParams) => {
      return new ManualPaymentRepository().createManualPayment(params)
    },
    onMutate: () => {
      startLoading()
    },
    onSuccess: async (_, variables) => {
      const { orderId } = variables

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
      stopLoading()
    },
  })
}
