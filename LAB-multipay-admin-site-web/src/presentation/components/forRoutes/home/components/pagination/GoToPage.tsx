import { FilterPaging } from '@/domain/aggregates/filter/filter'
import { isNumber } from '@/domain/seedWork/validators/isNumber'
import { useFilterContext } from '@/presentation/context/filter-context'

import { Box, TextField } from '@mui/material'

const GoToPage = () => {
  const { setFilter, filterData } = useFilterContext()

  const handleChangeGoToPage = (value: string) => {
    if (value !== '' && isNumber(value))
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
    <>
      <Box component="span">Ir para página: </Box>
      <TextField
        onBlur={event => handleChangeGoToPage(event.target.value)}
        onKeyUp={event => {
          if (event.key === 'Enter') {
            handleChangeGoToPage((event.target as HTMLInputElement).value)
          }
        }}
        variant="standard"
        size="small"
        style={{ marginLeft: '8px', width: '60px' }}
      />
    </>
  )
}

export default GoToPage
