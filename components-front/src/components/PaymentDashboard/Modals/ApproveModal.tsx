import React from 'react';
import { Dialog, DialogContent, DialogContentText, DialogActions, Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ApproveModal({ open, onClose, onConfirm }: Props) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: 6 } }}>
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
          Confirmar Aprovação
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 3 }}>
        <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
          Tem certeza que deseja aprovar este pagamento? Esta ação não poderá ser desfeita e a comunicação com a API será iniciada.
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
          sx={{ textTransform: 'none', bgcolor: '#2E7D32', '&:hover': { bgcolor: '#1b5e20' } }}
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
