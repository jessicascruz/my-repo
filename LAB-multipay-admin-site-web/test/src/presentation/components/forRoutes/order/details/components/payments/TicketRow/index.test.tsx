import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import {
  AcquirerEnum,
  IPaymentResponse,
  MethodEnum,
  PaymentStatusEnum,
} from '@/domain/aggregates/order'
import { TicketRow } from '@/presentation/components/forRoutes/order/details/components/payments/TicketRow'

// Mock the Next.js router hooks
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <div data-testid="app-root">
      {ui}
    </div>
  )
}

describe('TicketRow Component', () => {
  const mockData: IPaymentResponse = {
    id: '3',
    amount: 150.25,
    status: PaymentStatusEnum.PENDING,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
    authorizedAt: '2023-01-03T00:00:00Z',
    approvedAt: '2023-01-03T00:00:00Z',
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
    },
    companyId: 1,
    pix: {
      code: 'code',
      expirationDate: '2023-01-01T00:00:00Z',
      qrCode: 'qr-code',
    },
    ticket: {
      barCode: 'bar-code',
      url: 'url',
    },
    internalPaymentId: 'internal-id',
  }

  const mockHandleCopy = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call handleCopy with url when copy button is clicked', () => {
    renderWithProviders(
      <table>
        <tbody>
          <TicketRow data={mockData} handleCopy={mockHandleCopy} />
        </tbody>
      </table>
    )

    const ticketButtons = screen.getAllByRole('button', {
      name: /link-url/i,
    })
    fireEvent.click(ticketButtons[0])

    expect(mockHandleCopy).toHaveBeenCalledTimes(1)
    expect(mockHandleCopy).toHaveBeenCalledWith('url')
  })

  it('should call handleCopy with no string when copy button is clicked and does not have any data', () => {
    renderWithProviders(
      <table>
        <tbody>
          <TicketRow data={mockData} handleCopy={mockHandleCopy} />
        </tbody>
      </table>
    )

    const ticketButtons = screen.getAllByRole('button', {
      name: /link-url/i,
    })
    fireEvent.click(ticketButtons[0])

    expect(mockHandleCopy).toHaveBeenCalledTimes(1)
  })
})
