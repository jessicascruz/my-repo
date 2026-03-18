'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Filter, FilterPaging } from '@/domain/aggregates/filter/filter'
import { Sort, SortCriteria } from '@/domain/aggregates/filter/sort'
import ButtonFilter from '@/presentation/components/forRoutes/home/components/filter/RefreshFilter'

export const FilterContext = createContext<{
  filterData: Filter
  handleClearFilter: () => void
  setFilter: (data: Partial<Filter>) => void
  isEmptyFilter: boolean
}>({
  filterData: {} as Filter,
  handleClearFilter: () => {},
  setFilter: () => {},
  isEmptyFilter: false,
})

export const useFilterContext = () => useContext(FilterContext)

export const FilterProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filterData, setFilterData] = useState<Filter>({} as Filter)

  const setFilter = (data: Partial<Filter>) => {
    const newFilter = new Filter({ ...filterData, ...data })
    router.replace(`?${newFilter.toQueryString()}`)
    setFilterData(newFilter)
  }

  useEffect(() => {
    const params = Object.fromEntries(searchParams.entries())

    setFilter({
      ...params,
      paging: new FilterPaging(
        +params.page || undefined,
        +params.perPage || undefined,
        (params.sort as Sort) || undefined,
        (params.sortCriteria as SortCriteria) || undefined
      ),
    })
  }, [])

  const isEmptyFilter = !Object.keys(filterData).some(
    key => key !== 'paging' && filterData[key as keyof Filter]
  )

  const handleClearFilter = () => {
    const params = Object.fromEntries(searchParams.entries())

    setFilter({
      ...new Filter({
        paging: new FilterPaging(
          +params.page || undefined,
          +params.perPage || undefined,
          (params.sort as Sort) || undefined,
          (params.sortCriteria as SortCriteria) || undefined
        ),
      }),
    })
  }

  const contextValue = useMemo(
    () => ({
      filterData,
      handleClearFilter,
      setFilter,
      isEmptyFilter,
    }),
    [filterData, handleClearFilter, setFilter, isEmptyFilter]
  )

  return (
    <FilterContext.Provider value={contextValue}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {children}
      </div>
    </FilterContext.Provider>
  )
}
