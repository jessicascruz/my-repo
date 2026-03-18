import React from 'react'
import {
  Modal,
  Box,
  Typography,
  Button,
  Stack,
  LinearProgress,
  CircularProgress,
} from '@mui/material'

type ConfirmModalProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title?: string
  message?: string
  isLoading: boolean
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  onClose,
  onConfirm,
  isLoading,
  title = 'Atenção',
  message = 'Você tem certeza que deseja realizar essa ação?',
}) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute' as const,
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <Typography sx={{ fontWeight: 'bold' }} variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography variant="body1">{message}</Typography>

        <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
          <Button
            disabled={isLoading}
            onClick={onClose}
            variant="outlined"
            color="secondary"
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {!isLoading ? (
              'Confirmar'
            ) : (
              <CircularProgress size={20} color="primary" />
            )}
          </Button>
        </Stack>
      </Box>
    </Modal>
  )
}

export default ConfirmModal
