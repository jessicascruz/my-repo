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
  fontWeight: 600,
})

export const ConfirmationModal = ({
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
          justifyContent: 'center',
          p: 2,
          ...contentSx,
        }}
      >
        {description && (
          <Typography sx={{ fontSize: 18, textAlign: 'center' }}>
            {description}
          </Typography>
        )}
        {children}
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
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
