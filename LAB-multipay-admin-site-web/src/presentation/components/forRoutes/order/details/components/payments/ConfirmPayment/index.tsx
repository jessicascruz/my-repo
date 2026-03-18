import { companyDict, IPaymentResponse } from '@/domain/aggregates/order'
import { ConfirmationModal } from '@/presentation/components/common/modals/ConfirmationModal'
import { useConfirmPayment } from '@/presentation/hooks/useConfirmPayment'
import { Button, useTheme } from '@mui/material'
import { useParams } from 'next/navigation'
import { useState } from 'react'

interface Props {
  company: number
  payment: IPaymentResponse
  reference: string
  system: number
}

export const ConfirmPayment = ({
  company,
  payment,
  reference,
  system,
}: Props) => {
  const theme = useTheme()
  const { id: orderId } = useParams<{ id: string }>()
  const { mutateAsync: confirmPayment, isPending } = useConfirmPayment()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => setIsModalOpen(true)

  const handleCloseModal = () => setIsModalOpen(false)

  const handleConfirmPayment = async () => {
    await confirmPayment({
      paymentId: payment.acquirer.paymentId,
      body: {
        orderId,
        acquirerId: payment.acquirer.id,
        companyId: company,
        systemId: system,
        amount: payment.amount,
        reference,
      },
    })

    handleCloseModal()
  }

  return (
    <>
      <Button
        onClick={handleOpenModal}
        variant="contained"
        size="medium"
        sx={{
          boxShadow: 'none',
          borderRadius: '100px',
          fontWeight: 600,
          backgroundColor: theme.palette.success.main,
          '&:hover': {
            backgroundColor: '#2cea6b',
          },
          '&:disabled': {
            backgroundColor: theme.palette.success[100],
            color: '#FFF',
          },
        }}
      >
        Confirmar
      </Button>

      <ConfirmationModal
        title="Confirmação de Pagamento"
        description="Você tem certeza que deseja confirmar o pagamento? Uma vez confirmado, não será possível reverter essa ação."
        isOpen={isModalOpen}
        isLoading={isPending}
        onClose={handleCloseModal}
        onConfirm={handleConfirmPayment}
        containerSx={{
          width: {
            md: 600,
            xs: '100%',
          },
        }}
      />
    </>
  )
}
