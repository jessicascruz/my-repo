import React, { useEffect, useState } from 'react'
import { Box, Typography, Icon } from '@mui/material'

export default function EnvironmentBanner() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const ddEnv = process.env.NEXT_PUBLIC_DD_ENV?.toUpperCase()
  let environmentType, bannerColor, textColor, srcIcon

  switch (ddEnv) {
    case 'QA':
      environmentType = 'QA'
      bannerColor = '#DE771E'
      textColor = '#FFF4E4'
      srcIcon = '/alert-banner-vector-qa.svg'
      break
    case 'PROD':
      environmentType = null
      break
    default:
      environmentType = 'DEV'
      bannerColor = '#D8CCFF'
      textColor = '#5000BE'
      srcIcon = '/alert-banner-vector-dev.svg'
      break
  }

  if (!environmentType) {
    return null
  } else {
    return (
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          width: '100%',
          zIndex: 50,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 0.2,
          px: 4,
          py: 2,
          bgcolor: bannerColor,
          maxHeight: '1vh',
          '@media (max-width:420px)': {
            flexDirection: 'row',
            flexWrap: 'wrap',
            fontSize: '0.8rem',
            gap: 0.5,
            py: 2,
            px: 0.5,
            maxHeight: '25vh',
          },
          '@media (max-width:450px)': {
            px: 2,
            py: 2,
          },
        }}
      >
        <Icon sx={{ display: 'flex', alignItems: 'center' }}>
          <img
            src={srcIcon}
            alt="ícone de atenção (sinal de exclamação)"
            style={{ height: '1rem', width: 'auto' }}
          />
        </Icon>

        <Typography
          variant="body1"
          fontWeight="600"
          fontSize="0.8rem"
          fontFamily="inter"
          color={textColor}
          sx={{ letterSpacing: '0.02rem' }}
        >
          {' '}
          Você está no ambiente de {environmentType}
        </Typography>
      </Box>
    )
  }
}
