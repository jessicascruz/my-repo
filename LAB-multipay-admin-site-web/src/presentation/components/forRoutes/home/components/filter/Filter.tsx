import FilterAltIcon from '@mui/icons-material/FilterAlt'
import { Button, Grid2 } from '@mui/material'
import { useCallback, useState } from 'react'
import { ClearFilter } from './ClearFilters'
import Formulary from './Formulary'
import RefreshFilter from './RefreshFilter'

const ButtonFilter = () => {
  const [open, setOpen] = useState(false)

  const handleClickOpen = useCallback(() => {
    setOpen(true)
  }, [])

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <Grid2>
      <Grid2 display="flex" flexDirection="row" gap={1}>
        <RefreshFilter />
        <Button
          variant="contained"
          size="medium"
          startIcon={<FilterAltIcon />}
          sx={{
            color: '#fff',
            background: '#0050D7',
            border: '1px solid #D1D1D1',
            boxShadow: 'none',
            borderRadius: 2,
            fontSize: 12,
            fontWeight: 600,
            mx: 0,
          }}
          onClick={handleClickOpen}
        >
          Filtros
        </Button>
        <ClearFilter />
      </Grid2>
      <Grid2>
        <Formulary open={open} handleClose={handleClose} />
      </Grid2>
    </Grid2>
  )
}

export default ButtonFilter
