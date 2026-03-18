import { reactQueryEnum } from '@/domain/seedWork/libs/reactQuery/reactQuery.enums'
import { PaymentRepository } from '@/infra/repositories/PaymentRepository'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

export const useConfirmPayment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: new PaymentRepository().confirmPayment,
    onSuccess: async (_, { body: { orderId } }) => {
      await queryClient.invalidateQueries({
        queryKey: [reactQueryEnum.GET_ORDER_DETAILS, orderId],
      })

      toast.success('Pagamento realizado com sucesso.')
    },
    onError: () => {
      toast.error(
        'Ocorreu um erro com a confirmação de pagamento, por favor tente novamente.'
      )
    },
  })
}
