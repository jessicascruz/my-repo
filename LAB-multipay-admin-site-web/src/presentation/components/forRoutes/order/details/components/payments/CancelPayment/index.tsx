import { companyDict, IPaymentResponse } from '@/domain/aggregates/order'
import { ConfirmationModal } from '@/presentation/components/common/modals/ConfirmationModal'
import { useCancelPayment } from '@/presentation/hooks/useCancelPayment'
import { Button, useTheme } from '@mui/material'
import { useParams } from 'next/navigation'
import { useState } from 'react'
interface Props {
  company: number
  system: number
  payment: IPaymentResponse
  reference: string
}

export const CancelPayment = ({
  company,
  payment,
  reference,
  system,
}: Props) => {
  const theme = useTheme()
  const { id: orderId } = useParams<{ id: string }>()
  const { mutateAsync: cancelPayment, isPending } = useCancelPayment()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => setIsModalOpen(true)

  const handleCloseModal = () => setIsModalOpen(false)

  const handleCancelPayment = async () => {
    await cancelPayment({
      paymentId: payment.acquirer.paymentId,
      body: {
        orderId,
        internalPaymentId: payment.acquirer.internalPaymentId,
        acquirerId: payment.acquirer.id,
        companyId: company,
        systemId: system,
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
          backgroundColor: theme.palette?.error.main,
          ':hover': {
            backgroundColor: theme.palette?.error[200],
          },
        }}
      >
        Cancelamento
      </Button>

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleCancelPayment}
        isLoading={isPending}
        title="Atenção!"
        description="Deseja mesmo cancelar o pagamento?"
      />
    </>
  )
}
