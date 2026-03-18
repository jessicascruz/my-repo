import { FilterPaging } from '@/domain/aggregates/filter/filter'
import { useFilterContext } from '@/presentation/context/filter-context'
import { Pagination } from '@mui/material'

const Pages = ({ page, count }: { page: number; count: number }) => {
  const { setFilter, filterData } = useFilterContext()

  const handlePageChange = (_: any, value: number) => {
    setFilter({
      paging: new FilterPaging(
        +value || undefined,
        filterData?.paging.perPage,
        filterData?.paging.sort,
        filterData?.paging.sortCriteria
      ),
    })

    // setPage(+value)
  }

  return (
    <Pagination
      count={count}
      page={page}
      color="primary"
      showFirstButton
      showLastButton
      onChange={handlePageChange}
    />
  )
}

export default Pages
