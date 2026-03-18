import { reactQueryEnum } from '@/domain/seedWork/libs/reactQuery/reactQuery.enums'
import { OrderRepository } from '@/infra/repositories/OrderRepository'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import useLoaders from './useLoaders'

export const useRefundPayment = () => {
  const queryClient = useQueryClient()
  const { startLoading, stopLoading } = useLoaders()

  return useMutation({
    onMutate: () => {
      startLoading()
    },
    mutationFn: new OrderRepository().refundOrderPayment,
    onSuccess: async (_, { orderId }) => {
      await queryClient.invalidateQueries({
        queryKey: [reactQueryEnum.GET_ORDER_DETAILS, orderId],
      })

      toast.success('Pagamento reembolsado com sucesso.')
      stopLoading()
    },
    onError: error => {
      console.error(error)
      toast.error('Erro ao reembolsar pagamento.')
      stopLoading()
    },
  })
}
