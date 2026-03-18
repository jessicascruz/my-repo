import { render, screen, fireEvent } from '@testing-library/react'
import ActionButton from '@/presentation/components/forRoutes/order/details/components/components/ActionButton'
import {useCanCancel} from '@/presentation/hooks/useCanCancel'
import { useSession } from 'next-auth/react'
import { IReceivableResponse } from '@/domain/aggregates/order'
import { CancelOrderModal } from '@/presentation/components/forRoutes/order/details/components/components/ActionButton/CancelOrderModal'

// Mocks
jest.mock('@/presentation/hooks/useCanCancel')
const mockUseCanCancel = useCanCancel as jest.MockedFunction<typeof useCanCancel>

jest.mock('next-auth/react')
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>

// Mock CancelOrderModal para simplificar
jest.mock(
  '@/presentation/components/forRoutes/order/details/components/components/ActionButton/CancelOrderModal',
  () => ({
    CancelOrderModal: jest.fn(() => (
      <div data-testid="cancel-order-modal">Modal</div>
    )),
  })
)

describe('ActionButton', () => {
  const mockOrder = {
    id: '1',
    referenceId: 'ref-1',
    subReferenceId: 'sub-1',
    status: 'CREATED',
  } as IReceivableResponse

  beforeEach(() => {
    jest.clearAllMocks()
    mockUseSession.mockReturnValue({
      data: { user: { id: 'u1', name: 'User', email: 'user@test.com' } },
    } as any)
  })

  it('should render button and toggle menu', () => {
    mockUseCanCancel.mockReturnValue({ canCancelOrder: () => true })

    render(<ActionButton order={mockOrder} />)

    const button = screen.getByRole('button', { name: /Escolha a ação/i })
    fireEvent.click(button)

    expect(screen.getByText(/Cancelar Ordem/i)).toBeInTheDocument()
  })

  it('should disable cancel option when cannot cancel', () => {
    mockUseCanCancel.mockReturnValue({ canCancelOrder: () => false })

    render(<ActionButton order={mockOrder} />)

    fireEvent.click(screen.getByRole('button'))
    expect(screen.getByText(/Cancelar Ordem/i)).toHaveAttribute(
      'aria-disabled',
      'true'
    )
  })

  it('should open CancelOrderModal when cancel is clicked', () => {
    mockUseCanCancel.mockReturnValue({ canCancelOrder: () => true })

    render(<ActionButton order={mockOrder} />)

    fireEvent.click(screen.getByRole('button'))
    fireEvent.click(screen.getByText(/Cancelar Ordem/i))

    expect(screen.getByTestId('cancel-order-modal')).toBeInTheDocument()
  })
})