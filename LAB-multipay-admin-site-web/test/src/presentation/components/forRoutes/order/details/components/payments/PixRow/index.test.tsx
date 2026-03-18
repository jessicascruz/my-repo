import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'

import {
  AcquirerEnum,
  IPaymentResponse,
  MethodEnum,
  PaymentStatusEnum,
} from '@/domain/aggregates/order'
import { PixRow } from '@/presentation/components/forRoutes/order/details/components/payments/PixRow'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}))

const renderWithRouter = (ui: React.ReactElement) => {
  return render(<div>{ui}</div>)
}

describe('PixRow Component', () => {
  const mockData: IPaymentResponse = {
    id: '3',
    amount: 150.25,
    status: PaymentStatusEnum.PENDING,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
    method: MethodEnum.PIX,
    companyId: 1,
    internalPaymentId: 'inter-id',
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
    approvedAt: '2023-01-01T00:00:00Z',
    authorizedAt: '2023-01-01T00:00:00Z',
    pix: {
      qrCode: 'pix-qr-code',
      code: 'pix-code-123',
      expirationDate: '21-04-2022',
    },
  }

  const mockDataWithoutData: IPaymentResponse = {
    id: '3',
    amount: 150.25,
    status: PaymentStatusEnum.PENDING,
    createdAt: '2023-01-03T00:00:00Z',
    updatedAt: '2023-01-03T00:00:00Z',
    method: MethodEnum.PIX,
    companyId: 1,
    internalPaymentId: 'inter-id',
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
    approvedAt: '2023-01-01T00:00:00Z',
    authorizedAt: '2023-01-01T00:00:00Z',
  }

  const mockHandleCopy = jest.fn()
  const mockHandleDownload = jest.fn()
  const mockOrderId = 'order-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should call handleCopy with Pix code when second copy button is clicked', () => {
    renderWithRouter(
      <table>
        <tbody>
          <PixRow data={mockData} handleCopy={mockHandleCopy} />
        </tbody>
      </table>
    )

    const codeButtons = screen.getAllByRole('button', { name: /link-code/i })
    fireEvent.click(codeButtons[0])

    expect(mockHandleCopy).toHaveBeenCalledTimes(1)
    expect(mockHandleCopy).toHaveBeenCalledWith('pix-code-123')
  })

  it('should call handleCopy with no string when second copy button is clicked and does not have any data', () => {
    renderWithRouter(
      <table>
        <tbody>
          <PixRow data={mockDataWithoutData} handleCopy={mockHandleCopy} />
        </tbody>
      </table>
    )

    const codeButtons = screen.getAllByRole('button', { name: /link-code/i })
    fireEvent.click(codeButtons[0])

    expect(mockHandleCopy).toHaveBeenCalledTimes(1)
    expect(mockHandleCopy).toHaveBeenCalledWith('')
  })
})
