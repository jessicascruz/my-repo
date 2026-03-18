import React, { useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, IconButton, Typography, Box, TextField } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function RejectModal({ open, onClose, onConfirm }: Props) {
  const [reason, setReason] = useState('');
  const minChars = 30;
  const isValid = reason.trim().length >= minChars;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(reason);
      setReason('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: 6 } }}>
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>Rejeitar Pagamento</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Por favor, informe o motivo da rejeição para o solicitante (mínimo 30 caracteres).
        </Typography>
        <Box>
          <TextField
            multiline
            minRows={4}
            fullWidth
            placeholder="Digite aqui o motivo detalhado..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            error={!isValid && reason.length > 0}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              }
            }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            {!isValid && reason.length > 0 ? (
              <Typography variant="caption" sx={{ color: 'error.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ErrorOutlineIcon fontSize="inherit" />
                O motivo deve ter pelo menos 30 caracteres.
              </Typography>
            ) : (
              <Box />
            )}
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {reason.length} / {minChars}
            </Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
        <Button onClick={onClose} variant="outlined" sx={{ color: 'text.primary', borderColor: 'grey.300', textTransform: 'none' }}>
          Cancelar
        </Button>
        <Button onClick={handleConfirm} disabled={!isValid} variant="contained" color="error" sx={{ textTransform: 'none', bgcolor: isValid ? '#D32F2F' : undefined }}>
          Confirmar Rejeição
        </Button>
      </DialogActions>
    </Dialog>
  );
}
