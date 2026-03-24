import React from 'react';
import { 
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { PaymentRequest } from '../../types/payment';
import { RejectModal } from './Modals/RejectModal';
import { ApproveModal } from './Modals/ApproveModal';
import { DetailsModal } from './Modals/DetailsModal';
import { RequesterModal } from './Modals/RequesterModal';
import { AttachmentModal } from './Modals/AttachmentModal';
import { usePaymentModals } from '../../hooks/usePaymentModals';
import { PaymentTableRow } from './PaymentTableRow';

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
              <PaymentTableRow
                key={payment.id}
                payment={payment}
                onApprove={modals.approve.handleOpen}
                onReject={modals.reject.handleOpen}
                onDetails={modals.details.handleOpen}
                onRequester={modals.requester.handleOpen}
                onAttachments={modals.attachments.handleOpen}
              />
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
