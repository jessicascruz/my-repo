import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import Payments from '@/presentation/components/forRoutes/order/details/components/payments/Payments'
import {
  IPaymentResponse,
  MethodEnum,
  AcquirerEnum,
  PaymentStatusEnum,
} from '@/domain/aggregates/order'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock do navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn().mockResolvedValue(undefined),
  },
})

describe('Payments Component', () => {
  const mockData: IPaymentResponse[] = [
    {
      id: '1',
      amount: 100.5,
      status: PaymentStatusEnum.AUTHORIZED,
      createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '2023-01-01T00:00:00Z',
      authorizedAt: '2023-01-01T00:00:00Z',
      approvedAt: '2023-01-01T00:00:00Z',
      method: MethodEnum.CREDIT_CARD,
      acquirer: {
        id: AcquirerEnum.GETNET,
        description: 'description',
        nsu: 'nsu',
        paymentId: 'id',
        status: 'status',
        statusDetail: 'details',
        transactionId: 'tran0-id',
        internalPaymentId: 'inter-id',
        authorizationCode: 'auth-code-123',
        ec: '12345',
      },
      internalPaymentId: 'inter-id',
      companyId: 1,
    },
    {
      id: '2',
      amount: 200.75,
      status: PaymentStatusEnum.PENDING,
      createdAt: '2023-01-02T00:00:00Z',
      updatedAt: '2023-01-02T00:00:00Z',
      authorizedAt: '2023-01-02T00:00:00Z',
      approvedAt: '2023-01-02T00:00:00Z',
      method: MethodEnum.TICKET,
      acquirer: {
        id: AcquirerEnum.MERCADO_PAGO,
        description: 'description',
        nsu: 'nsu',
        paymentId: 'id',
        status: 'status',
        statusDetail: 'details',
        transactionId: 'tran0-id',
        internalPaymentId: 'inter-id',
        authorizationCode: 'auth-code-123',
        ec: '12345',
      },
      internalPaymentId: 'inter-id',
      companyId: 1,
      ticket: {
        url: 'https://example.com/ticket',
        barCode: '1234567890',
        expirationDate: '2023-01-10T00:00:00Z',
      },
    },
    {
      id: '3',
      amount: 150.25,
      status: PaymentStatusEnum.PENDING,
      createdAt: '2023-01-03T00:00:00Z',
      updatedAt: '2023-01-03T00:00:00Z',
      authorizedAt: '2023-01-03T00:00:00Z',
      approvedAt: '2023-01-03T00:00:00Z',
      method: MethodEnum.PIX,
      acquirer: {
        id: AcquirerEnum.MERCADO_PAGO,
        description: 'description',
        nsu: 'nsu',
        paymentId: 'id',
        status: 'status',
        statusDetail: 'details',
        transactionId: 'tran0-id',
        internalPaymentId: 'inter-id',
        authorizationCode: 'auth-code-123',
        ec: '12345',
      },
      internalPaymentId: 'inter-id',
      companyId: 1,
      pix: {
        qrCode: 'pix-qr-code',
        code: 'pix-code-123',
        expirationDate: '21-04-2022',
      },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render all payment methods grouped by acquirer', () => {
    render(
      <Payments
        data={mockData}
        company={1}
        reference="ref-1"
        refunds={[]}
        system={1}
      />
    )

    expect(screen.getByText('Pagamentos')).toBeInTheDocument()
    expect(screen.getByText('Getnet')).toBeInTheDocument()
    expect(screen.getByText('Mercado Pago')).toBeInTheDocument()
    expect(screen.getByText('Cartão de Crédito')).toBeInTheDocument()
    expect(screen.getByText('Boleto')).toBeInTheDocument()
    expect(screen.getByText('PIX')).toBeInTheDocument()
  })

  it('should copy ticket URL and show snackbar', async () => {
    render(
      <Payments
        data={mockData}
        company={1}
        reference="ref-1"
        refunds={[]}
        system={1}
      />
    )

    // Expand Mercado Pago accordion
    const mercadoPagoHeader = screen.getByText('Mercado Pago').closest('button')
    if (!mercadoPagoHeader)
      throw new Error('Mercado Pago header button not found')
    fireEvent.click(mercadoPagoHeader)

    // Wait for the content to render
    await waitFor(() => {
      expect(screen.getByText('Boleto')).toBeInTheDocument()
    })

    // Find and click the copy button
    const copyButtons = screen.getAllByRole('button', { name: /link/i })
    fireEvent.click(copyButtons[0])

    // Verify clipboard was called with correct URL
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      'https://example.com/ticket'
    )

    // Verify the snackbar appears
    await waitFor(() => {
      expect(screen.getByText('Link copiado!')).toBeInTheDocument()
    })

    // Verify the snackbar disappears after auto-hide
    await waitFor(
      () => {
        expect(screen.queryByText('Link copiado!')).not.toBeInTheDocument()
      },
      { timeout: 3000 }
    )
  })

  it('should not render when there is no data', () => {
    const { container } = render(
      <Payments
        data={[]}
        company={1}
        reference="ref-1"
        refunds={[]}
        system={1}
      />
    )

    expect(container.firstChild).toBeNull()
  })
})
