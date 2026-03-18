import { reactQueryEnum } from '@/domain/seedWork/libs/reactQuery/reactQuery.enums'
import { OrderRepository, ICancelOrderParams } from '@/infra/repositories/OrderRepository'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import useLoaders from './useLoaders'

export const useCancelOrder = () => {
  const queryClient = useQueryClient()
  const { startLoading, stopLoading } = useLoaders()

  return useMutation<void, Error, ICancelOrderParams>({
    mutationFn: async (params: ICancelOrderParams) => {
      return new OrderRepository().cancelOrder(params)
    },
    onMutate: () => {
      startLoading()
    },
    onSuccess: async (_, variables) => {
      const { orderId } = variables

      await queryClient.invalidateQueries({
        queryKey: [reactQueryEnum.CANCEL_ORDER, orderId],
      })

      await queryClient.refetchQueries({
        queryKey: [reactQueryEnum.GET_ORDER_DETAILS, orderId],
      })

      toast.success('Ordem cancelada com sucesso.')
      stopLoading()
    },
    onError: error => {
      console.error(error)
      toast.error('Ocorreu um erro com o cancelamento da ordem, por favor tente novamente.')
      stopLoading()
    },
  })
}