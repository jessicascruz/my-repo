import { Box, useTheme } from '@mui/material'
import React, { ReactNode } from 'react'

interface Props {
  isFixed?: boolean
  children: ReactNode
}
const BottomBar = ({ isFixed = true, children }: Props) => {
  const theme = useTheme()
  return (
    <Box
      component="div"
      position={isFixed ? 'fixed' : 'relative'}
      bottom={0}
      left={0}
      width={'100%'}
      sx={{ backgroundColor: theme.palette.common.white }}
      borderTop={'1px solid #e0e0e0'}
      padding={'10px 24px'}
      zIndex={1000}
      data-testid="bottom-bar"
    >
      {children}
    </Box>
  )
}

export default BottomBar
