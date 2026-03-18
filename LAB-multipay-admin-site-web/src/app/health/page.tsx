import { Box, Container, Typography } from '@mui/material'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function NotFound() {
  return (
    <Container
      className={inter.className}
      maxWidth={false}
      disableGutters
      sx={{
        height: 'calc(100vh - 65px)',
        display: 'flex',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        flexDirection: {
          xs: 'column',
          md: 'row',
        },
        px: 2,
        gap: 4,
        textAlign: {
          xs: 'center',
          md: 'left',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'center',
            md: 'flex-start',
          },
          flexDirection: 'column',
          maxWidth: 500,
        }}
      >
        <Typography fontWeight="bold" color="#0050D7" variant="h4" gutterBottom>
          200
        </Typography>
        <Typography fontWeight="400" color="#6D6D6D">
          A aplicação está online e funcionando corretamente. Nenhuma ação é
          necessária no momento.
        </Typography>
      </Box>
    </Container>
  )
}
