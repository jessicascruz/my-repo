import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Typography, Box, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { User } from '../../../types/payment';

interface Props {
  open: boolean;
  onClose: () => void;
  user: User | null;
}

export function RequesterModal({ open, onClose, user }: Props) {
  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: 24, overflow: 'hidden', maxWidth: 'md' } }}>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: 1, borderColor: 'grey.100', m: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Informações do Solicitante
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'primary.main', '&:hover': { color: 'primary.dark' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 4 }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', rowGap: 4, columnGap: 6 }}>
          <Box>
            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>ID Solicitante</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '1rem' }}>{user.id}</Typography>
          </Box>
          <Box>
            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>Nome Solicitante</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '1rem' }}>{user.nome}</Typography>
          </Box>
          <Box sx={{ gridColumn: 'span 2' }}>
            <Typography component="label" sx={{ display: 'block', fontSize: '0.875rem', fontWeight: 'bold', color: 'text.primary', mb: 0.5 }}>E-mail Solicitante</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '1rem' }}>{user.email}</Typography>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, bgcolor: 'grey.50', justifyContent: 'flex-end' }}>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white', 
            borderRadius: 2, 
            px: 3, 
            py: 1, 
            fontWeight: 500, 
            textTransform: 'none',
            '&:hover': { bgcolor: 'primary.dark' } 
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
