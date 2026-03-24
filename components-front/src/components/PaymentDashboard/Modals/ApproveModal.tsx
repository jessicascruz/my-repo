import React from 'react';
import { Dialog, DialogContent, DialogContentText, DialogActions, Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ApproveModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ApproveModal({ open, onClose, onConfirm }: ApproveModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="approve-dialog-title"
      aria-describedby="approve-dialog-description"
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3, boxShadow: 6 } }}
    >
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography id="approve-dialog-title" variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Confirmar Aprovação
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <DialogContentText id="approve-dialog-description" sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          Tem certeza que deseja aprovar este pagamento? Esta ação não poderá ser desfeita.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50' }}>
        <Button 
          onClick={onClose} 
          variant="outlined" 
          sx={{ color: 'text.primary', borderColor: 'grey.300', textTransform: 'none' }}
        >
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="success" 
          sx={{ textTransform: 'none' }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
