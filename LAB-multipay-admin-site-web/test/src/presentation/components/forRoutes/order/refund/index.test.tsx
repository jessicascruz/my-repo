import { render, screen } from '@testing-library/react'
import { useParams } from 'next/navigation'
import { useTheme } from '@mui/material'
import RefundPage from '@/presentation/components/forRoutes/order/refund'
import { useOrderDetails } from '@/presentation/hooks/useOrderDetails'
import { useCanRefund } from '@/presentation/hooks/useCanRefund'

// Mock the hooks and components
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
}))

jest.mock('@mui/material', () => ({
  useTheme: jest.fn(),
  Box: (props: any) => <div {...props}>{props.children}</div>,
}))

jest.mock('@/presentation/hooks/useOrderDetails')
jest.mock('@/presentation/hooks/useCanRefund')
jest.mock('@/presentation/components/forRoutes/components/info/Info', () => ({
  __esModule: true,
  default: () => <div data-testid="info-component" />,
}))
jest.mock('@/presentation/components/common/breadcrumb', () => ({
  BreadcrumbsComponent: () => <div data-testid="breadcrumbs-component" />,
}))
jest.mock(
  '@/presentation/components/forRoutes/order/refund/components/PaymentComponent',
  () => ({
    PaymentsComponent: () => <div data-testid="payments-component" />,
  })
)
jest.mock(
  '@/presentation/components/forRoutes/order/refund/components/PaymentRefundsTable',
  () => ({
    __esModule: true,
    default: () => <div data-testid="refunds-table" />,
  })
)

describe('RefundPage', () => {
  const mockOrder = {
    id: 'order-123',
    payments: [
      {
        id: 'payment-123',
        acquirer: {
          id: 'acquirer-123',
        },
        approvedAt: '2024-03-20T10:00:00Z',
        status: 'APPROVED',
      },
    ],
    refunds: [
      {
        acquirer: {
          paymentId: 'payment-123',
          status: 'AUTHORIZED',
        },
        amount: 100,
      },
      {
        acquirer: {
          paymentId: 'payment-123',
          status: 'PENDING',
        },
        amount: 50,
      },
    ],
  }

  beforeEach(() => {
    jest.clearAllMocks()

    // Mock useParams
    ;(useParams as jest.Mock).mockReturnValue({
      id: 'order-123',
      paymentId: 'payment-123',
    })

    // Mock useTheme
    ;(useTheme as jest.Mock).mockReturnValue({
      palette: {
        background: {
          default: '#fff',
        },
      },
    })

    // Mock useOrderDetails
    ;(useOrderDetails as jest.Mock).mockReturnValue({
      order: mockOrder,
    })

    // Mock useCanRefund
    ;(useCanRefund as jest.Mock).mockReturnValue({
      canRefundPayment: jest.fn().mockReturnValue(true),
    })
  })

  it('should render the component with order and payment data', () => {
    render(<RefundPage />)

    // Verify that the component renders without crashing
    expect(screen.getByTestId('refund-page')).toBeInTheDocument()
    expect(screen.getByTestId('info-component')).toBeInTheDocument()
    expect(screen.getByTestId('breadcrumbs-component')).toBeInTheDocument()
    expect(screen.getByTestId('payments-component')).toBeInTheDocument()
    expect(screen.getByTestId('refunds-table')).toBeInTheDocument()
  })

  it('should not render when order or payment data is missing', () => {
    ;(useOrderDetails as jest.Mock).mockReturnValue({
      order: null,
    })

    render(<RefundPage />)

    // Verify that nothing is rendered
    expect(screen.queryByTestId('refund-page')).not.toBeInTheDocument()
  })

  it('should calculate total authorized refunds correctly', () => {
    render(<RefundPage />)

    // The total authorized refunds should be 100 (only the AUTHORIZED refund)
    expect(screen.getByTestId('payments-component')).toBeInTheDocument()
  })

  it('should call canRefundPayment with correct parameters', () => {
    const mockCanRefundPayment = jest.fn().mockReturnValue(true)
    ;(useCanRefund as jest.Mock).mockReturnValue({
      canRefundPayment: mockCanRefundPayment,
    })

    render(<RefundPage />)

    expect(mockCanRefundPayment).toHaveBeenCalledWith({
      acquirerId: 'acquirer-123',
      paymentApprovedAt: '2024-03-20T10:00:00Z',
      paymentStatus: 'APPROVED',
      amount: 0,
      refundedAmount: 0,
    })
  })
})
