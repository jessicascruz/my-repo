import { Container, Paper, Typography } from '@mui/material'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode | ReactNode[]
  title?: string
}

export const CollapsableListContainer = ({ children, title }: Props) => {
  return (
    <Container
      disableGutters
      sx={{
        flex: 1,
        pb: 2,
        overflow: 'auto',
        maxWidth: '100% !important',
        width: '100%',
        paddingLeft: { xs: 0, sm: 2 },
        paddingRight: { xs: 0, sm: 2 },
      }}
    >
      <Paper sx={{ p: 2, borderRadius: 2, border: '1px solid #E0E0E0', mb: 4 }}>
        {title && (
          <Typography
            variant="h4"
            sx={{
              fontWeight: '500',
              color: '#454545',
              fontSize: '1.5rem',
              mb: 2,
            }}
          >
            {title}
          </Typography>
        )}
        {children}
      </Paper>
    </Container>
  )
}
