import { queryOptions } from '@tanstack/react-query'
import { reactQueryEnum } from './reactQuery.enums'
import { Filter } from '@/domain/aggregates/filter/filter'
import { OrderRepository } from '@/infra/repositories/OrderRepository'

export const filterOptions = (filter: Filter) => {
  return queryOptions({
    queryKey: [reactQueryEnum.GET_ORDERS, filter],
    queryFn: () => new OrderRepository().getOrdersByFilter(filter),
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
}

export const detailsOptions = (orderId: string, retrieveRefunds: boolean = false) => {
  return queryOptions({
    queryKey: [reactQueryEnum.GET_ORDER_DETAILS, orderId],
    queryFn: () => new OrderRepository().getOrderDetails(orderId, retrieveRefunds),
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  })
}
