import { detailsOptions } from '@/domain/seedWork/libs/reactQuery/options'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import useLoaders from './useLoaders'

export const useOrderDetails = (id: string, retrieveRefunds: boolean = false) => {
  const { data, error, isLoading } = useQuery(detailsOptions(id, retrieveRefunds))
  const { startLoading, stopLoading } = useLoaders()
  useEffect(() => {
    if (isLoading) {
      startLoading()
    } else {
      stopLoading()
    }
  }, [isLoading])

  return {
    order: data?.data[0],
    isLoading,
    error,
  }
}
