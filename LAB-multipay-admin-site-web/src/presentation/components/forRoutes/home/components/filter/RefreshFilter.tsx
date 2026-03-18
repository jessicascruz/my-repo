'use client'

import RefreshIcon from '@mui/icons-material/Refresh'
import { Button, Grid2 } from '@mui/material'
import { useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import Formulary from './Formulary'

const RefreshFilter = () => {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleClose = useCallback(() => {
    setOpen(false)
  }, [])

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <Button
      variant="contained"
      size="medium"
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
      onClick={handleReload}
    >
      <RefreshIcon />
    </Button>
  )
}

export default RefreshFilter
