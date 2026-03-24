import React from 'react';
import { Dialog, DialogContent, DialogActions, IconButton, Typography, Box, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import { PaymentRequest } from '../../../types/payment';
import { StatusBadge } from '../StatusBadge';

interface DetailsModalProps {
  open: boolean;
  onClose: () => void;
  payment: PaymentRequest | null;
}

export function DetailsModal({ open, onClose, payment }: DetailsModalProps) {
  if (!payment) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="details-dialog-title"
      aria-describedby="details-dialog-description"
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: 6
        }
      }}
    >
      <Box sx={{ px: 3, py: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography id="details-dialog-title" variant="h6" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5, fontSize: '1.125rem' }}>
          <Box sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 1, display: 'flex', p: 0.5 }}>
            <FactCheckIcon sx={{ fontSize: 20 }} />
          </Box>
          Detalhes da Análise
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent id="details-dialog-description" sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', mb: 1.5 }}>
            DADOS DO APROVADOR
          </Typography>
          <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2.5, border: 1, borderColor: 'divider', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2.5 }}>
            <Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>ID</Typography>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 500 }}>{payment.aprovador?.id || '-'}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>NOME</Typography>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 500 }}>{payment.aprovador?.nome || 'Aprovador Sistema'}</Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 2' }}>
              <Typography sx={{ fontSize: '0.65rem', fontWeight: 700, color: 'text.secondary', mb: 0.5 }}>E-MAIL</Typography>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>{payment.aprovador?.email || '-'}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', mb: 1.5 }}>STATUS</Typography>
            <StatusBadge status={payment.status} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', mb: 1.5 }}>DATA DE APROVAÇÃO</Typography>
            <Typography sx={{ fontSize: '0.875rem', color: 'text.primary', fontWeight: 500 }}>{payment.aprovacaoEm || '-'}</Typography>
          </Box>
        </Box>

        {payment.status === 'RECUSADO' && (
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', letterSpacing: '0.05em', mb: 1.5 }}>MOTIVO</Typography>
            <Box sx={{ bgcolor: 'grey.50', borderRadius: 2, p: 2.5, border: 1, borderColor: 'divider' }}>
              <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary', fontStyle: 'italic', lineHeight: 1.6 }}>
                {payment.motivo || 'Nenhum motivo informado.'}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, bgcolor: 'grey.50', borderTop: 1, borderColor: 'divider' }}>
        <Button 
          onClick={onClose} 
          variant="contained" 
          color="primary"
          sx={{ 
            textTransform: 'none', 
            boxShadow: 'none', 
            borderRadius: 2, 
            px: 3, 
            fontWeight: 600 
          }}
        >
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
