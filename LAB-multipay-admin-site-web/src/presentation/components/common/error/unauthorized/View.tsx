import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import React from 'react' // Importe ReactNode
import UnauthorizedSVG from './unauthorized-page-image.svg'

const UnauthorizedView: React.FC = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      height={'100vh'}
      justifyContent="center"
      textAlign="center"
      padding={{ xs: '5rem', md: '12rem', lg: '2rem' }}
    >
      <Typography variant="h3" color={'#0050D7'}>
        403
      </Typography>
      <Typography variant="h5" color={'#6D6D6D'}>
        Acesso Restrito
      </Typography>
      <Box>
        <Typography variant="body1" color={'#6D6D6D'}>
          Você não possui permissão para acessar este recurso.
        </Typography>
        <Typography variant="body1" color={'#6D6D6D'}>
          Entre em contato com o seu gestor ou o setor de TI.
        </Typography>
      </Box>
      <Box my={4}>
        <Image
          alt="Não autorizado"
          src={UnauthorizedSVG}
          width={200}
          height={200}
        />
      </Box>
    </Box>
  )
}

export default UnauthorizedView
