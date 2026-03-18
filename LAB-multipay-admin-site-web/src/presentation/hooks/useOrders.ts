import { filterOptions } from '@/domain/seedWork/libs/reactQuery/options'
import { Search } from '@/domain/seedWork/paging/Search'
import { useQuery } from '@tanstack/react-query'
import { IReceivableResponse } from '@/domain/aggregates/order'
import { useFilterContext } from '../context/filter-context'
import { useEffect } from 'react'
import useLoaders from './useLoaders'

export const useOrders = () => {
  const { filterData } = useFilterContext()
  const { startLoading, stopLoading } = useLoaders()
  const {
    data: searchLinks,
    error,
    isLoading,
  } = useQuery(filterOptions(filterData))

  const defaultSearchFilteredLinks = new Search<IReceivableResponse>()

  useEffect(() => {
    if (isLoading) {
      startLoading()
    } else {
      stopLoading()
    }
  }, [isLoading])

  const orders = searchLinks?.data || defaultSearchFilteredLinks.data
  const paging = searchLinks?.paging || defaultSearchFilteredLinks.paging

  return {
    orders,
    isLoading,
    paging,
    error,
  }
}
