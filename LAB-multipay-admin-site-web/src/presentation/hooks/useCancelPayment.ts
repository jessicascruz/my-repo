import { reactQueryEnum } from '@/domain/seedWork/libs/reactQuery/reactQuery.enums'
import { PaymentRepository } from '@/infra/repositories/PaymentRepository'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import useLoaders from './useLoaders'

export const useCancelPayment = () => {
  const queryClient = useQueryClient()
  const { startLoading, stopLoading } = useLoaders()

  return useMutation({
    onMutate: () => {
      startLoading()
    },
    mutationFn: new PaymentRepository().cancelPayment,
    onSuccess: async (_, { body: { orderId } }) => {
      await queryClient.invalidateQueries({
        queryKey: [reactQueryEnum.GET_ORDER_DETAILS, orderId],
      })

      toast.success('Pagamento cancelado com sucesso.')
      stopLoading()
    },
    onError: error => {
      console.error(error)
      toast.error('Ocorreu um erro com o cancelamento de pagamento, por favor tente novamente.')
      stopLoading()
    },
  })
}
