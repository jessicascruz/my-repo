import { reactQueryEnum } from '@/domain/seedWork/libs/reactQuery/reactQuery.enums'
import { useQuery } from '@tanstack/react-query'
import { ManualPaymentRepository, IGetManualPaymentParams } from '@/infra/repositories/ManualPaymentRepository'
import useLoaders from './useLoaders'
import { useEffect } from 'react'

export const useGetManualPaymentByOrderId = (params: IGetManualPaymentParams) => {
  const { startLoading, stopLoading } = useLoaders()
  const repository = new ManualPaymentRepository()

  const query = useQuery({
    queryKey: [reactQueryEnum.GET_MANUAL_PAYMENTS, params.orderId, params.reference, params.subReference],
    queryFn: () => repository.getManualPaymentByOrderId(params),
    enabled: !!params.orderId,
  })

  useEffect(() => {
    if (query.isFetching) {
      startLoading()
    } else {
      stopLoading()
    }
  }, [query.isFetching, startLoading, stopLoading])

  return query
}
