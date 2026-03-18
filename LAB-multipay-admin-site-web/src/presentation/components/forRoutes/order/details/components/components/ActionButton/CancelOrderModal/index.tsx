import { CancellationModal } from '@/presentation/components/common/modals/CancellationModal'
import { useCancelOrder } from '@/presentation/hooks/useCancelOrder'
import { ICancelOrderParams } from '@/infra/repositories/OrderRepository'

interface CancelOrderModalProps extends ICancelOrderParams {
  isOpen: boolean
  onClose: VoidFunction
}

export const CancelOrderModal = (props: CancelOrderModalProps) => {
  const { isOpen, onClose, ...cancelParams } = props
  const { mutateAsync, isPending } = useCancelOrder()

  const handleConfirm = async () => {
    await mutateAsync(cancelParams)
    onClose()
  }

  return (
    <CancellationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title="Confirma o cancelamento da ordem de recebimento?"
      description="Após esta ação, não será possível reverter."
      isLoading={isPending}
      containerSx={{
        padding: 3,
        width: { xs: 'calc(100% - 26px)', sm: '600px' }, 
        maxWidth: '100%',
        margin: { xs: 'auto', sm: 0 },
        alignItems: 'flex-start',
        borderRadius: 4,
        '& > .MuiBox-root:first-of-type  .MuiTypography-root': {
          fontSize: 22,
          color: '#000',       
        },
        '& > .MuiBox-root:first-of-type  .MuiIconButton-root': {
           marginTop: -4,
        },
      }}
    />
  )
}