import React from 'react';
import { 
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Box,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { PaymentRequest, User, Attachment } from '../../types/payment';
import { StatusBadge } from './StatusBadge';
import { RejectModal } from './Modals/RejectModal';
import { ApproveModal } from './Modals/ApproveModal';
import { DetailsModal } from './Modals/DetailsModal';
import { RequesterModal } from './Modals/RequesterModal';
import { AttachmentModal } from './Modals/AttachmentModal';
import { usePaymentModals } from '../../hooks/usePaymentModals';

export interface PaymentTableProps {
  payments: PaymentRequest[];
  onApprove?: (paymentId: number) => void;
  onReject?: (paymentId: number, reason: string) => void;
}

export function PaymentTable({ payments, onApprove, onReject }: PaymentTableProps) {
  const { modals, selectedData } = usePaymentModals();

  const handleConfirmReject = (reason: string) => {
    if (selectedData.payment && onReject) {
      onReject(selectedData.payment.id, reason);
    }
    modals.reject.close();
  };

  const handleConfirmApprove = () => {
    if (selectedData.payment && onApprove) {
      onApprove(selectedData.payment.id);
    }
    modals.approve.close();
  };

  return (
    <>
      <TableContainer sx={{ overflowX: 'auto', display: 'block' }}>
        <Table sx={{ width: '100%', minWidth: 800 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell align="center" sx={{ width: 192, color: 'text.secondary', fontWeight: 'medium' }}>Ações</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'medium' }}>Id</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'medium' }}>Status</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'medium' }}>Motivo</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap', color: 'text.secondary', fontWeight: 'medium' }}>Valor</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'medium' }}>Solicitante</TableCell>
              <TableCell align="center" sx={{ color: 'text.secondary', fontWeight: 'medium' }}>Anexos</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'medium' }}>Criado em</TableCell>
              <TableCell sx={{ color: 'text.secondary', fontWeight: 'medium' }}>Aprovação em</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align="center">
                  {payment.status === 'PENDENTE' ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                      <Button
                        variant="contained"
                        onClick={() => modals.approve.handleOpen(payment)}
                        title="Aprovar"
                        startIcon={<CheckIcon sx={{ '&.MuiSvgIcon-root': { fontSize: 14 } }} />}
                        sx={{
                          borderRadius: '50px',
                          fontSize: '10px',
                          fontWeight: 600,
                          boxShadow: 1,
                          bgcolor: '#2E7D32',
                          color: '#fff',
                          textTransform: 'none',
                          minWidth: 'auto',
                          px: 1.5,
                          py: 0.5,
                          '&:hover': { bgcolor: '#2E7D32', opacity: 0.9 }
                        }}
                      >
                        Aprovar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={() => modals.reject.handleOpen(payment)}
                        title="Rejeitar"
                        startIcon={<CloseIcon sx={{ '&.MuiSvgIcon-root': { fontSize: 14 } }} />}
                        sx={{
                          borderRadius: '50px',
                          fontSize: '10px',
                          fontWeight: 600,
                          boxShadow: 1,
                          bgcolor: '#D32F2F',
                          color: '#fff',
                          textTransform: 'none',
                          minWidth: 'auto',
                          px: 1.5,
                          py: 0.5,
                          '&:hover': { bgcolor: '#D32F2F', opacity: 0.9 }
                        }}
                      >
                        Rejeitar
                      </Button>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={() => modals.details.handleOpen(payment)}
                      startIcon={<InfoOutlinedIcon sx={{ '&.MuiSvgIcon-root': { fontSize: 16 } }} />}
                      sx={{
                        borderRadius: '50px',
                        bgcolor: '#eff6ff',
                        borderColor: '#bfdbfe',
                        color: '#1d4ed8',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        px: 2,
                        py: 0.5,
                        width: '100%',
                        whiteSpace: 'nowrap',
                        boxShadow: 1,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#dbeafe', borderColor: '#bfdbfe' }
                      }}
                    >
                      Ver Detalhes
                    </Button>
                  )}
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{payment.id}</TableCell>
                <TableCell>
                  <StatusBadge status={payment.status} />
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>
                  <Tooltip title={payment.motivo} placement="top" arrow>
                    <Box sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'help' }}>
                      {payment.motivo}
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell sx={{ fontWeight: 500, whiteSpace: 'nowrap' }}>{payment.valor}</TableCell>
                <TableCell>
                  <Button
                    variant="text"
                    onClick={() => modals.requester.handleOpen(payment.solicitante)}
                    startIcon={<AccountCircleOutlinedIcon fontSize="small" />}
                    sx={{ color: '#2563eb', textTransform: 'none', p: 0, minWidth: 'auto', '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' } }}
                  >
                    <span>{payment.solicitante.email}</span>
                  </Button>
                </TableCell>
                <TableCell align="center">
                  <Button
                    variant="text"
                    onClick={() => modals.attachments.handleOpen(payment.anexos)}
                    disabled={payment.anexos.length === 0}
                    startIcon={<AttachFileIcon fontSize="small" />}
                    sx={{ 
                      color: '#2563eb', 
                      fontWeight: 500, 
                      p: 0, 
                      minWidth: 'auto', 
                      textTransform: 'none',
                      '&:hover': { color: '#1e40af', bgcolor: 'transparent' }, 
                      '&.Mui-disabled': { opacity: 0.5, cursor: 'not-allowed' } 
                    }}
                  >
                    ({payment.anexos.length})
                  </Button>
                </TableCell>
                <TableCell sx={{ color: 'text.secondary' }}>{payment.criadoEm}</TableCell>
                <TableCell sx={{ 
                  color: payment.status === 'PENDENTE' ? 'text.disabled' : 'text.secondary', 
                  fontStyle: payment.status === 'PENDENTE' ? 'italic' : 'normal', 
                  fontSize: payment.status === 'PENDENTE' ? '0.75rem' : 'inherit' 
                }}>
                  {payment.aprovacaoEm || 'Aguardando'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <ApproveModal
        open={modals.approve.open}
        onClose={modals.approve.close}
        onConfirm={handleConfirmApprove}
      />
      <RejectModal
        open={modals.reject.open}
        onClose={modals.reject.close}
        onConfirm={handleConfirmReject}
      />
      <DetailsModal
        open={modals.details.open}
        onClose={modals.details.close}
        payment={selectedData.payment}
      />
      <RequesterModal
        open={modals.requester.open}
        onClose={modals.requester.close}
        user={selectedData.user}
      />
      <AttachmentModal
        open={modals.attachments.open}
        onClose={modals.attachments.close}
        attachments={selectedData.attachments}
      />
    </>
  );
}
