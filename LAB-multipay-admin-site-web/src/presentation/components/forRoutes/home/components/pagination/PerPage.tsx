import { FilterPaging } from '@/domain/aggregates/filter/filter'
import { useFilterContext } from '@/presentation/context/filter-context'
import { Box, MenuItem, TextField } from '@mui/material'
import React from 'react'

const cardsPerPageOptions = [10, 20, 30, 50, 100]

const PerPage = ({ total }: { total: number }) => {
  const { setFilter, filterData } = useFilterContext()

  const handleCardsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const perPage = parseInt(event.target.value)
    const currentPage = Number(filterData?.paging?.page) || 1

    const lastPage = Math.ceil(total / perPage)
    const newPage = Math.min(currentPage, lastPage)

    setFilter({
      paging: new FilterPaging(
        newPage,
        perPage || undefined,
        filterData?.paging.sort,
        filterData?.paging.sortCriteria
      ),
    })
  }

  return (
    <>
      <Box component="span">Cards por Registros: </Box>
      <TextField
        select
        onChange={handleCardsPerPageChange}
        variant="standard"
        slotProps={{ htmlInput: { MenuProps: { disableScrollLock: true } } }}
        size="small"
        value={+filterData?.paging.perPage}
        style={{ marginLeft: '8px' }}
      >
        {cardsPerPageOptions.map(option => (
          <MenuItem
            key={option}
            value={option}
            selected={String(option) === String(filterData?.paging.perPage)}
          >
            {option}
          </MenuItem>
        ))}
      </TextField>
    </>
  )
}

export default PerPage
