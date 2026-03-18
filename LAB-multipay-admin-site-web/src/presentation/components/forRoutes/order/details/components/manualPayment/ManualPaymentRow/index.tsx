import { IApproval, IManualPayment, IReceipt, ManualPaymentStatusEnum } from '@/domain/aggregates/order'
import { formatToBrlCurrency } from '@/domain/seedWork/utils/currencyFormat'
import { isoToLocalePtBr } from '@/domain/seedWork/utils/dateFormat'
import { Box, IconButton, TableCell, TableRow, Tooltip, Button, Chip } from '@mui/material'
import { RequesterModal } from '../../components/RequesterModal'
import { AttachmentsModal } from '../../components/AttachmentsModal'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'

interface ManualPaymentRowProps {
  data: IManualPayment
  files: IReceipt[]
  onApprove?: (manualPaymentId: string, isApproved: boolean) => void
  onViewDetails?: (payment: IManualPayment) => void
}


export const ManualPaymentRow = ({ data, files, onApprove, onViewDetails }: ManualPaymentRowProps) => {
  const manualPaymentStatus = data.status?.description === 'PENDING_APPROVAL' ? ManualPaymentStatusEnum.PENDING_APPROVAL :
    data.status?.description === 'APPROVED' ? ManualPaymentStatusEnum.APPROVED :
      data.status?.description === 'REJECTED' ? ManualPaymentStatusEnum.REJECTED :
        data.status?.description || 'N/A'

  const isPendente = manualPaymentStatus === ManualPaymentStatusEnum.PENDING_APPROVAL
  const isAprovado = manualPaymentStatus === ManualPaymentStatusEnum.APPROVED
  const isRecusado = manualPaymentStatus === ManualPaymentStatusEnum.REJECTED


  if (data.approvals?.length > 0) {
    data.approvals.forEach((approval: IApproval) => {
      console.log('approval', approval)
    })
  }


  const getStatusColorsName = () => {
    if (isPendente) return 'warning';
    if (isAprovado) return 'success';
    if (isRecusado) return 'error';
    return 'default';
  }

  return (
    <TableRow sx={{ '&:hover': { bgcolor: '#f9fafb' }, transition: 'background-color 0.2s' }}>
      <TableCell sx={{ textAlign: 'center', py: 2 }}>
        {isPendente ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
            <Button
              title="Aprovar"
              onClick={() => onApprove?.(data.id, true)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '9999px',
                color: 'white', fontSize: '10px', fontWeight: 'bold', bgcolor: '#2e7d32',
                boxShadow: 1, minWidth: 'auto', textTransform: 'none',
                '&:hover': { bgcolor: '#1b5e20', opacity: 0.9 }
              }}
            >
              <CheckCircleIcon sx={{ fontSize: '14px' }} />
              Aprovar
            </Button>
            <Button
              title="Rejeitar"
              onClick={() => onApprove?.(data.id, false)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5, px: 1.5, py: 0.5, borderRadius: '9999px',
                color: 'white', fontSize: '10px', fontWeight: 'bold', bgcolor: '#d32f2f',
                boxShadow: 1, minWidth: 'auto', textTransform: 'none',
                '&:hover': { bgcolor: '#c62828', opacity: 0.9 }
              }}
            >
              <CancelIcon sx={{ fontSize: '14px' }} />
              Rejeitar
            </Button>
          </Box>
        ) : (
          <Button
            onClick={() => onViewDetails?.(data)}
            sx={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, px: 2, py: 0.5,
              borderRadius: '9999px', color: '#1d4ed8', fontSize: '10px', fontWeight: 'bold',
              bgcolor: '#eff6ff', border: '1px solid #dbeafe', width: '100%', maxWidth: '140px', mx: 'auto',
              textTransform: 'none', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
              '&:hover': { bgcolor: '#dbeafe' }, whiteSpace: 'nowrap'
            }}
          >
            <InfoOutlinedIcon sx={{ fontSize: '16px' }} />
            Ver Detalhes
          </Button>
        )}
      </TableCell>

      <TableCell sx={{ color: '#4b5563', py: 2 }}>{data.id}</TableCell>

      <TableCell sx={{ py: 2 }}>
        <Chip
          sx={{ fontSize: '10px', fontWeight: 'bold' }}
          size='small'
          color={getStatusColorsName()}
          label={manualPaymentStatus}
          variant="outlined"
        />
      </TableCell>

      <TableCell sx={{ color: '#4b5563', py: 2 }}>
        <Tooltip title={data.reason || 'Sem motivo'} arrow placement="top">
          <Box
            sx={{
              maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              cursor: 'help'
            }}
          >
            {data.reason || '-'}
          </Box>
        </Tooltip>
      </TableCell>

      <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap', py: 2 }}>
        {formatToBrlCurrency(data.amount)}
      </TableCell>

      <TableCell sx={{ px: 2, py: 2 }}>
        <RequesterModal requester={data.requester} />
      </TableCell>

      <TableCell sx={{ px: 2, py: 2, textAlign: 'center' }}>
        <AttachmentsModal attachments={files} orderId={data.orderId} />
      </TableCell>

      <TableCell sx={{ color: '#6b7280', py: 2 }}>{isoToLocalePtBr(data.createdAt)}</TableCell>

      <TableCell sx={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.75rem', py: 2 }}>
        {data.approvals?.length > 0 ? isoToLocalePtBr(data.approvals[data.approvals.length - 1].createdAt) : 'Aguardando'}
      </TableCell>
    </TableRow>
  )
}
