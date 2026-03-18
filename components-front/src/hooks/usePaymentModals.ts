import { useState } from 'react';
import { PaymentRequest, User, Attachment } from '../types/payment';

export function usePaymentModals() {
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [requesterModalOpen, setRequesterModalOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAttachments, setSelectedAttachments] = useState<Attachment[]>([]);

  const openApprove = (payment: PaymentRequest) => {
    setSelectedPayment(payment);
    setApproveModalOpen(true);
  };

  const closeApprove = () => setApproveModalOpen(false);

  const openReject = (payment: PaymentRequest) => {
    setSelectedPayment(payment);
    setRejectModalOpen(true);
  };

  const closeReject = () => setRejectModalOpen(false);

  const openDetails = (payment: PaymentRequest) => {
    setSelectedPayment(payment);
    setDetailsModalOpen(true);
  };

  const closeDetails = () => setDetailsModalOpen(false);

  const openRequester = (user: User) => {
    setSelectedUser(user);
    setRequesterModalOpen(true);
  };

  const closeRequester = () => setRequesterModalOpen(false);

  const openAttachments = (attachments: Attachment[]) => {
    setSelectedAttachments(attachments);
    setAttachmentModalOpen(true);
  };

  const closeAttachments = () => setAttachmentModalOpen(false);

  return {
    modals: {
      approve: { open: approveModalOpen, close: closeApprove, handleOpen: openApprove },
      reject: { open: rejectModalOpen, close: closeReject, handleOpen: openReject },
      details: { open: detailsModalOpen, close: closeDetails, handleOpen: openDetails },
      requester: { open: requesterModalOpen, close: closeRequester, handleOpen: openRequester },
      attachments: { open: attachmentModalOpen, close: closeAttachments, handleOpen: openAttachments },
    },
    selectedData: {
      payment: selectedPayment,
      user: selectedUser,
      attachments: selectedAttachments,
    }
  };
}
