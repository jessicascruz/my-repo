import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CancelOrderModal } from '@/presentation/components/forRoutes/order/details/components/components/ActionButton/CancelOrderModal'
import { useCancelOrder } from '@/presentation/hooks/useCancelOrder'

jest.mock('@/presentation/hooks/useCancelOrder')
jest.mock('@/presentation/components/common/modals/ConfirmationModal', () => ({
  ConfirmationModal: ({ isOpen, onConfirm }: any) =>
    isOpen ? <button onClick={onConfirm}>Confirmar</button> : null
}))

describe('CancelOrderModal', () => {
  const baseProps = {
    isOpen: true,
    onClose: jest.fn(),
    orderId: '1',
    referenceId: 'ref-1',
    subReferenceId: 'sub-1',
    requester: { id: 'u1', name: 'User', email: 'user@test.com' }
  }

  it('should call mutateAsync and close modal on confirm', async () => {
    const mockMutate = jest.fn().mockResolvedValue(undefined)
    ;(useCancelOrder as jest.Mock).mockReturnValue({ mutateAsync: mockMutate, isPending: false })

    render(<CancelOrderModal {...baseProps} />)

    fireEvent.click(screen.getByText(/Confirmar/i))

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({
        orderId: '1',
        referenceId: 'ref-1',
        subReferenceId: 'sub-1',
        requester: { id: 'u1', name: 'User', email: 'user@test.com' }
      })
      expect(baseProps.onClose).toHaveBeenCalled()
    })
  })
})