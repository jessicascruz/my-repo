import React from 'react'
import {
  Dialog,
  DialogContent,
  Typography,
  Box,
  IconButton,
  Button
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import FactCheckIcon from '@mui/icons-material/FactCheck'
import { IManualPayment, ManualPaymentStatusEnum } from '@/domain/aggregates/order'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'

interface DetailsManualPaymentApprovalModalProps {
  open: boolean
  onClose: () => void
  payment: IManualPayment | null
}

export const DetailsManualPaymentApprovalModal: React.FC<DetailsManualPaymentApprovalModalProps> = ({
  open,
  onClose,
  payment
}) => {
  if (!payment) return null

  const isAprovado = payment.status.id === 2
  const isRecusado = payment.status.id === 3

  const approval = payment.approvals && payment.approvals.length > 0 
    ? payment.approvals[payment.approvals.length - 1] 
    : null

  const approverId = approval?.requester?.id || '-'
  const approverName = approval?.requester?.name || 'Aprovador Sistema'
  const approverEmail = approval?.requester?.email || 'aprovador@empresa.com.br'
  const reason = approval?.rejectionReason || payment.reason || 'Nenhum motivo informado.'
  const approvalDate = payment.approvedAt ? isoToLocalePtBr(payment.approvedAt) : 'Aguardando'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: '12px', overflow: 'hidden' } }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography sx={{ fontSize: '1.125rem', fontWeight: 700, color: '#1f2937', display: 'flex', alignItems: 'center', gap: 1 }}>
          <FactCheckIcon sx={{ color: '#2563eb' }} />
          Detalhes da Análise
        </Typography>
        <IconButton onClick={onClose} sx={{ color: '#9ca3af', '&:hover': { color: '#4b5563' } }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Box>
          <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1.5 }}>
            Dados do Aprovador
          </Typography>
          <Box sx={{ bgcolor: 'rgba(239, 246, 255, 0.5)', borderRadius: '8px', p: 2, border: '1px solid #dbeafe', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', mb: 0.5 }}>Id</Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937' }}>{approverId}</Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', mb: 0.5 }}>Nome</Typography>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#1f2937', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{approverName}</Typography>
            </Box>
            <Box sx={{ gridColumn: 'span 2' }}>
              <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', mb: 0.5 }}>E-mail</Typography>
              <Typography sx={{ fontSize: '0.75rem', color: '#6b7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{approverEmail}</Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
              Status
            </Typography>
            <Box sx={{
              display: 'inline-flex', alignItems: 'center', px: 1.5, py: 0.5, borderRadius: '9999px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase',
              ...(isAprovado && { bgcolor: '#dcfce7', color: '#15803d' }),
              ...(isRecusado && { bgcolor: '#fee2e2', color: '#b91c1c' })
            }}>
              {payment.status.description}
            </Box>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
              Data de Aprovação
            </Typography>
            <Typography sx={{ fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
              {approvalDate}
            </Typography>
          </Box>
        </Box>

        {!isAprovado && (
          <Box>
            <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', mb: 1 }}>
              Motivo
            </Typography>
            <Box sx={{ bgcolor: '#f9fafb', borderRadius: '8px', p: 2, border: '1px solid #e5e7eb' }}>
              <Typography sx={{ fontSize: '0.875rem', color: '#4b5563', fontStyle: 'italic', lineHeight: 1.6 }}>
                {reason}
              </Typography>
            </Box>
          </Box>
        )}
      </DialogContent>

      <Box sx={{ px: 3, py: 2, bgcolor: '#f9fafb', display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={onClose} sx={{ bgcolor: '#2563eb', color: 'white', px: 3, py: 1, textTransform: 'none', fontWeight: 600, fontSize: '0.875rem', borderRadius: '8px', boxShadow: 1, '&:hover': { bgcolor: '#1d4ed8' } }}>
          Fechar
        </Button>
      </Box>
    </Dialog>
  )
}
