import {
  Box,
  Button,
  CircularProgress,
  styled,
  SxProps,
  Typography,
} from '@mui/material'
import { ReactNode } from 'react'
import { DefaultModal } from '..'

interface Props {
  isOpen?: boolean
  onClose: VoidFunction
  onConfirm: VoidFunction
  title: string
  description?: string
  children?: ReactNode | ReactNode[]
  isLoading?: boolean
  containerSx?: SxProps
  contentSx?: SxProps
}

const ModalButton = styled(Button)({
  boxShadow: 'none',
  borderRadius: '100px',
  fontWeight: 650,
  width: 115,
  fontSize: 16,
  marginTop: 7,
  marginBottom: 0,
})

export const CancellationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading,
  children,
  containerSx,
  contentSx,
}: Props) => {
  const handleClose = () => {
    if (!isLoading) onClose()
  }

  return (
    <DefaultModal
      isOpen={isOpen}
      title={title}
      onClose={handleClose}
      disableCloseButton={isLoading}
      sx={containerSx}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-start',
          pt: 1,
          ...contentSx,
        }}
      >
        {description && (
          <Typography sx={{ fontSize: 15, textAlign: 'center', color: '#888888' }}>
            {description}
          </Typography>
        )}
        {children}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'flex-end',
          flexWrap: 'wrap',
          rowGap: 1,
          pt: 1,
        }}
      >
        <ModalButton
          disabled={isLoading}
          onClick={handleClose}
          variant="outlined"
          size="medium"
        >
          Cancelar
        </ModalButton>
        <ModalButton
          disabled={isLoading}
          onClick={onConfirm}
          variant="contained"
          size="medium"
        >
          {!isLoading ? (
            'Confirmar'
          ) : (
            <CircularProgress size={20} color="primary" />
          )}
        </ModalButton>
      </Box>
    </DefaultModal>
  )
}
