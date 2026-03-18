import { Box } from '@mui/material'
import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}
const BottomBarContent = ({ children }: Props) => {
  return (
    <Box
      display={'flex'}
      justifyContent={'space-between'}
      alignItems={'center'}
    >
      {children}
    </Box>
  )
}

export default BottomBarContent
