'use client'
import Grid2 from '@mui/material/Grid2'
import ButtonFilter from '../filter/Filter'
import RenderFilters from '../filter/RenderFilters'
const SearchToolbar = () => {
  return (
    <Grid2
      data-testid="grid-container"
      container
      spacing={1}
      justifyContent="space-between"
      alignItems="center"
      maxWidth="100%"
      style={{
        margin: '12px 1rem',
        backgroundColor: '#fff',
        boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.1)',
        padding: '1rem',
      }}

    >
      <RenderFilters />
      <ButtonFilter />
    </Grid2>
  )
}

export default SearchToolbar
